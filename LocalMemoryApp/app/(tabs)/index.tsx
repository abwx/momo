import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, Card, Avatar, useTheme, Dialog, Portal, TextInput, Button, Switch } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { getCategories, addCategory, deleteCategory, Category } from '@/database/db';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPassword, setNewCatPassword] = useState('');
  const [isSecure, setIsSecure] = useState(false);
  const theme = useTheme();

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    if (isSecure && !newCatPassword.trim()) {
      Alert.alert('提示', '请为加密分类输入密码');
      return;
    }
    // Default colors for variety
    const colors = ['#6200EE', '#03DAC6', '#FF0266', '#FFDE03', '#000000', '#4CAF50'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    await addCategory(newCatName.trim(), isSecure ? 'lock' : 'folder', randomColor, isSecure ? newCatPassword.trim() : undefined);
    
    setNewCatName('');
    setNewCatPassword('');
    setIsSecure(false);
    setDialogVisible(false);
    loadCategories();
  };

  const handleDelete = (id: number) => {
    Alert.alert('删除分类', '确定要删除此分类及其所有内容吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        await deleteCategory(id);
        loadCategories();
      }}
    ]);
  };

  const [unlockDialogVisible, setUnlockDialogVisible] = useState(false);
  const [selectedLockedCat, setSelectedLockedCat] = useState<Category | null>(null);
  const [inputPassword, setInputPassword] = useState('');

  const handleCategoryPress = (item: Category) => {
    if (item.password) {
      setSelectedLockedCat(item);
      setUnlockDialogVisible(true);
    } else {
      router.push(`/category/${item.id}`);
    }
  };

  const handleUnlock = () => {
    if (selectedLockedCat && inputPassword === selectedLockedCat.password) {
      setUnlockDialogVisible(false);
      setInputPassword('');
      router.push(`/category/${selectedLockedCat.id}`);
    } else {
      Alert.alert('错误', '密码不正确');
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => handleCategoryPress(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <Card style={[styles.card, { backgroundColor: item.color + '15' }]}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon size={48} icon={item.icon} style={{ backgroundColor: item.color }} />
          <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.headerTitle}>我的分类</Text>
      
      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => setDialogVisible(true)}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => {
          setDialogVisible(false);
          setNewCatName('');
          setNewCatPassword('');
          setIsSecure(false);
        }}>
          <Dialog.Title>新建分类</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="分类名称"
              value={newCatName}
              onChangeText={setNewCatName}
              mode="outlined"
              autoFocus
              style={{ marginBottom: 12 }}
            />
            <View style={styles.switchRow}>
              <Text>开启密码保护</Text>
              <Switch value={isSecure} onValueChange={setIsSecure} />
            </View>
            {isSecure && (
              <TextInput
                label="设置访问密码"
                value={newCatPassword}
                onChangeText={setNewCatPassword}
                mode="outlined"
                secureTextEntry
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDialogVisible(false);
              setNewCatName('');
              setNewCatPassword('');
              setIsSecure(false);
            }}>取消</Button>
            <Button onPress={handleAddCategory}>创建</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={unlockDialogVisible} onDismiss={() => {
          setUnlockDialogVisible(false);
          setInputPassword('');
        }}>
          <Dialog.Title>解锁分类</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="请输入密码"
              value={inputPassword}
              onChangeText={setInputPassword}
              mode="outlined"
              secureTextEntry
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setUnlockDialogVisible(false);
              setInputPassword('');
            }}>取消</Button>
            <Button onPress={handleUnlock}>解锁</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  cardContainer: {
    flex: 1,
    margin: 8,
    maxWidth: '50%',
  },
  card: {
    elevation: 0,
    borderRadius: 16,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardTitle: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});
