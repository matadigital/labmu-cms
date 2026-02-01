export const usersLogic = `
    isLoadingUsers: false,
    showUserModal: false,
    editingUserId: null, 
    // TAMBAHKAN EMAIL DI SINI
    userForm: { username:'', password:'', name:'', email:'', role:'editor' },
    usersList: [],

    async loadUsers() {
       this.isLoadingUsers = true;
       try {
          let res = await fetch('/api/users', { headers: { 'Authorization': this.token } });
          if(res.status === 401) return this.logout();
          let json = await res.json();
          if(json.success) {
              this.usersList = json.data;
          }
       } catch(e) { console.error(e); } 
       finally { this.isLoadingUsers = false; }
    },

    openAddUser() {
        this.editingUserId = null;
        // Reset form termasuk email
        this.userForm = { username:'', password:'', name:'', email:'', role:'editor' };
        this.showUserModal = true;
    },

    editUser(u) {
        this.editingUserId = u.id;
        this.userForm = { 
            username: u.username, 
            name: u.name, 
            email: u.email || '', // Load email
            role: u.role, 
            password: '' 
        };
        this.showUserModal = true;
    },

    async saveUser() {
       if(!this.userForm.username) return alert('Username wajib diisi');
       if(!this.editingUserId && !this.userForm.password) return alert('Password wajib untuk user baru');
       
       try {
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
             this.loadUsers(); 
             alert('Data User Tersimpan!');
          } else {
             alert('Gagal: ' + json.error);
          }
       } catch(e) { alert('Error network'); }
    },

    async deleteUser(id) {
       if(!confirm('Hapus user ini?')) return;
       try {
          await fetch('/api/users/' + id, { method: 'DELETE', headers: { 'Authorization': this.token } });
          this.loadUsers();
       } catch(e) { alert('Gagal hapus'); }
    },
`;