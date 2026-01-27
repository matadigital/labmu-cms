import { Hono } from 'hono'
import { SettingsService } from './settings.service'
// Kita matikan dulu authMiddleware sementara buat tes, 
// nanti kalau sudah lancar baru dipasang lagi biar gak ribet token dulu.
// import { authMiddleware } from '../../middleware/auth'

const settings = new Hono<{ Bindings: { DB: D1Database } }>()

// GET /api/settings
settings.get('/', async (c) => {
  const service = new SettingsService(c.env.DB)
  const data = await service.getAll()
  return c.json({ success: true, data })
})

// POST /api/settings
settings.post('/', async (c) => {
  const service = new SettingsService(c.env.DB)
  const body = await c.req.json()
  
  try {
    await service.updateMany(body)
    return c.json({ success: true, message: 'Settings saved!' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default settings