import { KVNamespace } from '@cloudflare/workers-types'

export class QuranService {
  constructor(private kv: KVNamespace) {}

  // 1. LIST SURAT (Cache 30 Hari)
  async getDaftarSurat() {
    const CACHE_KEY = 'quran:list';
    const cached = await this.kv.get(CACHE_KEY, 'json');
    if (cached) return cached;

    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const json: any = await res.json();
        
        if (json.data) {
            await this.kv.put(CACHE_KEY, JSON.stringify(json.data), { expirationTtl: 2592000 });
            return json.data;
        }
    } catch (e) {
        console.error('Gagal fetch list', e);
        return [];
    }
  }

  // 2. DETAIL HYBRID (Indo + Inggris + Multi Audio)
  async getDetailSurat(nomor: string) {
    const CACHE_KEY = `quran:detail_v3:${nomor}`; // Versi 3 (Struktur Baru)

    const cached = await this.kv.get(CACHE_KEY, 'json');
    if (cached) return cached;

    console.log(`🌍 Fetching Hybrid Data: Surat ${nomor}`);

    try {
        const [resIndo, resEng] = await Promise.all([
            fetch(`https://equran.id/api/v2/surat/${nomor}`),
            fetch(`http://api.alquran.cloud/v1/surah/${nomor}/en.sahih`)
        ]);

        const jsonIndo: any = await resIndo.json();
        const jsonEng: any = await resEng.json();

        if (jsonIndo.data && jsonEng.data && jsonEng.data.ayahs) {
            const data = jsonIndo.data;
            const englishAyahs = jsonEng.data.ayahs;

            // Gabungkan Data
            data.ayat = data.ayat.map((ayat: any, index: number) => {
                return {
                    ...ayat,
                    teksInggris: englishAyahs[index] ? englishAyahs[index].text : '',
                    // Simpan SEMUA opsi audio untuk dropdown nanti
                    audioOptions: ayat.audio 
                };
            });

            await this.kv.put(CACHE_KEY, JSON.stringify(data), { expirationTtl: 31536000 });
            return data;
        }
    } catch (e) {
        return null;
    }
  }
}