/* 
内容：基于 HTML 核心引入的右键菜单逻辑 (加入容错兜底机制)
文件目录：JASPERBLOG/overall-situation/right-click/script.js
*/
(function() {
    "use strict";

    // 1. 尝试查找页面中已有的容器，如果没找到，立刻动态创建一个
    var contextMenu = document.getElementById('custom-context-menu');
    if (!contextMenu) {
        // 创建兜底容器
        contextMenu = document.createElement('div');
        contextMenu.id = 'custom-context-menu';
        document.body.appendChild(contextMenu);
        console.warn("⚠️ 未发现预设的 HTML 右键菜单，已由脚本自动创建。");
    }

    var menuList = contextMenu.querySelector('.context-menu-list');
    if (!menuList) {
        // 如果容器里没有列表，也动态生成一个
        menuList = document.createElement('ul');
        menuList.className = 'context-menu-list';
        contextMenu.appendChild(menuList);
    }

    // 2. 预置菜单数据配置
    var menuData = [
        { label: '复制', icon: 'fa-regular fa-copy' },
        { label: '全选', icon: 'fa-regular fa-square-check' },
        { type: 'divider' },
        { label: '首页', icon: 'fa-solid fa-house', route: 'home' },
        { label: '分类', icon: 'fa-solid fa-shapes', route: 'categories' },
        { label: '收藏', icon: 'fa-regular fa-star', route: 'collection' },
        { label: '通知', icon: 'fa-regular fa-bell', route: 'notice' },
        { label: '共创', icon: 'fa-solid fa-hand-holding-heart', route: 'co-create' },
        { label: '投稿', icon: 'fa-solid fa-arrow-up-from-bracket', route: 'submit' },
        { label: '关于', icon: 'fa-solid fa-circle-info', route: 'about' },
        { type: 'divider' },
        { label: '刷新页面', icon: 'fa-solid fa-rotate-right' }
    ];

    // 3. 渲染菜单项到 HTML 列表中
    function renderMenu() {
        menuList.innerHTML = '';
        menuData.forEach(function(item) {
            if (item.type === 'divider') {
                var divider = document.createElement('li');
                divider.className = 'context-menu-divider';
                menuList.appendChild(divider);
                return;
            }

            var li = document.createElement('li');
            li.className = 'context-menu-item';
            li.innerHTML = `<i class="${item.icon}"></i><span>${item.label}</span>`;
            
            if (item.route) {
                li.dataset.route = item.route;
            }
            menuList.appendChild(li);
        });
    }
    // 打开页面时预渲染
    renderMenu();

    // 4. 菜单显示/隐藏逻辑
    function showMenu(x, y) {
        contextMenu.style.display = 'block';
        
        var menuWidth = 190;
        var menuHeight = 340;
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 15;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 15;
        
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    }

    function hideMenu() {
        contextMenu.style.display = 'none';
    }

    // 5. 全局拦截浏览器默认右键
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showMenu(e.clientX, e.clientY);
    }, true);

    // 点击空白处隐藏
    document.addEventListener('click', function(e) {
        if (contextMenu && !contextMenu.contains(e.target)) {
            hideMenu();
        }
    });

    // ESC 键隐藏
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideMenu();
    });

    // 6. 菜单点击与路由预留 (委托给全局路由)
    menuList.addEventListener('click', function(e) {
        var targetItem = e.target.closest('.context-menu-item');
        if (!targetItem) return;

        var label = targetItem.querySelector('span') ? targetItem.querySelector('span').textContent : '';
        var route = targetItem.dataset.route;

        console.log('右键执行: ' + label);
        hideMenu();

        if (label === '刷新页面') {
            window.location.reload();
        } else if (route) {
            // 【核心修改】不再查找内部 routeMap，全部交给全局路由引擎
            if (typeof window.navigateToModule === 'function') {
                window.navigateToModule(route);
            } else {
                console.warn("全局路由尚未就绪");
            }
        }
    });

})();