export const editorPage = `
<div x-show="view==='add'" style="padding-bottom:50px;">
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
        <button @click="view='posts'" class="btn" style="background:transparent; color:#555; border:1px solid #ccc;">
            <i class="fas fa-arrow-left"></i> Back to Posts
        </button>
        <h2 style="margin:0;">Editor</h2>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 300px; gap:25px;">
        
        <div style="min-width: 0;">
            <input x-model="form.title" class="input" placeholder="Judul Artikel..." 
                   style="font-size: 24px; font-weight: 600; padding: 10px 15px; height: auto; margin-bottom: 20px;" 
                   @input="makeSlug()">
            
            <div style="border: 1px solid #ccc; background: #fff;">
                <textarea id="editor" style="display:none;"></textarea>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 style="margin:0 0 15px 0; font-size:14px; border-bottom:1px solid #eee; padding-bottom:10px; color:#333;">Page Attributes</h3>
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                    <div>
                        <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Slug</label>
                        <div style="display:flex; align-items:center; background:#f0f0f1; border:1px solid #8c8f94; border-radius:4px;">
                            <span style="padding:8px 10px; color:#646970; font-size:13px; border-right:1px solid #8c8f94; background:#e0e0e0;">/</span>
                            <input x-model="form.slug" type="text" style="border:none; padding:8px 10px; flex:1; background:transparent; outline:none; font-size:13px;" placeholder="slug-halaman-ini">
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Post Type</label>
                        <select x-model="form.type" class="input" style="height:38px;">
                            <option value="post">Post (Artikel)</option>
                            <option value="page">Page (Halaman)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            
            <div class="card" style="padding:0; overflow:hidden; border-top: 3px solid #2271b1;">
                <div style="padding:15px; background:#fff;">
                    <div style="margin-bottom:15px;">
                        <label style="font-weight:600; font-size:12px; display:block; margin-bottom:5px;">Status</label>
                        <select x-model="form.status" class="input"><option value="draft">Draft</option><option value="publish">Published</option></select>
                    </div>
                    <div style="margin-bottom:5px;">
                         <label style="font-weight:600; font-size:12px; display:block; margin-bottom:5px;">Tanggal Terbit</label>
                         <input type="datetime-local" x-model="form.date" class="input">
                    </div>
                </div>
                <div style="padding:10px 15px; background:#f6f7f7; border-top:1px solid #eee; display:flex; justify-content:space-between;">
                    <button class="btn" style="background:none; border:none; color:#b32d2e; text-decoration:underline; font-size:12px;">Move to Trash</button>
                    <button @click="save()" class="btn btn-primary"><span x-text="editingId ? 'Update' : 'Publish'"></span></button>
                </div>
            </div>

            <div class="card">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Categories</h3>
                <input x-model="form.category" list="catList" class="input" placeholder="Select or type new...">
                <datalist id="catList"><template x-for="c in uniqueCategories"><option :value="c"></option></template></datalist>
            </div>

            <div class="card">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Tags</h3>
                <textarea x-model="form.tags" class="input" style="height:60px;" placeholder="Add tags..."></textarea>
            </div>

            <div class="card">
                <h3 style="margin:0 0 10px 0; font-size:14px;">Featured image</h3>
                <div x-show="!form.featured_image">
                    <button @click="openMediaSelector()" style="width:100%; padding:20px; background:#f0f0f1; border:1px dashed #2271b1; color:#2271b1; cursor:pointer;">Set featured image</button>
                </div>
                <div x-show="form.featured_image">
                    <img :src="form.featured_image" style="width:100%; height:auto; border:1px solid #ddd; margin-bottom:10px;">
                    <textarea x-model="form.featured_image_caption" class="input" placeholder="Keterangan gambar..." style="height:50px; font-size:12px;"></textarea>
                    <div style="display:flex; gap:10px;">
                        <button @click="openMediaSelector()" style="color:#2271b1; background:none; border:none; cursor:pointer; font-size:13px;">Replace</button>
                        <button @click="form.featured_image=''; form.featured_image_caption=''" style="color:#b32d2e; background:none; border:none; cursor:pointer; font-size:13px;">Remove</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    
    </div>
`;