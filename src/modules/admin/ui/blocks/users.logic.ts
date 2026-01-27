export const usersLogic = `
    // STATE
    isLoadingUsers: false,
    showUserModal: false,
    editingUserId: null, // null = Mode Tambah, angka = Mode Edit
    userForm: { username:'', password:'', name:'', role:'editor' },

    // 1. LOAD DATA USER
    async loadUsers() {
       this.isLoadingUsers = true;
       try {
          let res = await fetch('/api/users', { headers: { 'Authorization': this.token } });
          if(!res.ok) throw new Error('API Error');
          let json = await res.json();
          if(json.success) this.usersList = json.data;
       } catch(e) { console.error(e); } 
       finally { this.isLoadingUsers = false; }
    },

    // 2. BUKA MODAL ADD
    openAddUser() {
        this.editingUserId = null;
        this.userForm = { username:'', password:'', name:'', role:'editor' };
        this.showUserModal = true;
    },

    // 3. BUKA MODAL EDIT
    editUser(u) {
        this.editingUserId = u.id;
        // Copy data user ke form, password dikosongkan (biar gak keganti kalau gak diisi)
        this.userForm = { 
            username: u.username, 
            name: u.name, 
            role: u.role, 
            password: '' 
        };
        this.showUserModal = true;
    },

    // 4. SIMPAN (Bisa CREATE atau UPDATE)
    async saveUser() {
       if(!this.userForm.username) return alert('Username wajib diisi');
       // Kalau mode tambah, password wajib. Kalau edit, boleh kosong.
       if(!this.editingUserId && !this.userForm.password) return alert('Password wajib diisi untuk user baru');
       
       try {
          // Tentukan URL & Method (POST vs PUT)
          const url = this.editingUserId ? ('/api/users/' + this.editingUserId) : '/api/users';
          const method = this.editingUserId ? 'PUT' : 'POST';

          let res = await fetch(url, {
             method: method,
             headers: { 'Content-Type':'application/json', 'Authorization': this.token },
             body: JSON.stringify(this.userForm)
          });

          let json = await res.json();
          if(json.success) {
             this.showUserModal = false;
             this.loadUsers(); // Refresh list
             alert(this.editingUserId ? 'User berhasil diupdate!' : 'User berhasil dibuat!');
          } else {
             alert('Gagal: ' + json.error);
          }
       } catch(e) { alert('Error network'); }
    },

    // 5. DELETE USER
    async deleteUser(id) {
       if(!confirm('Hapus user ini?')) return;
       try {
          await fetch('/api/users/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
          this.loadUsers();
       } catch(e) { alert('Gagal hapus'); }
    },
`;