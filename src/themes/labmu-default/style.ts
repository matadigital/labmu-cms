export const css = `
  :root { --primary: #2271b1; --text: #333; --bg: #fff; --light: #f5f5f5; }
  body { font-family: -apple-system, sans-serif; line-height: 1.6; margin: 0; color: var(--text); background: var(--light); }
   
  /* Container */
  .container { max-width: 800px; margin: 0 auto; padding: 20px; background: var(--bg); min-height: 100vh; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
   
  /* Header */
  header { border-bottom: 2px solid var(--primary); padding-bottom: 20px; margin-bottom: 30px; }
  h1.site-title { margin: 0; }
  h1.site-title a { text-decoration: none; color: var(--primary); }
  p.site-desc { color: #666; margin: 5px 0 0; }

  /* --- [BARU] NAVIGATION MENU --- */
  .main-nav { margin-top: 15px; }
  .nav-menu { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 20px; }
  .menu-item a { text-decoration: none; color: #555; font-weight: 500; font-size: 0.95em; transition: 0.2s; }
  .menu-item a:hover { color: var(--primary); }
   
  /* Post List */
  .post-item { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #eee; }
  .post-title { margin: 0 0 10px; }
  .post-title a { text-decoration: none; color: #111; }
  .post-title a:hover { color: var(--primary); }
  .meta { font-size: 0.85em; color: #999; margin-bottom: 10px; }
   
  /* Single Post */
  .entry-content { font-size: 1.1em; }
  .back-link { display: inline-block; margin-bottom: 20px; color: var(--primary); text-decoration: none; }
   
  /* Footer */
  footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.9em; color: #999; }
`;