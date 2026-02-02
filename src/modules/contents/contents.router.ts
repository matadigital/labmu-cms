import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const contentsRouter = new Hono();

// SKEMA VALIDASI
const contentSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    body: z.string().optional(),
    type: z.string().default('post'),
    status: z.string().default('draft'),
    featured_image: z.string().optional().nullable(),
    featured_image_caption: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    tags: z.string().optional().nullable(),
    created_at: z.string().optional()
});

// 1. GET ALL CONTENTS
contentsRouter.get('/', async (c) => {
    const type = c.req.query('type');
    try {
        let query = "SELECT * FROM contents WHERE 1=1";
        const params: any[] = [];

        if (type) {
            query += " AND type = ?";
            params.push(type);
        }

        query += " ORDER BY created_at DESC";
        
        const { results } = await c.env.DB.prepare(query).bind(...params).all();
        return c.json({ success: true, data: results });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 2. CREATE NEW CONTENT
contentsRouter.post('/', zValidator('json', contentSchema), async (c) => {
    const body = c.req.valid('json');
    try {
        // Cek Slug Unik
        const exists = await c.env.DB.prepare("SELECT id FROM contents WHERE slug = ?").bind(body.slug).first();
        if (exists) {
            return c.json({ success: false, error: 'Slug/URL sudah digunakan. Ganti judul atau slug.' }, 400);
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' '); 
        
        await c.env.DB.prepare(`
            INSERT INTO contents (id, title, slug, body, type, status, featured_image, featured_image_caption, category, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, body.title, body.slug, body.body || '', body.type, body.status,
            body.featured_image || null, body.featured_image_caption || null,
            body.category || '', body.tags || '',
            body.created_at || now, now
        ).run();

        return c.json({ success: true, message: 'Created', id });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 3. UPDATE CONTENT (PERBAIKAN UTAMA DISINI)
contentsRouter.put('/:id', zValidator('json', contentSchema), async (c) => {
    const id = c.req.param('id');
    const body = c.req.valid('json');
    
    try {
        // LOGIC FIX: Cek slug duplikat KECUALI punya diri sendiri
        const exists = await c.env.DB.prepare("SELECT id FROM contents WHERE slug = ? AND id != ?")
            .bind(body.slug, id).first();
            
        if (exists) {
            return c.json({ success: false, error: 'Slug sudah dipakai konten lain.' }, 400);
        }

        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await c.env.DB.prepare(`
            UPDATE contents SET 
                title = ?, slug = ?, body = ?, type = ?, status = ?,
                featured_image = ?, featured_image_caption = ?,
                category = ?, tags = ?, created_at = ?, updated_at = ?
            WHERE id = ?
        `).bind(
            body.title, body.slug, body.body || '', body.type, body.status,
            body.featured_image || null, body.featured_image_caption || null,
            body.category || '', body.tags || '',
            body.created_at || now, now,
            id
        ).run();

        return c.json({ success: true, message: 'Updated' });
    } catch (e: any) {
        console.error("DB Error:", e);
        return c.json({ success: false, error: 'DB Error: ' + e.message }, 500);
    }
});

// 4. DELETE CONTENT
contentsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        await c.env.DB.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 5. GET SINGLE
contentsRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const res = await c.env.DB.prepare("SELECT * FROM contents WHERE id = ?").bind(id).first();
        if(!res) return c.json({error: 'Not found'}, 404);
        return c.json(res);
    } catch(e: any) {
        return c.json({error: e.message}, 500);
    }
});

export default contentsRouter;