export const contentsLogic = `
    form: { id: null, title: '', slug: '', body: '', type: 'post', status: 'publish', category: '', tags: '' },
    editingId: null,

    async save() {
       if (window.sunEditor && window.sunEditor.getContents) this.form.body = window.sunEditor.getContents();
       if (!this.form.title) return alert('Judul wajib!');
       
       if (!this.form.slug) {
            this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
       }
       
       const payload = { ...this.form }; 
       const isPage = payload.type === 'page';

       try { 
           let res = await fetch('/api/contents', { 
               method: 'POST', 
               headers: { 'Content-Type': 'application/json', 'Authorization': this.token }, 
               body: JSON.stringify(payload) 
           }); 
           
           if (res.ok) { 
               alert('Tersimpan!'); 
               this.view = isPage ? 'pages' : 'posts'; 
               if(isPage && this.loadPages) this.loadPages(); 
               else if(this.loadPosts) this.loadPosts(); 
               this.editingId = null; 
           } else { 
               let json = await res.json(); 
               alert('Gagal: ' + json.error); 
           } 
        } catch (e) { alert('Error Network'); }
    },

    async deletePost(id) { 
        if(!confirm('Hapus?')) return; 
        try { 
            await fetch('/api/contents/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } }); 
            if(this.loadPosts) this.loadPosts(); 
            if(this.loadPages) this.loadPages();
        } catch(e) {} 
    },

    resetForm(type) {
        this.form = {id: null, title:'', slug:'', body:'', type: type || 'post', status:'publish', category:'', tags:''};
    },

    openEditor(type) { 
        this.view = 'add'; 
        this.editingId = null; 
        this.resetForm(type || 'post');
        setTimeout(() => { 
            if(typeof startSunEditor === 'function') {
                startSunEditor('editor', this.token, '', (c) => { this.form.body = c; }); 
            }
        }, 100); 
    },
    
    editContent(item) { 
        this.view = 'add'; 
        this.editingId = item.id; 
        this.form = { ...item }; 
        setTimeout(() => { 
            if(typeof startSunEditor === 'function') {
                startSunEditor('editor', this.token, item.body, (c) => { this.form.body = c; }); 
            }
        }, 100); 
    },

    makeSlug(){ 
        if(!this.editingId && this.form.title) {
            this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); 
        }
    },

    addTag(tag) {
        let current = this.form.tags ? this.form.tags.split(',').map(t => t.trim()).filter(t => t) : [];
        if (!current.includes(tag)) { 
            current.push(tag); 
            this.form.tags = current.join(', '); 
        }
    }
`;