import { adminStyles } from './blocks/styles';
import { sidebarBlock } from './blocks/sidebar';
import { topbarBlock } from './blocks/topbar';
import { pagesBlock } from './blocks/pages';
import { globalModals } from './blocks/modals';

// LOGIC JAVASCRIPT MONOLITIK (SATU TEMPAT)
const jsLogic = `
/** 1. HELPER SUNEDITOR */
function startSunEditor(id, token, content, onChange) {
    if (typeof SUNEDITOR === 'undefined') return;
    try {
        if(window.sunEditor) { try{ window.sunEditor.destroy(); }catch(e){} }
        const editor = SUNEDITOR.create(id, {
            display: 'block', width: '100%', height: 'auto', minHeight: '400px',
            buttonList: [
                ['undo', 'redo'], ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike'], ['removeFormat'],
                ['fontColor', 'hiliteColor'], ['align', 'list', 'lineHeight'], 
                ['table', 'link', 'image', 'video'], ['fullScreen', 'codeView']
            ],
            callbacks: { onChange: function(c) { onChange(c); } }
        });
        if(content) editor.setContents(content);
        window.sunEditor = editor; 
    } catch(e) { console.error(e); }
}

/** 2. CMS MAIN LOGIC */
window.cms = function() {
  return {
    // --- STATE UTAMA ---
    token: localStorage.getItem('labmu_token') || '',
    view: 'dash',
    sidebarOpen: true,
    userRole: 'editor',
    loginForm: { username: '', password: '' },
    isLoggingIn: false,

    // --- DATA STORE ---
    posts: [], 
    pages: [], 
    mediaList: [], 
    usersList: [],
    quranList: [], 
    availableThemes: [], 
    menuList: [], 
    uniqueCategories: [], 
    uniqueTags: [],
    
    // --- UI LOADING STATE (YANG TADI ERROR) ---
    isLoadingUsers: false,  // <--- INI YANG KURANG TADI
    loadingQuran: false,
    isUploading: false, 
    isUploadingFeatured: false,
    isSavingMeta: false,
    isSavingMenu: false, 
    isSavingSettings: false,
    
    // --- UI TOGGLES & HELPERS ---
    showMediaSelector: false, 
    showUserModal: false, 
    mediaSearchQuery: '',
    activeSurat: null,
    mediaSelectorTarget: null,
    activeMediaItem: null,
    activeMediaMeta: { alt: '', title: '', description: '' },
    
    // --- FORMS ---
    form: { title: '', slug: '', body: '', type: 'post', status: 'publish', date: '', featured_image: '', category: '', tags: '' },
    userForm: { username:'', password:'', name:'', email:'', role:'editor' },
    menuForm: { id: null, label: '', url: '', order_num: 0 },
    settings: { site_title: '', site_desc: '', admin_email: '', site_logo: '', site_favicon: '' },
    editingId: null,
    editingUserId: null,

    // --- INIT ---
    init() {
      if (this.token) {
        this.decodeRole();
        this.loadAllData();
      }
    },

    decodeRole() {
        try {
            if (!this.token) return;
            const base64 = this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = JSON.parse(window.atob(base64));
            this.userRole = json.role || json.r || 'editor';
        } catch (e) { this.userRole = 'editor'; }
    },

    loadAllData() {
        this.loadPosts(); 
        this.loadPages(); 
        this.loadThemes();
        this.loadMedia();
        this.loadSettings();
        this.loadMenus();
        if(this.userRole === 'admin') this.loadUsers();
    },

    // --- AUTH ---
    async doLogin() {
        if(!this.loginForm.username) return alert('Isi username!');
        this.isLoggingIn = true;
        try {
            let res = await fetch('/api/users/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(this.loginForm) });
            let json = await res.json();
            if(res.ok) {
                this.token = json.token; localStorage.setItem('labmu_token', this.token);
                this.decodeRole(); this.init(); window.location.reload();
            } else { alert(json.error || 'Login Gagal'); }
        } catch(e) { alert('Error Network'); } 
        finally { this.isLoggingIn = false; }
    },
    logout() { localStorage.removeItem('labmu_token'); window.location.reload(); },

    // --- USERS (DIPERBAIKI) ---
    async loadUsers() { 
        this.isLoadingUsers = true; // Set loading true
        try { 
            let res = await fetch('/api/users', { headers: {'Authorization':this.token}}); 
            let json = await res.json(); 
            this.usersList = json.data||[]; 
        } catch(e){
            console.error(e);
        } finally {
            this.isLoadingUsers = false; // Set loading false
        }
    },
    openAddUser() { this.showUserModal=true; this.editingUserId=null; this.userForm={username:'',password:'',name:'',email:'',role:'editor'}; },
    editUser(u) { this.showUserModal=true; this.editingUserId=u.id; this.userForm={...u, password:''}; },
    async saveUser() {
        const url = this.editingUserId ? '/api/users/'+this.editingUserId : '/api/users';
        const method = this.editingUserId ? 'PUT' : 'POST';
        try { await fetch(url, {method, headers:{'Content-Type':'application/json','Authorization':this.token}, body:JSON.stringify(this.userForm)}); this.showUserModal=false; this.loadUsers(); alert('User Saved'); } catch(e){}
    },
    async deleteUser(id) { if(confirm('Hapus?')) { await fetch('/api/users/'+id, {method:'DELETE',headers:{'Authorization':this.token}}); this.loadUsers(); } },

    // --- POSTS & PAGES ---
    async loadPosts() { if (!this.token) return; try { let res = await fetch('/api/contents?type=post'); let json = await res.json(); this.posts = json.data || []; this.extractMeta(); } catch (e) { } },
    async loadPages() { if (!this.token) return; try { let res = await fetch('/api/contents?type=page'); let json = await res.json(); this.pages = json.data || []; } catch (e) { } },
    
    extractMeta() {
         const cats = new Set(); const tags = new Set();
         if (this.posts) {
            this.posts.forEach(p => {
                if (p.category) p.category.split(',').forEach(c => cats.add(c.trim()));
                if (p.tags) p.tags.split(',').forEach(t => tags.add(t.trim()));
            });
         }
         this.uniqueCategories = Array.from(cats).sort();
         this.uniqueTags = Array.from(tags).sort();
    },

    openEditor(type) {
        this.view = 'add'; this.editingId = null;
        this.form = { title: '', slug: '', body: '', type: type || 'post', status: 'publish', date: '', featured_image: '', category: '', tags: '' };
        setTimeout(() => { if (typeof startSunEditor === 'function') startSunEditor('editor', this.token, '', (c) => { this.form.body = c; }); }, 100);
    },
    
    editPost(post) {
        this.view = 'add'; this.editingId = post.id;
        let safeDate = '';
        if(post.created_at) safeDate = post.created_at.replace(' ', 'T').substring(0, 16);
        this.form = { ...post, date: safeDate, category: post.category||'', tags: post.tags||'' };
        setTimeout(() => { if (typeof startSunEditor === 'function') startSunEditor('editor', this.token, post.body, (c) => { this.form.body = c; }); }, 100);
    },

    async save() {
       if (window.sunEditor) this.form.body = window.sunEditor.getContents();
       const payload = { ...this.form };
       const url = this.editingId ? '/api/contents/' + this.editingId : '/api/contents';
       try {
           let res = await fetch(url, { method: this.editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': this.token }, body: JSON.stringify(payload) });
           if (res.ok) { 
               alert('Tersimpan!'); 
               if(payload.type === 'page') this.loadPages(); else this.loadPosts();
               this.view = payload.type === 'page' ? 'pages' : 'posts';
           } else { alert('Gagal simpan'); }
       } catch (e) { alert('Error'); }
    },

    async deletePost(id) {
       if(!confirm('Hapus?')) return;
       try { await fetch('/api/contents/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } }); this.loadPosts(); this.loadPages(); } catch(e) {}
    },

    makeSlug() { if (!this.editingId && this.form.title) { this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); } },
    addTag(t) { 
        let cur = this.form.tags ? this.form.tags.split(',').map(x=>x.trim()) : [];
        if(!cur.includes(t)) { cur.push(t); this.form.tags = cur.join(', '); }
    },
    getPageTitle() {
        const map = { 'dash': 'Dashboard', 'posts': 'Posts', 'pages': 'Pages', 'settings': 'Settings', 'users': 'Users', 'media': 'Media', 'themes': 'Themes', 'quran': 'Quran', 'menus': 'Menus' };
        return map[this.view] || 'CMS';
    },

    // --- MEDIA ---
    async loadMedia() {
        try {
            let res = await fetch('/api/media', { headers: { 'Authorization': this.token } });
            let json = await res.json();
            this.mediaList = json.data || [];
        } catch(e){}
    },
    get filteredMedia() {
        if (!this.mediaSearchQuery) return this.mediaList;
        return this.mediaList.filter(m => (m.key||'').toLowerCase().includes(this.mediaSearchQuery.toLowerCase()));
    },
    openMediaSelector() { this.showMediaSelector = true; this.activeMediaItem = null; this.loadMedia(); },
    setActiveItem(item) { this.activeMediaItem = item; this.activeMediaMeta = { alt: item.alt||'', title: item.title||'', description: item.description||'' }; },
    
    confirmFeaturedImage() {
       if(!this.activeMediaItem) return;
       if (this.mediaSelectorTarget) {
           this.settings[this.mediaSelectorTarget] = this.activeMediaItem.url;
           this.mediaSelectorTarget = null;
       } else {
           this.form.featured_image = this.activeMediaItem.url;
       }
       this.showMediaSelector = false;
    },
    openLogoSelector(target) { this.mediaSelectorTarget = target; this.openMediaSelector(); },

    async uploadMedia(e) { this.uploadFeaturedImage(e); }, 
    async uploadFeaturedImage(e) {
        const file = e.target.files[0]; if(!file) return;
        this.isUploading = true; this.isUploadingFeatured = true;
        const formData = new FormData(); formData.append('file', file);
        try {
            let res = await fetch('/api/media', { method: 'POST', headers: {'Authorization':this.token}, body: formData });
            let json = await res.json();
            if(json.success) { await this.loadMedia(); if(this.showMediaSelector) { const n = this.mediaList.find(m=>m.key===json.key); if(n) this.setActiveItem(n); } else alert('Upload Sukses'); }
        } catch(e) { alert('Error Upload'); } finally { this.isUploading = false; this.isUploadingFeatured = false; }
    },
    async deleteMedia(key) { if(confirm('Hapus file?')) { await fetch('/api/media/'+key, {method:'DELETE',headers:{'Authorization':this.token}}); this.loadMedia(); this.activeMediaItem=null; } },
    async saveActiveMeta() {
        if(!this.activeMediaItem) return; this.isSavingMeta = true;
        try { await fetch('/api/media/meta/'+this.activeMediaItem.key, {method:'PUT',headers:{'Content-Type':'application/json','Authorization':this.token}, body:JSON.stringify(this.activeMediaMeta)}); alert('Meta Saved'); } catch(e){} finally { this.isSavingMeta = false; }
    },

    // --- THEMES ---
    async loadThemes() { try { let res = await fetch('/api/theme'); let json = await res.json(); this.availableThemes = json.data || []; } catch(e){} },
    async activateTheme(id) { if(confirm('Aktifkan?')) { await fetch('/api/theme/activate', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': this.token }, body: JSON.stringify({ themeId: id }) }); alert('Aktif!'); this.loadThemes(); } },

    // --- MENUS ---
    async loadMenus() { try { let res = await fetch('/api/menus'); let json = await res.json(); this.menuList = json.data||[]; } catch(e){} },
    async saveMenu() {
         if(!this.menuForm.label) return; this.isSavingMenu=true;
         try { await fetch('/api/menus', {method:'POST', headers:{'Content-Type':'application/json','Authorization':this.token}, body:JSON.stringify(this.menuForm)}); this.loadMenus(); this.menuForm={id:null,label:'',url:'',order_num:0}; alert('Menu Saved'); } catch(e){} finally { this.isSavingMenu=false; }
    },
    async deleteMenu(id) { if(confirm('Hapus?')) { await fetch('/api/menus/'+id, {method:'DELETE',headers:{'Authorization':this.token}}); this.loadMenus(); } },

    // --- SETTINGS ---
    async loadSettings() { try { let res = await fetch('/api/settings'); let json = await res.json(); if(json.success) this.settings = {...this.settings, ...json.data}; } catch(e){} },
    async saveSettings() {
        this.isSavingSettings=true;
        try { await fetch('/api/settings', {method:'POST', headers:{'Content-Type':'application/json','Authorization':this.token}, body:JSON.stringify(this.settings)}); alert('Saved!'); } catch(e){} finally { this.isSavingSettings=false; }
    },
    
    // --- QURAN ---
    async loadQuranList() {
       this.view = 'quran'; if(this.quranList.length>0) return;
       this.loadingQuran = true;
       try { let res = await fetch('/api/quran/surat'); let json = await res.json(); this.quranList = json.data||[]; } catch(e){} finally{ this.loadingQuran=false; }
    },
    openSurat(nomor) {
       this.activeSurat = null; this.loadingQuran = true;
       fetch('/api/quran/'+nomor).then(r=>r.json()).then(j=> { this.activeSurat = j; this.loadingQuran=false; });
    },
    closeSurat() { this.activeSurat = null; }
  }
}
`;

