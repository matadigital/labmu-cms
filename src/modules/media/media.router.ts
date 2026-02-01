import { Hono } from 'hono';
import { Bindings } from '../../types';
import { authMiddleware } from '../../middleware/auth';
import { MediaService } from './media.service';

const media = new Hono<{ Bindings: Bindings }>();

// Public Access File
media.get('/file/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  const object = await service.get(key);
  
  if (!object) return c.notFound();
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 tahun
  
  return new Response(object.body, { headers });
});

// Upload API
media.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] || body['file-0'];
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file detected' }, 400);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    // Bersihkan nama file
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${year}/${month}/${Date.now()}-${cleanName}`;

    const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
    await service.upload(fileName, file);

    const urlObj = new URL(c.req.url);
    const fullUrl = `${urlObj.protocol}//${urlObj.host}/api/media/file/${fileName}`;

    return c.json({ 
        success: true, 
        url: `/api/media/file/${fileName}`, 
        key: fileName,
        size: file.size,
        result: [{ url: fullUrl, name: fileName, size: file.size }] // Format kompatibel SunEditor
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// List Files
media.get('/', authMiddleware, async (c) => {
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  const files = await service.list();
  // Sort by uploaded descending (Terbaru diatas)
  files.sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());
  
  const data = files.map(f => ({ ...f, url: `/api/media/file/${f.key}` }));
  return c.json({ success: true, data });
});

// Delete File
media.post('/delete', authMiddleware, async (c) => { // Support method POST untuk delete juga
    const body = await c.req.json();
    const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
    await service.delete(body.key);
    return c.json({ success: true });
});
media.delete('/:key', authMiddleware, async (c) => {
  const key = c.req.param('key');
  const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
  await service.delete(key);
  return c.json({ success: true });
});

// Update SEO Meta
media.put('/meta/:key', authMiddleware, async (c) => {
    const key = c.req.param('key');
    const body = await c.req.json();
    const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
    await service.saveMeta(key, body);
    return c.json({ success: true, message: 'SEO Saved' });
});

// FITUR BARU: RENAME
media.post('/rename', authMiddleware, async (c) => {
    try {
        const { oldKey, newName } = await c.req.json();
        if(!oldKey || !newName) return c.json({error: 'Data tidak lengkap'}, 400);

        const service = new MediaService(c.env.MY_BUCKET, c.env.DB);
        const result = await service.rename(oldKey, newName);
        
        return c.json({ success: true, ...result });
    } catch(e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default media;