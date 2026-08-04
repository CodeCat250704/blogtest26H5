(function() {
    "use strict";
    const list = document.getElementById('pad-notice-list');
    const count = document.getElementById('pad-notice-count');
    async function loadData() {
        try {
            const res = await fetch('/data-base/notice/index.json');
            if (res.ok) renderList(await res.json());
        } catch (e) { console.error(e); }
    }
    function renderList(notices) {
        if (!notices || notices.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);">暂无通知</p>'; count.textContent = '0'; return; }
        count.textContent = notices.length;
        list.innerHTML = notices.map(n => `
            <div class="notice-item">
                <div class="bar ${n.type || 'info'}"></div>
                <div class="content">
                    <h4>${n.title}</h4>
                    <p>${n.content}</p>
                    <span class="date">${n.date || '刚刚'}</span>
                </div>
            </div>
        `).join('');
    }
    loadData();
})();