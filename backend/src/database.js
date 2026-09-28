const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/tasks.db');

let db = null;
let initPromise = null;

/**
 * Initialize (or load) the SQLite database.
 * Returns a promise that resolves with the sql.js Database instance.
 */
function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();

    // Ensure the database directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing database file or create new one
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('[DB] Loaded existing database from:', DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('[DB] Created new database at:', DB_PATH);
    }

    // Create tasks table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in-progress', 'completed')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        due_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    saveDatabase();
    console.log('[DB] Database initialized successfully.');
    return db;
  })();

  return initPromise;
}

/** Get the database instance (must call initDatabase first) */
function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

/** Persist the in-memory database to disk */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/** Close the database connection */
function closeDb() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    initPromise = null;
    console.log('[DB] Database connection closed.');
  }
}

module.exports = { initDatabase, getDb, saveDatabase, closeDb };
