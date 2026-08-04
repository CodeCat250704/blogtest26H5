(function() {
    "use strict";
    const grid = document.getElementById('pad-collection-grid');
    const count = document.getElementById('pad-collection-count');
    async function loadData() {
        try {
            const res = await fetch('/data-base/catalog.json');
            if (!res.ok) throw new Error();
            const data = await res.json();
            let posts = data.posts || [];
            let favorites = posts.filter(p => p.collected === true);
            if (favorites.length === 0 && posts.length > 0) favorites = posts.slice(0, 6);
            renderCards(favorites);
        } catch (e) { console.error(e); }
    }
    function renderCards(posts) {
        if (posts.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);">暂无收藏</p>'; count.textContent = '0 篇'; return; }
        count.textContent = posts.length + ' 篇';
        grid.innerHTML = posts.map(p => `
            <div class="collection-card">
                <h4>${p.title}</h4>
                <p>${p.subtitle || '点击阅读全文'}</p>
                <div class="meta"><span>${p.date || ''}</span><i class="fa-regular fa-circle-check" style="color:var(--text-contrast);"></i></div>
            </div>
        `).join('');
    }
    loadData();
})();