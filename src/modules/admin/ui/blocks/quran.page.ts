export const quranPage = `
<div x-show="view==='quran'">
  
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
     <div style="display:flex; align-items:center; gap:10px;">
        <h2 style="margin:0;">Al-Quran Digital</h2>
        <span x-show="loadingQuran" style="font-size:12px; color:#666;"><i class="fas fa-spinner fa-spin"></i> Memuat...</span>
     </div>
     <button x-show="activeSurat" @click="closeSurat()" class="btn" style="background:#666; border-color:#666;">
        <i class="fas fa-arrow-left"></i> Kembali ke Daftar
     </button>
  </div>

  <div x-show="!activeSurat" class="card" style="padding:0;">
     <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
        <template x-for="s in quranList">
           <div @click="openSurat(s.nomor)" 
                style="padding:15px; border-bottom:1px solid #eee; border-right:1px solid #eee; cursor:pointer; transition:0.2s; display:flex; align-items:center; gap:10px;"
                onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='#fff'">
              
              <div style="background:#f0f0f1; width:35px; height:35px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; color:#555;" x-text="s.nomor"></div>
              <div>
                 <div style="font-weight:bold; color:var(--wp-blue);" x-text="s.namaLatin"></div>
                 <div style="font-size:11px; color:#888;" x-text="s.arti + ' • ' + s.jumlahAyat + ' ayat'"></div>
              </div>
              <div style="margin-left:auto; font-family:'Amiri', serif; font-size:16px;" x-text="s.nama"></div>

           </div>
        </template>
     </div>
     <div x-show="quranList.length===0 && !loadingQuran" style="padding:30px; text-align:center;">Klik menu Quran untuk memuat data.</div>
  </div>

  <template x-if="activeSurat">
     <div class="card" style="max-width:800px; margin:0 auto;">
        
        <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #eee; margin-bottom:20px;">
           <h1 x-text="activeSurat.namaLatin" style="margin:0; color:var(--wp-blue);"></h1>
           <p x-text="activeSurat.arti" style="color:#666; margin:5px 0;"></p>
           
           <div x-show="activeSurat.nomor != 9" style="font-family:'Amiri', serif; font-size:24px; margin-top:20px;">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
           </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:30px;">
           <template x-for="ayat in activeSurat.ayat">
              <div style="border-bottom:1px dashed #eee; padding-bottom:20px;">
                 
                 <div style="text-align:right; font-family:'Amiri', serif; font-size:28px; line-height:2.2; margin-bottom:15px; direction:rtl;" x-text="ayat.teksArab"></div>
                 
                 <div style="font-size:14px; color:#555;">
                    <span style="display:inline-block; width:25px; height:25px; background:var(--wp-blue); color:#fff; text-align:center; line-height:25px; border-radius:50%; font-size:11px; margin-right:8px;" x-text="ayat.nomorAyat"></span>
                    <span x-text="ayat.teksIndonesia"></span>
                 </div>
              
              </div>
           </template>
        </div>

     </div>
  </template>

</div>
`;