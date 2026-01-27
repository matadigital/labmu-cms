import { featuredImageLogic } from './featured.logic';
import { usersLogic } from './users.logic';
import { quranLogic } from './quran.logic';
import { mediaLogic } from './media.logic';

export const scriptBlock = `

/** 1. GLOBAL SUNEDITOR */
function startSunEditor(id, token, content, onChange) {
    if (typeof SUNEDITOR === 'undefined') return;
    try {
        if(window.sunEditor) { try{ window.sunEditor.destroy(); }catch(e){} }
        const editor = SUNEDITOR.create(id, {
            display: 'block', width: '100%', height: 'auto', minHeight: '400px',
            popupDisplay: 'full',
            buttonList: [
                ['undo', 'redo'], ['font', 'fontSize', 'formatBlock'],
                ['bold', 'underline', 'italic', 'strike'], ['removeFormat'],
                ['fontColor', 'hiliteColor'], ['outdent', 'indent'],
                ['align', 'list', 'lineHeight'], ['table', 'link', 'image', 'video'],
                ['fullScreen', 'showBlocks', 'codeView']
            ],
            callbacks: {
                onChange: function(contents) { onChange(contents); }
            }
        });
        if(content) editor.setContents(content);
        window.sunEditor = editor; 
    } catch(e) { console.error(e); }
}

/** 2. CMS APP */
function cms(){
  return {
    // === STATE ===
    token: localStorage.getItem('labmu_token')||'', 
    view:'dash', 
    sidebarOpen: true, 
    userRole: 'editor', 
    
    // LOGIN
    loginForm: { username: '', password: '' }, isLoggingIn: false,

    // DATA LISTS
    posts:[], mediaList: [], mediaFilter: '', usersList: [],
    quranList: [], activeSurat: null, loadingQuran: false,
    
    // THEMES & CATS & TAGS
    availableThemes: [], activeThemeId: 'labmu-default',
    uniqueCategories: [], 
    uniqueTags: [], // <--- Penampung Tag Unik

    // FORM EDITOR
    form: {title:'', slug:'', body:'', type:'post', status:'publish', featured_image:'', category:'', tags:''},
    editingId: null,
    
    // SETTINGS & UI
    settings: { site_title: '', site_desc: '', admin_email: '' },
    isUploading: false, showMediaSelector: false,
    showUserModal: false, userForm: { username:'', password:'', name:'', role:'editor' },

    // ============================================================
    // INJECT LOGIC
    // ============================================================
    ${featuredImageLogic}
    ${mediaLogic}
    ${usersLogic}
    ${quranLogic}
    
    // ============================================================
    // HELPER UI
    // ============================================================
    getPageTitle() { 
      if(this.view === 'add' && this.editingId) return 'Edit Post';
      const map = {'dash':'Dashboard','posts':'All Posts','add':'Add New','settings':'General Settings','users':'User Manager','media':'Media Library','themes':'Themes','menus':'Menus', 'quran':'QuranMu'}; 
      return map[this.view] || 'LabMu CMS'; 
    },

    makeSlug(){ 
      if(!this.editingId && this.form.title) { 
         this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); 
      }
    },

    // FUNGSI: Tambah Tag saat diklik
    addTag(tag) {
        let current = this.form.tags ? this.form.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        if (!current.includes(tag)) {
            current.push(tag);
            this.form.tags = current.join(', ');
        }
    },

    // ============================================================
    // DATA LOADER
    // ============================================================
    async loadPosts(){ 
        if(!this.token) return; 
        try { 
            let res = await fetch('/api/contents'); 
            let json = await res.json(); 
            this.posts = json.data; 

            // --- EKSTRAK KATEGORI & TAGS DARI SEMUA POST ---
            const cats = new Set();
            const tags = new Set();

            if (this.posts) {
                this.posts.forEach(p => {
                    // Ambil Kategori
                    if (p.category) {
                        p.category.split(',').forEach(c => cats.add(c.trim()));
                    }
                    // Ambil Tags
                    if (p.tags) {
                        p.tags.split(',').forEach(t => tags.add(t.trim()));
                    }
                });
            }
            
            this.uniqueCategories = Array.from(cats).filter(c => c).sort();
            this.uniqueTags = Array.from(tags).filter(t => t).sort();

        } catch(e) {} 
    },

    async loadThemes() {
       try {
          let res = await fetch('/api/theme', { headers: { 'Authorization': this.token } });
          if(res.ok){
              let json = await res.json();
              if (json.success) {
                  this.availableThemes = json.data;
                  const active = this.availableThemes.find(t => t.active);
                  if(active) this.activeThemeId = active.id;
              }
          }
       } catch (e) { console.error('Gagal load themes', e); }
    },

    async activateTheme(themeId) {
       if(!confirm('Aktifkan tema ini?')) return;
       try {
          let res = await fetch('/api/theme/activate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': this.token },
              body: JSON.stringify({ themeId })
          });
          if (res.ok) {
              alert('✅ Tema Berhasil Diaktifkan!');
              this.loadThemes(); 
          }
       } catch(e) { alert('Error Network'); }
    },
    
    // ============================================================
    // FUNGSI CORE SAVE
    // ============================================================
    async save() {
       if (window.sunEditor && window.sunEditor.getContents) {
           this.form.body = window.sunEditor.getContents();
       }
       if (!this.form.title) return alert('Judul wajib diisi!');
       if (!this.form.slug) {
           this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
       }

       const payload = { ...this.form }; 
       const url = this.editingId ? '/api/contents/' + this.editingId : '/api/contents';
       const method = this.editingId ? 'PUT' : 'POST';

       try {
           let res = await fetch(url, {
               method: method,
               headers: { 'Content-Type': 'application/json', 'Authorization': this.token },
               body: JSON.stringify(payload)
           });
           
           if (res.ok) {
               alert('✅ Berhasil Tersimpan!');
               this.view = 'posts'; 
               this.loadPosts(); 
               this.editingId = null;
               this.form = {title:'', slug:'', body:'', type:'post', status:'publish', featured_image:'', category:'', tags:''};
           } else {
               let json = await res.json();
               alert('❌ Gagal Simpan: ' + (json.error || 'Unknown Error'));
           }
       } catch (e) { alert('❌ Error Network'); }
    },

    // INIT
    init() { 
        if(this.token) { 
            this.decodeRole(); 
            this.loadAllData();
        } 
    },

    decodeRole() {
        try {
            if (!this.token) return;
            if (this.token.startsWith('labmu_v1.')) {
                const base64 = this.token.split('.')[1];
                const json = JSON.parse(window.atob(base64));
                this.userRole = json.r || 'editor';
            } else {
                try {
                   const base64 = this.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
                   this.userRole = JSON.parse(window.atob(base64)).role;
                } catch(e) { this.userRole = 'editor'; }
            }
        } catch (e) { this.userRole = 'editor'; }
    },

    async doLogin() {
        if(!this.loginForm.username || !this.loginForm.password) return alert('Lengkapi data!');
        this.isLoggingIn = true;
        try {
            let res = await fetch('/api/users/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.loginForm)
            });
            let json = await res.json();
            if(res.ok && json.token) {
                this.token = json.token;
                localStorage.setItem('labmu_token', this.token);
                this.decodeRole(); 
                this.init(); 
                window.location.reload();
            } else {
                alert('Login Gagal: ' + (json.error));
            }
        } catch(e) { alert('Error Network'); } 
        finally { this.isLoggingIn = false; }
    },
    
    logout(){ 
        localStorage.removeItem('labmu_token'); 
        window.location.reload();
    },

    openEditor() { 
      this.view = 'add'; this.editingId = null; 
      this.form = {title:'', slug:'', body:'', type:'post', status:'publish', featured_image:'', category:'', tags:''}; 
      setTimeout(() => { if(typeof startSunEditor === 'function') startSunEditor('editor', this.token, '', (c) => { this.form.body = c; }); }, 100);
    },
    
    editPost(post) { 
      this.view = 'add'; this.editingId = post.id; 
      this.form = { 
          title: post.title, 
          slug: post.slug, 
          body: post.body, 
          type: post.type, 
          status: post.status, 
          featured_image: post.featured_image || '',
          category: post.category || '', 
          tags: post.tags || ''
      };
      setTimeout(() => { if(typeof startSunEditor === 'function') startSunEditor('editor', this.token, post.body, (c) => { this.form.body = c; }); }, 100);
    },

    loadAllData() {
        try { this.loadPosts(); } catch(e){}
        try { this.loadThemes(); } catch(e){}
        
        if(typeof this.loadMedia === 'function') { try { this.loadMedia(); } catch(e){} } 
        if(this.userRole === 'admin') {
            try { this.loadSettings(); } catch(e){}
            if(typeof this.loadUsers === 'function') try { this.loadUsers(); } catch(e){}
        }
    },

    async loadSettings(){ try { let res = await fetch('/api/settings'); let json = await res.json(); if(json.success) this.settings = json.data; } catch(e) {} },
    async saveSettings(){ await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(this.settings) }); alert('Settings Saved'); },

    async deletePost(id) {
       if(!confirm('Hapus?')) return;
       try {
          await fetch('/api/contents/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
          this.loadPosts();
       } catch(e) { alert('Error network'); }
    }
  } 
}
`;