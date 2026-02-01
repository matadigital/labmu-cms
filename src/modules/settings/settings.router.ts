import { Hono } from 'hono';
import { Bindings } from '../../types';
import { authMiddleware } from '../../middleware/auth';

const settings = new Hono<{ Bindings: Bindings }>();

// GET ALL SETTINGS (Format Object: { site_title: '...', ... })
settings.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();
    
    // Convert Array [{key:'a', value:'1'}] -> Object {a: '1'}
    const data: any = {};
    if(results){
        results.forEach((row: any) => {
            data[row.key] = row.value;
        });
    }
    return c.json({ success: true, data });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// SAVE SETTINGS (Terima Object, Simpan Loop)
settings.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    
    // Loop setiap key di body dan update/insert ke DB
    const stmt = c.env.DB.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `);
    
    const batch = [];
    for (const key in body) {
        batch.push(stmt.bind(key, body[key]));
    }
    
    await c.env.DB.batch(batch);
    
    return c.json({ success: true, message: 'Settings saved' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default settings;