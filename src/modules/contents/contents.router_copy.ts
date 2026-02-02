import { Hono } from 'hono';
import { Bindings } from '../../types';

const content = new Hono<{ Bindings: Bindings }>();

// GET ALL
content.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM contents ORDER BY created_at DESC").all();
    return c.json({ success: true, data: results });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET SINGLE
content.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare("SELECT * FROM contents WHERE id = ?").bind(id).first();
  return result ? c.json(result) : c.notFound();
});

// CREATE
content.post('/', async (c) => {
  const body = await c.req.json();
  try {
    const createdAt = body.created_at ? body.created_at : new Date().toISOString();
    const updatedAt = new Date().toISOString();

    const result = await c.env.DB.prepare(
      `INSERT INTO contents (title, slug, body, type, status, featured_image, featured_image_caption, category, tags, author, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.title,
      body.slug,
      body.body,
      body.type || 'post',
      body.status || 'draft',
      body.featured_image || '',
      body.featured_image_caption || '', // <--- SIMPAN CAPTION
      body.category || 'Uncategorized',
      body.tags || '',
      body.author || 'Admin', 
      createdAt,
      updatedAt
    ).run();
    
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: "Gagal Insert: " + e.message }, 500);
  }
});

// UPDATE
content.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  try {
    const updatedAt = new Date().toISOString();
    
    let query = `UPDATE contents SET title=?, slug=?, body=?, type=?, status=?, featured_image=?, featured_image_caption=?, category=?, tags=?, updated_at=?`;
    const params: any[] = [
      body.title,
      body.slug,
      body.body,
      body.type,
      body.status,
      body.featured_image || '',
      body.featured_image_caption || '', // <--- UPDATE CAPTION
      body.category || 'Uncategorized',
      body.tags || '',
      updatedAt
    ];

    if (body.created_at) {
        query += `, created_at=?`;
        params.push(body.created_at);
    }

    query += ` WHERE id=?`;
    params.push(id);

    await c.env.DB.prepare(query).bind(...params).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: "Gagal Update: " + e.message }, 500);
  }
});

// DELETE
content.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export default content;