/* 
内容：平板端分类页核心逻辑
文件目录：JASPERBLOG/modular-pad/categories/script.js 
*/
(function() {
    const categorySwitchList = document.getElementById('category-switch-list');
    const articleSwitchList = document.getElementById('article-switch-list');
    const readerContainer = document.getElementById('embedded-reader-content');

    let allPosts = [];
    let hljsLoaded = false;

    const iconMap = {
        "前端开发": "fa-solid fa-code", "后端架构": "fa-solid fa-server",
        "UI/UX 设计": "fa-solid fa-pen-nib", "音乐分享": "fa-solid fa-headphones",
        "生活随笔": "fa-solid fa-mug-saucer", "科技前沿": "fa-solid fa-microchip"
    };

    // 1. 数据加载与分类渲染
    async function loadCategoriesData() {
        try {
            const response = await fetch('/data-base/catalog.json');
            if (!response.ok) throw new Error();
            const data = await response.json();
            allPosts = data.posts || [];
            renderCategories(allPosts);
        } catch (error) {
            categorySwitchList.innerHTML = `<div style="color:#ffcccc; padding:20px;">数据加载失败</div>`;
        }
    }

    function renderCategories(posts) {
        const categories = [...new Set(posts.map(p => p.category))];
        categorySwitchList.innerHTML = '';
        categories.forEach((cat, i) => {
            const btn = document.createElement('div');
            btn.className = 'list-item' + (i === 0 ? ' active' : '');
            const iconClass = iconMap[cat] || "fa-regular fa-folder";
            btn.innerHTML = `<i class="${iconClass}" style="width: 18px; text-align: center;"></i> ${cat}`;
            btn.onclick = function() {
                document.querySelectorAll('#category-switch-list .list-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                renderArticles(posts.filter(p => p.category === cat));
            };
            categorySwitchList.appendChild(btn);
        });
        categories.length > 0 && document.querySelector('#category-switch-list .list-item').click();
    }

    // 2. 文章列表渲染
    function renderArticles(filtered) {
        const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        articleSwitchList.innerHTML = '';
        if (sorted.length === 0) {
            articleSwitchList.innerHTML = `<div style="color:var(--text-muted); padding:10px; text-align:center;">该分类暂无文章</div>`;
            return;
        }
        sorted.forEach((post, i) => {
            const item = document.createElement('div');
            item.className = 'list-item' + (i === 0 ? ' active' : '');
            item.innerHTML = `<span>${post.title}</span>`;
            item.onclick = function() {
                document.querySelectorAll('#article-switch-list .list-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                openEmbeddedReader(post);
            };
            articleSwitchList.appendChild(item);
        });
        const firstItem = articleSwitchList.querySelector('.list-item');
        if (firstItem) firstItem.click();
    }

    // 3. 阅读器
    async function openEmbeddedReader(post) {
        if (!post || !post.mdPath) { readerContainer.innerHTML = '未找到文章路径'; return; }
        readerContainer.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>`;
        try {
            if (typeof marked === 'undefined') {
                await new Promise(resolve => { let s = document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js'; s.onload=resolve; document.head.appendChild(s); });
            }
            if (!hljsLoaded) {
                await new Promise(resolve => { let s = document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'; s.onload=resolve; document.head.appendChild(s); });
                let link = document.createElement('link'); link.rel='stylesheet'; link.href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'; document.head.appendChild(link);
                hljsLoaded = true;
            }
            const res = await fetch(post.mdPath);
            if (!res.ok) throw new Error('404');
            let md = await res.text();

            let baseUrl = '';
            const idx = post.mdPath.lastIndexOf('/');
            if (idx !== -1) baseUrl = post.mdPath.substring(0, idx + 1) + 'picture/';
            const renderer = new marked.Renderer();
            renderer.image = function(href, title, text) {
                if (!href.startsWith('http') && !href.startsWith('/')) href = baseUrl + href;
                return `<img src="${href}" alt="${text}" style="max-width:100%; border-radius:8px; margin:10px 0;">`;
            };
            let html = marked.parse(md, { renderer: renderer });
            readerContainer.innerHTML = html;

            setTimeout(() => {
                readerContainer.querySelectorAll('pre code').forEach(block => { if (window.hljs) hljs.highlightElement(block); });
            }, 100);
        } catch (e) {
            readerContainer.innerHTML = `<div style="color:#ffcccc; padding:20px;">加载失败</div>`;
        }
    }

    // 4. 自动打开定位逻辑
    let isAutoOpening = false;
    function tryAutoOpenReader() {
        if (isAutoOpening || !allPosts || allPosts.length === 0) return;
        const urlParams = new URLSearchParams(window.location.search);
        const targetTitle = urlParams.get('target');
        if (!targetTitle) return;

        const targetPost = allPosts.find(p => p.title === targetTitle);
        if (!targetPost) return;

        isAutoOpening = true;
        const catBtns = document.querySelectorAll('#category-switch-list .list-item');
        let targetCatBtn = null;
        catBtns.forEach(btn => { if (btn.textContent.trim() === targetPost.category) targetCatBtn = btn; });
        if (targetCatBtn) {
            targetCatBtn.click();
            setTimeout(() => {
                const artItems = document.querySelectorAll('#article-switch-list .list-item');
                let found = false;
                artItems.forEach(item => { if (item.textContent.trim() === targetPost.title) { item.click(); found = true; } });
                isAutoOpening = false;
            }, 500);
        } else {
            isAutoOpening = false;
        }
    }

    // 启动
    loadCategoriesData();
    setTimeout(tryAutoOpenReader, 600);
    setTimeout(tryAutoOpenReader, 1200);
})();