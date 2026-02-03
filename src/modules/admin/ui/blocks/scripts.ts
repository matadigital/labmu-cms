import { featuredImageLogic } from './featured.logic';
import { mediaLogic } from './media.logic';
import { usersLogic } from './users.logic';
import { quranLogic } from './quran.logic';
import { settingsLogic } from './settings.logic';
import { menusLogic } from './menus.logic';

export const scriptBlock = (data: any) => `
  // 1. DEFINISI GLOBAL DI WINDOW (Agar Bisa Diakses Dimana Saja)
  window.cms = function() {
    return {
      // --- STATE AWAL (HARUS LENGKAP SUPAYA GAK REFERENCE ERROR) ---
      token: localStorage.getItem('labmu_token') || '',
      view: 'dash',
      sidebarOpen: true,
      userRole: 'editor',
      loginForm: { username: '', password: '' },
      isLoggingIn: false,
      
      // Data Lists
      posts: [], pages: [], mediaList: [], usersList: [],
      quranList: [], availableThemes: [], 
      activeSurat: null, loadingQuran: false,
      mediaSearchQuery: '',
      
      // Form Editor
      form: { title: '', slug: '', body: '', type: 'post', status: 'publish', date: '', featured_image: '', category: '', tags: '' },
      editingId: null,
      
      // UI Helpers
      isUploading: false, showMediaSelector: false, showUserModal: false,
      userForm: { username: '', password: '', name: '', email: '', role: 'editor' },
      mediaSelectorTarget: null,
      activeMediaItem: null,
      activeMediaMeta: { alt: '', title: '', description: '' },
      isSavingMeta: false,
      
      // Settings & Menu (Tambahan)
      settings: {},
      menuList: [],
      menuForm: { id: null, label: '', url: '', order_num: 0 },
      isSavingMenu: false,
      isSavingSettings: false,
      uniqueCategories: [], uniqueTags: [],

      // --- INJECT LOGIC (ARRAY JOIN ADALAH KUNCI AGAR TIDAK ERROR KOMA) ---
      ${ [
          featuredImageLogic,
          mediaLogic,
          usersLogic,
          quranLogic,
          settingsLogic,
          menusLogic
        ].map(l => l.trim()).join(',\n') 
      },

      // --- CORE ACTIONS (INIT & AUTH) ---
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
          const decoded = JSON.parse(window.atob(base64));
          this.userRole = decoded.role || decoded.r || 'editor';
        } catch (e) { this.userRole = 'editor'; }
      },

      loadAllData() {
        // Gunakan Optional Chaining atau Check Typeof agar Aman
        if(this.loadPosts) this.loadPosts();
        if(this.loadPages) this.loadPages();
        if(this.loadThemes) this.loadThemes();
        if(this.loadMedia) this.loadMedia();
        if(this.userRole === 'admin' && this.loadUsers) this.loadUsers();
        if(this.loadSettings) this.loadSettings();
        if(this.loadMenus) this.loadMenus();
      },
      
      // --- FALLBACK METHODS (JAGA-JAGA KALAU LOGIC GAGAL LOAD) ---
      async loadPosts() { if (!this.token) return; try { let res = await fetch('/api/contents?type=post'); let json = await res.json(); this.posts = json.data || []; } catch (e) { } },
      
      // Helper: Filter Media (Pindah kesini biar aman dari error scope)
      get filteredMedia() {
        if (!this.mediaSearchQuery) return this.mediaList;
        const q = this.mediaSearchQuery.toLowerCase();
        return this.mediaList.filter(item => (item.key || '').toLowerCase().includes(q));
      },

      // Helper: Logout
      logout() { localStorage.removeItem('labmu_token'); window.location.reload(); },

      // Helper: Page Title
      getPageTitle() {
        const map = { 'dash': 'Dashboard', 'posts': 'All Posts', 'pages': 'Static Pages', 'settings': 'Settings', 'users': 'Users', 'media': 'Media Library', 'themes': 'Themes', 'quran': 'Al-Quran', 'menus': 'Menus' };
        return map[this.view] || 'Admin Panel';
      },
      
      // Helper: Open Editor
      openEditor(type) {
        this.view = 'add'; this.editingId = null;
        this.form = { title: '', slug: '', body: '', type: type || 'post', status: 'publish', date: '', featured_image: '', category: '', tags: '' };
        // SunEditor Delay
        setTimeout(() => { 
            if (typeof startSunEditor === 'function') startSunEditor('editor', this.token, '', (c) => { this.form.body = c; }); 
        }, 100);
      },
      
      // Helper: Auth Login
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
      }
    }
  };

  // 2. SUNEDITOR HELPER (GLOBAL)
  function startSunEditor(id, token, content, onChange) {
    if (typeof SUNEDITOR === 'undefined') return;
    const editor = SUNEDITOR.create(id, {
      width: '100%', height: '400px',
      buttonList: [['undo', 'redo'], ['font', 'fontSize', 'formatBlock'], ['bold', 'underline', 'italic'], ['list', 'align'], ['image', 'link', 'video'], ['fullScreen', 'codeView']],
    });
    if (content) editor.setContents(content);
    editor.onChange = (c) => onChange(c);
    window.sunEditor = editor;
  }
`;