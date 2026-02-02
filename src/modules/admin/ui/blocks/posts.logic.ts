export const postsLogic = `
    // --- STATE POSTS ---
    posts: [],
    uniqueCategories: [], 
    uniqueTags: [],

    // --- LOADER ---
    async loadPosts(){ 
        if(!this.token) return; 
        try { 
            let res = await fetch('/api/contents?type=post'); 
            let json = await res.json(); 
            this.posts = json.data; 
            
            // Logic hitung kategori & tags
            const cats = new Set(); const tags = new Set();
            if (this.posts) { 
                this.posts.forEach(p => { 
                    if (p.category) p.category.split(',').forEach(c => cats.add(c.trim())); 
                    if (p.tags) p.tags.split(',').forEach(t => tags.add(t.trim())); 
                }); 
            }
            this.uniqueCategories = Array.from(cats).filter(c => c).sort(); 
            this.uniqueTags = Array.from(tags).filter(t => t).sort();
        } catch(e) {} 
    }
`;