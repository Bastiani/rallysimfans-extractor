import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPromise = open({
  filename: path.join(__dirname, 'db', 'checkDate.sqlite'),
  driver: sqlite3.Database
});

export async function initDB() {
  const db = await dbPromise;
  await db.exec(`CREATE TABLE IF NOT EXISTS check_date (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    UNIQUE(name, date)
  )`);
}

export async function wasCheckDateTrue(name: string, date: string): Promise<boolean> {
  const db = await dbPromise;
  const row = await db.get('SELECT 1 FROM check_date WHERE name = ? AND date = ?', [name, date]);
  return !!row;
}

export async function setCheckDateTrue(name: string, date: string) {
  const db = await dbPromise;
  await db.run('INSERT OR IGNORE INTO check_date (name, date) VALUES (?, ?)', [name, date]);
}
