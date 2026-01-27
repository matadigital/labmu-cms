export const usersPage = `
<div x-show="view==='users'">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <h2>User Manager</h2>
    <button @click="openAddUser()" class="btn"><i class="fas fa-plus"></i> Add User</button>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
     <table class="wp-table">
        <thead style="background:#f8f9fa;">
           <tr>
              <th style="padding:12px;">Username</th>
              <th>Name</th>
              <th>Role</th>
              <th style="text-align:center">Action</th>
           </tr>
        </thead>
        <tbody>
           <template x-for="u in usersList">
              <tr style="border-bottom:1px solid #eee;">
                 <td style="font-weight:bold; color:var(--wp-blue); padding:12px;" x-text="u.username"></td>
                 <td x-text="u.name"></td>
                 <td>
                    <span class="badge" x-text="u.role" 
                          :style="u.role==='admin' ? 'background:#333; color:#fff;' : (u.role==='editor' ? 'background:#e0f2f1; color:#00695c;' : 'background:#eee; color:#666;')">
                    </span>
                 </td>
                 <td style="text-align:center;">
                    <button @click="editUser(u)" class="btn-icon" style="color:orange;" title="Edit">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button @click="deleteUser(u.id)" class="btn-icon" style="color:red;" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                 </td>
              </tr>
           </template>
           
           <tr x-show="usersList.length === 0">
              <td colspan="4" style="text-align:center; padding:30px; color:#999;">
                 <span x-show="isLoadingUsers"><i class="fas fa-spinner fa-spin"></i> Memuat data...</span>
                 <span x-show="!isLoadingUsers">Belum ada user lain.</span>
              </td>
           </tr>
        </tbody>
     </table>
  </div>

  <div x-show="showUserModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:999;" x-transition>
     <div class="card" style="width:100%; max-width:400px; padding:25px; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3 style="margin:0;" x-text="editingUserId ? 'Edit User' : 'Add New User'"></h3>
            <button @click="showUserModal=false" style="border:none; background:none; cursor:pointer; font-size:20px;">&times;</button>
        </div>

        <label style="font-weight:600; font-size:12px; color:#666;">Username</label>
        <input x-model="userForm.username" class="input" placeholder="Username unik">
        
        <label style="font-weight:600; font-size:12px; color:#666;">Full Name</label>
        <input x-model="userForm.name" class="input" placeholder="Nama Lengkap">
        
        <label style="font-weight:600; font-size:12px; color:#666;">Password</label>
        <input x-model="userForm.password" type="password" class="input" placeholder="(Biarkan kosong jika tidak ingin ganti)">
        <small x-show="!editingUserId" style="color:red; display:block; margin-top:-8px; margin-bottom:10px; font-size:10px;">* Wajib diisi untuk user baru</small>
        
        <label style="font-weight:600; font-size:12px; color:#666;">Role</label>
        <select x-model="userForm.role" class="input">
           <option value="admin">Administrator</option>
           <option value="editor">Editor</option>
           <option value="author">Author (Penulis)</option>
        </select>

        <div style="display:flex; gap:10px; margin-top:20px;">
           <button @click="saveUser()" class="btn" style="flex:1;">
              <i class="fas fa-save"></i> <span x-text="editingUserId ? 'Update User' : 'Create User'"></span>
           </button>
           <button @click="showUserModal=false" class="btn" style="flex:1; background:#f0f0f1; border-color:#ccc; color:#333;">Cancel</button>
        </div>
     </div>
  </div>
</div>
`;