/* 电脑端友链逻辑 */
(function() {
    "use strict";
    const container = document.getElementById('pc-together-grid');

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/together.json');
            if (!res.ok) throw new Error('读取失败');
            const data = await res.json();
            renderGroups(data);
        } catch (e) {
            console.error("电脑端友链加载失败", e);
            container.innerHTML = '<p style="color:#ffcccc; text-align:center;">数据加载失败，请检查 data-base/together.json</p>';
        }
    }

    function renderGroups(groups) {
        container.innerHTML = '';
        groups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'pc-group-section';
            groupDiv.innerHTML = `
                <h3 class="pc-group-title">${group.group}</h3>
                <div class="pc-group-list">
                    ${group.list.map(item => `
                        <div class="pc-link-card">
                            <img src="${item.avatar || ''}" alt="${item.name}" loading="lazy" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}'">
                            <div class="info">
                                <span class="name">${item.name}</span>
                                <span class="desc">${item.desc || '友链'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(groupDiv);
        });
    }

    loadData();
})();