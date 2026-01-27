// src/modules/admin/ui/blocks/topbar.ts
export const topbarBlock = `
<header class="topbar">
  <div style="display:flex; align-items:center; gap:15px;">
    <button @click="sidebarOpen = !sidebarOpen" class="btn-icon"><i class="fas fa-bars"></i></button>
    <b x-text="getPageTitle()" style="font-size:16px;"></b>
    <a href="/" target="_blank" class="btn" style="padding: 4px 10px; font-size:11px; display:flex; align-items:center; gap:5px; text-decoration:none;">
      <i class="fas fa-home"></i> View Home
    </a>
  </div>
  <div>
    <small style="margin-right:10px;">Hi, Admin</small>
    <i class="fas fa-user-circle fa-lg" style="color:#ccc;"></i>
  </div>
</header>
`;