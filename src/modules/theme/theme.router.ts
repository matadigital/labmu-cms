import { Hono } from 'hono';
import { availableThemes } from '../../themes/registry';

const theme = new Hono<{ Bindings: any }>();

// GET: List Themes & Status Aktif
theme.get('/', async (c) => {
  try {
    // 1. Ambil status aktif langsung dari tabel themes
    const { results: dbThemes } = await c.env.DB.prepare("SELECT id, active FROM themes").all();
    
    // 2. Map data file registry dengan data database
    const data = availableThemes.map(t => {
      const dbEntry = dbThemes?.find((d: any) => d.id === t.id);
      return {
        ...t,
        active: dbEntry ? dbEntry.active === 1 : (t.id === 'labmu-default'), // Default fallback
        thumbnail: `https://placehold.co/600x400/2563eb/ffffff?text=${encodeURIComponent(t.name)}`
      };
    });

    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// POST: Activate Theme (FIXED LOGIC)
theme.post('/activate', async (c) => {
  try {
    const body = await c.req.json();
    const targetId = body.theme_id || body.themeId;

    if (!targetId) return c.json({ success: false, message: 'ID Tema kosong' }, 400);

    // 1. Reset semua tema jadi inactive (0)
    await c.env.DB.prepare("UPDATE themes SET active = 0").run();

    // 2. Cek apakah tema sudah ada di DB, kalau belum insert dulu
    const exists = await c.env.DB.prepare("SELECT id FROM themes WHERE id = ?").bind(targetId).first();
    
    if (!exists) {
       // Ambil detail dari registry
       const info = availableThemes.find(t => t.id === targetId);
       if(info) {
          await c.env.DB.prepare(`
            INSERT INTO themes (id, name, description, author, version, active) 
            VALUES (?, ?, ?, ?, ?, 1)
          `).bind(info.id, info.name, info.description, info.author, info.version).run();
       } else {
          return c.json({ success: false, message: 'Tema tidak ditemukan di registry' }, 404);
       }
    } else {
       // 3. Set tema target jadi active (1)
       await c.env.DB.prepare("UPDATE themes SET active = 1 WHERE id = ?").bind(targetId).run();
    }

    return c.json({ success: true, message: 'Tema Berhasil Diaktifkan!' });
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
});

export default theme;