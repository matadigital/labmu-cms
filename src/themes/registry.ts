// OTOMATIS DIGENERATE OLEH npm run sync-themes
import LabmuDefault from './labmu-default';
import LabmuNews from './labmu-news';
import LabmuPro from './labmu-pro';
import LabmuQuran from './labmu-quran';


// 1. Daftar Tema untuk API
export const availableThemes = [
  {
    "id": "labmu-default",
    "name": "labmu-default",
    "description": "No description"
  },
  {
    "id": "labmu-news",
    "name": "LabMu News Premium",
    "version": "1.0.0",
    "author": "LabMu Dev",
    "description": "Tema berita modern untuk ekosistem Muhammadiyah."
  },
  {
    "id": "labmu-pro",
    "name": "labmu-pro",
    "description": "No description"
  },
  {
    "id": "labmu-quran",
    "name": "labmu-quran",
    "description": "No description"
  }
];

// 2. Fungsi Render
export const getActiveTheme = (id: string) => {
  const themes: any = {
  'labmu-default': LabmuDefault,
  'labmu-news': LabmuNews,
  'labmu-pro': LabmuPro,
  'labmu-quran': LabmuQuran,
  };
  return themes[id] || themes['labmu-default'];
};
