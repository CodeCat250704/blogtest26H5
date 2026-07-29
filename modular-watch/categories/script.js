/* 手表端分类页逻辑：胶囊标签 + 单列列表 + 全屏阅读 */
/* 文件目录：JASPERBLOG/modular-watch/categories/script.js */

(function() {
    "use strict";

    const tabContainer = document.getElementById('watch-category-tabs');
    const listContainer = document.getElementById('watch-article-list-container');
    
    // 阅读器元素
    const readerOverlay = document.getElementById('watch-reader-overlay');
    const readerTitle = document.getElementById('watch-reader-title');
    const readerBody = document.getElementById('watch-reader-body');
    const closeReaderBtn = document.getElementById('watch-close-reader');

    let allPosts = [];
    let currentCategory = '';

    // 1. 读取数据 (使用正确的 ../../../ 相对路径)
    async function loadWatchCategories() {
        try {
            const res = await fetch('../../../data-base/catalog.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            allPosts = data.posts || [];
            
            if (allPosts.length === 0) {
                listContainer.innerHTML = '<div class="watch-empty-state"><p>暂无数据</p></div>';
                return;
            }
            renderTabs(allPosts);
        } catch (e) {
            console.error("手表分类加载失败:", e);
            listContainer.innerHTML = '<div class="watch-empty-state"><p style="color:#ffcccc;">加载失败</p></div>';
        }
    }

    // 2. 渲染顶部胶囊 Tabs
    function renderTabs(posts) {
        const categories = [...new Set(posts.map(p => p.category))];
        tabContainer.innerHTML = '';
        
        categories.forEach((cat, index) => {
            const tab = document.createElement('div');
            tab.className = 'watch-tab-item' + (index === 0 ? ' active' : '');
            tab.textContent = cat;
            
            tab.addEventListener('click', function() {
                document.querySelectorAll('.watch-tab-item').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                currentCategory = cat;
                renderList(posts.filter(p => p.category === cat));
                // 切换时关闭阅读器
                readerOverlay.classList.add('hidden');
            });
            tabContainer.appendChild(tab);
        });

        // 默认点击第一个
        const firstTab = tabContainer.querySelector('.watch-tab-item');
        if (firstTab) firstTab.click();
    }

    // 3. 渲染单列极简列表
    function renderList(filteredPosts) {
        const sorted = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        listContainer.innerHTML = '';
        
        if (sorted.length === 0) {
            listContainer.innerHTML = '<div class="watch-empty-state"><p>无内容</p></div>';
            return;
        }

        sorted.forEach(post => {
            const item = document.createElement('div');
            item.className = 'watch-article-item';
            item.innerHTML = `
                <span class="item-title">${post.title}</span>
                <i class="fa-solid fa-chevron-right item-arrow"></i>
            `;
            item.addEventListener('click', () => {
                openWatchReader(post);
            });
            listContainer.appendChild(item);
        });
    }

    // 4. 手表全屏阅读器
    async function openWatchReader(post) {
        readerTitle.textContent = post.title;
        readerOverlay.classList.remove('hidden');
        readerBody.innerHTML = '<div class="loading-tip"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>';

        const mdUrl = post.mdPath;
        if (!mdUrl) {
            readerBody.innerHTML = '未配置路径';
            return;
        }

        try {
            // 动态加载 marked
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

            // 处理图片路径（手表的图片通常需要等比缩放）
            let baseUrl = '';
            const idx = mdUrl.lastIndexOf('/');
            if (idx !== -1) baseUrl = mdUrl.substring(0, idx + 1) + 'picture/';
            const renderer = new marked.Renderer();
            renderer.image = function(href, title, text) {
                if (!href.startsWith('http') && !href.startsWith('/')) {
                    href = baseUrl + href;
                }
                return `<img src="${href}" alt="${text}" style="max-width:100%; border-radius:6px; margin:8px 0;">`;
            };

            const html = marked.parse(rawText, { renderer: renderer });
            readerBody.innerHTML = html;

        } catch (e) {
            readerBody.innerHTML = `<div style="color:#ffcccc; text-align:center;">文章加载失败</div>`;
        }
    }

    // 5. 关闭阅读器
    closeReaderBtn.addEventListener('click', () => {
        readerOverlay.classList.add('hidden');
    });
    // 点击蒙层背景也可以关闭
    readerOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });

    // 启动
    loadWatchCategories();

})();