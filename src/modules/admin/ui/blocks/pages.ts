import { dashboardPage } from './dashboard.page';
import { postsPage } from './posts.page';
import { editorPage } from './editor.page';
import { mediaPage } from './media.page';
import { usersPage } from './users.page';
import { themesPage } from './themes.page';
import { quranPage } from './quran.page';
import { settingsPage } from './settings.page'; // Pastikan file ini ada

export const pagesBlock = `
    ${dashboardPage}
    ${postsPage}
    ${editorPage} 
    ${mediaPage}
    ${usersPage}
    ${themesPage}
    ${quranPage}
    ${settingsPage}  <div x-show="view==='menus'">
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
             <h2 style="margin:0;">Menu Manager</h2>
        </div>
        <div class="card" style="padding:40px; text-align:center; color:#999;">
             <i class="fas fa-tools fa-3x" style="margin-bottom:15px; opacity:0.3;"></i>
             <p>Fitur Drag & Drop Menu sedang dalam pengembangan.</p>
        </div>
    </div>
`;