import { Hono } from 'hono';
import { Bindings } from '../types';

// Import Addon Disini
import wpRouter from './wp-importer/wp.router';
// import initSEO from './nusa-seo'; // (Nanti diaktifkan)

// Kita ubah agar menerima parameter 'app'
export default function registerAddons(app: Hono<{ Bindings: Bindings }>) {
  console.log('🔌 Nusa CMS: Addons system starting...');

  // 1. DAFTARKAN WP IMPORTER
  // Ini membuat route '/api/import/wp' otomatis aktif
  app.route('/api/import/wp', wpRouter);
  console.log('✅ Addon Loaded: WP Importer');

  // 2. DAFTARKAN ADDON LAIN (CONTOH)
  // if (initSEO) {
  //    initSEO();
  //    console.log('✅ Addon Loaded: Nusa SEO');
  // }
  
  console.log('🚀 Semua Addons Siap!');
}