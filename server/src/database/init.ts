import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_URL || path.join(__dirname, '../../teleboot.db');

let db: sqlite3.Database;

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      createTables()
        .then(() => resolve())
        .catch(reject);
    });
  });
};

const createTables = async (): Promise<void> => {
  const run = promisify(db.run.bind(db));
  
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bots table
    await run(`
      CREATE TABLE IF NOT EXISTS bots (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        telegram_token TEXT,
        is_active BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Bot flows table
    await run(`
      CREATE TABLE IF NOT EXISTS bot_flows (
        id TEXT PRIMARY KEY,
        bot_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        flow_data TEXT NOT NULL,
        is_main BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots (id) ON DELETE CASCADE
      )
    `);

    // Templates table
    await run(`
      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        flow_data TEXT NOT NULL,
        is_public BOOLEAN DEFAULT TRUE,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
      )
    `);

    // Bot sessions table (for tracking user conversations)
    await run(`
      CREATE TABLE IF NOT EXISTS bot_sessions (
        id TEXT PRIMARY KEY,
        bot_id TEXT NOT NULL,
        telegram_user_id TEXT NOT NULL,
        current_node TEXT,
        session_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_id) REFERENCES bots (id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables created successfully');
    
    // Seed templates
    const { seedTemplates } = await import('../controllers/templatesController');
    await seedTemplates();
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};