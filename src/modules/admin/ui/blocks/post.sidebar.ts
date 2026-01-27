export const postSidebar = `
    <div style="display:flex; flex-direction:column; gap:15px;">
      
      <div class="card" style="border-top: 3px solid #2271b1; padding:15px;">
        <h4 style="margin-top:0; margin-bottom:15px;">Publish</h4>
        <div style="margin-bottom:15px; font-size:13px; color:#3c434a; display:flex; flex-direction:column; gap:8px;">
           <div style="display:flex; align-items:center; gap:5px;">
              <i class="fas fa-map-marker-alt" style="color:#8c8f94;"></i> 
              Status: <b x-text="form.status" style="text-transform:capitalize;"></b>
           </div>
           <div style="display:flex; align-items:center; gap:5px;">
              <i class="fas fa-eye" style="color:#8c8f94;"></i> 
              Visibility: <b>Public</b>
           </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:10px; border-top:1px solid #f0f0f1;">
           <button class="btn" style="background:none; border:none; color:#b32d2e; text-decoration:underline; padding:0; font-size:13px;">Move to Trash</button>
           <button @click="save()" class="btn" style="background:#2271b1; color:#fff; border-color:#2271b1; font-weight:600;">
              <span x-text="editingId ? 'Update' : 'Publish'"></span>
           </button>
        </div>
      </div>

      <div class="card">
        <label>Slug (URL)</label>
        <input x-model="form.slug" class="input">
        
        <label>Type</label>
        <select x-model="form.type" class="input">
            <option value="post">Post</option>
            <option value="page">Page</option>
        </select>
        
        <label>Status</label>
        <select x-model="form.status" class="input">
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
        </select>
      </div>

      <div class="card">
         <h4 style="margin-top:0;">Categories</h4>
         
         <label style="font-size:12px; font-weight:600;">Select or Create Category</label>
         <input x-model="form.category" list="catList" class="input" placeholder="Select or type new...">
         
         <datalist id="catList">
            <template x-for="cat in uniqueCategories">
                <option :value="cat"></option>
            </template>
         </datalist>

         <p style="font-size:11px; color:#666; margin-top:5px;">
            <i class="fas fa-info-circle"></i> Pilih dari list atau ketik baru.
         </p>
      </div>

      <div class="card">
         <h4 style="margin-top:0;">Tags</h4>
         <textarea x-model="form.tags" class="input" style="height:60px;" placeholder="Add new tags..."></textarea>
         <p style="font-size:11px; color:#666; margin-top:5px;">Separate tags with commas.</p>
         
         <div style="margin-top:10px; border-top:1px dashed #ddd; padding-top:10px;" x-show="uniqueTags.length > 0">
            <small style="display:block; margin-bottom:5px; color:#555;">Most Used Tags:</small>
            <div style="display:flex; flex-wrap:wrap; gap:5px;">
               <template x-for="tag in uniqueTags">
                  <span @click="addTag(tag)" 
                        style="background:#f0f0f1; border:1px solid #ccc; padding:2px 8px; font-size:11px; border-radius:10px; cursor:pointer; user-select:none;"
                        onmouseover="this.style.background='#e5e5e5'"
                        onmouseout="this.style.background='#f0f0f1'">
                     <i class="fas fa-plus" style="font-size:9px; color:#888;"></i> <span x-text="tag"></span>
                  </span>
               </template>
            </div>
         </div>
      </div>

      <div class="card">
        <h4 style="margin-top:0;">Featured image</h4>
        
        <div x-show="form.featured_image" style="margin-bottom:10px;">
           <img :src="form.featured_image" style="width:100%; height:auto; object-fit:cover; border:1px solid #dcdcde; background:#f0f0f1; min-height:100px;">
           <button @click="form.featured_image=''" style="background:none; border:none; color:#b32d2e; margin-top:8px; cursor:pointer; font-size:13px;">Remove featured image</button>
        </div>

        <div x-show="!form.featured_image">
           <button @click="openMediaSelector()" style="background:#f0f0f1; color:#2271b1; border:none; width:100%; padding:15px; text-align:center; cursor:pointer; font-size:13px; text-decoration:underline;">
             Set featured image
           </button>
        </div>
        
        <input x-model="form.featured_image" type="hidden">
      </div>
    </div>

    <div x-show="showMediaSelector" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; padding:40px; align-items:center; justify-content:center;" x-transition>
       <div class="card" style="width:100%; max-width:900px; height:80%; display:flex; flex-direction:column; overflow:hidden; border-radius:0; box-shadow: 0 5px 15px rgba(0,0,0,0.5); border:none; padding:0;">
          <div style="display:flex; justify-content:space-between; padding:15px; border-bottom:1px solid #ddd; background:#fff;">
             <h3 style="margin:0; font-size:18px;">Select Featured Image</h3>
             <button @click="showMediaSelector=false" style="background:none; border:none; font-size:20px; cursor:pointer;">&times;</button>
          </div>
          
          <div style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:10px; padding:20px; background:#f0f0f1;">
             <template x-for="m in mediaList">
                <div @click="selectFeaturedImage(m.url)" style="cursor:pointer; border:4px solid transparent; overflow:hidden; aspect-ratio:1/1; position:relative;" :style="form.featured_image === m.url ? 'border-color:#2271b1; box-shadow:0 0 0 1px #fff inset' : 'border-color:transparent'">
                   <img :src="m.url" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
                   <div x-show="form.featured_image === m.url" style="position:absolute; top:5px; right:5px; background:#2271b1; color:white; width:20px; height:20px; text-align:center; line-height:20px; border-radius:50%; font-size:12px;">✓</div>
                </div>
             </template>
          </div>
       </div>
    </div>
`;