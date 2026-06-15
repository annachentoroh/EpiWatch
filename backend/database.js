const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'epiwatch.sqlite');

// Підключення до локального файлу бази даних
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[SQLite] Помилка підключення до бази даних:', err.message);
  } else {
    console.log('[SQLite] Успішно підключено до локальної БД epiwatch.sqlite.');
  }
});

// Промісифікована обгортка для виконання запитів (INSERT, UPDATE, CREATE)
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

// Промісифікована обгортка для вибірки кількох рядків (SELECT ALL)
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Промісифікована обгортка для вибірки одного рядка (SELECT SINGLE)
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Ініціалізація реляційної схеми таблиці для епідемій
const initDb = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS diseases (
      id TEXT PRIMARY KEY,
      name TEXT,
      origin TEXT,
      type TEXT,
      pathogen TEXT,
      level TEXT,
      levelLabel TEXT,
      cases INTEGER,
      deaths INTEGER,
      recovered INTEGER,
      regions TEXT,        -- Текстове поле для збереження JSON-масивів
      symptoms TEXT,       -- Текстове поле для збереження JSON-масивів
      transmission TEXT,
      prevention TEXT,     -- Текстове поле для збереження JSON-масивів
      lat REAL,
      lng REAL,
      country TEXT,
      date TEXT,
      sources TEXT         -- Текстове поле для збереження JSON-масивів
    )
  `;
  try {
    await run(sql);
    console.log('[SQLite] Схему таблиці "diseases" успішно валідовано/створено.');
  } catch (err) {
    console.error('[SQLite] Помилка створення таблиці:', err.message);
  }
};

module.exports = {
  run,
  all,
  get,
  initDb
};