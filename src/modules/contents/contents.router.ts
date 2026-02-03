import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// ✅ Interface untuk type safety
interface Bindings {
    DB: D1Database;
}

const contentsRouter = new Hono<{ Bindings: Bindings }>();

// SKEMA VALIDASI
const contentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    body: z.string().optional().default(''),
    type: z.enum(['post', 'page']).default('post'),
    status: z.enum(['draft', 'publish']).default('draft'),
    featured_image: z.string().optional().nullable(),
    featured_image_caption: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    tags: z.string().optional().nullable()
});

// ✅ AUTH MIDDLEWARE (tambahkan ini)
const authMiddleware = async (c: any, next: any) => {
    const token = c.req.header('Authorization');
    if (!token) {
        return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    // TODO: Verify JWT token here
    await next();
};

// 1. GET ALL CONTENTS
contentsRouter.get('/', async (c) => {
    const type = c.req.query('type');
    const status = c.req.query('status'); // ✅ Tambahan filter status
    
    try {
        let query = "SELECT * FROM contents WHERE 1=1";
        const params: any[] = [];

        if (type) {
            query += " AND type = ?";
            params.push(type);
        }
        
        if (status) {
            query += " AND status = ?";
            params.push(status);
        }

        query += " ORDER BY created_at DESC";
        
        const { results } = await c.env.DB.prepare(query).bind(...params).all();
        return c.json({ success: true, data: results || [] }); // ✅ Fallback array kosong
    } catch (e: any) {
        console.error("GET Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

// 2. CREATE NEW CONTENT
contentsRouter.post('/', 
    authMiddleware, // ✅ Tambah auth
    zValidator('json', contentSchema), 
    async (c) => {
        const body = c.req.valid('json');
        
        try {
            // ✅ Cek Slug Unik
            const exists = await c.env.DB.prepare("SELECT id FROM contents WHERE slug = ?")
                .bind(body.slug).first();
                
            if (exists) {
                return c.json({ 
                    success: false, 
                    error: 'Slug/URL sudah digunakan. Ganti judul atau slug.' 
                }, 400);
            }

            // ✅ FIX: Gunakan INTEGER ID dengan autoincrement atau pastikan UUID support
            // Opsi 1: Jika ID adalah INTEGER AUTOINCREMENT, jangan pass ID
            // Opsi 2: Jika ID adalah TEXT (UUID), gunakan crypto.randomUUID()
            
            const now = Math.floor(Date.now() / 1000); // ✅ Unix timestamp (INTEGER)
            
            // ✅ Asumsi: id adalah INTEGER AUTOINCREMENT
            const result = await c.env.DB.prepare(`
                INSERT INTO contents (
                    title, slug, body, type, status, 
                    featured_image, featured_image_caption, 
                    category, tags, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                body.title, 
                body.slug, 
                body.body || '', 
                body.type, 
                body.status,
                body.featured_image || null, 
                body.featured_image_caption || null,
                body.category || null, // ✅ null instead of empty string
                body.tags || null,     // ✅ null instead of empty string
                now, 
                now
            ).run();

            return c.json({ 
                success: true, 
                message: 'Created', 
                id: result.meta.last_row_id // ✅ Return actual inserted ID
            });
        } catch (e: any) {
            console.error("CREATE Error:", e);
            return c.json({ success: false, error: e.message }, 500);
        }
    }
);

// 3. UPDATE CONTENT
contentsRouter.put('/:id', 
    authMiddleware, // ✅ Tambah auth
    zValidator('json', contentSchema), 
    async (c) => {
        const id = c.req.param('id');
        const body = c.req.valid('json');
        
        try {
            // ✅ Cek apakah content exists
            const existing = await c.env.DB.prepare("SELECT id FROM contents WHERE id = ?")
                .bind(id).first();
                
            if (!existing) {
                return c.json({ success: false, error: 'Content not found' }, 404);
            }
            
            // ✅ Cek slug duplikat KECUALI punya diri sendiri
            const slugExists = await c.env.DB.prepare(
                "SELECT id FROM contents WHERE slug = ? AND id != ?"
            ).bind(body.slug, id).first();
                
            if (slugExists) {
                return c.json({ 
                    success: false, 
                    error: 'Slug sudah dipakai konten lain.' 
                }, 400);
            }

            const now = Math.floor(Date.now() / 1000); // ✅ Unix timestamp

            await c.env.DB.prepare(`
                UPDATE contents SET 
                    title = ?, 
                    slug = ?, 
                    body = ?, 
                    type = ?, 
                    status = ?,
                    featured_image = ?, 
                    featured_image_caption = ?,
                    category = ?, 
                    tags = ?, 
                    updated_at = ?
                WHERE id = ?
            `).bind(
                body.title, 
                body.slug, 
                body.body || '', 
                body.type, 
                body.status,
                body.featured_image || null, 
                body.featured_image_caption || null,
                body.category || null,
                body.tags || null,
                now, // ✅ Hanya update updated_at, bukan created_at
                id
            ).run();

            return c.json({ success: true, message: 'Updated' });
        } catch (e: any) {
            console.error("UPDATE Error:", e);
            return c.json({ success: false, error: 'DB Error: ' + e.message }, 500);
        }
    }
);

// 4. DELETE CONTENT
contentsRouter.delete('/:id', 
    authMiddleware, // ✅ Tambah auth
    async (c) => {
        const id = c.req.param('id');
        
        try {
            // ✅ Cek apakah content exists
            const existing = await c.env.DB.prepare("SELECT id FROM contents WHERE id = ?")
                .bind(id).first();
                
            if (!existing) {
                return c.json({ success: false, error: 'Content not found' }, 404);
            }
            
            await c.env.DB.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
            return c.json({ success: true, message: 'Deleted' });
        } catch (e: any) {
            console.error("DELETE Error:", e);
            return c.json({ success: false, error: e.message }, 500);
        }
    }
);

// 5. GET SINGLE
contentsRouter.get('/:id', async (c) => {
    const id = c.req.param('id');
    
    try {
        const res = await c.env.DB.prepare("SELECT * FROM contents WHERE id = ?")
            .bind(id).first();
            
        if (!res) {
            return c.json({ success: false, error: 'Content not found' }, 404);
        }
        
        return c.json({ success: true, data: res });
    } catch (e: any) {
        console.error("GET SINGLE Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

// ✅ BONUS: GET by slug (untuk public view)
contentsRouter.get('/slug/:slug', async (c) => {
    const slug = c.req.param('slug');
    
    try {
        const res = await c.env.DB.prepare(
            "SELECT * FROM contents WHERE slug = ? AND status = 'publish'"
        ).bind(slug).first();
            
        if (!res) {
            return c.json({ success: false, error: 'Content not found' }, 404);
        }
        
        return c.json({ success: true, data: res });
    } catch (e: any) {
        console.error("GET BY SLUG Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default contentsRouter;