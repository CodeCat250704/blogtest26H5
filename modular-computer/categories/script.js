/* 
内容：分类归档引擎 (多标签、三栏布局、阅读器)
文件目录：JASPERBLOG/modular-computer/classification/script.js 
*/
(function() {
    const categorySwitchList = document.getElementById('category-switch-list');
    const articleSwitchList = document.getElementById('article-switch-list');
    const readerContainer = document.getElementById('embedded-reader-content');
    const tabBar = document.getElementById('global-tab-bar');

    let allPosts = [];
    let hljsLoaded = false;
    let openTabs = []; // 存储 { title, postData, isActive }

    const iconMap = {
        "前端开发": "fa-solid fa-code", "后端架构": "fa-solid fa-server",
        "UI/UX 设计": "fa-solid fa-pen-nib", "音乐分享": "fa-solid fa-headphones",
        "生活随笔": "fa-solid fa-mug-saucer", "科技前沿": "fa-solid fa-microchip"
    };

    // ==========================================================
    // 1. 基础空白与操作函数
    // ==========================================================
    const EMPTY_STATE_HTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
            <h1 style="font-size: 40px; color: rgba(255,255,255,0.8); font-weight: 300; margin-bottom: 10px;">阅读文章区域</h1>
            <p style="font-size: 15px; color: rgba(255,255,255,0.4);">请从左侧选择分类与文章以开始阅读</p>
        </div>
    `;

    window.resetReaderToEmpty = function() {
        readerContainer.innerHTML = EMPTY_STATE_HTML;
        readerContainer.style.position = 'static';
        readerContainer.style.top = '0';
        readerContainer.style.left = '0';
        readerContainer.style.width = '100%';
        readerContainer.style.height = '100%';
        document.querySelectorAll('.article-item').forEach(el => el.classList.remove('active'));
    };
    window.closeEmbeddedReader = window.resetReaderToEmpty;

    window.toggleReaderFullscreen = function() {
        const container = document.getElementById('reader-window-container');
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    };

    // ==========================================================
    // 2. 阅读器专用深色模式
    // ==========================================================
    const readerDarkCSS = document.createElement('style');
    readerDarkCSS.textContent = `
        .reader-dark-mode { background: #1a1a1a !important; border-color: #333 !important; }
        .reader-dark-mode .reader-title-bar { background: #2a2a2a !important; border-color: #444 !important; }
        .reader-dark-mode .reader-title-bar div { color: #eeeeee !important; }
        .reader-dark-mode .reader-body-bg { background: #1a1a1a !important; }
        .reader-dark-mode .reader-body-text { color: #dddddd !important; }
        .reader-dark-mode .reader-body-text h1, .reader-dark-mode .reader-body-text h2, .reader-dark-mode .reader-body-text h3 { color: #ffffff !important; }
        .reader-dark-mode pre { background: #0d0d0d !important; border: 1px solid #333 !important; }
        .reader-dark-mode code { color: #e6e6e6 !important; }
        .reader-dark-mode .hljs { background: #0d0d0d !important; color: #e6e6e6 !important; }
    `;
    if (!document.getElementById('reader-custom-css')) {
        readerDarkCSS.id = 'reader-custom-css';
        document.head.appendChild(readerDarkCSS);
    }

    window.toggleReaderDarkMode = function() {
        const box = document.getElementById('reader-window-box');
        if (box) box.classList.toggle('reader-dark-mode');
    };

    // ==========================================================
    // 3. 动态多标签页渲染引擎
    // ==========================================================
    function renderTabs() {
        tabBar.innerHTML = '';
        if (openTabs.length === 0) {
            const defaultTab = document.createElement('div');
            defaultTab.className = 'tab-item active';
            defaultTab.innerHTML = `<i class="fa-solid fa-folder-open"></i><span class="tab-title">分类归档</span>`;
            tabBar.appendChild(defaultTab);
        } else {
            openTabs.forEach((tab, index) => {
                const tabEl = document.createElement('div');
                tabEl.className = 'tab-item';
                if (tab.isActive) tabEl.classList.add('active');
                tabEl.innerHTML = `
                    <i class="fa-solid fa-file-lines"></i>
                    <span class="tab-title">${tab.title}</span>
                    <span class="tab-close" data-index="${index}">×</span>
                `;
                tabEl.addEventListener('click', function(e) {
                    if (e.target.classList.contains('tab-close')) return;
                    openTabs.forEach(t => t.isActive = false);
                    tab.isActive = true;
                    renderTabs();
                    openEmbeddedReader(tab.postData);
                });
                tabEl.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showTabContextMenu(e.clientX, e.clientY, index);
                });
                const closeBtn = tabEl.querySelector('.tab-close');
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeTab(index);
                });
                tabBar.appendChild(tabEl);
            });
        }
        const addBtn = document.createElement('div');
        addBtn.className = 'tab-add-btn';
        addBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
        tabBar.appendChild(addBtn);
        const spacer = document.createElement('div');
        spacer.style.cssText = 'flex:1;';
        tabBar.appendChild(spacer);
    }

    // ==========================================================
    // 4. 标签页右键菜单专用功能
    // ==========================================================
    function showTabContextMenu(x, y, index) {
        const existingMenu = document.getElementById('tab-context-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'tab-context-menu';
        menu.style.cssText = `
            position: fixed; top: ${y}px; left: ${x}px;
            width: 150px; padding: 6px 0;
            background: rgba(20, 20, 30, 0.9); backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
            color: #fff; font: 14px sans-serif;
            z-index: 99999; box-shadow: 0 8px 20px rgba(0,0,0,0.5);
        `;
        const items = [
            { label: '关闭此标签', action: 'close-single' },
            { label: '关闭其他标签', action: 'close-others' },
            { label: '关闭所有标签', action: 'close-all' }
        ];
        items.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.label;
            div.style.cssText = 'padding: 8px 16px; cursor: pointer; transition: 0.15s;';
            div.onmouseenter = function() { this.style.background = 'rgba(255,255,255,0.1)'; };
            div.onmouseleave = function() { this.style.background = 'transparent'; };
            div.onclick = function() {
                menu.remove();
                if (item.action === 'close-single') closeTab(index);
                else if (item.action === 'close-others') {
                    const currentTab = openTabs[index];
                    openTabs = [currentTab];
                    openTabs[0].isActive = true;
                    renderTabs();
                    openEmbeddedReader(openTabs[0].postData);
                } else if (item.action === 'close-all') {
                    openTabs = [];
                    renderTabs();
                    resetReaderToEmpty();
                }
            };
            menu.appendChild(div);
        });
        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('#tab-context-menu')) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    function closeTab(index) {
        openTabs.splice(index, 1);
        if (openTabs.length > 0) {
            const nextIndex = Math.min(index, openTabs.length - 1);
            openTabs[nextIndex].isActive = true;
            renderTabs();
            openEmbeddedReader(openTabs[nextIndex].postData);
        } else {
            renderTabs();
            resetReaderToEmpty();
        }
    }

    function addTab(post) {
        const existingTab = openTabs.find(t => t.postData.title === post.title);
        if (existingTab) {
            openTabs.forEach(t => t.isActive = false);
            existingTab.isActive = true;
            renderTabs();
            openEmbeddedReader(post);
            return;
        }
        openTabs.forEach(t => t.isActive = false);
        openTabs.push({ title: post.title, postData: post, isActive: true });
        renderTabs();
        openEmbeddedReader(post);
    }

    // ==========================================================
    // 5. 分类引擎 (适配 data-base)
    // ==========================================================
    async function loadCategoriesData() {
        try {
            const response = await fetch('/data-base/catalog.json');
            if (!response.ok) throw new Error(`读取失败: ${response.status}`);
            const data = await response.json();
            allPosts = data.posts || [];
            if (allPosts.length === 0) {
                categorySwitchList.innerHTML = `<div style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;">暂无文章数据</div>`;
                return;
            }
            renderTabs();
            renderCategorySwitcher(allPosts);
        } catch (error) {
            console.error('数据加载失败:', error);
            categorySwitchList.innerHTML = `<div style="color:#ffcccc; text-align:center; padding:20px;">未能读取到 /data-base/catalog.json</div>`;
        }
    }

    function renderCategorySwitcher(posts) {
        const categories = [...new Set(posts.map(p => p.category))];
        const defaultCat = categories.length > 0 ? categories[0] : null;
        categorySwitchList.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('div');
            btn.className = 'category-btn';
            const iconClass = iconMap[cat] || "fa-regular fa-folder";
            btn.innerHTML = `<i class="${iconClass}"></i> ${cat}`;
            if (cat === defaultCat) btn.classList.add('active');
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                renderArticleList(posts.filter(p => p.category === cat));
            });
            categorySwitchList.appendChild(btn);
        });
        if (defaultCat) {
            const firstBtn = categorySwitchList.querySelector('.category-btn');
            if (firstBtn) firstBtn.click();
        }
    }

    function renderArticleList(filteredPosts) {
        const sorted = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        articleSwitchList.innerHTML = '';
        if (sorted.length === 0) {
            articleSwitchList.innerHTML = `<div style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;">该分类暂无文章</div>`;
            return;
        }
        sorted.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = 'article-item';
            if (index === 0) item.classList.add('active');
            item.innerHTML = `<div class="title">${post.title}</div><div class="subtitle">${post.subtitle || '无副标题'}</div>`;
            item.addEventListener('click', () => {
                document.querySelectorAll('.article-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                addTab(post);
            });
            articleSwitchList.appendChild(item);
        });
    }

    // ==========================================================
    // 6. 阅读器
    // ==========================================================
    async function openEmbeddedReader(post) {
        readerContainer.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100%; width:100%; color: rgba(255,255,255,0.5);">
                <i class="fa-solid fa-circle-notch fa-spin" style="margin-right:10px;"></i> 加载中...
            </div>
        `;

        const mdUrl = post.mdPath;
        if (!mdUrl) {
            readerContainer.innerHTML = `<div style="padding:40px; color:#856404;">⚠️ 请配置 mdPath</div>`;
            return;
        }

        try {
            if (typeof marked === 'undefined') {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.bootcdn.net/ajax/libs/marked/4.3.0/marked.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            if (!hljsLoaded) {
                await new Promise((resolve, reject) => {
                    const hljsScript = document.createElement('script');
                    hljsScript.src = 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.8.0/highlight.min.js';
                    const codeFont = document.createElement('link');
                    codeFont.rel = 'stylesheet';
                    codeFont.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap';
                    document.head.appendChild(codeFont);
                    document.head.appendChild(hljsScript);
                    hljsScript.onload = resolve;
                    hljsScript.onerror = reject;
                });
                const hljsStyle = document.createElement('link');
                hljsStyle.rel = 'stylesheet';
                hljsStyle.href = 'https://cdn.bootcdn.net/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css';
                document.head.appendChild(hljsStyle);
                hljsLoaded = true;
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
                return `<img src="${href}" alt="${text}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0;">`;
            };

            let html = marked.parse(rawText, { renderer: renderer });
            html = html.replace(/<pre><code/g, '<pre><code class="hljs"');

            readerContainer.style.position = 'absolute';
            readerContainer.style.top = '0';
            readerContainer.style.left = '0';
            readerContainer.style.width = '100%';
            readerContainer.style.height = '100%';
            readerContainer.style.padding = '0';
            readerContainer.style.margin = '0';
            readerContainer.style.overflow = 'hidden';

            readerContainer.innerHTML = `
                <div id="reader-window-box" style="display: flex; flex-direction: column; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.95); border-radius: 16px; overflow: hidden; box-sizing: border-box;">
                    <div class="reader-title-bar" style="flex-shrink: 0; height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #eee; background: #f8f9fa;">
                        <div style="font-size: 14px; font-weight: bold; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${post.title}</div>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="toggleReaderFullscreen()" style="background: #28c840; border: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer;"></button>
                            <button onclick="toggleReaderDarkMode()" style="background: #888; border: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer; transition: 0.2s;"></button>
                            <button onclick="resetReaderToEmpty()" style="background: #ff5f57; border: none; width: 14px; height: 14px; border-radius: 50%; cursor: pointer;"></button>
                        </div>
                    </div>
                    <div class="reader-body-bg" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px 30px; background: #ffffff; font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace;">
                        <div class="reader-body-text" style="max-width: 100%; word-wrap: break-word; text-align: left; color: #222; line-height: 1.8; font-size: 16px;">
                            ${html}
                        </div>
                    </div>
                </div>
            `;

            setTimeout(() => {
                document.querySelectorAll('#reader-window-box pre code').forEach((block) => {
                    if (window.hljs) {
                        window.hljs.highlightElement(block);
                    }
                });
            }, 100);

        } catch (error) {
            console.error(error);
            readerContainer.innerHTML = `<div style="padding:40px; color:#ffcccc;">加载失败</div>`;
        }
    }

    // ==========================================================
    // 7. 启动
    // ==========================================================
    loadCategoriesData();
})();