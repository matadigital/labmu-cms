import { Hono } from 'hono';
import { Bindings } from '../../types';
import { authMiddleware } from '../../middleware/auth';

const users = new Hono<{ Bindings: Bindings }>();

async function hashPassword(password: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. LIST
users.get('/', authMiddleware, async (c) => {
    try {
        // Ambil email juga
        const { results } = await c.env.DB.prepare(
            "SELECT id, username, name, email, role, created_at FROM users ORDER BY created_at DESC"
        ).all();
        return c.json({ success: true, data: results });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 2. CREATE
users.post('/', authMiddleware, async (c) => {
    try {
        const body = await c.req.json();
        
        if(!body.username || !body.password) return c.json({ error: 'Data tidak lengkap' }, 400);

        // Cek username kembar
        const existing = await c.env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(body.username).first();
        if(existing) return c.json({ error: 'Username sudah dipakai' }, 400);

        // Cek email kembar (opsional, tapi disarankan)
        if (body.email) {
            const emailExist = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(body.email).first();
            if(emailExist) return c.json({ error: 'Email sudah terdaftar' }, 400);
        }

        const hashed = await hashPassword(body.password);
        const role = body.role || 'editor';
        const name = body.name || body.username;
        const email = body.email || ''; // Default kosong jika tidak diisi

        await c.env.DB.prepare(
            "INSERT INTO users (username, password, name, email, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(body.username, hashed, name, email, role, new Date().toISOString()).run();

        return c.json({ success: true, message: 'User dibuat' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 3. UPDATE
users.put('/:id', authMiddleware, async (c) => {
    try {
        const id = c.req.param('id');
        const body = await c.req.json();
        
        const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
        if(!user) return c.json({ error: 'User tidak ditemukan' }, 404);

        // Update basic info (termasuk email)
        let query = "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?";
        let params = [body.name, body.email || '', body.role, id];

        // Jika password diisi, update juga
        if(body.password && body.password.length > 0) {
            const hashed = await hashPassword(body.password);
            query = "UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?";
            params = [body.name, body.email || '', body.role, hashed, id];
        }

        await c.env.DB.prepare(query).bind(...params).run();
        return c.json({ success: true, message: 'User diupdate' });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// 4. DELETE
users.delete('/:id', authMiddleware, async (c) => {
    try {
        const id = c.req.param('id');
        await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
        return c.json({ success: true });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// LOGIN
users.post('/login', async (c) => {
    const body = await c.req.json();
    const hashed = await hashPassword(body.password);
    
    // Login bisa pakai username ATAU email (Fitur Pro!)
    const user = await c.env.DB.prepare(
        "SELECT id, username, role, name, email FROM users WHERE (username = ? OR email = ?) AND password = ?"
    ).bind(body.username, body.username, hashed).first();

    if (!user) return c.json({ error: 'Login gagal. Cek username/email dan password.' }, 401);

    const tokenPayload = JSON.stringify({ 
        id: user.id, 
        role: user.role, 
        name: user.name, 
        exp: Date.now() + 86400000 
    });
    const token = 'labmu_v1.' + btoa(tokenPayload);

    return c.json({ success: true, token, user });
});

export default users;