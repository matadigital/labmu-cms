import { R2Bucket, D1Database } from '@cloudflare/workers-types'

export class MediaService {
  // Sekarang butuh DB juga
  constructor(private bucket: R2Bucket, private db: D1Database) {}

  async upload(key: string, file: File) {
    await this.bucket.put(key, file);
    return { key };
  }

  // LIST FILES + Gabungkan dengan Data SEO dari DB
  async list() {
    // 1. Ambil list file dari R2
    const list = await this.bucket.list({ limit: 50 });
    
    // 2. Ambil semua metadata dari DB
    const { results } = await this.db.prepare("SELECT * FROM media_meta").all();
    
    // 3. Gabungkan (Mapping)
    return list.objects.map(obj => {
      // Cari apakah file ini punya data SEO di DB?
      const meta: any = results.find((m: any) => m.key === obj.key) || {};
      
      return {
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        // Masukkan data SEO, atau default kosong
        alt: meta.alt || '',
        description: meta.description || '',
        title: meta.title || ''
      };
    });
  }

  async get(key: string) {
    return await this.bucket.get(key);
  }

  async delete(key: string) {
    await this.bucket.delete(key);
    // Hapus juga data SEO-nya di DB biar bersih
    await this.db.prepare("DELETE FROM media_meta WHERE key = ?").bind(key).run();
  }

  // FITUR BARU: SIMPAN META SEO
  async saveMeta(key: string, data: {alt?: string, description?: string, title?: string}) {
    return await this.db.prepare(`
      INSERT INTO media_meta (key, alt, description, title) VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET alt=excluded.alt, description=excluded.description, title=excluded.title
    `).bind(key, data.alt || '', data.description || '', data.title || '').run();
  }
}