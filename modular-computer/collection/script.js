(function() {
    "use strict";
    
    let allPosts = [];
    const grid = document.getElementById('computer-collection-grid');
    const readerOverlay = document.getElementById('pc-reader-overlay');
    const readerTitle = document.getElementById('pc-reader-title');
    const readerBody = document.getElementById('pc-reader-body');
    const closeBtn = document.getElementById('pc-close-reader');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (res.ok) {
                const data = await res.json();
                // 1. 真实场景：通过 collected 字段过滤
                allPosts = data.posts ? data.posts.filter(p => p.collected === true) : [];
                
                // 2. 如果返回空，使用演示假数据 (这样你立刻就能看到卡片)
                if (allPosts.length === 0) {
                    console.log("加载演示收藏数据");
                    allPosts = [
                        { title: "【演示】前端架构深度解析", subtitle: "如何设计一个可靠的微前端框架", date: "2026-07-30", mdPath: "/md/demo.md" },
                        { title: "【演示】毛玻璃 UI 设计指南", subtitle: "探索 Glassmorphism 在 B 端系统的应用", date: "2026-07-29", mdPath: "/md/demo.md" },
                        { title: "【演示】Vue 3 响应式原理", subtitle: "基于 Proxy 的深层响应式解密", date: "2026-07-28", mdPath: "/md/demo.md" }
                    ];
                }
                renderCards(allPosts);
            }
        } catch (e) { console.error(e); }
    }

    function renderCards(posts) {
        if (!posts.length) {
            grid.innerHTML = `<div class="empty-state-collection"><i class="fa-regular fa-star" style="font-size:48px;opacity:0.2;"></i><h2>暂无收藏</h2></div>`;
            return;
        }
        grid.innerHTML = posts.map(post => `
            <div class="collection-card" data-title="${post.title}" data-md="${post.mdPath}">
                <h3>${post.title}</h3>
                <p>${post.subtitle || '暂无描述'}</p>
                <div class="meta"><span><i class="fa-regular fa-calendar"></i> ${post.date}</span></div>
            </div>
        `).join('');

        grid.querySelectorAll('.collection-card').forEach(el => {
            el.onclick = function() {
                const title = this.dataset.title;
                const mdPath = this.dataset.md;
                openReader(title, mdPath);
            };
        });
    }

    async function openReader(title, mdPath) {
        readerTitle.textContent = title;
        readerOverlay.classList.remove('hidden');
        readerBody.innerHTML = '加载文章...';
        // 简单模拟加载 MD
        setTimeout(() => {
            readerBody.innerHTML = `<h1>${title}</h1><p>这是一篇测试文章的内容。在实际应用中，我会通过 <code>fetch('${mdPath}')</code> 解析 Markdown 并渲染到这里。</p>`;
        }, 500);
    }

    closeBtn.onclick = () => readerOverlay.classList.add('hidden');
    readerOverlay.onclick = (e) => { if(e.target === readerOverlay) readerOverlay.classList.add('hidden'); };

    loadData();
})();