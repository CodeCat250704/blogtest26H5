(function() {
    "use strict";
    const btns = document.querySelectorAll('.phone-theme-btn');
    let currentTheme = localStorage.getItem('jasper_theme') || 'light';
    applyTheme(currentTheme);
    function applyTheme(theme) {
        document.body.classList.remove('dark-mode', 'sunset-mode');
        if (theme === 'dark') document.body.classList.add('dark-mode');
        else if (theme === 'sunset') document.body.classList.add('sunset-mode');
        btns.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.phone-theme-btn[data-theme="${theme}"]`);
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