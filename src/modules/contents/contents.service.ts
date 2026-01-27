import { D1Database } from '@cloudflare/workers-types'

export class ContentService {
  constructor(private db: D1Database) {}

  async getAll() {
    const { results } = await this.db.prepare("SELECT * FROM contents ORDER BY created_at DESC").all();
    return results;
  }

  // --- TAMBAHAN BARU: AMBIL SATU DATA ---
  async getById(id: string) {
    return await this.db.prepare("SELECT * FROM contents WHERE id = ?").bind(id).first();
  }

  async create(data: any) {
    const { title, slug, body, type, status } = data;
    const res = await this.db.prepare(
      "INSERT INTO contents (title, slug, body, type, status) VALUES (?, ?, ?, ?, ?) RETURNING id"
    ).bind(title, slug, body, type, status).first();
    return res;
  }

  // --- TAMBAHAN BARU: UPDATE DATA ---
  async update(id: string, data: any) {
    const { title, slug, body, type, status } = data;
    // Update data berdasarkan ID
    const res = await this.db.prepare(
      "UPDATE contents SET title=?, slug=?, body=?, type=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(title, slug, body, type, status, id).run();
    return res;
  }

  // --- TAMBAHAN BARU: HAPUS DATA ---
  async delete(id: string) {
    return await this.db.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
  }
}