import { ThemeStructure, ThemeContext } from '../types';
import { css } from './style';

const LabMuDefault: ThemeStructure = {
  name: 'LabMu Default',
  version: '1.0.0',
  author: 'LabMu Team',

  // 1. LAYOUT UTAMA (Head, Header, Footer)
  _layout(content: string, title: string, ctx: ThemeContext) {
    
    // A. Ambil Menu
    const menus = ctx.menus || [];
    
    // B. Ambil Favicon (Default ke /favicon.ico jika kosong)
    // Pastikan key-nya 'site_favicon' sesuai dengan yang ada di Admin Panel
    const favicon = ctx.site.site_favicon || '/favicon.ico';

    // C. Generate HTML Menu
    let navHtml = '';
    if (menus.length > 0) {
       navHtml = `
         <nav class="main-nav">
           <ul class="nav-menu">
             ${menus.map((m: any) => `
                <li class="menu-item">
                   <a href="${m.url}">${m.label}</a>
                </li>
             `).join('')}
           </ul>
         </nav>
       `;
    }

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <link rel="icon" href="${favicon}" />
        
        <title>${title} - ${ctx.site.site_title || ctx.site.title}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <header>
            <div style="display:flex; align-items:center; gap:15px;">
                ${ctx.site.site_logo 
                    ? `<img src="${ctx.site.site_logo}" alt="Logo" style="height:50px; width:auto;">` 
                    : ''
                }
                <div>
                    <h1 class="site-title">
                        <a href="/">${ctx.site.site_title || ctx.site.title}</a>
                    </h1>
                    <p class="site-desc">${ctx.site.site_desc || ctx.site.description || ''}</p>
                </div>
            </div>

            ${navHtml}

          </header>
          
          <main>
            ${content}
          </main>

          <footer>
            &copy; ${new Date().getFullYear()} ${ctx.site.site_title || ctx.site.title}. Powered by LabMu CMS.
          </footer>
        </div>
      </body>
      </html>
    `;
  },

  // 2. RENDER HOME
  renderHome(ctx: ThemeContext) {
    const posts = ctx.data || [];
    let html = '';

    if (posts.length === 0) {
      html = '<p style="text-align:center; color:#666;">Belum ada postingan. Silakan buat di Admin Panel.</p>';
    } else {
      html = posts.map((p: any) => `
        <article class="post-item">
          ${p.featured_image ? `<img src="${p.featured_image}" alt="${p.title}" style="width:100%; height:auto; border-radius:8px; margin-bottom:15px; object-fit:cover; max-height:300px;">` : ''}
          
          <h2 class="post-title"><a href="/${p.slug}">${p.title}</a></h2>
          <div class="meta">Diposting pada ${p.created_at || 'Baru saja'}</div>
          <p>${p.excerpt || 'Klik judul untuk membaca selengkapnya...'}</p>
        </article>
      `).join('');
    }
    
    return this._layout(html, 'Beranda', ctx);
  },

  // 3. TAMPILAN SINGLE POST (Artikel Berita)
  renderSingle(ctx: ThemeContext) {
    const post = ctx.data;
    if(!post) return this.render404(ctx);

    // Format Tanggal biar cantik (Contoh: 2 Feb 2026)
    const dateStr = post.created_at 
      ? new Date(post.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) 
      : '';

    const html = `
      <article class="post-single">
        <div style="margin-bottom:15px;">
             <a href="/" class="back-link" style="font-size:0.9em;">&larr; Kembali ke Beranda</a>
        </div>

        <h1 class="entry-title" style="margin-bottom:5px;">${post.title}</h1>
        
        <div class="meta" style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee; color:#666; font-size:0.9em;">
           <span class="date">📅 ${dateStr}</span> &bull; 
           <span class="author">👤 Admin</span>
           ${post.category ? `&bull; 📂 ${post.category}` : ''}
        </div>

        ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" style="width:100%; height:auto; border-radius:8px; margin-bottom:25px;">` : ''}

        <div class="entry-content">
          ${post.body || '<p>Isi konten kosong...</p>'}
        </div>
        
        ${post.tags ? `<div style="margin-top:30px; font-size:0.85em; color:#888;">🏷️ Tags: ${post.tags}</div>` : ''}
      </article>
    `;
    return this._layout(html, post.title, ctx);
  },

  // 4. TAMPILAN HALAMAN STATIS (Page)
  renderPage(ctx: ThemeContext) {
    const page = ctx.data;
    if(!page) return this.render404(ctx);

    // Tampilan Page lebih bersih (Tanpa Tanggal/Author)
    const html = `
      <div class="page-single">
        <h1 class="entry-title" style="margin-bottom:25px; border-bottom:2px solid #eee; padding-bottom:15px;">
            ${page.title}
        </h1>

        ${page.featured_image ? `<img src="${page.featured_image}" alt="${page.title}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px; margin-bottom:25px;">` : ''}

        <div class="entry-content">
          ${page.body || '<p>Halaman ini belum diisi.</p>'}
        </div>
      </div>
    `;
    return this._layout(html, page.title, ctx);
  },

  // 4. RENDER 404
  render404(ctx: ThemeContext) {
    const html = `
      <div style="text-align:center; padding: 50px 0;">
        <h1 style="font-size:3rem; margin-bottom:10px; color:#e74c3c;">404</h1>
        <p>Halaman tidak ditemukan.</p>
        <a href="/" class="back-link">Kembali ke Beranda</a>
      </div>
    `;
    return this._layout(html, '404 Not Found', ctx);
  }
};

export default LabMuDefault;