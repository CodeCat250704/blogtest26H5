/* 手机端通知页逻辑 */
(function() {
    "use strict";
    const list = document.getElementById('phone-notice-list');
    const count = document.getElementById('phone-notice-count');

    async function loadData() {
        try {
            // 读取真正在 data-base/notice 下的数据
            const res = await fetch('../../../data-base/notice/index.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            renderList(data);
        } catch (e) {
            console.error("通知加载失败:", e);
            list.innerHTML = `<div class="phone-empty-state"><p style="color:#ffcccc;">数据加载失败</p></div>`;
        }
    }

    // 简单图标映射
    const iconMap = { 'info': 'fa-solid fa-circle-info', 'success': 'fa-solid fa-circle-check', 'warning': 'fa-solid fa-triangle-exclamation' };

    function renderList(notices) {
        if (!notices || notices.length === 0) {
            list.innerHTML = `<div class="phone-empty-state"><i class="fa-regular fa-bell-slash" style="font-size:40px;opacity:0.3;"></i><p>暂无通知</p></div>`;
            count.textContent = '0';
            return;
        }
        count.textContent = notices.length;
        list.innerHTML = notices.map(n => `
            <div class="phone-notice-item">
                <div class="ni-icon ${n.type || 'info'}"><i class="${iconMap[n.type] || 'fa-solid fa-circle-info'}"></i></div>
                <div class="ni-content">
                    <h4>${n.title}</h4>
                    <p>${n.content}</p>
                    <div class="date">${n.date || '刚刚'}</div>
                </div>
            </div>
        `).join('');
    }

    loadData();
})();