-- 1. Tabel Surah
CREATE TABLE IF NOT EXISTS surah (
  id INTEGER PRIMARY KEY,
  nomor INTEGER NOT NULL,
  nama TEXT,
  nama_latin TEXT,
  jumlah_ayat INTEGER,
  tempat_turun TEXT,
  arti TEXT,
  audio_full TEXT
);

-- 2. Tabel Ayat
CREATE TABLE IF NOT EXISTS ayah (
  id INTEGER PRIMARY KEY,
  surah_id INTEGER,
  nomor_ayat INTEGER,
  teks_arab TEXT,
  teks_latin TEXT,
  teks_indonesia TEXT,
  teks_inggris TEXT,
  audio_options TEXT,
  FOREIGN KEY(surah_id) REFERENCES surah(id)
);
CREATE INDEX IF NOT EXISTS idx_ayah_surah ON ayah(surah_id);

-- 3. Tabel Tema
CREATE TABLE IF NOT EXISTS tema (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  judul TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT
);

-- 4. Tabel Pivot Tema-Ayat
CREATE TABLE IF NOT EXISTS tema_ayat (
  tema_id INTEGER,
  ayah_id INTEGER,
  PRIMARY KEY (tema_id, ayah_id),
  FOREIGN KEY(tema_id) REFERENCES tema(id),
  FOREIGN KEY(ayah_id) REFERENCES ayah(id)
);

-- 5. Seeding Data Tema (Default)
INSERT OR IGNORE INTO tema (judul, slug, icon) VALUES 
('Doa', 'doa', '🤲'),
('Shalat', 'shalat', '🕌'),
('Zakat', 'zakat', '💰'),
('Puasa', 'puasa', '🌙'),
('Haji', 'haji', '🕋'),
('Sabar', 'sabar', '❤️'),
('Wanita', 'wanita', '🧕'),
('Ekonomi', 'ekonomi', '📊');