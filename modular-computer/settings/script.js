(function() {
    "use strict";
    const btns = document.querySelectorAll('.pc-theme-btn');
    
    // 使用默认亮色
    let currentTheme = localStorage.getItem('jasper_theme') || 'light';
    applyTheme(currentTheme);

    function applyTheme(theme) {
        // 移除所有主题样式
        document.body.classList.remove('dark-mode', 'sunset-mode');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'sunset') {
            document.body.classList.add('sunset-mode');
        }
        // light 模式下不加任何 class，以 CSS :root 为准
        
        btns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.pc-theme-btn[data-theme="${theme}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        localStorage.setItem('jasper_theme', theme);
    }

    btns.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            if (theme === currentTheme) return;
            currentTheme = theme;
            applyTheme(theme);
        });
    });
})();