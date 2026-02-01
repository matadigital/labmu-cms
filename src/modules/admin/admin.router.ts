import { Hono } from 'hono';
import { renderAdmin } from './ui/view'; 

const admin = new Hono();

admin.get('/*', (c) => {
  // Panggil fungsi renderAdmin() untuk merakit HTML
  const html = renderAdmin(); 
  return c.html(html);
});

export default admin;