import { Hono } from 'hono'
import { MediaService } from './media.service'
import { authMiddleware } from '../../middleware/auth'
import { Bindings } from '../../types'

const media = new Hono<{ Bindings: Bindings }>()

// 1. PUBLIC VIEW (Handler File)
media.get('/file/:key{.+}', async (c) => { // Perhatikan {.+} agar bisa baca slash (/)
  const key = c.req.param('key');
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  
  const object = await service.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000'); 

  return new Response(object.body, { headers });
})

// 2. ADMIN UPLOAD (Dengan Folder YYYY/MM)
media.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] || body['file-0']; 
    // const existingKey = body['key'] as string; // Kita disable replace key biar folder work

    if (!file || !(file instanceof File)) {
        return c.json({ error: 'No file detected' }, 400);
    }

    // --- LOGIC FOLDER R2 (YYYY/MM) ---
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 01, 02, dst
    
    // Bersihkan nama file
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    
    // Hasil: 2026/01/17345678-gambar.jpg
    const fileName = `${year}/${month}/${Date.now()}-${cleanName}`;
    // ---------------------------------

    const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
    await service.upload(fileName, file);

    // URL Absolute
    const urlObj = new URL(c.req.url);
    const fullUrl = `${urlObj.protocol}//${urlObj.host}/api/media/file/${fileName}`;

    return c.json({ 
      success: true, 
      url: `/api/media/file/${fileName}`,
      key: fileName,
      size: file.size,
      result: [{ url: fullUrl, name: fileName, size: file.size }]
    });

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

// 3. ADMIN LIST
media.get('/', authMiddleware, async (c) => {
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  const files = await service.list();
  // Support file dalam folder
  const data = files.map(f => ({ ...f, url: `/api/media/file/${f.key}` }));
  return c.json({ success: true, data });
})

// 4. DELETE & META (Tetap Sama)
media.delete('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key'); // key sekarang bisa berisi "2026/01/..."
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  await service.delete(key);
  return c.json({ success: true });
})

media.put('/meta/:key', authMiddleware, async (c) => {
  const key = c.req.param('key');
  const body = await c.req.json();
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  await service.saveMeta(key, body);
  return c.json({ success: true, message: 'SEO Saved' });
})

export default media