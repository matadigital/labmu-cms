import { Hono } from 'hono'
import { renderAdmin } from './ui/view'

const admin = new Hono()

// Halaman Utama Admin
admin.get('/', (c) => c.html(renderAdmin()))

// API Internal: Ambil Daftar Users (Khusus Admin)
admin.get('/data/users', async (c) => {
  const users = await c.env.DB.prepare("SELECT id, username, name, role FROM users").all();
  return c.json({ data: users.results });
})

export default admin