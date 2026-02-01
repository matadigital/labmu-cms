export const quranLogic = `
    // STATE
    quranList: [],
    loadingQuran: false,
    activeSurat: null, 

    // ACTION: Ambil Data Surat
    async loadQuran() {
        if(this.quranList.length > 0) return; // Hemat kuota, kalau sudah ada jangan load lagi

        this.loadingQuran = true;
        try {
            let res = await fetch('/api/quran/surat');
            let json = await res.json();
            
            if(json.data) {
                this.quranList = json.data;
            }
        } catch(e) {
            console.error('Gagal load Quran', e);
            alert('Gagal mengambil data Quran. Cek koneksi internet.');
        } finally {
            this.loadingQuran = false;
        }
    },

    // ACTION: Mainkan Audio
    playAudio(url) {
        if(this.activeSurat) {
            this.activeSurat.pause();
        }
        this.activeSurat = new Audio(url);
        this.activeSurat.play();
    },
`;