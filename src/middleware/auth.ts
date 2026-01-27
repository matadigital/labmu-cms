import { Context, Next } from 'hono'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized: Butuh Login' }, 401)
  }

  // Bersihkan token
  const token = authHeader.replace('Bearer ', '').trim();

  // 1. Cek Apakah ini Token Format LabMu (labmu_v1.XXXXX)?
  if (token.startsWith('labmu_v1.')) {
     try {
        // Bongkar Token
        const base64 = token.split('.')[1]; 
        const jsonString = atob(base64);    
        const data = JSON.parse(jsonString);

        // Verifikasi Langsung ke Database
        // Cek apakah username & password di token COCOK dengan di DB
        const user = await c.env.DB.prepare("SELECT id, role, name FROM users WHERE username = ? AND password = ?")
                           .bind(data.u, data.p)
                           .first();

        if (!user) {
           return c.json({ error: 'Password berubah atau User tidak valid.' }, 401);
        }

        // Lolos! Simpan data user
        c.set('user', user);
        await next();
        return;

     } catch (e) {
        return c.json({ error: 'Token Rusak.' }, 401)
     }
  }

  // 2. Fallback: Cek Token Master (Untuk darurat)
  // Kalau token sama dengan API KEY di wrangler/env, loloskan.
  const masterKey = c.env.CLOUDFLARE_API_TOKEN || 'labmu_rahasia_master';
  if (token === masterKey) {
     await next();
     return;
  }

  // Kalau format gak dikenal, tolak.
  return c.json({ error: 'Format Token Salah. Login Ulang.' }, 401)
}