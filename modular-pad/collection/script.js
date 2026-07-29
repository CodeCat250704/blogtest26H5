/* 平板端收藏页逻辑：三列卡片 + 右侧滑出阅读 */
(function() {
    "use strict";

    const grid = document.getElementById('pad-collection-grid');
    const count = document.getElementById('pad-collection-count');
    const drawer = document.getElementById('pad-collection-reader');
    const dTitle = document.getElementById('pad-reader-title');
    const dBody = document.getElementById('pad-reader-body');
    const closeBtn = document.getElementById('pad-close-reader');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            
            let posts = data.posts || [];
            let favorites = posts.filter(p => p.collected === true);
            if (favorites.length === 0 && posts.length > 0) {
                favorites = posts.slice(0, 6); // 平板上多展示一些
            }
            renderCards(favorites);
        } catch (e) {
            console.error("平板收藏加载失败:", e);
        }
    }

    function renderCards(posts) {
        if (posts.length === 0) {
            grid.innerHTML = `<div class="pad-empty-state"><i class="fa-regular fa-star" style="font-size:48px;opacity:0.2;"></i><p>暂无收藏</p></div>`;
            count.textContent = '0 篇';
            return;
        }

        count.textContent = posts.length + ' 篇';
        grid.innerHTML = posts.map(post => `
            <div class="pad-card-item" data-title="${post.title}" data-md="${post.mdPath || '#'}">
                <h4>${post.title}</h4>
                <p>${post.subtitle || '点击进入阅读'}</p>
                <div class="meta">${post.date || ''}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.pad-card-item').forEach(el => {
            el.addEventListener('click', function() {
                openReader(this.dataset.title, this.dataset.md);
            });
        });
    }

    async function openReader(title, mdPath) {
        dTitle.textContent = title;
        drawer.classList.remove('hidden');
        dBody.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4);"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>';

        if (mdPath === '#') {
            dBody.innerHTML = '<p>暂无文章内容。</p>';
            return;
        }

        try {
            if (typeof marked === 'undefined') {
                await new Promise(resolve => {
                    const s = document.createElement('script');
                    s.src = 'https://cdn.bootcdn.net/ajax/libs/marked/4.3.0/marked.min.js';
                    s.onload = resolve;
                    document.head.appendChild(s);
                });
            }
            const res = await fetch(mdPath);
            if (!res.ok) throw new Error('404');
            const html = marked.parse(await res.text());
            dBody.innerHTML = html;
        } catch (e) {
            dBody.innerHTML = '<p style="color:#ffcccc;">内容加载失败</p>';
        }
    }

    closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));

    loadData();
})();