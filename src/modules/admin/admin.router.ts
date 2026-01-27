import { Hono } from 'hono'
// PENTING: Kita import dari sistem modular UI yang sudah Om bangun
import { renderAdmin } from './ui/view' 

const admin = new Hono()

// Gunakan View Engine Modular untuk merender halaman admin
admin.get('/*', (c) => c.html(renderAdmin()))

export default admin