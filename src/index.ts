import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from './types'

// --- 1. IMPORT ADDONS SYSTEM ---
import registerAddons from './addons'

// --- 2. IMPORT MODULES LAMA (WAJIB ADA) ---
import contentRouter from './modules/contents/contents.router'
import adminRouter from './modules/admin/admin.router'
import publicRouter from './modules/public/public.router'
import settingsRouter from './modules/settings/settings.router'
import mediaRouter from './modules/media/media.router'
import usersRouter from './modules/users/users.router'
import migrationRouter from './migration' 
import themeRouter from './modules/theme/theme.router' 
import quranRouter from './addons/quran-mu/quran.router' 
import { updateSchema } from './db/init'
import menusRouter from './modules/menus/menus.router'; // Import

import settings from './modules/settings/settings.router';

// --- 3. INISIALISASI APP ---
const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('/*', cors());

// --- 4. DAFTARKAN ADDONS (UPDATE PENTING DISINI) ---
// Kita masukkan variabel 'app' agar Addon WP Importer bisa bikin route sendiri
registerAddons(app);

// --- 5. SYSTEM ROUTES (PERTAHANKAN) ---
app.get('/sys/install', async (c) => {
  try {
     const logs = await updateSchema(c.env.DB);
     return c.json({ success: true, message: "Database Upgrade Sukses!", details: logs });
  } catch (e: any) {
     return c.json({ error: "Gagal Init DB: " + e.message }, 500);
  }
})

// --- 6. ROUTING MODULES LENGKAP (PERTAHANKAN) ---
app.route('/sys/migration', migrationRouter)
app.route('/api/contents', contentRouter)
app.route('/api/settings', settingsRouter)
app.route('/api/media', mediaRouter)
app.route('/api/theme', themeRouter)
app.route('/api/users', usersRouter)
app.route('/api/settings', settings)
app.route('/api/menus', menusRouter);

// Fitur Quran (Manual Route)
app.route('/api/quran', quranRouter)

// Admin Panel
app.route('/admin', adminRouter)

// Public Router (Harus paling bawah karena menangkap semua slug)
app.route('/', publicRouter)

export default app