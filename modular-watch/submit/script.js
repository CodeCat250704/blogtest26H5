/* 手表端投稿逻辑 - 极简垂直流内嵌数据版 */
(function() {
    "use strict";
    
    // 获取手表端专用容器
    const rulesEl = document.getElementById('watch-rules-content');
    const methodEl = document.getElementById('watch-method-content');
    const templateEl = document.getElementById('watch-template-content');
    const quickEl = document.getElementById('watch-quick-submit-content');

    // 硬编码数据 (和电脑端一样)
    const data = [
        {
            "section": "rules",
            "content": [
                "<strong>一、原创声明</strong><br>所有作品必须为原创，严禁抄袭或侵犯版权。",
                "<strong>二、内容规范</strong><br>文章需积极向上，符合法律法规，不含恶意言论或违规信息。",
                "<strong>三、审核周期</strong><br>通常 4 至 6 个工作日，通过后将在首页展示。若未通过，我们会通过邮件反馈修改建议。"
            ]
        },
        {
            "section": "method",
            "content": [
                "请将文章打包为 <strong>ZIP</strong> 或 <strong>RAR</strong> 压缩包。",
                "包含 <strong>meta.json</strong> 和 <strong>content.md</strong>。",
                "如有图片请存放在 <strong>picture</strong> 文件夹中。",
                "通过下方任意邮箱发送。"
            ]
        },
        {
            "section": "template",
            "template": "收件人：xsh3304832000@163.com\n主题：【投稿】[标题] - [昵称]\n\n您好！附件是我的投稿作品《[标题]》。\n内容简介：[简述大意]\n\n期待审阅，谢谢！"
        },
        {
            "section": "quick_submit",
            "emails": [
                { "name": "163邮箱", "url": "https://mail.163.com/mail/WriteLetter.jsp?to=xsh3304832000@163.com" },
                { "name": "QQ邮箱", "url": "https://mail.qq.com/cgi-bin/qm_act?to=xsh3304832000@163.com" },
                { "name": "Gmail", "url": "https://mail.google.com/mail/?view=cm&fs=1&to=xsh3304832000@163.com" }
            ]
        }
    ];

    function renderAll() {
        data.forEach(section => {
            if (section.section === 'rules' && rulesEl) {
                renderRules(rulesEl, section.content);
            } else if (section.section === 'method' && methodEl) {
                renderMethod(methodEl, section.content);
            } else if (section.section === 'template' && templateEl) {
                renderTemplate(templateEl, section.template);
            } else if (section.section === 'quick_submit' && quickEl) {
                renderQuick(quickEl, section.emails);
            }
        });
    }

    function renderRules(container, content) {
        let html = `<ul class="watch-rules-list">`;
        content.forEach((text, index) => {
            if (index === content.length - 1) {
                html += `</ul><div class="watch-rules-blockquote"><i class="fa-regular fa-circle-check" style="color:#4F9CF7;margin-right:4px;"></i> ${text}</div>`;
            } else {
                html += `<li>${text}</li>`;
            }
        });
        container.innerHTML = html;
    }

    function renderMethod(container, content) {
        container.innerHTML = `<ul class="watch-method-list">${content.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }

    function renderTemplate(container, templateStr) {
        container.innerHTML = `<div class="watch-mail-box">${templateStr}</div>`;
    }

    function renderQuick(container, emails) {
        container.innerHTML = `<div class="watch-email-btn-wrapper">${emails.map(e => `<a href="${e.url}" target="_blank" class="watch-email-btn"><i class="fa-regular fa-paper-plane"></i> ${e.name}</a>`).join('')}</div>`;
    }

    renderAll();
})();