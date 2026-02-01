import { Hono } from 'hono';
import { Bindings } from '../../types';
import { WPImporterService } from './wp.service';

const wpRouter = new Hono<{ Bindings: Bindings }>();

wpRouter.post('/json', async (c) => {
  const posts = await c.req.json();
  const service = new WPImporterService(c.env.DB);
  const result = await service.importPosts(posts);
  return c.json({ success: true, data: result });
});

export default wpRouter;