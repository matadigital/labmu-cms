export const mediaLogic = `
    async loadMedia() {
        this.isLoading = true;
        try {
            const res = await fetch('/api/media', { 
                headers: { 'Authorization': this.token } 
            });
            if (!res.ok) throw new Error('Failed to fetch media');
            const json = await res.json();
            this.mediaList = json.data || [];
        } catch(e) { 
            console.error('Load media error:', e);
            this.mediaList = [];
        } finally { 
            this.isLoading = false; 
        }
    },

    async uploadMedia(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        
        this.isUploading = true;
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Authorization': this.token },
                body: formData
            });
            
            if (res.ok) {
                await this.loadMedia();
                alert('✅ Upload Sukses');
                e.target.value = ''; // Reset input file
            } else {
                const error = await res.json().catch(() => ({}));
                alert('Gagal Upload: ' + (error.message || 'Unknown error'));
            }
        } catch(err) { 
            console.error('Upload error:', err);
            alert('Error Network'); 
        } finally { 
            this.isUploading = false; 
        }
    },

    setActiveItem(item) {
        this.activeMediaItem = item;
        this.activeMediaMeta = { 
            alt: item?.alt || '', 
            title: item?.title || '', 
            description: item?.description || '' 
        };
    },

    async deleteMedia(key) {
        if (!confirm('Hapus file permanen?')) return;
        
        try {
            const res = await fetch('/api/media/' + encodeURIComponent(key), { 
                method: 'DELETE', 
                headers: { 'Authorization': this.token } 
            });
            
            if (!res.ok) throw new Error('Delete failed');
            
            await this.loadMedia();
            this.activeMediaItem = null;
            alert('✅ File terhapus');
        } catch(e) { 
            console.error('Delete error:', e);
            alert('Gagal hapus'); 
        }
    },

    async saveActiveMeta() {
        if (!this.activeMediaItem) return;
        
        this.isSavingMeta = true;
        try {
            const res = await fetch('/api/media/meta/' + encodeURIComponent(this.activeMediaItem.key), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify(this.activeMediaMeta)
            });
            
            if (!res.ok) throw new Error('Save failed');
            
            await this.loadMedia(); // Refresh data setelah update
            alert('✅ Info tersimpan');
        } catch(e) { 
            console.error('Save meta error:', e);
            alert('Gagal simpan'); 
        } finally { 
            this.isSavingMeta = false; 
        }
    }
`;