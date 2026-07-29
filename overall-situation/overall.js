/* 全局控制台，处理点击空白处隐藏菜单 */
/* 文件目录：JASPERBLOG/overall-situation/overall.js */
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('context-menu');
        if (menu && !e.target.closest('#context-menu')) {
            menu.classList.add('hidden');
        }
    });
});