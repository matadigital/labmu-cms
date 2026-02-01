import { D1Database } from '@cloudflare/workers-types';
import { WPPost } from './wp.types';

export class WPImporterService {
  constructor(private db: D1Database) {}

  async importPosts(posts: WPPost[]) {
    const results = [];
    for (const post of posts) {
      try {
        await this.db.prepare(
          "INSERT OR REPLACE INTO contents (title, slug, body, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(post.title, post.slug, post.content, 'post', post.status, post.date).run();
        results.push({ title: post.title, status: 'success' });
      } catch (e: any) {
        results.push({ title: post.title, status: 'error', message: e.message });
      }
    }
    return results;
  }
}