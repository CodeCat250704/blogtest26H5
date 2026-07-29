/* 平板分类页逻辑：Tab切换 + 双列卡片 + 右侧展开阅读 */
/* 文件目录：JASPERBLOG/modular-pad/categories/script.js */

(function() {
    "use strict";

    const tabContainer = document.getElementById('pad-category-tabs');
    const gridContainer = document.getElementById('pad-article-grid-container');
    const searchInput = document.getElementById('pad-search-input');
    
    // 阅读器元素
    const readerOverlay = document.getElementById('pad-reader-overlay');
    const readerTitle = document.getElementById('pad-reader-title');
    const readerBody = document.getElementById('pad-reader-body');
    const closeReaderBtn = document.getElementById('pad-close-reader');

    let allPosts = [];
    let currentCategory = '';

    const iconMap = {
        "前端开发": "fa-solid fa-code", "后端架构": "fa-solid fa-server",
        "UI/UX 设计": "fa-solid fa-pen-nib", "音乐分享": "fa-solid fa-headphones",
        "生活随笔": "fa-solid fa-mug-saucer", "科技前沿": "fa-solid fa-microchip"
    };

    // 1. 读取数据
    async function loadPadCategories() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            allPosts = data.posts || [];
            if (allPosts.length === 0) {
                gridContainer.innerHTML = '<div class="pad-empty-state"><p>暂无文章数据</p></div>';
                return;
            }
            renderTabs(allPosts);
        } catch (e) {
            console.error("平板分类加载失败:", e);
            gridContainer.innerHTML = '<div class="pad-empty-state"><p style="color:#ffcccc;">数据加载失败</p></div>';
        }
    }

    // 2. 渲染左侧 Tabs
    function renderTabs(posts) {
        const categories = [...new Set(posts.map(p => p.category))];
        tabContainer.innerHTML = '';
        
        categories.forEach((cat, index) => {
            const tab = document.createElement('div');
            tab.className = 'pad-tab-item' + (index === 0 ? ' active' : '');
            const iconClass = iconMap[cat] || "fa-regular fa-folder";
            tab.innerHTML = `<i class="${iconClass}"></i> ${cat}`;
            
            tab.addEventListener('click', function() {
                document.querySelectorAll('.pad-tab-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                currentCategory = cat;
                renderCards(posts.filter(p => p.category === cat));
                // 切换分类时自动关闭阅读器
                readerOverlay.classList.add('hidden');
            });
            tabContainer.appendChild(tab);
        });
        const firstTab = tabContainer.querySelector('.pad-tab-item');
        if (firstTab) firstTab.click();
    }

    // 3. 渲染右侧双列卡片
    function renderCards(filteredPosts) {
        const sorted = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        gridContainer.innerHTML = '';
        
        if (sorted.length === 0) {
            gridContainer.innerHTML = '<div class="pad-empty-state"><p>该分类暂无内容</p></div>';
            return;
        }

        sorted.forEach(post => {
            const card = document.createElement('div');
            card.className = 'pad-article-card';
            card.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.subtitle || '点击阅读完整内容'}</p>
                <div style="margin-top:8px; font-size:12px; color:rgba(255,255,255,0.4);">${post.date}</div>
            `;
            card.addEventListener('click', () => {
                openPadReader(post);
            });
            gridContainer.appendChild(card);
        });
    }

    // 4. 搜索功能
    searchInput.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        const currentPosts = allPosts.filter(p => p.category === currentCategory);
        const filtered = currentPosts.filter(p => p.title.toLowerCase().includes(val));
        renderCards(filtered);
    });

    // 5. 右侧打开阅读器
    async function openPadReader(post) {
        readerTitle.textContent = post.title;
        readerOverlay.classList.remove('hidden');
        readerBody.innerHTML = '<div class="loading-tip"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>';

        const mdUrl = post.mdPath;
        if (!mdUrl) {
            readerBody.innerHTML = '未配置文章路径';
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

            const res = await fetch(mdUrl);
            if (!res.ok) throw new Error('404');
            const rawText = await res.text();

            let baseUrl = '';
            const idx = mdUrl.lastIndexOf('/');
            if (idx !== -1) baseUrl = mdUrl.substring(0, idx + 1) + 'picture/';
            const renderer = new marked.Renderer();
            renderer.image = function(href, title, text) {
                if (!href.startsWith('http') && !href.startsWith('/')) {
                    href = baseUrl + href;
                }
                return `<img src="${href}" alt="${text}" style="max-width:100%; border-radius:8px; margin:10px 0;">`;
            };

            const html = marked.parse(rawText, { renderer: renderer });
            readerBody.innerHTML = html;

        } catch (e) {
            readerBody.innerHTML = `<div style="color:#ffcccc; text-align:center;">文章加载失败</div>`;
        }
    }

    // 6. 关闭阅读器
    closeReaderBtn.addEventListener('click', () => {
        readerOverlay.classList.add('hidden');
    });

    // 启动
    loadPadCategories();

})();