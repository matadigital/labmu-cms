export const mediaPage = `
<div x-show="view === 'media'" class="animate-fade" style="height: calc(100vh - 80px); display: flex; flex-direction: column; background: #fff; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
    
    <div style="padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; background: #fff;">
        
        <div style="font-weight: bold; font-size: 16px;">Media Library</div>

        <div style="display: flex; gap: 10px;">
            <div style="position: relative;">
                <i class="fas fa-search" style="position: absolute; left: 10px; top: 9px; color: #999; font-size: 12px;"></i>
                <input type="text" x-model="mediaSearchQuery" @input="filterMedia()" 
                       placeholder="Search media items..." 
                       style="padding: 6px 10px 6px 30px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; width: 250px;">
            </div>

            <label class="btn btn-primary" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding: 6px 12px; font-size: 13px;">
                <input type="file" multiple @change="uploadMedia($event)" style="display:none;">
                <i class="fas" :class="isUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                <span x-text="isUploading ? 'Uploading...' : 'Upload New'"></span>
            </label>
        </div>
    </div>

    <div style="display: flex; flex: 1; overflow: hidden;">
        
        <div style="flex: 1; overflow-y: auto; padding: 20px; background: #fcfcfc;">
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px;">
                <template x-for="m in filteredMedia" :key="m.key">
                    <div @click="setActiveItem(m)" 
                         style="position: relative; aspect-ratio: 1/1; cursor: pointer; background: #e5e5e5; border: 1px solid #ddd; overflow: hidden;"
                         :style="activeMediaItem && activeMediaItem.key === m.key ? 'box-shadow: inset 0 0 0 4px #2271b1;' : ''">
                        
                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                            <img :src="m.url" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                         </div>

                        <div x-show="activeMediaItem && activeMediaItem.key === m.key" 
                             style="position: absolute; top: -2px; right: -2px; background: #2271b1; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; z-index: 2;">
                            <i class="fas fa-check" style="color: white; font-size: 12px;"></i>
                        </div>
                    </div>
                </template>
            </div>

            <div x-show="filteredMedia.length === 0" style="text-align: center; padding: 50px; color: #888;">
                <p>Tidak ada media ditemukan.</p>
            </div>
        </div>

        <div style="width: 320px; background: #f9f9f9; border-left: 1px solid #ddd; display: flex; flex-direction: column; overflow-y: auto;">
            
            <template x-if="activeMediaItem">
                <div class="animate-fade" style="padding: 20px;">
                    
                    <div style="font-size: 12px; font-weight: bold; color: #555; margin-bottom: 10px;">ATTACHMENT DETAILS</div>

                    <div style="margin-bottom: 15px; border: 1px solid #ddd; background: #fff; padding: 5px;">
                        <img :src="activeMediaItem.url" style="width: 100%; height: auto; display: block;">
                    </div>

                    <div style="font-size: 12px; color: #666; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd; line-height: 1.6;">
                        <div style="font-weight: bold; color: #333; word-break: break-all;" x-text="activeMediaItem.key.split('/').pop()"></div>
                        <div x-text="new Date(activeMediaItem.uploaded).toLocaleDateString()"></div>
                        <div x-text="Math.round(activeMediaItem.size/1024) + ' KB'"></div>
                        
                        <div style="margin-top: 5px;">
                             <button @click="deleteMedia(activeMediaItem.key); activeMediaItem=null;" 
                                    style="color: #b32d2e; text-decoration: none; background: none; border: none; padding: 0; font-size: 12px; cursor: pointer;">
                                Delete Permanently
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        
                        <div>
                            <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">File URL</label>
                            <input type="text" :value="window.location.origin + activeMediaItem.url" readonly 
                                   style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px; background: #fff;"
                                   onclick="this.select()">
                        </div>

                        <div>
                            <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Alt Text</label>
                            <input type="text" x-model="activeMediaMeta.alt" placeholder="Alt text"
                                   style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Title</label>
                            <input type="text" x-model="activeMediaMeta.title" placeholder="Title"
                                   style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 11px; color: #666; margin-bottom: 3px;">Description</label>
                            <textarea x-model="activeMediaMeta.description" placeholder="Deskripsi..." rows="3"
                                      style="width: 100%; padding: 6px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px; font-family: sans-serif;"></textarea>
                        </div>
                        
                        <button class="btn btn-primary" style="margin-top: 10px; width: 100%; font-size: 12px;" disabled title="Fitur update meta akan datang">
                            <i class="fas fa-save"></i> Save Changes (Coming Soon)
                        </button>
                    </div>

                </div>
            </template>

            <template x-if="!activeMediaItem">
                <div style="padding: 20px; text-align: center; color: #999; margin-top: 50px;">
                    <i class="fas fa-image" style="font-size: 48px; opacity: 0.2; margin-bottom: 20px;"></i>
                    <p style="font-size: 13px;">Pilih salah satu gambar untuk melihat detail atau mengeditnya.</p>
                </div>
            </template>

        </div>
    </div>
</div>
`;