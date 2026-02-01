import { Hono } from 'hono';
import { Bindings } from './types';

const migration = new Hono<{ Bindings: Bindings }>();

migration.get('/', async (c) => {
  try {
    const logs = [];
    const alterations = [
      // ... Alterations sebelumnya biarkan saja, SQL akan skip kalau sudah ada
      "ALTER TABLE contents ADD COLUMN featured_image_caption TEXT",
      "ALTER TABLE media_meta ADD COLUMN caption TEXT",
      "ALTER TABLE users ADD COLUMN name TEXT",
      "ALTER TABLE users ADD COLUMN created_at TEXT",
      "ALTER TABLE users ADD COLUMN role TEXT",
      "ALTER TABLE users ADD COLUMN email TEXT",

      // TABEL BARU: SETTINGS
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      )`
    ];

    for (const sql of alterations) {
      try {
        await c.env.DB.prepare(sql).run();
        logs.push(`✅ Sukses: ${sql}`);
      } catch (e: any) {
        logs.push(`ℹ️ Skip: ${sql}`); // Error diabaikan (sudah ada)
      }
    }

    // SEED DEFAULT DATA (Jika kosong)
    try {
        const check = await c.env.DB.prepare("SELECT count(*) as count FROM settings").first();
        if (check && check.count === 0) {
            await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").bind('site_title', 'LabMu CMS').run();
            await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").bind('site_desc', 'Just another CMS site').run();
            await c.env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").bind('admin_email', 'admin@example.com').run();
            logs.push("✅ Seed Default Settings");
        }
    } catch(e) {}

    return c.json({ success: true, message: "Upgrade Database Selesai!", logs });
  } catch (e: any) {
    return c.json({ success: false, error: e.message });
  }
});

export default migration;