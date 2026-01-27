import { Hono } from 'hono';
import LabMuQuran from '../../themes/labmu-quran'; 

// --- INI BARIS YANG HILANG SEBELUMNYA ---
const quranRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// ==========================================
// 1. ADMIN PANEL (UI)
// ==========================================
quranRouter.get('/panel', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LabMu Quran Installer</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
      <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fas fa-file-import"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Quran Data Manager</h1>
          <p class="text-gray-500 text-sm">Import 30 Juz (Indo + English)</p>
        </div>

        <div class="mb-6">
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-green-700">Progress</span>
            <span class="text-sm font-medium text-green-700" id="progress-text">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-green-600 h-2.5 rounded-full" style="width: 0%" id="progress-bar"></div>
          </div>
          <p id="status-text" class="text-xs text-gray-500 mt-2 text-center">Siap memulai...</p>
        </div>

        <div class="space-y-3">
          <button onclick="startImport()" id="btn-import" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition flex items-center justify-center gap-2">
            <i class="fas fa-cloud-download-alt"></i> Mulai Import (1-114)
          </button>
          
          <button onclick="resetDb()" class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 px-4 rounded transition text-sm">
            <i class="fas fa-trash"></i> Reset Database
          </button>
           <a href="/quran" target="_blank" class="block text-center text-blue-600 text-sm hover:underline mt-4">
            Buka Halaman Depan &rarr;
          </a>
        </div>
      </div>

      <script>
        async function startImport() {
            const btn = document.getElementById('btn-import');
            const bar = document.getElementById('progress-bar');
            const txt = document.getElementById('progress-text');
            const status = document.getElementById('status-text');
            
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            
            let successCount = 0;
            
            for (let i = 1; i <= 114; i++) {
                status.innerText = 'Mengunduh Surat ke-' + i + ' (Indo + Eng)...';
                
                try {
                    const res = await fetch('/api/quran/import-surah?nomor=' + i);
                    const json = await res.json();
                    if(json.status === 'success' || json.status === 'skipped') successCount++;
                } catch(e) { console.error(e); }

                const percent = Math.round((i / 114) * 100);
                bar.style.width = percent + '%';
                txt.innerText = percent + '% (' + i + '/114)';
                await new Promise(r => setTimeout(r, 800)); // Jeda biar aman
            }
            
            status.innerText = 'Selesai! ' + successCount + ' surat berhasil diproses.';
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.innerText = 'Import Selesai';
        }

        async function resetDb() {
            if(!confirm('Hapus semua data database?')) return;
            document.getElementById('status-text').innerText = 'Mereset...';
            const res = await fetch('/api/quran/install');
            const json = await res.json();
            if(json.success) {
                alert('Database Reset OK!');
                location.reload();
            }
        }
      </script>
    </body>
    </html>
  `);
});

// ==========================================
// 2. LOGIC IMPORTER (DUAL SOURCE)
// ==========================================

quranRouter.get('/import-surah', async (c) => {
    const nomor = c.req.query('nomor');
    if (!nomor) return c.json({ error: "Need ?nomor=" }, 400);
    const db = c.env.DB;
    
    try {
        // Cek apakah surat sudah ada
        const cek: any = await db.prepare("SELECT id, nama_latin FROM surah WHERE nomor = ?").bind(nomor).first();
        if (cek) return c.json({ status: "skipped", message: `Surat ${nomor} exists.` });

        // A. FETCH SUMBER INDONESIA (EQuran.id)
        const resIndo = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        if(!resIndo.ok) throw new Error("Gagal fetch EQuran.id");
        const jsonIndo: any = await resIndo.json();
        const dataIndo = jsonIndo.data;

        // B. FETCH SUMBER INGGRIS (AlQuran.Cloud - Sahih International)
        const resEng = await fetch(`http://api.alquran.cloud/v1/surah/${nomor}/en.sahih`);
        let mapEng: any = {};
        if(resEng.ok) {
            const jsonEng: any = await resEng.json();
            // Mapping nomor ayat -> teks inggris
            jsonEng.data.ayahs.forEach((a: any) => {
                mapEng[a.numberInSurah] = a.text;
            });
        }

        // C. INSERT SURAH
        await db.prepare("INSERT INTO surah (id, nomor, nama, nama_latin, arti, jumlah_ayat, tempat_turun, audio_full) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(dataIndo.nomor, dataIndo.nomor, dataIndo.nama, dataIndo.namaLatin, dataIndo.arti, dataIndo.jumlahAyat, dataIndo.tempatTurun, JSON.stringify(dataIndo.audioFull))
            .run();

        // D. INSERT AYAT (Merge Indo + Eng)
        const batchSize = 40; 
        const ayatList = dataIndo.ayat;
        
        for (let i = 0; i < ayatList.length; i += batchSize) {
            const chunk = ayatList.slice(i, i + batchSize);
            const stmts = chunk.map((a: any) => {
                // Ambil teks inggris dari mapEng (fallback string kosong jika gagal)
                const textEng = mapEng[a.nomorAyat] || ''; 
                
                return db.prepare("INSERT INTO ayah (surah_id, nomor_ayat, teks_arab, teks_latin, teks_indonesia, teks_inggris, audio_options) VALUES (?, ?, ?, ?, ?, ?, ?)")
                  .bind(dataIndo.nomor, a.nomorAyat, a.teksArab, a.teksLatin, a.teksIndonesia, textEng, JSON.stringify(a.audio));
            });
            await db.batch(stmts);
        }

        return c.json({ status: "success", message: `Imported QS. ${dataIndo.namaLatin} (+English)` });

    } catch (e: any) {
        return c.json({ status: "error", message: e.message }, 500);
    }
});

