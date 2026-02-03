import { Hono } from 'hono';
import { Bindings } from '../../types';
import { getActiveTheme } from '../../themes/registry'; 
import { QuranService } from '../../addons/quran-mu/quran.service';

const publicRouter = new Hono<{ Bindings: Bindings }>();

// --- HELPER: AMBIL DATA GLOBAL (SETTINGS & MENU) ---
async function getGlobalData(db: D1Database) {
    let settings: any = {};
    let menus: any[] = [];

    try {
        // 1. Ambil Settings
        const { results: settingRows } = await db.prepare("SELECT key, value FROM settings").all();
        if(settingRows) settingRows.forEach((row: any) => { settings[row.key] = row.value; });

        // 2. Ambil Menus
        const { results: menuRows } = await db.prepare("SELECT * FROM menus ORDER BY order_num ASC").all();
        menus = menuRows || [];
    } catch (e) {
        console.error("Error fetching global data (Tables might be missing)", e);
    }

    return { settings, menus };
}

// --- HELPER: RENDERER THEME (SAFE MODE) ---
async function getRenderer(db: any) {
  try {
    // KUNCI: Query ke tabel themes, cari yang active = 1
    const activeTheme = await db.prepare("SELECT id FROM themes WHERE active = 1").first();
    
    // Kalau ketemu, pakai ID-nya. Kalau tidak, pakai default.
    const themeId = activeTheme ? activeTheme.id : 'labmu-default';
    
    return getActiveTheme(themeId);
  } catch (e) {
    console.error("Gagal load theme, fallback ke default");
    return getActiveTheme('labmu-default');
  }
}


// 1. ROUTE KHUSUS: DAFTAR SURAT
publicRouter.get('/quran', async (c) => {
  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const Renderer = await getRenderer(c.env.DB);
    
    const quranService = new QuranService(c.env.QURAN_CACHE);
    const listSurat = await quranService.getDaftarSurat();

    const listHtml = listSurat.map((s: any) => `
        <div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between;">
            <a href="/quran/${s.nomor}" style="text-decoration:none; font-weight:bold; color:#2271b1;">
                ${s.nomor}. ${s.namaLatin}
            </a>
            <span style="color:#666;">${s.arti}</span>
        </div>
    `).join('');

    const context = {
        site: settings,
        menus: menus,
        data: { 
            title: 'Al-Quran Digital', 
            body: `<div class="quran-list">${listHtml}</div>` 
        }
    };

    return c.html(Renderer.renderPage(context));

  } catch(e: any) {
    return c.text('Gagal memuat Quran: ' + e.message, 500);
  }
});


// 2. ROUTE KHUSUS: BACA SURAT
publicRouter.get('/quran/:nomor', async (c) => {
  const nomor = c.req.param('nomor');
  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const Renderer = await getRenderer(c.env.DB);

    const quranService = new QuranService(c.env.QURAN_CACHE);
    const dataSurat: any = await quranService.getDetailSurat(nomor);
    if (!dataSurat) return c.text('Surat tidak ditemukan.', 404);

    const ayatHtml = dataSurat.ayat.map((a: any) => `
        <div style="margin-bottom:30px; border-bottom:1px solid #f0f0f0; padding-bottom:20px;">
            <div style="text-align:right; font-size:28px; font-family:'Amiri', serif; margin-bottom:10px;">${a.ar}</div>
            <div style="font-size:16px; color:#333;">${a.nomor}. ${a.idn}</div>
        </div>
    `).join('');

    const context = {
        site: settings,
        menus: menus,
        data: {
            title: `Surat ${dataSurat.namaLatin} (${dataSurat.arti})`,
            body: `
                <div style="background:#f9f9f9; padding:15px; margin-bottom:20px; border-radius:8px;">
                    <strong>Info:</strong> ${dataSurat.jumlahAyat} Ayat, Turun di ${dataSurat.tempatTurun}.
                    <br><a href="/quran">&larr; Kembali ke Daftar Surat</a>
                </div>
                ${ayatHtml}
            `
        }
    };

    return c.html(Renderer.renderPage(context));

  } catch(e: any) {
    return c.text('Gagal: ' + e.message, 500);
  }
});


// 3. HOME (Artikel Biasa) - MODIFIED FILTER
publicRouter.get('/', async (c) => {
  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const Renderer = await getRenderer(c.env.DB);
    
    // Ambil Posts dengan Try-Catch
    let results: any[] = [];
    try {
        // PERBAIKAN DISINI: Tambahkan "AND type = 'post'"
        const res = await c.env.DB.prepare(
            "SELECT * FROM contents WHERE status = 'publish' AND type = 'post' ORDER BY created_at DESC"
        ).all();
        results = res.results || [];
    } catch(e) {}

    const context = {
        site: settings, 
        menus: menus,    
        data: results    
    };
    return c.html(Renderer.renderHome(context));

  } catch (e: any) { return c.text('Error: ' + e.message, 500); }
});


// 4. SMART ROUTE: POST vs PAGE
publicRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  if (slug.includes('.')) return c.notFound(); 

  try {
    const { settings, menus } = await getGlobalData(c.env.DB);
    const Renderer = await getRenderer(c.env.DB);

    // Cari Konten (Bisa Post atau Page)
    const content = await c.env.DB.prepare(
        "SELECT * FROM contents WHERE slug = ? AND status = 'publish'"
    ).bind(slug).first();
    
    const context = {
        site: settings,
        menus: menus,
        data: content
    };

    if (!content) {
        return c.html(Renderer.render404(context), 404);
    } else if (content.type === 'page') {
        // Render Halaman Statis
        return c.html(Renderer.renderPage(context));
    } else {
        // Render Artikel Blog
        return c.html(Renderer.renderSingle(context));
    }

  } catch (e: any) { 
    return c.text('Error System: ' + e.message, 500); 
  }
});

export default publicRouter;