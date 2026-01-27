export const featuredImageLogic = `
    // State Modal
    showMediaSelector: false,

    // Fungsi Buka Modal
    openMediaSelector() {
       this.showMediaSelector = true;
       this.loadMedia(); // Pastikan list media termuat (reuse fungsi loadMedia yg sudah ada)
    },

    // Fungsi Pilih Gambar
    selectFeaturedImage(url) {
       this.form.featured_image = url;
       this.showMediaSelector = false;
    },
`;