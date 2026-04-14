import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text, FAB, Card, IconButton, useTheme, Portal, Dialog, TextInput, Button, ActivityIndicator, Switch } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { getItemsByCategory, addItem, deleteItem, MemoryItem } from '@/database/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper to extract tags like #work #idea from text
const extractTags = (text: string): string[] => {
  const regex = /#[a-zA-Z0-9_\u4e00-\u9fa5]+/g;
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
};

// Component for URL Item with real-time status check
const UrlItemCard = ({ item, handleOpenItem, handleDelete }: { item: MemoryItem, handleOpenItem: (item: MemoryItem) => void, handleDelete: (id: number) => void }) => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  
  useEffect(() => {
    let isMounted = true;
    
    const checkUrl = async () => {
      if (!item.content) return;
      try {
        const response = await fetch(item.content, { method: 'HEAD', mode: 'no-cors' });
        if (isMounted) setStatus('ok');
      } catch (error) {
        if (isMounted) setStatus('error');
      }
    };
    
    checkUrl();
    return () => { isMounted = false; };
  }, [item.content]);

  const getStatusIcon = () => {
    if (status === 'checking') return <ActivityIndicator size={20} style={{ margin: 10 }} />;
    if (status === 'ok') return <IconButton icon="check-circle" iconColor="green" size={20} />;
    return <IconButton icon="alert-circle" iconColor="red" size={20} />;
  };

  const handleCopyUrl = async () => {
    if (item.content) {
      await Clipboard.setStringAsync(item.content);
      Alert.alert('已复制', '网址已复制到剪贴板');
    }
  };

  return (
    <Card style={styles.card} onPress={() => handleOpenItem(item)} onLongPress={() => handleDelete(item.id)}>
      <Card.Title
        title={item.title}
        subtitle={item.content}
        subtitleNumberOfLines={2}
        left={(props) => <IconButton {...props} icon="link" />}
        right={() => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {getStatusIcon()}
            <IconButton icon="content-copy" size={20} onPress={handleCopyUrl} />
            <IconButton icon="delete-outline" size={20} onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />
    </Card>
  );
};

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const categoryId = parseInt(id as string, 10);
  const [items, setItems] = useState<MemoryItem[]>([]);
  const theme = useTheme();

  const [menuVisible, setMenuVisible] = useState(false);
  const [textDialogVisible, setTextDialogVisible] = useState(false);
  const [urlDialogVisible, setUrlDialogVisible] = useState(false);
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '如果需要提醒功能，请在设置中允许应用发送通知');
      setIsReminderEnabled(false);
      return false;
    }
    return true;
  };

  const scheduleReminder = async (title: string, body: string, date: Date) => {
    if (date.getTime() <= Date.now()) return null;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: date,
    });
    return date.getTime();
  };

  const resetDialogForm = () => {
    setNewItemTitle('');
    setNewItemContent('');
    setIsReminderEnabled(false);
    setReminderDate(new Date());
  };

  const loadItems = async () => {
    const fetchedItems = await getItemsByCategory(categoryId);
    setItems(fetchedItems);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [categoryId])
  );

  const handleAddText = async () => {
    if (!newItemTitle.trim()) return;

    let reminderTime = null;
    if (isReminderEnabled) {
      reminderTime = await scheduleReminder('文本提醒: ' + newItemTitle, newItemContent, reminderDate);
    }

    const tags = extractTags(newItemTitle + ' ' + newItemContent);

    await addItem({
      category_id: categoryId,
      type: 'text',
      title: newItemTitle,
      content: newItemContent,
      file_uri: null,
      file_name: null,
      reminder_time: reminderTime,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
    });
    setTextDialogVisible(false);
    resetDialogForm();
    loadItems();
  };

  const handleAddUrl = async () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return;
    const tags = extractTags(newItemTitle + ' ' + newItemContent);
    await addItem({
      category_id: categoryId,
      type: 'url',
      title: newItemTitle,
      content: newItemContent,
      file_uri: null,
      file_name: null,
      reminder_time: null,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
    });
    setUrlDialogVisible(false);
    resetDialogForm();
    loadItems();
  };

  const handleAddFile = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      if (result.canceled) return;

      const file = result.assets[0];
      const tags = extractTags(file.name);
      
      await addItem({
        category_id: categoryId,
        type: 'file',
        title: file.name,
        content: null,
        file_uri: file.uri,
        file_name: file.name,
        reminder_time: null,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
      });
      loadItems();
    } catch (e) {
      console.error(e);
      Alert.alert('错误', '无法读取文件');
    }
  };

  const handleDelete = (itemId: number) => {
    Alert.alert('删除', '确定删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        await deleteItem(itemId);
        loadItems();
      }}
    ]);
  };

  const handleOpenItem = async (item: MemoryItem) => {
    if (item.type === 'url' && item.content) {
      try {
        await Linking.openURL(item.content);
      } catch (e) {
        Alert.alert('错误', '无法打开此网址');
      }
    } else if (item.type === 'text' && item.content) {
      await Clipboard.setStringAsync(item.content);
      Alert.alert('已复制', '文本内容已复制到剪贴板');
    } else if (item.type === 'file' && item.file_uri) {
      Alert.alert('文件', `文件已保存在本地: ${item.file_name}`);
      // Since it's local we could potentially open it with expo-sharing, 
      // but for now, we just show it's saved.
    }
  };

  const renderItem = ({ item }: { item: MemoryItem }) => {
    if (item.type === 'url') {
      return <UrlItemCard item={item} handleOpenItem={handleOpenItem} handleDelete={handleDelete} />;
    }

    const getIcon = () => {
      if (item.type === 'text') return 'text-box-outline';
      return 'file-document-outline';
    };

    return (
      <Card style={styles.card} onPress={() => handleOpenItem(item)} onLongPress={() => handleDelete(item.id)}>
        <Card.Title
          title={item.title}
          subtitle={item.type === 'file' ? item.file_name : item.content}
          subtitleNumberOfLines={2}
          left={(props) => <IconButton {...props} icon={getIcon()} />}
          right={(props) => <IconButton {...props} icon="delete-outline" onPress={() => handleDelete(item.id)} />}
        />
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: '分类详情' }} />
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.outline }}>暂无内容，点击右下角添加</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <FAB.Group
          open={menuVisible}
          visible
          icon={menuVisible ? 'close' : 'plus'}
          actions={[
            { icon: 'file-document-outline', label: '添加文件', onPress: handleAddFile },
            { icon: 'link', label: '添加网址', onPress: () => setUrlDialogVisible(true) },
            { icon: 'text-box-outline', label: '添加文本', onPress: () => setTextDialogVisible(true) },
          ]}
          onStateChange={({ open }) => setMenuVisible(open)}
          onPress={() => {
            if (menuVisible) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>

      {/* Text Dialog */}
      <Portal>
        <Dialog 
          visible={textDialogVisible} 
          onDismiss={() => {
            setTextDialogVisible(false);
            resetDialogForm();
          }}
        >
          <Dialog.Title>新建文本记录</Dialog.Title>
          <Dialog.Content>
            <TextInput label="标题" value={newItemTitle} onChangeText={setNewItemTitle} mode="outlined" style={styles.input} />
            <TextInput label="内容" value={newItemContent} onChangeText={setNewItemContent} mode="outlined" multiline numberOfLines={4} />
            
            {/* Reminder Section */}
            <View style={styles.reminderContainer}>
              <View style={styles.reminderRow}>
                <Text>定时提醒我</Text>
                <Switch 
                  value={isReminderEnabled} 
                  onValueChange={(val) => {
                    if (val) requestNotificationPermission().then((granted) => setIsReminderEnabled(granted));
                    else setIsReminderEnabled(false);
                  }} 
                />
              </View>
              {isReminderEnabled && Platform.OS !== 'web' && (
                <View style={styles.reminderPickers}>
                  <Button mode="text" onPress={() => setShowDatePicker(true)}>
                    {reminderDate.toLocaleDateString()}
                  </Button>
                  <Button mode="text" onPress={() => setShowTimePicker(true)}>
                    {reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                </View>
              )}
              {isReminderEnabled && Platform.OS === 'web' && (
                <Text style={{ color: 'orange', fontSize: 12, marginTop: 4 }}>提醒功能仅在原生应用中有效</Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const newDate = new Date(reminderDate);
                    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setReminderDate(newDate);
                  }
                }}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    const newDate = new Date(reminderDate);
                    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                    setReminderDate(newDate);
                  }
                }}
              />
            )}

          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setTextDialogVisible(false);
              resetDialogForm();
            }}>取消</Button>
            <Button onPress={handleAddText}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* URL Dialog */}
      <Portal>
        <Dialog 
          visible={urlDialogVisible} 
          onDismiss={() => {
            setUrlDialogVisible(false);
            setNewItemTitle('');
            setNewItemContent('');
          }}
        >
          <Dialog.Title>新建网址</Dialog.Title>
          <Dialog.Content>
            <TextInput label="标题 (例如: 百度)" value={newItemTitle} onChangeText={setNewItemTitle} mode="outlined" style={styles.input} />
            <TextInput label="网址 (例如: https://baidu.com)" value={newItemContent} onChangeText={setNewItemContent} mode="outlined" keyboardType="url" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setUrlDialogVisible(false);
              setNewItemTitle('');
              setNewItemContent('');
            }}>取消</Button>
            <Button onPress={handleAddUrl}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 12, elevation: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 28 },
  input: { marginBottom: 12 },
  reminderContainer: { marginTop: 16, padding: 12, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderPickers: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }
});
