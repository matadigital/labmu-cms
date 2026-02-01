import { D1Database } from '@cloudflare/workers-types';

export const updateSchema = async (db: D1Database) => {
  const logs = [];

  try {
    // 1. Tabel Options (PENTING: Ini yang bikin macet)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS options (
        key TEXT PRIMARY KEY, 
        value TEXT,
        autoload INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'options' checked/created.");

    // 2. Tabel Users (Untuk Admin Login)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'users' checked/created.");

    // 3. Tabel Contents (Artikel, Halaman, Menu)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS contents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT UNIQUE,
        body TEXT,
        type TEXT DEFAULT 'post',
        status TEXT DEFAULT 'draft',
        author_id INTEGER,
        category TEXT,
        tags TEXT,
        featured_image TEXT,
        wp_id INTEGER, 
        old_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'contents' checked/created.");

    return logs;
  } catch (e: any) {
    console.error(e);
    throw new Error("DB Init Failed: " + e.message);
  }
};