export const postsPage = `
<div x-show="view==='posts'">
  <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center;">
    <h2 style="margin:0;">All Posts</h2>
    <button @click="openEditor()" class="btn"><i class="fas fa-plus"></i> Add New</button>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
    <table class="wp-table" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#f8f9fa; border-bottom:2px solid #ddd;">
          <th style="text-align:left; padding:12px;">Title</th>
          
          <th style="text-align:left; width:140px;">Date</th>
          
          <th style="text-align:left; width:150px;">Category</th>
          <th style="text-align:left; width:150px;">Tags</th>
          <th width="80" style="text-align:center;">Status</th>
          <th width="120" style="text-align:center; padding:12px;">Action</th>
        </tr>
      </thead>
      <tbody>
        <template x-for="p in posts">
          <tr style="border-bottom:1px solid #eee;">
            
            <td style="padding:12px;">
              <b x-text="p.title" style="color:var(--wp-blue); font-size:14px; display:block; margin-bottom:4px;"></b>
              <div style="font-size:11px; color:#666; font-family:monospace;" x-text="'/'+p.slug"></div>
            </td>

            <td style="font-size:12px;">
                <div style="display:flex; flex-direction:column;">
                    <template x-if="p.created_at">
                        <div>
                            <span style="font-weight:600; color:#333;">
                                <i class="far fa-calendar-alt" style="margin-right:3px; color:#888;"></i>
                                <span x-text="new Date(p.created_at).toLocaleDateString('id-ID')"></span>
                            </span>
                            <div style="font-size:11px; color:#888; margin-top:2px;">
                                <span x-text="new Date(p.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})"></span>
                            </div>
                        </div>
                    </template>
                    <template x-if="!p.created_at">
                        <span style="color:#999;">-</span>
                    </template>
                </div>
            </td>

            <td style="font-size:12px; color:#555;">
                <i class="fas fa-folder" style="color:#f39c12; margin-right:5px;"></i>
                <span x-text="p.category || '-'"></span>
            </td>

            <td style="font-size:12px; color:#555;">
                <i class="fas fa-tags" style="color:#2ecc71; margin-right:5px;"></i>
                <span x-text="p.tags || '-'"></span>
            </td>

            <td style="text-align:center;">
              <span class="badge" 
                    :style="p.status=='publish' ? 'background:#d1e7dd; color:#0f5132' : 'background:#fff3cd; color:#664d03'"
                    style="padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold; text-transform:uppercase;" 
                    x-text="p.status">
              </span>
            </td>

            <td style="padding:8px; text-align:center;">
              <div style="display:flex; align-items:center; justify-content:center; gap:8px; width:100%;">
                <a :href="'/'+p.slug" target="_blank" class="btn-icon" title="Lihat" style="color:#3498db;"><i class="fas fa-eye"></i></a>
                <button @click="editPost(p)" class="btn-icon" title="Edit" style="color:#f39c12;"><i class="fas fa-pencil-alt"></i></button>
                <button @click="deletePost(p.id)" class="btn-icon" title="Hapus" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i></button>
              </div>
            </td>

          </tr>
        </template>
        
        <tr x-show="posts.length===0">
            <td colspan="6" style="text-align:center; padding:40px; color:#999;">
                Belum ada artikel. Yuk nulis!
            </td>
        </tr>

      </tbody>
    </table>
  </div>
</div>
`;