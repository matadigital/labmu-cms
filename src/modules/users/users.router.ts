import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { Bindings } from '../../types'

const users = new Hono<{ Bindings: Bindings }>()

// 1. LOGIN (FIXED: Payload HARUS ada Username & Password)
users.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Cek User di DB
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
    
    if (!user || user.password !== password) {
       return c.json({ error: 'Username atau Password salah' }, 401);
    }

    // --- FIX DISINI: KEMBALIKAN CREDENTIAL KE TOKEN ---
    // Tadi sempat hilang saat update fitur Edit User
    const payload = JSON.stringify({
       u: user.username,
       p: user.password, // Penting untuk verifikasi auth.ts
       r: user.role || 'editor',
       n: user.name
    });
    
    const token = 'labmu_v1.' + btoa(payload);

    return c.json({ success: true, token, user });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

// 2. LIST USERS (Admin Only)
users.get('/', authMiddleware, async (c) => {
  const list = await c.env.DB.prepare("SELECT id, username, name, role FROM users ORDER BY id DESC").all();
  return c.json({ success: true, data: list.results });
})

// 3. ADD USER (Admin Only)
users.post('/', authMiddleware, async (c) => {
  const { username, password, name, role } = await c.req.json();
  try {
    await c.env.DB.prepare("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)").bind(username, password, name, role || 'editor').run();
    return c.json({ success: true });
  } catch(e: any) {
    return c.json({ error: 'Gagal membuat user (Username mungkin sudah ada)' }, 400);
  }
})

// 4. EDIT USER (Admin Only)
users.put('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { username, password, name, role } = await c.req.json();
  
  try {
    if (password && password.trim() !== "") {
        // Update data + password
        await c.env.DB.prepare("UPDATE users SET username=?, password=?, name=?, role=? WHERE id=?")
            .bind(username, password, name, role, id).run();
    } else {
        // Update data saja (password tetap)
        await c.env.DB.prepare("UPDATE users SET username=?, name=?, role=? WHERE id=?")
            .bind(username, name, role, id).run();
    }
    return c.json({ success: true });
  } catch(e: any) {
    return c.json({ error: 'Gagal update user' }, 400);
  }
})

// 5. DELETE USER
users.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  return c.json({ success: true });
})

export default users