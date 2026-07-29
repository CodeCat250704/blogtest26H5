(function() {
    const container = document.getElementById('watch-together-list');
    async function loadData() {
        try {
            const res = await fetch('../../../data-base/together.json');
            if (res.ok) renderGroups(await res.json());
        } catch(e) { container.innerHTML = '<div style="color:red;font-size:12px;">加载失败</div>'; }
    }
    function renderGroups(groups) {
        container.innerHTML = '';
        groups.forEach(g => {
            const div = document.createElement('div');
            div.innerHTML = `<div class="watch-group-title">${g.group}</div>` + g.list.map(i => `
                <div class="watch-link-item">
                    <img src="${i.avatar || ''}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${i.name}'">
                    <div><div class="name">${i.name}</div><div class="desc" style="display:${i.desc ? 'block' : 'none'}">${i.desc || ''}</div></div>
                </div>
            `).join('');
            container.appendChild(div);
        });
    }
    loadData();
})();