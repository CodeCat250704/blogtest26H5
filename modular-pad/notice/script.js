/* 平板端通知页逻辑 */
(function() {
    "use strict";
    const list = document.getElementById('pad-notice-list');
    const count = document.getElementById('pad-notice-count');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/notice/index.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            renderList(data);
        } catch (e) {
            console.error("通知加载失败:", e);
            list.innerHTML = `<div class="pad-empty-state"><p style="color:#ffcccc;">数据加载失败</p></div>`;
        }
    }

    function renderList(notices) {
        if (!notices || notices.length === 0) {
            list.innerHTML = `<div class="pad-empty-state"><i class="fa-regular fa-bell-slash" style="font-size:48px;opacity:0.2;"></i><p>暂无通知</p></div>`;
            count.textContent = '0 条';
            return;
        }
        count.textContent = notices.length + ' 条';
        list.innerHTML = notices.map(n => `
            <div class="pad-notice-item">
                <h4><i class="fa-regular fa-circle-check" style="color:#4F9CF7; margin-right:6px;"></i> ${n.title}</h4>
                <p>${n.content}</p>
                <div class="date">${n.date || '刚刚'}</div>
            </div>
        `).join('');
    }

    loadData();
})();