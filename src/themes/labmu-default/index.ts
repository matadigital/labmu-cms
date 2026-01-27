import { ThemeStructure, ThemeContext } from '../types';
import { css } from './style';

const LabMuDefault: ThemeStructure = {
  name: 'LabMu Default',
  version: '1.0.0',
  author: 'LabMu Team',

  // 1. WRAPPER UTAMA (Header & Footer)
  // Fungsi helper internal biar gak nulis ulang header/footer terus
  _layout(content: string, title: string, ctx: ThemeContext) {
    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${ctx.site.title}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1 class="site-title"><a href="/">${ctx.site.title}</a></h1>
            <p class="site-desc">${ctx.site.description}</p>
          </header>
          
          <main>
            ${content}
          </main>

          <footer>
            &copy; ${new Date().getFullYear()} ${ctx.site.title}. Powered by LabMu CMS.
          </footer>
        </div>
      </body>
      </html>
    `;
  },

  // 2. TAMPILAN HOME
  renderHome(ctx: ThemeContext) {
    const posts = ctx.data || [];
    let html = '';

    if (posts.length === 0) {
      html = '<p>Belum ada postingan. Silakan buat di Admin Panel.</p>';
    } else {
      html = posts.map((p: any) => `
        <article class="post-item">
          <h2 class="post-title"><a href="/${p.slug}">${p.title}</a></h2>
          <div class="meta">Diposting pada ${p.created_at || 'Hari ini'}</div>
          <p>${p.excerpt || 'Klik judul untuk membaca selengkapnya...'}</p>
        </article>
      `).join('');
    }
    
    return this._layout(html, 'Beranda', ctx);
  },

  // 3. TAMPILAN SINGLE POST
  renderSingle(ctx: ThemeContext) {
    const post = ctx.data;
    const html = `
      <article>
        <a href="/" class="back-link">&larr; Kembali ke Depan</a>
        <h1 class="entry-title">${post.title}</h1>
        <div class="meta">Ditulis oleh Admin</div>
        <div class="entry-content">
          ${post.body || '<p>Isi konten belum ditulis...</p>'}
        </div>
      </article>
    `;
    return this._layout(html, post.title, ctx);
  },

  // 4. TAMPILAN HALAMAN (Page)
  renderPage(ctx: ThemeContext) {
    // Mirip single, tapi tanpa tanggal/author biasanya
    return this.renderSingle(ctx); 
  },

  // 5. TAMPILAN 404
  render404(ctx: ThemeContext) {
    const html = `
      <div style="text-align:center; padding: 50px 0;">
        <h1>404</h1>
        <p>Maaf, halaman yang Anda cari tidak ditemukan di laboratorium kami.</p>
        <a href="/" class="back-link">Kembali ke Aman</a>
      </div>
    `;
    return this._layout(html, 'Tidak Ditemukan', ctx);
  }
};

export default LabMuDefault;