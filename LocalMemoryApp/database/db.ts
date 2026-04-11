import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

export type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  password?: string | null;
  created_at: number;
};

export type ItemType = 'text' | 'url' | 'file';

export type MemoryItem = {
  id: number;
  category_id: number;
  type: ItemType;
  title: string;
  content: string | null;
  file_uri: string | null;
  file_name: string | null;
  reminder_time: number | null;
  created_at: number;
};

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('local_memory.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      password TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      file_uri TEXT,
      file_name TEXT,
      reminder_time INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Initialize a default category if empty
  const defaultCategory = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );
  if (defaultCategory && defaultCategory.count === 0) {
    await db.runAsync(
      'INSERT INTO categories (name, icon, color, created_at) VALUES (?, ?, ?, ?)',
      ['默认分类', 'folder', '#6200EE', Date.now()]
    );
  }

  // Handle migration to add reminder_time if missing
  try {
    const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(items)');
    const hasReminderColumn = tableInfo.some(col => col.name === 'reminder_time');
    if (!hasReminderColumn) {
      await db.execAsync('ALTER TABLE items ADD COLUMN reminder_time INTEGER;');
    }
    
    const catTableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(categories)');
    const hasPasswordColumn = catTableInfo.some(col => col.name === 'password');
    if (!hasPasswordColumn) {
      await db.execAsync('ALTER TABLE categories ADD COLUMN password TEXT;');
    }
  } catch (e) {
    console.error('Error checking/migrating schema:', e);
  }

  return db;
}

// Categories CRUD
export async function getCategories(): Promise<Category[]> {
  const database = await initDatabase();
  return await database.getAllAsync<Category>('SELECT * FROM categories ORDER BY created_at DESC');
}

export async function addCategory(name: string, icon: string, color: string, password?: string): Promise<number> {
  const database = await initDatabase();
  const result = await database.runAsync(
    'INSERT INTO categories (name, icon, color, password, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, icon, color, password || null, Date.now()]
  );
  return result.lastInsertRowId;
}

export async function deleteCategory(id: number): Promise<void> {
  const database = await initDatabase();
  // Items will be deleted automatically if we enable foreign key PRAGMA, but just to be sure we can delete items too
  await database.runAsync('PRAGMA foreign_keys = ON');
  await database.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

// Items CRUD
export async function getItemsByCategory(categoryId: number): Promise<MemoryItem[]> {
  const database = await initDatabase();
  return await database.getAllAsync<MemoryItem>(
    'SELECT * FROM items WHERE category_id = ? ORDER BY created_at DESC',
    [categoryId]
  );
}

export async function addItem(item: Omit<MemoryItem, 'id' | 'created_at'>): Promise<number> {
  const database = await initDatabase();
  
  // If it's a file, we should move it to app's document directory for permanent local storage
  let finalUri = item.file_uri;
  if (item.type === 'file' && item.file_uri) {
    const fileName = item.file_name || `file_${Date.now()}`;
    const newPath = `${FileSystem.documentDirectory}${fileName}`;
    try {
      await FileSystem.copyAsync({
        from: item.file_uri,
        to: newPath
      });
      finalUri = newPath;
    } catch (e) {
      console.error('Error saving file locally:', e);
    }
  }

  const result = await database.runAsync(
    `INSERT INTO items (category_id, type, title, content, file_uri, file_name, reminder_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.category_id,
      item.type,
      item.title,
      item.content || null,
      finalUri || null,
      item.file_name || null,
      item.reminder_time || null,
      Date.now()
    ]
  );
  return result.lastInsertRowId;
}

export async function deleteItem(id: number): Promise<void> {
  const database = await initDatabase();
  // We might want to delete the local file too if it's a file
  const item = await database.getFirstAsync<MemoryItem>('SELECT file_uri, type FROM items WHERE id = ?', [id]);
  if (item?.type === 'file' && item.file_uri) {
    try {
      await FileSystem.deleteAsync(item.file_uri, { idempotent: true });
    } catch (e) {
      console.error('Error deleting local file:', e);
    }
  }
  await database.runAsync('DELETE FROM items WHERE id = ?', [id]);
}
