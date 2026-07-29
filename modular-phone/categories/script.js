/* 手机端分类页逻辑：Tab 切换 + 卡片列表 + 悬浮阅读器 */
/* 文件目录：JASPERBLOG/modular-phone/categories/script.js */

(function() {
    "use strict";

    const tabContainer = document.getElementById('phone-category-tabs');
    const listContainer = document.getElementById('phone-article-list-container');
    const searchInput = document.getElementById('phone-search-input');
    const clearSearch = document.getElementById('phone-clear-search');
    
    // 阅读器元素
    const readerOverlay = document.getElementById('phone-reader-overlay');
    const readerTitle = document.getElementById('phone-reader-title');
    const readerBody = document.getElementById('phone-reader-body');
    const closeReaderBtn = document.getElementById('phone-close-reader');

    let allPosts = [];
    let currentCategory = '';

    // 映射图标 (与电脑端保持一致)
    const iconMap = {
        "前端开发": "fa-solid fa-code", "后端架构": "fa-solid fa-server",
        "UI/UX 设计": "fa-solid fa-pen-nib", "音乐分享": "fa-solid fa-headphones",
        "生活随笔": "fa-solid fa-mug-saucer", "科技前沿": "fa-solid fa-microchip"
    };

    // 1. 读取数据
    async function loadPhoneCategories() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            allPosts = data.posts || [];
            
            if (allPosts.length === 0) {
                listContainer.innerHTML = '<div class="phone-empty-state"><p>暂无文章数据</p></div>';
                return;
            }
            renderTabs(allPosts);
        } catch (e) {
            console.error("手机分类加载失败:", e);
            listContainer.innerHTML = '<div class="phone-empty-state"><p style="color:#ffcccc;">数据加载失败</p></div>';
        }
    }

    // 2. 渲染顶部滑动 Tabs
    function renderTabs(posts) {
        const categories = [...new Set(posts.map(p => p.category))];
        tabContainer.innerHTML = '';
        
        categories.forEach((cat, index) => {
            const tab = document.createElement('div');
            tab.className = 'phone-tab-item' + (index === 0 ? ' active' : '');
            const iconClass = iconMap[cat] || "fa-regular fa-folder";
            tab.innerHTML = `<i class="${iconClass}"></i> ${cat}`;
            
            tab.addEventListener('click', function() {
                document.querySelectorAll('.phone-tab-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                currentCategory = cat;
                renderArticleCards(posts.filter(p => p.category === cat));
            });
            tabContainer.appendChild(tab);
        });

        // 默认点击第一个
        const firstTab = tabContainer.querySelector('.phone-tab-item');
        if (firstTab) firstTab.click();
    }

    // 3. 渲染卡片列表
    function renderArticleCards(filteredPosts) {
        const sorted = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        listContainer.innerHTML = '';
        
        if (sorted.length === 0) {
            listContainer.innerHTML = '<div class="phone-empty-state"><p>该分类暂无内容</p></div>';
            return;
        }

        sorted.forEach(post => {
            const card = document.createElement('div');
            card.className = 'phone-article-card';
            card.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.subtitle || '点击阅读完整内容'}</p>
                <div class="card-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${post.date}</span>
                    <span><i class="fa-regular fa-clock"></i> 3 分钟</span>
                </div>
            `;
            card.addEventListener('click', () => {
                openPhoneReader(post);
            });
            listContainer.appendChild(card);
        });
    }

    // 4. 搜索功能
    searchInput.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        if (val.length > 0) clearSearch.style.display = 'block';
        else clearSearch.style.display = 'none';

        // 在当前选中的分类下进行二次搜索
        const currentPosts = allPosts.filter(p => p.category === currentCategory);
        const filtered = currentPosts.filter(p => p.title.toLowerCase().includes(val));
        renderArticleCards(filtered);
    });
    clearSearch.addEventListener('click', function() {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        // 重置显示当前分类
        const currentPosts = allPosts.filter(p => p.category === currentCategory);
        renderArticleCards(currentPosts);
    });

    // 5. 手机底部弹出阅读器
    async function openPhoneReader(post) {
        readerTitle.textContent = post.title;
        readerOverlay.classList.remove('hidden');
        readerBody.innerHTML = '<div class="loading-tip"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>';

        const mdUrl = post.mdPath;
        if (!mdUrl) {
            readerBody.innerHTML = '未配置文章路径';
            return;
        }

        try {
            // 动态加载 marked 库（如果未加载）
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

            // 处理图片相对路径
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
    // 点击背景遮罩也关闭
    readerOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });

    // 启动
    loadPhoneCategories();

})();