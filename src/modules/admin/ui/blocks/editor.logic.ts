export const editorLogic = `
    // FUNGSI SIMPAN (CREATE / UPDATE)
    async save() {
       // 1. Ambil Konten dari SunEditor (Jika ada)
       // Kita pakai pengecekan 'sunEditor' agar tidak error jika editor belum load
       if (typeof sunEditor !== 'undefined' && sunEditor.getContents) {
           this.form.body = sunEditor.getContents();
       }

       // 2. Validasi Sederhana
       if (!this.form.title) {
           return alert('Mohon isi Judul Artikel terlebih dahulu!');
       }
       
       // Buat Slug otomatis jika kosong
       if (!this.form.slug) {
           this.form.slug = this.form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
       }

       // 3. Siapkan Data
       const payload = {
           title: this.form.title,
           slug: this.form.slug,
           body: this.form.body,
           type: this.form.type,
           status: this.form.status,
           featured_image: this.form.featured_image,
           
           // Data Baru (Penting!)
           category: this.form.category,
           tags: this.form.tags
       };

       // 4. Tentukan Arah (Edit atau Baru?)
       const url = this.editingId ? '/api/contents/' + this.editingId : '/api/contents';
       const method = this.editingId ? 'PUT' : 'POST';

       // UBAH TOMBOL JADI LOADING
       const originalText = this.editingId ? 'Update' : 'Publish';
       // (Kita tidak bisa ubah text tombol secara langsung dari sini dengan mudah tanpa x-text, 
       // tapi kita bisa kasih indikator loading via alert atau console sementara)
       
       try {
           let res = await fetch(url, {
               method: method,
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': this.token
               },
               body: JSON.stringify(payload)
           });

           const json = await res.json();

           if (res.ok) {
               alert(this.editingId ? '✅ Artikel Berhasil Diupdate!' : '✅ Artikel Berhasil Dipublish!');
               
               // Redirect kembali ke halaman All Posts
               this.view = 'posts'; 
               this.loadPosts(); 
               
               // Reset Form
               this.editingId = null;
               this.form = {title:'', slug:'', body:'', type:'post', status:'publish', featured_image:'', category:'', tags:''};
           } else {
               alert('❌ Gagal: ' + (json.error || 'Terjadi kesalahan sistem'));
           }
       } catch (e) {
           alert('❌ Error Network: ' + e.message);
           console.error(e);
       }
    },
`;