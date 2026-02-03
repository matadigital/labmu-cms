import { D1Database } from '@cloudflare/workers-types';

export const updateSchema = async (db: D1Database) => {
  const logs = [];

  try {
    // 1. TABEL OPTIONS
    // Menyimpan konfigurasi autoload
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS options (
        key TEXT PRIMARY KEY, 
        value TEXT,
        autoload INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'options' checked (Safe).");

    // 2. TABEL USERS
    // Menyimpan data login admin/editor
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    logs.push("✅ Table 'users' checked (Safe).");

    // 3. TABEL CONTENTS
    // Menyimpan Post, Page, Draft, dll
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
    logs.push("✅ Table 'contents' checked (Safe).");

    // 4. TABEL SETTINGS
    // Menyimpan Judul Situs, Favicon, Deskripsi
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `).run();
    logs.push("✅ Table 'settings' checked (Safe).");

    // 5. TABEL MENUS (FIXED & STABLE)
    // ID menggunakan TEXT agar support UUID
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS menus (
        id TEXT PRIMARY KEY, 
        label TEXT,
        url TEXT,
        order_num INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'menus' checked (Safe - ID TEXT).");

    // 6. TABEL THEMES
    // Menyimpan daftar tema dan status aktif
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        author TEXT,
        version TEXT,
        active INTEGER DEFAULT 0
      );
    `).run();
    logs.push("✅ Table 'themes' checked (Safe).");

    // Optional: Auto-insert default theme jika tabel baru dibuat
    await db.prepare(`
      INSERT OR IGNORE INTO themes (id, name, description, active) 
      VALUES ('labmu-default', 'LabMu Default', 'Standard LabMu Theme', 1);
    `).run();

    return logs;

  } catch (e: any) {
    console.error("Schema Update Error:", e);
    // Kita return error log biar tampil di browser/API
    logs.push("❌ ERROR: " + e.message);
    return logs;
  }
};