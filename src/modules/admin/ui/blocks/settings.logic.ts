export const settingsLogic = `
    // STATE
    settings: { 
        site_title: '', 
        site_desc: '', 
        admin_email: '',
        site_logo: '',      
        site_favicon: ''    
    },
    isSavingSettings: false,

    // LOAD SETTINGS
    async loadSettings() {
       try {
          let res = await fetch('/api/settings');
          let json = await res.json();
          if(json.success) {
              // Merge data
              this.settings = { ...this.settings, ...json.data };
              
              // UPDATE TAMPILAN BROWSER (TITLE & FAVICON)
              this.updateDom();
          }
       } catch(e) {}
    },

    // SAVE SETTINGS
    async saveSettings() {
       this.isSavingSettings = true;
       try {
          let res = await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type':'application/json', 'Authorization': this.token },
              body: JSON.stringify(this.settings)
          });
          
          if(res.ok) {
              alert('✅ Pengaturan Tersimpan!');
              // Update browser langsung setelah simpan
              this.updateDom();
          } else {
              alert('Gagal simpan');
          }
       } catch(e) { alert('Error network'); }
       finally { this.isSavingSettings = false; }
    },

    // FUNGSI BARU: UPDATE TITLE & FAVICON DI BROWSER
    updateDom() {
        // Update Title Tab
        if(this.settings.site_title) {
            document.title = this.settings.site_title + ' - Admin';
        }

        // Update Favicon
        if(this.settings.site_favicon) {
            let link = document.getElementById('site-favicon');
            // Kalau tag belum ada, buat baru (jaga-jaga)
            if (!link) {
                link = document.createElement('link');
                link.id = 'site-favicon';
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = this.settings.site_favicon;
        }
    },

    // SELECT LOGO/FAVICON
    openLogoSelector(target) {
        // Set target agar global script tahu kita mau ganti logo/favicon
        // Pastikan variabel 'mediaSelectorTarget' ada di scripts.ts
        if(typeof this.mediaSelectorTarget !== 'undefined') {
             this.mediaSelectorTarget = target;
             this.openMediaSelector();
        } else {
             // Fallback jika script belum update variable target
             console.error('Variable mediaSelectorTarget belum ada di scripts.ts');
        }
    },
`;