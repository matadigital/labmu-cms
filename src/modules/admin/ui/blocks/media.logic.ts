export const mediaLogic = `
    // STATE MEDIA
    isUploading: false,
    selectedMedia: null,
    // UPDATE META STATE: Tambah caption
    selectedMediaMeta: { alt:'', description:'', title:'', caption:'' },
    showMediaSelector: false,
    
    mediaSearchQuery: '',
    renameForm: { oldKey: '', newName: '' },
    isRenaming: false,

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
       let items = this.mediaList;
       if (this.mediaFilter) items = items.filter(m => m.key && m.key.startsWith(this.mediaFilter));
       if (this.mediaSearchQuery) {
           const q = this.mediaSearchQuery.toLowerCase();
           items = items.filter(m => m.key.split('/').pop().toLowerCase().includes(q));
       }
       return items;
    },

    // ACTIONS
    async loadMedia(){ 
        try { 
            let res = await fetch('/api/media', { headers: {'Authorization':this.token} });
            if(res.status === 401) return this.logout();
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
            const res = await fetch('/api/media', { method: 'POST', headers: { 'Authorization': this.token }, body: formData });
            if(res.status === 401) return this.logout();
            const json = await res.json();
            if(json.success) {
                await this.loadMedia(); 
                e.target.value = ''; 
                
                // OPTIONAL: Otomatis buka popup detail setelah upload
                const newItem = this.mediaList.find(m => m.key === json.key);
                if(newItem) this.openMediaDetail(newItem);

            } else { alert('Upload Gagal: ' + json.error); }
        } catch(err) { alert('Error saat upload'); } 
        finally { this.isUploading = false; }
    },

    async deleteMedia(key) { 
        if(!confirm('Hapus Permanen?')) return; 
        try { 
            let res = await fetch('/api/media/delete', { method: 'POST', headers: {'Authorization':this.token, 'Content-Type': 'application/json'}, body: JSON.stringify({ key: key }) }); 
            if(res.status === 401) return this.logout();
            if(res.ok) { this.selectedMedia=null; this.loadMedia(); } 
        } catch(e) {} 
    },

    // OPEN DETAIL (UPDATE CAPTION)
    openMediaDetail(media) { 
        this.selectedMedia = media; 
        this.selectedMediaMeta = { 
            alt: media.alt || '', 
            description: media.description || '', 
            title: media.title || '',
            caption: media.caption || '' // <--- Load Caption
        };
        const filename = media.key.split('/').pop();
        this.renameForm = { oldKey: media.key, newName: filename };
    },

    async renameFile() {
        if(!this.renameForm.newName || this.renameForm.newName === this.renameForm.oldKey.split('/').pop()) return;
        if(!confirm('PERINGATAN: Mengubah nama file akan memutus link gambar di artikel lama. Lanjutkan?')) return;

        this.isRenaming = true;
        try {
            let res = await fetch('/api/media/rename', { method: 'POST', headers: {'Authorization':this.token, 'Content-Type': 'application/json'}, body: JSON.stringify(this.renameForm) }); 
            if(res.status === 401) return this.logout();
            const json = await res.json();
            if(json.success) {
                alert('File berhasil direname!');
                this.selectedMedia = null; 
                this.loadMedia(); 
            } else { alert('Gagal Rename: ' + json.error); }
        } catch(e) { alert('Error Network'); } 
        finally { this.isRenaming = false; }
    },

    async saveMediaMeta() { 
        if(!this.selectedMedia) return; 
        try { 
            let res = await fetch('/api/media/meta/' + this.selectedMedia.key, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json', 'Authorization': this.token}, 
                body: JSON.stringify(this.selectedMediaMeta) 
            }); 
            if(res.status === 401) return this.logout();
            alert('✅ Info Media Tersimpan!'); 
            this.loadMedia(); 
        } catch(e) { alert('Error saving meta'); } 
    },
    
    copyUrl(url) {
        if(!url) return;
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl).then(() => { alert('Link tersalin!'); });
    },
`;