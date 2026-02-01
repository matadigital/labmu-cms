export const mediaPage = `
<div x-show="view==='media'">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:#fff; padding:15px; border-radius:8px; border:1px solid #ddd; flex-wrap:wrap; gap:15px;">
    
    <div style="display:flex; flex-direction:column;">
        <h2 style="margin:0; font-size:18px;">Media Library</h2>
        <small style="color:#666;" x-text="filteredMedia.length + ' items'">0 items</small>
    </div>

    <div style="display:flex; gap:10px; align-items:center; flex:1; justify-content:flex-end; flex-wrap:wrap;">
      
      <div style="position:relative;">
         <i class="fas fa-search" style="position:absolute; left:10px; top:10px; color:#999; font-size:12px;"></i>
         <input x-model="mediaSearchQuery" class="input" placeholder="Cari nama file..." style="width:200px; margin:0; padding-left:30px; height:38px;">
      </div>

      <select x-model="mediaFilter" class="input" style="width:auto; margin:0; padding:8px; height:38px;">
         <option value="">Semua Tanggal</option>
         <template x-for="date in mediaDates">
            <option :value="date" x-text="date"></option>
         </template>
      </select>

      <label class="btn" :style="isUploading ? 'opacity:0.7; cursor:wait' : 'cursor:pointer; background:#2271b1; border-color:#2271b1;'" style="display:inline-flex; align-items:center; gap:8px; padding:8px 15px; height:38px;">
        <i class="fas" :class="isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
        <span x-text="isUploading ? 'Uploading...' : 'Upload New'"></span>
        <input type="file" style="display:none" @change="uploadFile($event)" accept="image/*" :disabled="isUploading">
      </label>

    </div>
  </div>

  <div class="media-grid">
    <template x-for="m in filteredMedia">
      <div class="media-item" @click="openMediaDetail(m)">
        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
             <img :src="m.url" loading="lazy" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;">
        </div>
        <div class="overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.6); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; opacity:0; transition:opacity 0.2s; pointer-events:none;" 
             @mouseenter="$el.style.opacity=1" @mouseleave="$el.style.opacity=0">
        </div>
      </div>
    </template>
  </div>

  <div x-show="filteredMedia.length===0" style="text-align:center; padding:60px 20px; color:#999; border:2px dashed #ccc; border-radius:10px; background:#fafafa; margin-top:20px;">
      <i class="fas fa-search fa-3x" style="margin-bottom:15px; opacity:0.3;"></i>
      <p style="margin:0;">Tidak ada media ditemukan.</p>
  </div>

  <div class="modal-overlay" x-show="selectedMedia" x-transition.opacity>
    <div class="modal-box" @click.away="selectedMedia=null" style="max-width:1100px;">
      
      <div class="modal-header">
         <h3 style="margin:0; font-size:18px;">Media Details</h3>
         <button @click="selectedMedia=null" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <div class="modal-body">
         
         <div class="modal-grid-area" style="display:flex; align-items:center; justify-content:center; background:#eee; background-image: radial-gradient(#ccc 1px, transparent 1px); background-size: 10px 10px;">
             <template x-if="selectedMedia">
                <img :src="selectedMedia.url" style="max-width:90%; max-height:90%; object-fit:contain; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
             </template>
         </div>

         <div class="modal-sidebar-area">
             
             <div style="font-size:11px; color:#666; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;">
                <div style="font-weight:bold; color:#333; margin-bottom:5px; word-break:break-all;" x-text="selectedMedia?.key.split('/').pop()"></div>
                <div>Size: <span x-text="Math.round(selectedMedia?.size/1024) + ' KB'"></span></div>
                <div>Date: <span x-text="new Date(selectedMedia?.uploaded).toLocaleDateString()"></span></div>
             </div>

             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">File Name</label>
             <div style="display:flex; margin-bottom:15px; gap:5px;">
                <input x-model="renameForm.newName" class="input" style="font-size:12px; margin:0;">
                <button @click="renameFile()" class="btn" style="padding:0 10px; font-size:11px;" :disabled="isRenaming">
                    <i class="fas" :class="isRenaming ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                </button>
             </div>

             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">File URL</label>
             <div style="display:flex; margin-bottom:15px;">
                <input :value="window.location.origin + selectedMedia?.url" class="input" readonly style="background:#f9f9f9; font-size:11px; margin:0; border-right:0; border-top-right-radius:0; border-bottom-right-radius:0;">
                <button @click="copyUrl(selectedMedia?.url)" class="btn" style="border-top-left-radius:0; border-bottom-left-radius:0; padding:0 10px;"><i class="fas fa-copy"></i></button>
             </div>

             <hr style="border:0; border-top:1px solid #eee; margin:5px 0 15px 0;">

             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Alt Text</label>
             <input x-model="selectedMediaMeta.alt" class="input" style="font-size:12px; margin-bottom:15px;" placeholder="Alt text">
             
             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Title</label>
             <input x-model="selectedMediaMeta.title" class="input" style="font-size:12px; margin-bottom:15px;" placeholder="Image Title">

             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Caption (Keterangan)</label>
             <textarea x-model="selectedMediaMeta.caption" class="input" style="font-size:12px; height:50px; margin-bottom:15px;" placeholder="Keterangan gambar..."></textarea>

             <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Description</label>
             <textarea x-model="selectedMediaMeta.description" class="input" style="font-size:12px; height:60px; margin-bottom:15px;" placeholder="Deskripsi admin..."></textarea>

             <div style="margin-top:auto; padding-top:20px;">
                <button @click="saveMediaMeta()" class="btn" style="width:100%; margin-bottom:10px;">Simpan Perubahan</button>
                <button @click="deleteMedia(selectedMedia.key); selectedMedia=null;" style="width:100%; color:#b32d2e; background:none; border:none; cursor:pointer; font-size:12px; text-decoration:underline;">Delete Permanently</button>
             </div>
         </div>

      </div>
    </div>
  </div>
</div>
`;