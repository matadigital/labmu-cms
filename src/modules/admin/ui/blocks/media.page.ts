export const mediaPage = `
<div x-show="view==='media'">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
    <h2>Media Library</h2>
    
    <div style="display:flex; gap:10px;">
      <select x-model="mediaFilter" class="input" style="width:auto; padding:8px;">
         <option value="">All Dates</option>
         <template x-for="date in mediaDates">
            <option :value="date" x-text="date"></option>
         </template>
      </select>

      <label class="btn" :style="isUploading ? 'opacity:0.5; cursor:not-allowed' : 'cursor:pointer'" style="display:inline-flex; align-items:center; gap:5px;">
        <i x-show="!isUploading" class="fas fa-cloud-upload-alt"></i>
        <span x-text="isUploading ? 'Uploading...' : 'Add New'"></span>
        <input type="file" style="display:none" @change="uploadFile($event)" accept="image/*" :disabled="isUploading">
      </label>
    </div>
  </div>

  <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:15px;">
    
    <template x-for="m in filteredMedia">
      <div class="card" style="padding:0; overflow:hidden; position:relative; aspect-ratio: 1/1; cursor:pointer; border:1px solid #eee; border-radius:8px;" @click="openMediaDetail(m)">
        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f4f4f4;">
             
             <template x-if="m.key && m.key.includes('/')">
                <div style="position:absolute; top:5px; left:5px; background:rgba(0,0,0,0.5); color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; z-index:2;">
                   <span x-text="m.key.split('/').slice(0,2).join('/')"></span>
                </div>
             </template>
             
             <img :src="m.url" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
        </div>
      </div>
    </template>
    
    <div x-show="filteredMedia.length===0" style="grid-column: 1/-1; text-align:center; padding:50px; color:#999; border:2px dashed #ccc; border-radius:10px;">
      <i class="fas fa-filter" style="margin-bottom:10px;"></i><br>
      Tidak ada gambar pada tanggal ini.
    </div>
  </div>

  <div x-show="selectedMedia" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(3px);" x-transition>
    <div class="card" style="width:90%; max-width:800px; display:grid; grid-template-columns: 1fr 1fr; gap:20px; position:relative; max-height:90vh; overflow-y:auto; border-radius:12px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); border:none;" @click.away="selectedMedia=null">
      
      <div style="background:#eee; display:flex; align-items:center; justify-content:center; border-radius:8px; overflow:hidden;">
        <template x-if="selectedMedia">
           <img :src="selectedMedia.url" style="max-width:100%; max-height:400px;">
        </template>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:10px;">
         <h3 style="margin:0 0 10px 0;">Image Details</h3>
         <label>File Name / Path</label>
         <input :value="selectedMedia?.key" class="input" disabled style="background:#f9f9f9; color:#666; font-family:monospace; font-size:12px;">
         
         <label>Alt Text (SEO)</label>
         <input x-model="selectedMediaMeta.alt" class="input" placeholder="Deskripsi gambar...">
         <label>Description</label>
         <textarea x-model="selectedMediaMeta.description" class="input" style="height:80px;"></textarea>
         
         <div style="display:flex; gap:10px; margin-top:10px;">
            <button @click="saveMediaMeta()" class="btn" style="flex:1;"><i class="fas fa-save"></i> Save SEO</button>
            <button @click="copyUrl(selectedMedia?.url)" class="btn" style="background:#f0f0f1; color:#333;"><i class="fas fa-link"></i> Copy URL</button>
         </div>
         <hr style="border:0; border-top:1px solid #eee; width:100%; margin:10px 0;">
         <button @click="deleteMedia(selectedMedia.key); selectedMedia=null;" class="btn" style="background:red; font-size:12px; width:100%;">
            <i class="fas fa-trash"></i> Delete Permanently
         </button>
      </div>
      <button @click="selectedMedia=null" style="position:absolute; top:10px; right:10px; border:none; background:none; font-size:20px; cursor:pointer; color:#666;">&times;</button>
    </div>
  </div>
</div>
`;