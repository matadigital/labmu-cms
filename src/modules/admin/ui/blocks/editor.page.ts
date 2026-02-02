export const editorPage = `
<div x-show="view === 'add'">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:20px;" x-text="getPageTitle()"></h2>
        <button @click="view = (form.type === 'page' ? 'pages' : 'posts')" class="btn" style="background:#fff; border:1px solid #ccc; color:#333;">Cancel</button>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        <div style="display:flex; flex-direction:column; gap:15px;">
            <input type="text" x-model="form.title" @input="makeSlug()" class="input" style="font-size:18px; font-weight:bold; padding:10px;" placeholder="Judul Tulisan...">
            
            <div style="font-size:12px; color:#666; display:flex; gap:5px; align-items:center;">
                Permalink: <span style="color:#2271b1;" x-text="'/' + form.slug"></span>
            </div>

            <div style="background:#fff; border:1px solid #ccc; min-height:400px;">
                <textarea id="editor" style="display:none;"></textarea>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:15px;">
            
            <div class="card">
                <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-size:14px;">Publish</h3>
                
                <div style="margin-bottom:10px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Status</label>
                    <select x-model="form.status" class="input">
                        <option value="publish">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px;">Tanggal</label>
                    <input type="datetime-local" x-model="form.date" class="input">
                </div>

                <div style="margin-bottom:15px; padding:8px; background:#f0f0f1; border-radius:4px; font-size:12px; color:#666;">
                    Sedang mengedit: <strong x-text="form.type === 'page' ? 'Page (Halaman)' : 'Post (Berita)'"></strong>
                </div>

                <button @click="save()" class="btn btn-primary" style="width:100%; justify-content:center;">
                    <span x-text="editingId ? 'Update' : 'Publish'"></span>
                </button>
            </div>

            <div class="card" x-show="form.type === 'post'">
                <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-size:14px;">Categories</h3>
                <div style="margin-bottom:10px;">
                    <input type="text" x-model="form.category" list="catList" class="input" placeholder="Select or type...">
                    <datalist id="catList"><template x-for="c in uniqueCategories"><option :value="c"></option></template></datalist>
                </div>
                
                <h3 style="margin-top:15px; border-bottom:1px solid #eee; padding-bottom:10px; font-size:14px;">Tags</h3>
                <div>
                    <input type="text" x-model="form.tags" class="input" placeholder="Separate with comma">
                </div>
            </div>

            <div class="card">
                <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; font-size:14px;">Featured Image</h3>
                <template x-if="form.featured_image">
                    <div style="margin-bottom:10px;">
                        <img :src="form.featured_image" style="width:100%; height:auto; border-radius:4px; border:1px solid #eee;">
                        <button @click="form.featured_image=''" style="color:red; font-size:12px; background:none; border:none; cursor:pointer; margin-top:5px;">Remove</button>
                    </div>
                </template>
                <button @click="openLogoSelector(null)" style="width:100%; padding:10px; border:1px dashed #ccc; background:#f9f9f9; cursor:pointer; color:#555;">
                    <span x-text="form.featured_image ? 'Change Image' : 'Set featured image'"></span>
                </button>
            </div>

        </div>
    </div>
</div>
`;