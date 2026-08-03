/* 电脑端关于页逻辑 (数据内嵌) */
(function() {
    "use strict";
    const authorEl = document.getElementById('pc-about-author');
    const techEl = document.getElementById('pc-about-tech');

    // 硬编码数据
    const profileData = `
        <p><strong>Cat,Gqun,DeepSeek,CodeSandwich</strong></p>
        <p>测试</p>
        <ul>
            <li>坐标：中国</li>
            <li>邮箱：暂不提供</li>
        </ul>
    `;

    const techData = `
        <p>本项目采用纯原生技术栈构建：</p>
        <ul>
            <li><strong>HTML5 / CSS3</strong></li>
            <li><strong>原生 JavaScript</strong> </li>
            <li><strong>FontAwesome 6</strong> (图标库)</li>
        </ul>
    `;

    authorEl.innerHTML = profileData;
    techEl.innerHTML = techData;
})();