// API Reset Database
quranRouter.get('/install', async (c) => {
  const db = c.env.DB;
  try {
      await db.exec(`DROP TABLE IF EXISTS tema_ayat; DROP TABLE IF EXISTS ayah; DROP TABLE IF EXISTS surah; DROP TABLE IF EXISTS tema;`);
      
      await db.exec(`CREATE TABLE surah (id INTEGER PRIMARY KEY, nomor INTEGER, nama TEXT, nama_latin TEXT, jumlah_ayat INTEGER, tempat_turun TEXT, arti TEXT, audio_full TEXT);`);
      await db.exec(`CREATE TABLE ayah (id INTEGER PRIMARY KEY, surah_id INTEGER, nomor_ayat INTEGER, teks_arab TEXT, teks_latin TEXT, teks_indonesia TEXT, teks_inggris TEXT, audio_options TEXT, FOREIGN KEY(surah_id) REFERENCES surah(id));`);
      await db.exec(`CREATE INDEX idx_ayah_surah ON ayah(surah_id);`);
      await db.exec(`CREATE TABLE tema (id INTEGER PRIMARY KEY AUTOINCREMENT, judul TEXT, slug TEXT UNIQUE, icon TEXT);`);
      await db.exec(`CREATE TABLE tema_ayat (tema_id INTEGER, ayah_id INTEGER, PRIMARY KEY (tema_id, ayah_id));`);

      // Seed Tema
      const temaList = [
          { t: 'Doa', s: 'doa', i: '🤲' }, { t: 'Shalat', s: 'shalat', i: '🕌' },
          { t: 'Zakat', s: 'zakat', i: '💰' }, { t: 'Puasa', s: 'puasa', i: '🌙' }
      ];
      const stmtTema = db.prepare("INSERT INTO tema (judul, slug, icon) VALUES (?, ?, ?)");
      await db.batch(temaList.map(t => stmtTema.bind(t.t, t.s, t.i)));

      return c.json({ success: true });
  } catch (e: any) {
      return c.json({ success: false, error: e.message }, 500);
  }
});

// ==========================================
// 3. PUBLIC ROUTES (VIEW)
// ==========================================

quranRouter.get('/', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM surah ORDER BY nomor ASC").all();
  return c.html(LabMuQuran.renderHome({ site: { title: 'LabMu' }, data: results }));
});

quranRouter.get('/tema/:slug', async (c) => {
  const slug = c.req.param('slug');
  const db = c.env.DB;
  const tema: any = await db.prepare("SELECT * FROM tema WHERE slug = ?").bind(slug).first();
  if (!tema) return c.html(LabMuQuran.render404({ site: { title: 'LabMu' }, data: null }));

  const query = `
    SELECT a.nomor_ayat as nomorAyat, a.teks_arab as teksArab, a.teks_latin as teksLatin, 
    a.teks_indonesia as teksIndonesia, a.teks_inggris as teksInggris, a.audio_options as audioOptionsRaw, 
    s.nama_latin as namaSurat, s.nomor as nomorSurat
    FROM tema_ayat ta JOIN ayah a ON ta.ayah_id = a.id JOIN surah s ON a.surah_id = s.id 
    WHERE ta.tema_id = ?`;
  
  const { results } = await db.prepare(query).bind(tema.id).all();
  const ayatList = results.map((r: any) => ({ ...r, audioOptions: JSON.parse(r.audioOptionsRaw || '{"05":""}') }));

  const dataRender = {
    namaLatin: `Ayat Tentang ${tema.judul}`, nama: tema.icon || '📚', 
    arti: 'Indeks Tematik', jumlahAyat: ayatList.length, tempatTurun: 'Topik', 
    ayat: ayatList, audioFull: null
  };
  return c.html(LabMuQuran.renderSingle({ site: { title: 'LabMu' }, data: dataRender }));
});

quranRouter.get('/:nomor', async (c) => {
  const nomor = c.req.param('nomor');
  // Handle conflict params
  if(nomor === 'panel' || nomor === 'install' || nomor === 'import-surah') return c.redirect('/api/quran/panel');

  const db = c.env.DB;
  const surah: any = await db.prepare("SELECT * FROM surah WHERE nomor = ?").bind(nomor).first();
  if (!surah) return c.html(LabMuQuran.render404({ site: { title: 'LabMu' }, data: null }));

  const { results } = await db.prepare("SELECT nomor_ayat as nomorAyat, teks_arab as teksArab, teks_latin as teksLatin, teks_indonesia as teksIndonesia, teks_inggris as teksInggris, audio_options as audioOptionsRaw FROM ayah WHERE surah_id = ? ORDER BY nomor_ayat ASC").bind(surah.id).all();
  const ayatList = results.map((r: any) => ({ ...r, audioOptions: JSON.parse(r.audioOptionsRaw || '{}') }));
  const prev: any = await db.prepare("SELECT nomor, nama_latin as namaLatin FROM surah WHERE nomor = ?").bind(surah.nomor - 1).first();
  const next: any = await db.prepare("SELECT nomor, nama_latin as namaLatin FROM surah WHERE nomor = ?").bind(surah.nomor + 1).first();

  const dataRender = { ...surah, namaLatin: surah.nama_latin, jumlahAyat: surah.jumlah_ayat, ayat: ayatList, audioFull: JSON.parse(surah.audio_full || '{}'), suratSebelumnya: prev, suratSelanjutnya: next };
  return c.html(LabMuQuran.renderSingle({ site: { title: 'LabMu' }, data: dataRender }));
});

export default quranRouter;