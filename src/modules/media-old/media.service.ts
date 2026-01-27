import { R2Bucket, D1Database } from '@cloudflare/workers-types'

export class MediaService {
  constructor(private bucket: R2Bucket, private db: D1Database) {}

  // 1. FUNGSI LIST (Mengambil daftar file dari R2)
  async list() {
    // include: ['customMetadata'] agar meta data terbaca
    const listed = await this.bucket.list({ include: ['customMetadata'] });
    
    // Mapping agar formatnya bersih
    return listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      httpEtag: obj.httpEtag,
      // Metadata tambahan jika ada
      customMetadata: obj.customMetadata || {}
    }));
  }

  // 2. FUNGSI GET (Mengambil 1 file untuk ditampilkan)
  async get(key: string) {
    return await this.bucket.get(key);
  }

  // 3. FUNGSI UPLOAD (Simpan file ke R2)
  async upload(key: string, file: File | Blob) {
    await this.bucket.put(key, file, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalName: (file as any).name || 'unknown'
      }
    });
  }

  // 4. FUNGSI DELETE (Hapus file)
  async delete(key: string) {
    await this.bucket.delete(key);
  }

  // 5. FUNGSI SAVE META (Simpan SEO image)
  async saveMeta(key: string, meta: any) {
    // Di R2, untuk update metadata kita harus copy file ke dirinya sendiri
    // Tapi untuk simpelnya, kita simpan di D1 saja atau abaikan dulu
    // (Implementasi advanced bisa menyusul)
    const object = await this.bucket.head(key);
    if(object) {
      await this.bucket.put(key, object.body, {
        customMetadata: { ...object.customMetadata, ...meta }
      })
    }
  }
}