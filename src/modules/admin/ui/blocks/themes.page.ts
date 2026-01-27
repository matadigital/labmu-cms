export const themesPage = `
<div x-show="view==='themes'">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <h2>Themes</h2>
    <button class="btn" style="background:#f0f0f1; color:#333; border:1px solid #ccc;">Upload Theme (Pro)</button>
  </div>

  <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:25px;">
     <template x-for="t in availableThemes">
        <div class="card" style="padding:0; overflow:hidden; border:1px solid #dcdcde; box-shadow:0 1px 2px rgba(0,0,0,0.05); position:relative;">
           
           <div style="aspect-ratio: 4/3; background:#eee; position:relative; border-bottom:1px solid #eee;">
               <img :src="t.thumbnail || 'https://placehold.co/600x400/eee/ccc?text=No+Preview'" style="width:100%; height:100%; object-fit:cover;">
               
               <div x-show="t.active" style="position:absolute; top:10px; right:10px; background:#2271b1; color:#fff; padding:4px 10px; font-size:12px; font-weight:bold; border-radius:3px; box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                  Active
               </div>
           </div>

           <div style="padding:15px;">
               <h3 x-text="t.name" style="margin:0 0 5px 0; font-size:16px;"></h3>
               <div style="font-size:12px; color:#666; margin-bottom:10px;">
                   By <span x-text="t.author"></span> &bull; v<span x-text="t.version"></span>
               </div>
               <p x-text="t.description" style="font-size:13px; color:#555; margin-bottom:15px; line-height:1.4; height:36px; overflow:hidden;"></p>
               
               <div style="display:flex; gap:10px;">
                   <button x-show="!t.active" @click="activateTheme(t.id)" class="btn" style="flex:1;">Activate</button>
                   <button x-show="t.active" class="btn" style="flex:1; background:#f0f0f1; color:#333; border:1px solid #ccc; cursor:default;">Customize</button>
               </div>
           </div>

        </div>
     </template>
  </div>
</div>
`;