(function() {
    const btns = document.querySelectorAll('.theme-btn');
    let currentTheme = localStorage.getItem('jasper_theme') || 'light';
    function apply(t) {
        document.body.classList.remove('light-mode', 'dark-mode', 'sunset-mode');
        if (t === 'light') document.body.classList.add('light-mode');
        else if (t === 'dark') document.body.classList.add('dark-mode');
        else if (t === 'sunset') document.body.classList.add('sunset-mode');
        btns.forEach(b => b.classList.remove('active'));
        document.querySelector(`.theme-btn[data-theme="${t}"]`).classList.add('active');
        localStorage.setItem('jasper_theme', t);
    }
    btns.forEach(b => b.addEventListener('click', function() { apply(this.dataset.theme); }));
    apply(currentTheme);
})();