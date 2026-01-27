import { adminStyles } from './blocks/styles'
import { sidebarBlock } from './blocks/sidebar'
import { topbarBlock } from './blocks/topbar'
import { pagesBlock } from './blocks/pages'  // <--- Cukup import ini saja
import { scriptBlock } from './blocks/scripts'

export const renderAdmin = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LabMu CMS Admin</title>
  
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js"></script>
  
  <style>${adminStyles}</style>
</head>
<body x-data="cms()" x-init="init()">

  <template x-if="!token">
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; background:#f0f2f5;">
      <div class="card" style="width:100%; max-width:360px; padding:40px; text-align:center;">
        <h2 style="margin-top:0; color:#333;">LabMu Login</h2>
        <div style="text-align:left; margin-top:20px;">
            <label style="font-size:12px; font-weight:bold;">Username</label>
            <input x-model="loginForm.username" type="text" class="input">
            <label style="font-size:12px; font-weight:bold;">Password</label>
            <input x-model="loginForm.password" type="password" class="input" @keyup.enter="doLogin()">
        </div>
        <button @click="doLogin()" class="btn" style="width:100%; margin-top:10px;">Masuk</button>
      </div>
    </div>
  </template>

  <div x-show="token" class="app-layout" 
       :style="sidebarOpen ? 'grid-template-columns: 160px 1fr' : 'grid-template-columns: 50px 1fr'"
       style="display:none;" x-show.important="token">
    
    ${sidebarBlock}

    <div style="display:flex; flex-direction:column; width:100%; overflow:hidden;">
      ${topbarBlock}
      <main class="main-content">
        ${pagesBlock}  </main>
    </div>
  </div>

  <script>${scriptBlock}</script>
</body>
</html>
`