export const editorPage = `
<div x-show="view==='add'" style="padding-bottom:50px;">
    
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <button @click="view = (form.type === 'page' ? 'pages' : 'posts')" class="btn" style="background:transparent; color:#555; border:1px solid #ccc; padding:6px 12px; display:flex; align-items:center; gap:5px;">
            <i class="fas fa-arrow-left"></i> 
            <span x-text="form.type === 'page' ? 'Kembali ke Pages' : 'Kembali ke Posts'"></span>
        </button>
        <h2 style="margin:0;" x-text="editingId ? ('Edit ' + (form.type==='page'?'Page':'Post')) : ('Tambah ' + (form.type==='page'?'Page':'Post') + ' Baru')"></h2>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 300px; gap:25px;">
        
        <div style="min-width: 0;">
            <input x-model="form.title" class="input" placeholder="Judul Tulisan..." 
                   style="font-size: 24px; font-weight: 600; padding: 10px 15px; height: auto; margin-bottom: 20px; border: 1px solid #ccc;" 
                   @input="makeSlug()">
            
            <div style="border: 1px solid #ccc; background: #fff; margin-bottom: 25px;">
                <textarea id="editor" style="display:none;"></textarea>
            </div>

            <div class="card">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Featured Image (Gambar Unggulan)</h3>
                
                <div x-show="!form.featured_image">
                    <button @click="openMediaSelector()" style="width:100%; padding:30px; background:#f0f0f1; border:2px dashed #ccc; color:#666; cursor:pointer; font-weight:500; border-radius:4px; display:flex; flex-direction:column; align-items:center; gap:10px;">
                        <i class="fas fa-image fa-2x" style="color:#ccc;"></i>
                        <span>Klik untuk memilih gambar</span>
                    </button>
                </div>

                <div x-show="form.featured_image" style="background:#f0f0f1; padding:10px; border-radius:4px; border:1px solid #ddd;">
                    <img :src="form.featured_image" style="width:100%; height:auto; max-height:400px; object-fit:contain; border:1px solid #ccc; background:#fff; display:block; margin-bottom:10px;">
                    
                    <div style="display:flex; gap:10px;">
                        <button @click="openMediaSelector()" class="btn" style="background:#fff; color:#2271b1; border:1px solid #2271b1; font-size:12px;">
                            <i class="fas fa-sync"></i> Ganti Gambar
                        </button>
                        <button @click="form.featured_image=''" class="btn" style="background:#fff; color:#b32d2e; border:1px solid #b32d2e; font-size:12px;">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
                
                <div style="margin-top:10px;">
                     <label style="font-size:12px; font-weight:bold; color:#666;">Caption Gambar</label>
                     <input x-model="form.featured_image_caption" class="input" placeholder="Keterangan gambar..." style="margin-top:5px; font-size:12px;">
                </div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            
            <div class="card" style="padding:0; overflow:hidden; border-top: 3px solid #2271b1;">
                <div style="padding:15px; border-bottom:1px solid #eee; background:#f8f9fa;">
                    <h3 style="margin:0; font-size:14px;">Terbitkan</h3>
                </div>
                <div style="padding:15px; background:#fff;">
                    <div style="margin-bottom:15px;">
                        <label style="font-size:12px; font-weight:600; color:#666; display:block; margin-bottom:5px;">Status</label>
                        <select x-model="form.status" class="input" style="width:100%;">
                            <option value="draft">Draft (Konsep)</option>
                            <option value="publish">Published (Terbit)</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom:5px;">
                         <label style="font-size:12px; font-weight:600; color:#666; display:block; margin-bottom:5px;">Waktu Terbit:</label>
                         <input type="datetime-local" x-model="form.date" class="input" style="margin-bottom:0; font-size:12px;">
                         <small style="color:#999; font-size:10px;">*Kosongkan untuk waktu sekarang</small>
                    </div>
                </div>
                
                <div style="padding:10px 15px; background:#f6f7f7; border-top:1px solid #dcdcde; display:flex; justify-content:space-between; align-items:center;">
                    <button @click="deletePost(editingId)" x-show="editingId" class="btn" style="background:none; border:none; color:#b32d2e; text-decoration:underline; cursor:pointer; font-size:12px; padding:0;">Hapus</button>
                    <span x-show="!editingId"></span> <button @click="save()" class="btn btn-primary">
                        <i class="fas fa-save"></i> <span x-text="editingId ? 'Update' : 'Publish'"></span>
                    </button>
                </div>
            </div>

            <div class="card" x-show="form.type === 'post'">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Kategori</h3>
                <input x-model="form.category" list="catList" class="input" placeholder="Pilih atau ketik baru..." style="margin-bottom:5px;">
                <datalist id="catList">
                    <template x-for="c in uniqueCategories"><option :value="c"></option></template>
                </datalist>
                <small style="color:#666;">Kelompokkan artikel Anda.</small>
            </div>

            <div class="card" x-show="form.type === 'post'">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Tags</h3>
                <textarea x-model="form.tags" class="input" style="height:60px; resize:vertical;" placeholder="Pisahkan dengan koma..."></textarea>
                
                <div style="margin-top:10px; border-top:1px dashed #ddd; padding-top:10px;" x-show="uniqueTags.length > 0">
                    <small style="color:#666; display:block; margin-bottom:5px;">Sering digunakan:</small>
                    <div style="display:flex; flex-wrap:wrap; gap:5px;">
                        <template x-for="t in uniqueTags">
                            <span @click="addTag(t)" style="background:#f0f0f1; padding:2px 8px; border-radius:10px; font-size:11px; cursor:pointer; border:1px solid #ddd; color:#555;">
                                <i class="fas fa-plus" style="font-size:9px;"></i> <span x-text="t"></span>
                            </span>
                        </template>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 style="margin:0 0 15px 0; font-size:14px;">Atribut Halaman</h3>
                
                <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Slug (URL)</label>
                <div style="display:flex; align-items:center; background:#f0f0f1; border:1px solid #8c8f94; border-radius:4px; margin-bottom:10px;">
                    <span style="padding:6px 10px; color:#646970; font-size:13px; border-right:1px solid #8c8f94;">/</span>
                    <input x-model="form.slug" style="border:none; padding:8px; flex:1; background:transparent; outline:none; font-size:13px; color:#333;">
                </div>
                <small style="color:#888;">URL akan dibuat otomatis dari judul jika kosong.</small>
            </div>

        </div>
    </div>
</div>
`;