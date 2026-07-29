/* 手表端通知页逻辑 */
(function() {
    "use strict";
    const list = document.getElementById('watch-notice-list');
    const count = document.getElementById('watch-notice-count');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/notice/index.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            renderList(data);
        } catch (e) {
            console.error("通知加载失败:", e);
        }
    }

    function renderList(notices) {
        if (!notices || notices.length === 0) {
            list.innerHTML = `<div class="watch-empty-state"><i class="fa-regular fa-bell-slash" style="font-size:24px;opacity:0.3;display:block;margin-bottom:8px;"></i><span>暂无通知</span></div>`;
            count.textContent = '0条';
            return;
        }
        count.textContent = notices.length + '条';
        list.innerHTML = notices.map(n => `
            <div class="watch-notice-item">
                <h4>${n.title}</h4>
                <p>${n.content}</p>
                <div class="date">${n.date || '刚刚'}</div>
            </div>
        `).join('');
    }

    loadData();
})();