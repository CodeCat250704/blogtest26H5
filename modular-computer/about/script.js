/* 电脑端关于页逻辑 (数据内嵌) */
(function() {
    "use strict";
    const authorEl = document.getElementById('pc-about-author');
    const techEl = document.getElementById('pc-about-tech');

    // 硬编码数据
    const profileData = `
        <p><strong>你好，我是 JASPER。</strong></p>
        <p>一个热爱折腾前端、追求极致 UI 体验的独立开发者。这个博客系统是我从零开始搭建的“毛玻璃 + 多设备自适应”练习项目。</p>
        <p>致力于用干净的代码构建有温度的交互。</p>
        <ul>
            <li>坐标：中国</li>
            <li>邮箱：xsh3304832000@163.com</li>
        </ul>
    `;

    const techData = `
        <p>本项目采用纯原生技术栈构建：</p>
        <ul>
            <li><strong>HTML5 / CSS3</strong> (Flexbox 布局)</li>
            <li><strong>原生 JavaScript (ES6)</strong> (路由引擎、组件化)</li>
            <li><strong>FontAwesome 6</strong> (图标库)</li>
            <li><strong>毛玻璃 (Glassmorphism)</strong> 设计语言</li>
        </ul>
        <p style="margin-top: 12px; font-size: 14px; color: rgba(255,255,255,0.5);">致敬所有为开源生态贡献力量的开发者。</p>
    `;

    authorEl.innerHTML = profileData;
    techEl.innerHTML = techData;
})();