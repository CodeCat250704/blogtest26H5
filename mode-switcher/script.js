/* macOS 风格顶栏逻辑 (含模式切换) */
/* 文件目录：JASPERBLOG/mode-switcher/script.js */
(function() {
    "use strict";

    // 1. 配置四种模式
    const MODES = [
        { id: 'computer', icon: 'fa-solid fa-desktop', label: '电脑' },
        { id: 'pad', icon: 'fa-solid fa-tablet-screen-button', label: '平板' },
        { id: 'phone', icon: 'fa-solid fa-mobile-screen-button', label: '手机' },
        { id: 'watch', icon: 'fa-solid fa-clock', label: '手表' }
    ];

    // 2. 渲染按钮到刚刚恢复的容器中
    const btnContainer = document.getElementById('mode-btn-container');
    let currentMode = localStorage.getItem('jasper_mode') || 'computer';

    if (btnContainer) {
        btnContainer.innerHTML = MODES.map(mode => `
            <div class="mode-btn ${mode.id === currentMode ? 'active' : ''}" data-mode="${mode.id}">
                <i class="${mode.icon}"></i>
                <span>${mode.label}</span>
            </div>
        `).join('');
    }

    // 3. 初始化：稍等片刻，自动加载当前模式对应的页面
    if (typeof window.navigateToModule === 'function') {
        setTimeout(() => {
            window.navigateToModule(currentMode);
        }, 300);
    }

    // 4. 绑定点击切换事件
    document.querySelector('#global-mode-switcher .switcher-panel').addEventListener('click', function(e) {
        const btn = e.target.closest('.mode-btn');
        if (!btn) return;

        const modeId = btn.dataset.mode;
        if (modeId === currentMode) return;

        document.querySelectorAll('.mode-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');

        localStorage.setItem('jasper_mode', modeId);
        currentMode = modeId;

        if (typeof window.navigateToModule === 'function') {
            window.navigateToModule(modeId);
        }
    });

})();