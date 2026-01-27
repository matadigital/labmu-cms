import { Hono } from 'hono'
import { authMiddleware } from '../../middleware/auth'
import { Bindings } from '../../types'

const content = new Hono<{ Bindings: Bindings }>()

// GET ALL
content.get('/', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM contents ORDER BY created_at DESC").all();
  return c.json({ success: true, data: results });
})

// GET ONE
content.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await c.env.DB.prepare("SELECT * FROM contents WHERE id = ?").bind(id).first();
  return result ? c.json(result) : c.notFound();
})

// CREATE (POST)
content.post('/', authMiddleware, async (c) => {
  const body = await c.req.json();
  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO contents (title, slug, body, type, status, featured_image, category, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.title, 
      body.slug, 
      body.body, 
      body.type || 'post', 
      body.status || 'draft',
      body.featured_image || '',
      body.category || 'Uncategorized', // Default
      body.tags || ''
    ).run();
    return c.json({ success: true, id: result.meta.last_row_id });
  } catch (e: any) {
    return c.json({ error: "Gagal Insert: " + e.message }, 500);
  }
})

// UPDATE (PUT)
content.put('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  try {
    await c.env.DB.prepare(
      `UPDATE contents SET title=?, slug=?, body=?, type=?, status=?, featured_image=?, category=?, tags=? 
       WHERE id=?`
    ).bind(
      body.title, 
      body.slug, 
      body.body, 
      body.type, 
      body.status,
      body.featured_image || '',
      body.category || 'Uncategorized',
      body.tags || '',
      id
    ).run();
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: "Gagal Update: " + e.message }, 500);
  }
})

// DELETE
content.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM contents WHERE id = ?").bind(id).run();
  return c.json({ success: true });
})

export default content