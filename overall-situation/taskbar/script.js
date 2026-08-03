/* 独立任务栏 - 剥除所有依赖，直接硬插 (完美胶囊版) */
(function() {
    "use strict";

    // 允许稍后的加载，确保页面的其他元素已经生成
    setTimeout(function() {
        // 如果已经存在旧任务栏，先杀掉避免重叠
        const existingBar = document.getElementById('jasper-bottom-bar');
        if (existingBar) existingBar.remove();

        // 构造一个绝对纯净的底部胶囊任务栏
        const taskbarHTML = `
        <div id="jasper-bottom-bar" style="position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); width: 75%; max-width: 750px; min-width: 480px; height: 66px; border-radius: 33px; background-color: var(--bg-taskbar) !important; backdrop-filter: blur(35px); -webkit-backdrop-filter: blur(35px); border: 1px solid var(--border-color); box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 99999; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 4px; padding: 0 16px; box-sizing: border-box; pointer-events: auto; transition: background-color 0.3s, border-color 0.3s;">
            
            <!-- 时间块 -->
            <div style="display: flex; flex-direction: column; align-items: flex-start; margin-right: 12px; min-width: 60px; flex-shrink: 0;">
                <span id="clock-time" style="color: var(--text-main); font-size: 14px; font-weight: 600; line-height: 1.1;">11:38</span>
                <span id="clock-date" style="color: var(--text-muted); font-size: 10px; line-height: 1.1;">7月29</span>
            </div>

            <!-- 按钮组 (使用 flex:1 占满中间空间并居中) -->
            <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 2px; flex: 1;">
                <div class="t-item" data-route="home"><i class="fa-solid fa-house"></i><span>首页</span></div>
                <div class="t-item" data-route="categories"><i class="fa-solid fa-shapes"></i><span>分类</span></div>
                <div class="t-item" data-route="collection"><i class="fa-regular fa-star"></i><span>收藏</span></div>
                <div class="t-item" data-route="notice"><i class="fa-regular fa-bell"></i><span>通知</span></div>
                <div class="t-item" data-route="together"><i class="fa-solid fa-hand-holding-heart"></i><span>共创</span></div>
                <div class="t-item" data-route="submit"><i class="fa-solid fa-arrow-up-from-bracket"></i><span>投稿</span></div>
                <div class="t-item" data-route="about"><i class="fa-solid fa-circle-info"></i><span>关于</span></div>
                <div class="t-item" data-route="settings"><i class="fa-solid fa-gear"></i><span>设置</span></div>
            </div>

        </div>
        `;

        // 插到 body 的最末尾
        document.body.insertAdjacentHTML('beforeend', taskbarHTML);

        // 动态注入自身的 CSS
        const style = document.createElement('style');
        style.textContent = `
            .t-item {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 4px 12px; min-width: 36px; gap: 2px; color: var(--text-muted);
                cursor: pointer; transition: all 0.2s; border-radius: 10px; border: 1px solid transparent;
            }
            .t-item i { font-size: 18px; color: var(--text-muted); }
            .t-item span { font-size: 10px; font-weight: 500; color: var(--text-muted); }
            .t-item:hover { background: rgba(255,255,255,0.08); color: var(--text-main); }
            .t-item:hover i, .t-item:hover span { color: var(--text-main); }
            .t-item.active { background: rgba(79, 156, 247, 0.15); border-color: rgba(79, 156, 247, 0.3); color: #4F9CF7; }
            .t-item.active i, .t-item.active span { color: #4F9CF7; }
        `;
        document.head.appendChild(style);

        // 启动时间逻辑
        function updateClock() {
            const now = new Date();
            document.getElementById('clock-time').textContent = now.toLocaleTimeString("zh-CN", { hour12: false });
            document.getElementById('clock-date').textContent = (now.getMonth()+1) + "月" + now.getDate();
        }
        updateClock();
        setInterval(updateClock, 1000);

        // 路由点击
        document.getElementById('jasper-bottom-bar').addEventListener('click', function(e) {
            const btn = e.target.closest('.t-item');
            if (btn) {
                document.querySelectorAll('#jasper-bottom-bar .t-item').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                const route = btn.getAttribute('data-route');
                if (route && typeof window.navigateToModule === 'function') {
                    window.navigateToModule(route);
                }
            }
        });

    }, 200); // 200毫秒延迟，确保最底层外壳先渲染出来
})();