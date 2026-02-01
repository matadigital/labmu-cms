export const globalModals = `
<div class="modal-overlay" x-show="showMediaSelector" x-transition.opacity>
   
   <div class="modal-box" @click.away="showMediaSelector=false">
      
      <div class="modal-header">
         <div style="display:flex; align-items:center; gap:15px;">
             <h3 style="margin:0; font-size:18px;">Select Image</h3>
             
             <label class="btn" :style="isUploadingFeatured ? 'opacity:0.7; cursor:wait' : 'background:#f0f0f1; color:#2271b1; border-color:#2271b1;'">
                <i class="fas" :class="isUploadingFeatured ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                <span x-text="isUploadingFeatured ? 'Uploading...' : 'Upload New'"></span>
                <input type="file" style="display:none" @change="uploadFeaturedImage($event)" accept="image/*" :disabled="isUploadingFeatured">
             </label>
         </div>
         <button @click="showMediaSelector=false" style="background:none; border:none; font-size:24px; cursor:pointer;">&times;</button>
      </div>

      <div class="modal-body">
          
          <div class="modal-grid-area">
             <div x-show="isUploadingFeatured" style="text-align:center; padding:20px; color:#2271b1;">
                <i class="fas fa-spinner fa-spin fa-2x"></i><p>Mengupload...</p>
             </div>

             <div class="media-grid">
                 <template x-for="m in mediaList">
                    <div @click="setActiveItem(m)" class="media-item" :class="(activeMediaItem && activeMediaItem.key === m.key) ? 'active' : ''">
                       <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                           <img :src="m.url" loading="lazy" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;">
                       </div>
                       <div x-show="activeMediaItem && activeMediaItem.key === m.key" class="media-check">✓</div>
                    </div>
                 </template>
             </div>
          </div>

          <div class="modal-sidebar-area" x-show="activeMediaItem">
              <div style="margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">
                  <h4 style="margin:0 0 10px 0; font-size:12px; color:#555; text-transform:uppercase;">Details</h4>
                  <div style="width:100%; height:150px; background:#f9f9f9; border:1px solid #eee; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border-radius:4px;">
                      <img :src="activeMediaItem?.url" style="max-width:100%; max-height:100%; object-fit:contain;">
                  </div>
                  <div style="font-size:11px; color:#666;">
                      <div style="font-weight:bold; word-break:break-all;" x-text="activeMediaItem?.key.split('/').pop()"></div>
                      <div x-text="Math.round(activeMediaItem?.size/1024) + ' KB'"></div>
                  </div>
              </div>

              <div style="flex:1;">
                  <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Alt Text</label>
                  <input x-model="activeMediaMeta.alt" class="input" placeholder="Alt text">

                  <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Title</label>
                  <input x-model="activeMediaMeta.title" class="input" placeholder="Title">

                  <label style="font-size:11px; font-weight:bold; color:#444; display:block; margin-bottom:5px;">Description</label>
                  <textarea x-model="activeMediaMeta.description" class="input" style="height:60px;" placeholder="Deskripsi..."></textarea>

                  <button @click="saveActiveMeta()" class="btn" style="width:100%; background:#f0f0f1; color:#333; border:1px solid #ccc; justify-content:center;">
                      <i class="fas" :class="isSavingMeta ? 'fa-spinner fa-spin' : 'fa-save'"></i> Simpan Info
                  </button>
              </div>

              <div style="margin-top:auto; padding-top:20px; border-top:1px solid #eee;">
                  <button @click="confirmFeaturedImage()" class="btn btn-primary" style="width:100%; justify-content:center; font-weight:bold; padding:10px;">
                      Set Selected Image
                  </button>
              </div>
          </div>
          
          <div class="modal-sidebar-area" x-show="!activeMediaItem" style="align-items:center; justify-content:center; color:#999; text-align:center;">
              <i class="fas fa-mouse-pointer fa-2x" style="margin-bottom:10px; opacity:0.3;"></i>
              <p>Pilih gambar di kiri.</p>
          </div>

      </div>
   </div>
</div>
`;