export const mediaLogic = `
    // STATE MEDIA
    isUploading: false,
    selectedMedia: null,
    selectedMediaMeta: { alt:'', description:'', title:'' },
    showMediaSelector: false,

    // GETTERS
    get mediaDates() {
       const dates = new Set();
       if(this.mediaList && this.mediaList.length > 0) {
           this.mediaList.forEach(m => {
              if(!m.key) return;
              const match = m.key.match(/^(\\d{4}\\/\\d{2})\\//);
              if (match) dates.add(match[1]); 
           });
       }
       return Array.from(dates).sort().reverse();
    },

    get filteredMedia() {
       if (!this.mediaFilter) return this.mediaList;
       return this.mediaList.filter(m => m.key && m.key.startsWith(this.mediaFilter));
    },

    // ACTIONS
    async loadMedia(){ 
        try { 
            let res = await fetch('/api/media', { headers: {'Authorization':this.token} });
            
            // [FIX] Kalau token salah/basi, langsung logout
            if(res.status === 401) {
                console.log('Token expired, logging out...');
                return this.logout();
            }

            if(res.ok) {
                let json = await res.json(); 
                this.mediaList = json.data || []; 
            }
        } catch(e) { console.error('Media Error:', e); } 
    },

    async uploadFile(e) {
        const file = e.target.files[0];
        if(!file) return;
        
        this.isUploading = true;
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Authorization': this.token },
                body: formData
            });
            
            // [FIX] Handle Error 401 saat Upload
            if(res.status === 401) {
                alert('Sesi habis (Token Expired). Silakan Login lagi.');
                return this.logout();
            }

            const json = await res.json();
            if(json.success) {
                this.loadMedia(); 
            } else {
                alert('Upload Gagal: ' + json.error);
            }
        } catch(err) {
            alert('Error saat upload');
        } finally {
            this.isUploading = false;
        }
    },

    async deleteMedia(key) { 
        if(!confirm('Hapus Permanen?')) return; 
        try { 
            let res = await fetch('/api/media/' + key, { method: 'DELETE', headers: {'Authorization':this.token} }); 
            if(res.status === 401) return this.logout();
            
            if(res.ok) { 
                this.selectedMedia=null; 
                this.loadMedia(); 
            } 
        } catch(e) {} 
    },

    openMediaDetail(media) { 
        this.selectedMedia = media; 
        this.selectedMediaMeta = { 
            alt: media.alt || '', 
            description: media.description || '', 
            title: media.title || '' 
        }; 
    },

    async saveMediaMeta() { 
        if(!this.selectedMedia) return; 
        try { 
            await fetch('/api/media/meta/' + this.selectedMedia.key, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json', 'Authorization': this.token}, 
                body: JSON.stringify(this.selectedMediaMeta) 
            }); 
            if(res.status === 401) return this.logout();
            
            alert('✅ SEO Updated!'); 
            this.loadMedia(); 
        } catch(e) { alert('Error saving meta'); } 
    },
`; 
// ^^^ Pastikan diakhiri Backtick (tanpa koma di luar string, koma nanti di scripts.ts)