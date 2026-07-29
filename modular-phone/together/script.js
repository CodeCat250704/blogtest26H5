(function() {
    const container = document.getElementById('phone-together-list');
    async function loadData() {
        try {
            const res = await fetch('../../../data-base/together.json');
            if (res.ok) renderGroups(await res.json());
        } catch(e) { container.innerHTML = '<p style="color:red;">加载失败</p>'; }
    }
    function renderGroups(groups) {
        container.innerHTML = '';
        groups.forEach(g => {
            const div = document.createElement('div');
            div.innerHTML = `<div class="phone-group-title">${g.group}</div>` + g.list.map(i => `
                <div class="phone-link-card">
                    <img src="${i.avatar || ''}" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${i.name}'">
                    <div><div class="name">${i.name}</div><div class="desc">${i.desc || ''}</div></div>
                </div>
            `).join('');
            container.appendChild(div);
        });
    }
    loadData();
})();