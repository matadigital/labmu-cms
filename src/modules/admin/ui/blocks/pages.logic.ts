export const pagesLogic = `
    // --- STATE PAGES ---
    pages: [],

    // --- LOADER ---
    async loadPages(){
        if(!this.token) return;
        try {
            let res = await fetch('/api/contents?type=page');
            let json = await res.json();
            this.pages = json.data;
        } catch(e) {}
    }
`;