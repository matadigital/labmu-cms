import { Hono } from 'hono'
import { Bindings } from '../../types'
import { renderPublicPage } from './public.view'
import { QuranService } from '../../addons/quran-mu/quran.service'

const publicRouter = new Hono<{ Bindings: Bindings }>()

// 1. ROUTE KHUSUS: DAFTAR SURAT (Pakai Cache KV)
publicRouter.get('/quran', async (c) => {
  try {
    // Inisialisasi Service dengan Binding KV
    const quranService = new QuranService(c.env.QURAN_CACHE);
    const listSurat = await quranService.getDaftarSurat();

    const html = await renderPublicPage(c.env.DB, { slug: 'quran', title: 'Al-Quran Digital', type: 'virtual' }, listSurat as any[]);
    return c.html(html);
  } catch(e: any) {
    return c.text('Gagal memuat Quran: ' + e.message, 500);
  }
})

// 2. ROUTE KHUSUS: BACA SURAT (Pakai Cache KV)
publicRouter.get('/quran/:nomor', async (c) => {
  const nomor = c.req.param('nomor');
  try {
    const quranService = new QuranService(c.env.QURAN_CACHE);
    const dataSurat: any = await quranService.getDetailSurat(nomor);

    if (!dataSurat) return c.text('Surat tidak ditemukan / Gagal fetch.', 404);

    const content = {
        slug: `quran/${nomor}`,
        title: `Surat ${dataSurat.namaLatin}`,
        type: 'virtual',
        ...dataSurat 
    };

    const html = await renderPublicPage(c.env.DB, content, []);
    return c.html(html);
  } catch(e: any) {
    return c.text('Gagal memuat Surat: ' + e.message, 500);
  }
})

// 3. HOME (Artikel Biasa)
publicRouter.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM contents WHERE status = 'publish' ORDER BY created_at DESC").all();
    const html = await renderPublicPage(c.env.DB, null, results as any[]);
    return c.html(html);
  } catch (e: any) { return c.text('Error: ' + e.message, 500); }
})

// 4. SINGLE POST (Artikel Biasa)
publicRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (slug.includes('.')) return c.notFound(); 

  try {
    const post = await c.env.DB.prepare("SELECT * FROM contents WHERE slug = ? AND status = 'publish'").bind(slug).first();
    if (!post) return c.notFound();

    const { results } = await c.env.DB.prepare("SELECT title, slug FROM contents WHERE status = 'publish' ORDER BY created_at DESC LIMIT 5").all();
    const html = await renderPublicPage(c.env.DB, post, results as any[]);
    return c.html(html);
  } catch (e: any) { return c.text('Error: ' + e.message, 500); }
})

export default publicRouter