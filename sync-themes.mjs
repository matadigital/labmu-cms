import fs from 'fs';
import path from 'path';

const themesDir = './src/themes';
const registryFile = './src/themes/registry.ts';

// Baca semua folder di themes
const folders = fs.readdirSync(themesDir).filter(f => 
  fs.statSync(path.join(themesDir, f)).isDirectory() && f !== 'types'
);

let imports = "";
let mapping = "";
let metaList = [];

folders.forEach(f => {
  const jsonPath = path.join(themesDir, f, 'theme.json');
  // Default Meta jika theme.json tidak ada
  let meta = { id: f, name: f, description: "No description" };
  
  // Jika ada theme.json, pakai datanya
  if (fs.existsSync(jsonPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.warn(`⚠️ Warning: Invalid JSON in ${f}/theme.json`);
    }
  }

  // Generate Import Name (labmu-news -> LabMuNews)
  const className = f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  
  imports += `import ${className} from './${f}';\n`;
  mapping += `  '${f}': ${className},\n`;
  
  // Masukkan ke daftar meta
  metaList.push(meta);
});

// Template isi file registry.ts
const content = `// OTOMATIS DIGENERATE OLEH npm run sync-themes
${imports}

// 1. Daftar Tema untuk API
export const availableThemes = ${JSON.stringify(metaList, null, 2)};

// 2. Fungsi Render
export const getActiveTheme = (id: string) => {
  const themes: any = {
${mapping}  };
  return themes[id] || themes['labmu-default'];
};
`;

fs.writeFileSync(registryFile, content);
console.log(`✅ Sukses Mendaftarkan ${folders.length} Tema ke registry.ts!`);