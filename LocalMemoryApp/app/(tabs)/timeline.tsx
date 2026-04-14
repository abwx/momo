import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Linking, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Text, Card, IconButton, useTheme, Chip } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { getAllItems, deleteItem, MemoryItem } from '@/database/db';

export default function TimelineScreen() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const theme = useTheme();

  const loadItems = async () => {
    let fetchedItems = await getAllItems();
    if (selectedTag) {
      fetchedItems = fetchedItems.filter(item => {
        if (!item.tags) return false;
        try {
          const parsedTags = JSON.parse(item.tags);
          return parsedTags.includes(selectedTag);
        } catch { return false; }
      });
    }
    setItems(fetchedItems);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
    }, [selectedTag])
  );

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
    }
  };

  const renderItem = ({ item }: { item: MemoryItem }) => {
    const getIcon = () => {
      if (item.type === 'text') return 'text-box-outline';
      if (item.type === 'url') return 'link';
      return 'file-document-outline';
    };

    let parsedTags: string[] = [];
    if (item.tags) {
      try { parsedTags = JSON.parse(item.tags); } catch (e) {}
    }

    const dateStr = new Date(item.created_at).toLocaleString();

    return (
      <Card style={styles.card} onPress={() => handleOpenItem(item)} onLongPress={() => handleDelete(item.id)}>
        <Card.Title
          title={item.title}
          subtitle={item.type === 'file' ? item.file_name : item.content}
          subtitleNumberOfLines={2}
          left={(props) => <IconButton {...props} icon={getIcon()} />}
          right={(props) => <IconButton {...props} icon="delete-outline" onPress={() => handleDelete(item.id)} />}
        />
        <Card.Content>
          <Text variant="labelSmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>{dateStr}</Text>
          {parsedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {parsedTags.map((tag, idx) => (
                <Chip 
                  key={idx} 
                  style={[styles.chip, selectedTag === tag && { backgroundColor: theme.colors.primaryContainer }]} 
                  compact
                  onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: '记忆流' }} />
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.outline }}>这里空空如也，快去记录点什么吧</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 12, elevation: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { marginRight: 4, marginBottom: 4 }
});