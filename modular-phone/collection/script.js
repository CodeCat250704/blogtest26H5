/* 手机端收藏页逻辑：双列网格 + 底部阅读 */
(function() {
    "use strict";

    const grid = document.getElementById('phone-collection-grid');
    const count = document.getElementById('phone-collection-count');
    const reader = document.getElementById('phone-collection-reader');
    const rTitle = document.getElementById('phone-reader-title');
    const rBody = document.getElementById('phone-reader-body');
    const closeBtn = document.getElementById('phone-close-reader');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            
            let posts = data.posts || [];
            // 1. 尝试查找数据库中被标记为 true 的收藏
            let favorites = posts.filter(p => p.collected === true);

            // 2. 如果没有任何标记，自动截取前 4 篇作为演示收藏
            if (favorites.length === 0 && posts.length > 0) {
                favorites = posts.slice(0, 4);
            }

            renderCards(favorites);
        } catch (e) {
            console.error("手机收藏加载失败:", e);
        }
    }

    function renderCards(posts) {
        if (posts.length === 0) {
            grid.innerHTML = `<div class="phone-empty-state"><i class="fa-regular fa-star" style="font-size:48px;opacity:0.2;"></i><p>暂无收藏</p></div>`;
            count.textContent = '0 篇';
            return;
        }

        count.textContent = posts.length + ' 篇';
        grid.innerHTML = posts.map(post => `
            <div class="phone-card-item" data-title="${post.title}" data-md="${post.mdPath || '#'}">
                <h4>${post.title}</h4>
                <p>${post.subtitle || '点击阅读全文'}</p>
                <div class="meta">${post.date || ''}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.phone-card-item').forEach(el => {
            el.addEventListener('click', function() {
                openReader(this.dataset.title, this.dataset.md);
            });
        });
    }

    async function openReader(title, mdPath) {
        rTitle.textContent = title;
        reader.classList.remove('hidden');
        rBody.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4);"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>';

        if (mdPath === '#') {
            rBody.innerHTML = '<p>暂无文章内容。</p>';
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
            rBody.innerHTML = html;
        } catch (e) {
            rBody.innerHTML = '<p style="color:#ffcccc;">内容加载失败</p>';
        }
    }

    closeBtn.addEventListener('click', () => reader.classList.add('hidden'));
    // 拖动边缘也可关闭
    reader.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('sheet-drag-handle')) {
            this.classList.add('hidden');
        }
    });

    loadData();
})();