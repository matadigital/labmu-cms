import { Hono } from 'hono'
import { Bindings } from './types'

const migration = new Hono<{ Bindings: Bindings }>()

migration.get('/', async (c) => {
  try {
    const logs = [];

    // 1. TAMBAHKAN KOLOM KE TABEL 'CONTENTS' (Bukan Posts)
    const alterations = [
      "ALTER TABLE contents ADD COLUMN category TEXT",
      "ALTER TABLE contents ADD COLUMN tags TEXT",
      "ALTER TABLE contents ADD COLUMN author TEXT",
      "ALTER TABLE contents ADD COLUMN featured_image TEXT" // Jaga-jaga kalau belum ada
    ];

    for (const sql of alterations) {
        try {
            await c.env.DB.prepare(sql).run();
            logs.push(`✅ Sukses: ${sql}`);
        } catch (e: any) {
            // Kalau error "duplicate column", berarti aman (sudah ada)
            logs.push(`ℹ️ Skip (Sudah ada?): ${sql} -> ${e.message}`);
        }
    }

    return c.json({ 
        success: true, 
        message: "✅ Database 'contents' berhasil di-upgrade!",
        logs 
    });

  } catch (e: any) {
    return c.json({ success: false, error: e.message });
  }
});

export default migration;