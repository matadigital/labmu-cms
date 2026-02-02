export const staticPage = `
<div x-show="view === 'pages'">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:20px;">Static Pages</h2>
        <button @click="openEditor('page')" class="btn btn-primary">
            <i class="fas fa-plus"></i> Add Page
        </button>
    </div>
    
    <div class="card" style="padding:0;">
         <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="background:#f9f9f9; text-align:left; border-bottom:1px solid #eee;">
                    <th style="padding:12px;">Title</th>
                    <th style="padding:12px;">URL Slug</th>
                    <th style="padding:12px; text-align:right;">Action</th>
                </tr>
            </thead>
            <tbody>
                <template x-for="p in pages" :key="p.id">
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:12px;">
                            <div style="font-weight:bold;" x-text="p.title"></div>
                        </td>
                        <td style="padding:12px; color:#2271b1;" x-text="'/' + p.slug"></td>
                        <td style="padding:12px; text-align:right;">
                            <a :href="'/' + p.slug" target="_blank" style="margin-right:10px; text-decoration:none; color:#2271b1;">View</a>
                            <button @click="editPost(p)" style="margin-right:10px; cursor:pointer; border:none; background:none; color:#e6a800;">Edit</button>
                            <button @click="deletePost(p.id)" style="cursor:pointer; border:none; background:none; color:#d63638;">Delete</button>
                        </td>
                    </tr>
                </template>
                <tr x-show="pages.length === 0"><td colspan="3" style="padding:20px; text-align:center; color:#999;">No pages found.</td></tr>
            </tbody>
        </table>
    </div>
</div>
`;