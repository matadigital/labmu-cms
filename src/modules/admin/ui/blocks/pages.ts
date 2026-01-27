import { dashboardPage } from './dashboard.page'
import { postSidebar } from './post.sidebar'
import { postsPage } from './posts.page' // <--- IMPORT FILE BARU KITA
import { themesPage } from './themes.page'
import { mediaPage } from './media.page'
import { usersPage } from './users.page'
import { quranPage } from './quran.page' 

export const pagesBlock = `

${dashboardPage}
${postsPage}  <div x-show="view==='add'">
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
     <button @click="view='posts'" class="btn" style="background:transparent; color:#555; border:1px solid #ccc; padding:6px 12px;">
        <i class="fas fa-arrow-left"></i> Back
     </button>
     <h2 style="margin:0;">Editor</h2>
  </div>

  <div style="display:grid; grid-template-columns:1fr 280px; gap:20px">
    <div>
      <input x-model="form.title" class="input" style="font-size:20px; padding:12px; font-weight:bold;" placeholder="Judul Artikel..." @input="makeSlug()">
      <div style="background:#fff; border:1px solid #c3c4c7;">
        <textarea id="editor" style="width:100%; height:500px;"></textarea>
      </div>
    </div>
    ${postSidebar}
  </div>
</div>

${mediaPage}
${themesPage}
${usersPage}
${quranPage}

<div x-show="view==='settings'">
  <h2>General Settings</h2>
  <div class="card" style="max-width:600px;">
    <label>Site Title</label><input x-model="settings.site_title" class="input">
    <label>Tagline</label><input x-model="settings.site_desc" class="input">
    <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
    <label>Admin Email</label><input x-model="settings.admin_email" class="input">
    <button @click="saveSettings()" class="btn" style="margin-top:10px;">Save Changes</button>
  </div>
</div>

<div x-show="view==='menus'">
    <h2>Menus</h2>
    <div class="card">Coming Soon</div>
</div>
`;