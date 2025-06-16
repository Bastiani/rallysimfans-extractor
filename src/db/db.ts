import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeOnlineRallyTable } from '../scrape-functions/onlineRally.ts';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPromise = open({
  filename: path.join(__dirname, 'data.sqlite'),
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
  await db.exec(`CREATE TABLE IF NOT EXISTS rally_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

export async function saveOnlineRallyTableScrapeResult(data: string) {
  const db = await dbPromise;
  await db.run('INSERT INTO rally_data (data) VALUES (?)', [data]);
}

// Retorna o registro mais recente de rally_data
export async function getLatestOnlineRallyTableScrapeResult() {
  const db = await dbPromise;
  return db.get('SELECT * FROM rally_data ORDER BY created_at DESC LIMIT 1');
}

// Salva o resultado do scrape, mas só se já passou mais de 1 minuto desde a última atualização
export async function saveOrGetOnlineRallyTableScrapeResult() {
  const db = await dbPromise;
  const last = await db.get('SELECT * FROM rally_data ORDER BY created_at DESC LIMIT 1');
  if (last) {
    // Corrige o formato da data para garantir que o Date interprete corretamente
    let createdAtString = last.created_at.replace(' ', 'T');
    if (!createdAtString.endsWith('Z')) {
      createdAtString += 'Z';
    }
    const lastTime = new Date(createdAtString).getTime();
    const now = Date.now();
    if (now - lastTime < 10 * 60 * 1000) {
      // Menos de 10 minutos, retorna o cache
      console.log('Returning cached data as it is less than 10 minutes old');
      return last.data;
    }
  }

  // Executa o scrape
  console.log('Scraping new data...');
  const data = await scrapeOnlineRallyTable();
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  // Salva novo dado
  await db.run('INSERT INTO rally_data (data) VALUES (?)', [jsonString]);
  return data;
}

