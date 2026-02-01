export const settingsPage = `
<div x-show="view==='settings'">
  
  <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
    <div>
        <h2 style="margin:0;">General Settings</h2>
        <p style="margin:5px 0 0 0; color:#666; font-size:13px;">Konfigurasi dasar website.</p>
    </div>
    <button @click="saveSettings()" class="btn btn-primary" :disabled="isSavingSettings">
        <i class="fas" :class="isSavingSettings ? 'fa-spinner fa-spin' : 'fa-save'"></i>
        <span x-text="isSavingSettings ? 'Saving...' : 'Save Changes'"></span>
    </button>
  </div>

  <div style="display:grid; grid-template-columns: 2fr 1fr; gap:25px;">
      
      <div class="card">
          <h3 style="margin:0 0 20px 0; padding-bottom:10px; border-bottom:1px solid #eee; font-size:14px;">Site Identity</h3>
          
          <div style="margin-bottom:15px;">
              <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Site Title</label>
              <input x-model="settings.site_title" class="input" placeholder="Nama Website Anda">
              <small style="color:#888;">Judul utama yang muncul di tab browser.</small>
          </div>

          <div style="margin-bottom:15px;">
              <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Tagline / Description</label>
              <input x-model="settings.site_desc" class="input" placeholder="Slogan singkat...">
              <small style="color:#888;">Deskripsi singkat tentang website ini.</small>
          </div>

          <div style="margin-bottom:15px;">
              <label style="font-weight:bold; font-size:12px; display:block; margin-bottom:5px;">Admin Email</label>
              <input x-model="settings.admin_email" type="email" class="input" placeholder="admin@domain.com">
              <small style="color:#888;">Email ini digunakan untuk keperluan administrasi.</small>
          </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:20px;">
          
          <div class="card">
              <h3 style="margin:0 0 15px 0; font-size:14px;">Site Logo</h3>
              
              <div x-show="settings.site_logo" style="margin-bottom:15px; background:#f0f0f1; padding:10px; text-align:center; border-radius:4px;">
                  <img :src="settings.site_logo" style="max-width:100%; max-height:80px; height:auto;">
              </div>

              <div style="display:flex; gap:10px;">
                  <button @click="openLogoSelector('site_logo')" class="btn" style="width:100%; justify-content:center; background:#f0f0f1; color:#333; border-color:#ccc;">
                      <i class="fas fa-image"></i> Select Logo
                  </button>
                  <button x-show="settings.site_logo" @click="settings.site_logo=''" class="btn-icon" style="color:#e74c3c; border:1px solid #eee;">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>

          <div class="card">
              <h3 style="margin:0 0 15px 0; font-size:14px;">Favicon</h3>
              
              <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                  <div style="width:40px; height:40px; background:#f0f0f1; border-radius:4px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                      <img x-show="settings.site_favicon" :src="settings.site_favicon" style="width:100%; height:100%; object-fit:contain;">
                      <i x-show="!settings.site_favicon" class="fas fa-globe" style="color:#ccc;"></i>
                  </div>
                  <div style="font-size:11px; color:#666; line-height:1.4;">
                      Icon yang muncul di tab browser.<br>Disarankan ukuran 32x32 px.
                  </div>
              </div>

              <div style="display:flex; gap:10px;">
                  <button @click="openLogoSelector('site_favicon')" class="btn" style="width:100%; justify-content:center; background:#f0f0f1; color:#333; border-color:#ccc;">
                      <i class="fas fa-icons"></i> Select Icon
                  </button>
                  <button x-show="settings.site_favicon" @click="settings.site_favicon=''" class="btn-icon" style="color:#e74c3c; border:1px solid #eee;">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>

      </div>
  </div>
</div>
`;