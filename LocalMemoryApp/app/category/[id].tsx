import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Text, FAB, Card, IconButton, useTheme, Portal, Dialog, TextInput, Button, Menu, Divider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from 'expo-router';
import { getItemsByCategory, addItem, deleteItem, MemoryItem } from '@/database/db';

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
    await addItem({
      category_id: categoryId,
      type: 'text',
      title: newItemTitle,
      content: newItemContent,
      file_uri: null,
      file_name: null,
    });
    setTextDialogVisible(false);
    setNewItemTitle('');
    setNewItemContent('');
    loadItems();
  };

  const handleAddUrl = async () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return;
    await addItem({
      category_id: categoryId,
      type: 'url',
      title: newItemTitle,
      content: newItemContent,
      file_uri: null,
      file_name: null,
    });
    setUrlDialogVisible(false);
    setNewItemTitle('');
    setNewItemContent('');
    loadItems();
  };

  const handleAddFile = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: false });
      if (result.canceled) return;

      const file = result.assets[0];
      await addItem({
        category_id: categoryId,
        type: 'file',
        title: file.name,
        content: null,
        file_uri: file.uri,
        file_name: file.name,
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
    const getIcon = () => {
      if (item.type === 'text') return 'text-box-outline';
      if (item.type === 'url') return 'link';
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
        <Dialog visible={textDialogVisible} onDismiss={() => setTextDialogVisible(false)}>
          <Dialog.Title>新建文本记录</Dialog.Title>
          <Dialog.Content>
            <TextInput label="标题" value={newItemTitle} onChangeText={setNewItemTitle} mode="outlined" style={styles.input} />
            <TextInput label="内容" value={newItemContent} onChangeText={setNewItemContent} mode="outlined" multiline numberOfLines={4} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTextDialogVisible(false)}>取消</Button>
            <Button onPress={handleAddText}>保存</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* URL Dialog */}
      <Portal>
        <Dialog visible={urlDialogVisible} onDismiss={() => setUrlDialogVisible(false)}>
          <Dialog.Title>新建网址</Dialog.Title>
          <Dialog.Content>
            <TextInput label="标题 (例如: 百度)" value={newItemTitle} onChangeText={setNewItemTitle} mode="outlined" style={styles.input} />
            <TextInput label="网址 (例如: https://baidu.com)" value={newItemContent} onChangeText={setNewItemContent} mode="outlined" keyboardType="url" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUrlDialogVisible(false)}>取消</Button>
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
  input: { marginBottom: 12 }
});
