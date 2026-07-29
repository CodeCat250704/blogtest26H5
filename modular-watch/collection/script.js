(function() {
    "use strict";
    const list = document.getElementById('watch-collection-grid');
    const count = document.getElementById('watch-collection-count');
    const overlay = document.getElementById('watch-reader-overlay');
    const rTitle = document.getElementById('watch-reader-title');
    const rBody = document.getElementById('watch-reader-body');
    const closeBtn = document.getElementById('watch-close-reader');

    async function load() {
        const res = await fetch('../../../data-base/catalog.json');
        let items = [];
        if (res.ok) {
            const data = await res.json();
            items = data.posts ? data.posts.filter(p => p.collected === true) : [];
        }
        if (items.length === 0) {
            items = [
                { title: "手表演示收藏 1", date: "07-30", mdPath: "demo" },
                { title: "手表演示收藏 2", date: "07-29", mdPath: "demo" }
            ];
        }
        render(items);
    }

    function render(items) {
        count.textContent = items.length;
        list.innerHTML = items.map(item => `
            <div class="watch-collection-item" data-title="${item.title}">
                <span class="title">${item.title}</span>
                <span class="date">${item.date}</span>
            </div>
        `).join('');
        
        list.querySelectorAll('.watch-collection-item').forEach(el => {
            el.onclick = () => {
                rTitle.textContent = el.dataset.title;
                overlay.classList.remove('hidden');
                rBody.innerHTML = `<h2>${el.dataset.title}</h2><p>这是手表端的收藏阅读演示内容，非常简短高效。</p>`;
            };
        });
    }

    closeBtn.onclick = () => overlay.classList.add('hidden');
    overlay.onclick = (e) => { if(e.target === overlay) overlay.classList.add('hidden'); };

    load();
})();