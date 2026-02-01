import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { Bindings } from '../../types'
// IMPORT PENTING: Ambil daftar tema dari hasil scan otomatis
import { availableThemes } from '../../themes/registry'

const theme = new Hono<{ Bindings: Bindings }>()

// 1. LIST THEMES (Dinamis dari Registry + Status DB)
theme.get('/', async (c) => {
  let currentActiveId = 'labmu-default';
  
  // Cek database untuk tahu mana yang sedang aktif
  try {
    const activeOption = await c.env.DB.prepare("SELECT value FROM options WHERE key = 'active_theme'").first();
    if(activeOption) currentActiveId = activeOption.value as string;
  } catch(e) {
    // Abaikan jika tabel belum ada (fallback ke default)
  }

  // GABUNGKAN DATA: Registry + Status Aktif
  const data = availableThemes.map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description || 'Tidak ada deskripsi',
    // Logic untuk menentukan badge "Active"
    active: t.id === currentActiveId,
    // Thumbnail placeholder otomatis sesuai nama tema
    thumbnail: `https://placehold.co/600x400/2563eb/ffffff?text=${encodeURIComponent(t.name)}`
  }));

  return c.json({ success: true, data });
})

// 2. ACTIVATE THEME
theme.post('/activate', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    // Support theme_id (dari Admin Panel) atau themeId (legacy)
    const targetId = body.theme_id || body.themeId; 

    if (!targetId) {
        return c.json({ success: false, message: "ID Tema tidak boleh kosong" }, 400);
    }

    // Pastikan tema benar-benar ada di registry sebelum disimpan
    const exists = availableThemes.find((t: any) => t.id === targetId);
    if (!exists) {
        return c.json({ success: false, message: "Tema tidak dikenal sistem" }, 404);
    }
    
    // Simpan ke DB (Upsert)
    await c.env.DB.prepare(`
      INSERT INTO options (key, value) VALUES ('active_theme', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).bind(targetId).run();

    return c.json({ success: true, message: `Tema ${exists.name} berhasil diaktifkan!` });
  } catch (e: any) {
    console.error(e);
    return c.json({ success: false, error: e.message }, 500);
  }
})

export default theme