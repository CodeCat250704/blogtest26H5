/* 平板端投稿逻辑 - 全硬编码数据版本 (免 JSON) */
(function() {
    "use strict";
    
    // 获取容器
    const rulesEl = document.getElementById('pad-rules-content');
    const methodEl = document.getElementById('pad-method-content');
    const templateEl = document.getElementById('pad-template-content');
    const quickEl = document.getElementById('pad-quick-submit-content');

    // 直接在这里写死全部数据
    const data = [
        {
            "section": "rules",
            "content": [
                "<strong>一、原创声明</strong><br>所有提交的作品必须为原创，严禁抄袭或侵犯他人版权。作品应未在任何公开平台发表过。",
                "<strong>二、内容规范</strong><br>文章内容需积极向上，符合国家法律法规，不得包含恶意言论、敏感信息、暴力或色情内容。严格遵守《网络安全法》及《网络信息内容生态治理规定》。",
                "<strong>三、审核周期</strong><br>审核周期通常为 4 至 6 个工作日，通过后将在首页展示。若未通过，我们将通过邮件告知具体原因及修改建议。"
            ]
        },
        {
            "section": "method",
            "content": [
                "请将您的文章或作品打包为 <strong>ZIP</strong> 或 <strong>RAR</strong> 格式的压缩包。",
                "按照博客规范，提供文章对应的 <strong>meta.json</strong> 以及 <strong>content.md</strong> 文件。",
                "<strong>content.md</strong> 为作品文件格式，如有照片请另附 <strong>picture</strong> 文件夹。",
                "通过下方任意邮箱发送至我们的投稿邮箱。"
            ]
        },
        {
            "section": "template",
            "template": "收件人：xsh3304832000@163.com\n主题：【投稿】[您的文章标题] - [您的昵称]\n\n尊敬的编辑老师：\n\n您好！附件是我的投稿作品《[文章标题]》。\n文章分类：[例如：前端开发]\n内容简介：[简要描述文章大意]\n\n期待您的审阅，谢谢！\n\n[您的姓名/昵称]\n[投稿日期]"
        },
        {
            "section": "quick_submit",
            "emails": [
                { "name": "Gmail", "url": "https://mail.google.com/mail/?view=cm&fs=1&to=xsh3304832000@163.com" },
                { "name": "QQ邮箱", "url": "https://mail.qq.com/cgi-bin/qm_act?to=xsh3304832000@163.com" },
                { "name": "网易 163", "url": "https://mail.163.com/mail/WriteLetter.jsp?to=xsh3304832000@163.com" },
                { "name": "网易 126", "url": "https://mail.126.com/mail/WriteLetter.jsp?to=xsh3304832000@163.com" },
                { "name": "Outlook", "url": "https://outlook.live.com/mail/0/deeplink/compose?to=xsh3304832000@163.com" },
                { "name": "腾讯企业邮", "url": "https://exmail.qq.com/cgi-bin/login?to=xsh3304832000@163.com" },
                { "name": "Zoho Mail", "url": "https://mail.zoho.com/mail/email?to=xsh3304832000@163.com" }
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
        let html = `<ul class="rules-list">`;
        content.forEach((text, index) => {
            if (index === content.length - 1) {
                html += `</ul><div class="rules-blockquote"><i class="fa-regular fa-circle-check" style="color:#4F9CF7;margin-right:6px;"></i> ${text}</div>`;
            } else {
                html += `<li>${text}</li>`;
            }
        });
        container.innerHTML = html;
    }

    function renderMethod(container, content) {
        container.innerHTML = `<ul class="method-list">${content.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }

    function renderTemplate(container, templateStr) {
        container.innerHTML = `<div class="mail-box">${templateStr}</div>`;
    }

    function renderQuick(container, emails) {
        container.innerHTML = `<div class="email-btn-wrapper">${emails.map(e => `<a href="${e.url}" target="_blank" class="email-btn"><i class="fa-regular fa-paper-plane"></i> ${e.name}</a>`).join('')}</div>`;
    }

    renderAll();
})();