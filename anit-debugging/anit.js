/* ==========================================================
 * Anit-Debugging 终极防调试锁 (覆盖菜单点击打开)
 * 文件目录：JASPERBLOG/anit-debugging/anit.js
 * ========================================================== */

(function() {
    "use strict";

    // ----- 1. 配置你的跳转地址 -----
    const REDIRECT_URL = "https://codegin.top"; 

    // ----- 2. 强制阻断所有可能的调试快捷键 -----
    function blockKeys() {
        document.addEventListener('keydown', function(e) {
            // 阻止 F12、Ctrl+Shift+I、Ctrl+Shift+J、Ctrl+Shift+C
            if (e.key === 'F12' || e.keyCode === 123 || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = REDIRECT_URL;
                return false;
            }
        });
    }

    // ----- 3. 强制阻断右键菜单 -----
    function blockContextMenu() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            window.location.href = REDIRECT_URL; // 只要右键，立刻跳转
            return false;
        });
    }

    // ----- 4. 【核心战术】检测“窗口外宽”与“窗口内宽”的差值 -----
    // 当开发者工具从侧边/底部打开时，window.outerWidth 和 window.innerWidth 会产生巨大差值。
    function checkDevToolsOpened() {
        // 设置一个基准偏移量（通常浏览器边框加上滚动条大概在 20-100px 左右）
        // 如果内外宽/高的差值大于 200px，判定为开发者工具被弹出
        const threshold = 200; 
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if (widthDiff > threshold || heightDiff > threshold) {
            // 检测到开发者工具悬浮停靠，立刻跳转！
            window.location.href = REDIRECT_URL;
        }
    }

    // ----- 5. 终极死锁：经典 debugger 反调试 -----
    function trapConsole() {
        // 核心思想：一旦控制台被打开，setInterval 里的 debugger 会卡死调试器
        function check() {
            // 如果反调试的 debugger 被用户关闭了，外部 try catch 会捕获异常并触发跳转
            try {
                // 采用 Function 构造器替代 eval，更隐蔽
                (function() {}).constructor('debugger')();
            } catch (e) {
                window.location.href = REDIRECT_URL;
            }
        }
        // 设置为密集检测 (150ms) 一旦触发立刻锁死
        setInterval(check, 150);
    }

    // ----- 6. 启动拦截器 -----
    function startProtection() {
        blockKeys();         // 1. 封按键
        blockContextMenu();  // 2. 封右键
        trapConsole();       // 3. 封控制台断点
        checkDevToolsOpened(); // 4. 立刻检查一次当前状态

        // 5. 每隔 1 秒持续检测窗口尺寸大小，防止通过菜单打开后尺寸变化 (完美针对你截图里的操作)
        setInterval(checkDevToolsOpened, 1000);
    }

    // 加载启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startProtection);
    } else {
        startProtection();
    }
})();