// Import blok UI dari folder blocks
import { adminStyles } from './blocks/styles';
import { sidebarBlock } from './blocks/sidebar';
import { topbarBlock } from './blocks/topbar'; 
import { pagesBlock } from './blocks/pages';
import { scriptBlock } from './blocks/scripts';

export const renderAdmin = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LabMu CMS Admin</title>
  
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
  
  <style>
    ${adminStyles}
  </style>
</head>
<body x-data="cms()" x-init="init()">

  <template x-if="!token">
    <div class="login-page">
      <div class="login-box">
        <h2 style="margin-top:0; color:#333;">LabMu Login</h2>
        <div style="text-align:left; margin-top:20px;">
            <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:5px;">Username</label>
            <input x-model="loginForm.username" type="text" class="input" placeholder="admin">
            
            <label style="font-size:12px; font-weight:bold; display:block; margin-top:10px; margin-bottom:5px;">Password</label>
            <input x-model="loginForm.password" type="password" class="input" placeholder="password" @keyup.enter="doLogin()">
        </div>
        <button @click="doLogin()" class="btn" style="width:100%; margin-top:20px;">
            <span x-show="!isLoggingIn">Masuk</span>
            <span x-show="isLoggingIn"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
        </button>
      </div>
    </div>
  </template>

  <div x-show="token" class="app-layout" 
       :style="sidebarOpen ? 'grid-template-columns: 240px 1fr' : 'grid-template-columns: 60px 1fr'"
       style="display:none;" x-show.important="token">
    
    ${sidebarBlock}

    <div style="display:flex; flex-direction:column; width:100%; overflow:hidden; position:relative;">
      
      ${topbarBlock}

      <main class="main-content">
        ${pagesBlock} 
      </main>
    </div>

  </div>

  <script>
    ${scriptBlock}
  </script>
</body>
</html>
`;