export const renderAdmin = () => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin LabMu</title>
  
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
  <style>${adminStyles}</style>

  <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/lang/en.js"></script>
  
  <script>
    ${jsLogic}
  </script>

  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
</head>

<body x-data="cms()" x-init="init()">
  
  <template x-if="!token">
    <div class="login-page">
      <div class="login-box">
        <h2 style="margin-top:0; color:#333;">LabMu Login</h2>
        <div style="text-align:left; margin-top:20px;">
            <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Username</label>
            <input x-model="loginForm.username" type="text" class="input" placeholder="admin">
            <label style="font-size:12px; font-weight:bold; display:block; margin-top:10px; margin-bottom:5px;">Password</label>
            <input x-model="loginForm.password" type="password" class="input" placeholder="password" @keyup.enter="doLogin()">
        </div>
        <button @click="doLogin()" class="btn" style="width:100%; margin-top:20px;">
            <span x-show="!isLoggingIn">Masuk</span>
            <span x-show="isLoggingIn"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
        </button>
      </div>
    </div>
  </template>

  <div x-show="token" class="app-layout" 
       :style="sidebarOpen ? 'grid-template-columns: 240px 1fr' : 'grid-template-columns: 60px 1fr'"
       style="display:none;" x-show.important="token">
    
    ${sidebarBlock}

    <div style="display:flex; flex-direction:column; width:100%; overflow:hidden; position:relative;">
      ${topbarBlock}
      <main class="main-content">
        ${pagesBlock} 
        ${globalModals}
      </main>
    </div>
  </div>

</body>
</html>
`;