export const adminCss = `
  :root {
    --wp-dark: #1d2327; --wp-light: #2c3338;
    --wp-blue: #2271b1; --wp-blue-h: #135e96;
    --bg: #f0f0f1; --txt: #3c434a; --border: #c3c4c7;
  }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,sans-serif; background:var(--bg); color:var(--txt); font-size:13px; height:100vh; overflow:hidden; }
  
  /* Layout */
  .app-grid { display:grid; grid-template-columns:160px 1fr; height:100vh; }
  .sidebar { background:var(--wp-dark); color:#fff; display:flex; flex-direction:column; }
  .brand { padding:10px 12px; font-weight:bold; background:#000; display:flex; gap:8px; align-items:center; }
  
  /* Menu */
  .menu-item { padding:10px 12px; color:#f0f0f1; cursor:pointer; border-left:4px solid transparent; display:flex; align-items:center; gap:8px; }
  .menu-item:hover, .menu-item.active { background:var(--wp-light); color:#72aee6; }
  .menu-item.active { border-left-color:#72aee6; font-weight:600; }

  /* Content */
  .topbar { background:#fff; height:50px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; padding:0 20px; }
  .main { overflow-y:auto; height:calc(100vh - 50px); padding:20px; }
  .card { background:#fff; border:1px solid var(--border); padding:15px; margin-bottom:20px; box-shadow:0 1px 1px rgba(0,0,0,0.04); }
  
  /* Form & Table */
  .wp-table { width:100%; border-collapse:collapse; }
  .wp-table th, .wp-table td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); }
  .wp-table tr:nth-child(even) { background:#f9f9f9; }
  .btn { padding:6px 12px; border:1px solid var(--wp-blue); border-radius:3px; cursor:pointer; background:var(--wp-blue); color:#fff; }
  .btn:hover { background:var(--wp-blue-h); }
  .input { width:100%; padding:6px; border:1px solid #8c8f94; border-radius:4px; margin-bottom:10px; }
`;