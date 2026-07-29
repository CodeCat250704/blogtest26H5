/* 电脑端通知页逻辑：左侧分类过滤 + 右侧消息流 */
(function() {
    "use strict";

    const list = document.getElementById('pc-notice-list');
    const count = document.getElementById('pc-notice-count');
    const filters = document.getElementById('pc-notice-filters');

    let allData = [];
    let currentFilter = 'all';

    async function loadData() {
        try {
            const res = await fetch('../../../data-base/notice/index.json');
            if (res.ok) {
                allData = await res.json();
            } else {
                throw new Error('读取失败');
            }
        } catch (e) {
            console.warn("未读取到 notice 数据，加载演示数据");
            // 加载演示数据让你立刻看到效果
            allData = [
                { type: 'info', title: '系统上线公告', content: 'JasperBlog 电脑端通知中心已上线，支持左侧分类过滤。', date: '2026-07-30 10:00' },
                { type: 'success', title: '文章更新通知', content: '您的文章《跨设备路由设计》已被成功收藏。', date: '2026-07-29 14:30' },
                { type: 'warning', title: '服务器维护提醒', content: '数据存储将于今晚 2:00 进行例行维护，预计耗时 5 分钟。', date: '2026-07-28 09:15' },
                { type: 'info', title: '新评论收到', content: '网友 “星辰” 评论了您的文章：非常棒的架构设计！', date: '2026-07-27 20:00' }
            ];
        }

        if (!allData || allData.length === 0) {
            list.innerHTML = `<div class="pc-empty-state"><i class="fa-regular fa-bell-slash" style="font-size:48px;opacity:0.2;display:block;margin-bottom:16px;"></i><h3>暂无通知消息</h3></div>`;
            count.textContent = '0';
            return;
        }

        renderFilters(allData);
        renderList(currentFilter, allData);
    }

    // 图标映射
    const iconMap = {
        'info': 'fa-solid fa-circle-info',
        'success': 'fa-solid fa-circle-check',
        'warning': 'fa-solid fa-triangle-exclamation'
    };

    function renderFilters(data) {
        // 提取所有不重复的类型
        const types = [...new Set(data.map(item => item.type))];
        
        // 重置过滤器HTML，加入全部
        filters.innerHTML = `
            <div class="filter-btn active" data-type="all">
                <i class="fa-regular fa-bell"></i> 全部
                <span class="f-count">${data.length}</span>
            </div>
        `;

        types.forEach(type => {
            const count = data.filter(item => item.type === type).length;
            const iconClass = iconMap[type] || 'fa-regular fa-circle';
            const btn = document.createElement('div');
            btn.className = 'filter-btn';
            btn.dataset.type = type;
            // 将类型首字母大写
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            btn.innerHTML = `<i class="${iconClass}"></i> ${label} <span class="f-count">${count}</span>`;
            filters.appendChild(btn);
        });

        // 绑定过滤器点击事件
        filters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                filters.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.type;
                renderList(currentFilter, allData);
            });
        });
    }

    function renderList(filterType, data) {
        let filteredData = data;
        if (filterType !== 'all') {
            filteredData = data.filter(item => item.type === filterType);
        }

        // 按日期倒序排列
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        count.textContent = filteredData.length;

        if (filteredData.length === 0) {
            list.innerHTML = `<div class="pc-empty-state"><h3>暂无该分类的通知</h3></div>`;
            return;
        }

        list.innerHTML = filteredData.map(item => `
            <div class="pc-notice-item">
                <div class="ni-icon ${item.type || 'info'}"><i class="${iconMap[item.type] || 'fa-solid fa-circle-info'}"></i></div>
                <div class="ni-content">
                    <h4>${item.title}</h4>
                    <p>${item.content}</p>
                    <div class="date"><i class="fa-regular fa-clock"></i> ${item.date || '刚刚'}</div>
                </div>
            </div>
        `).join('');
    }

    // 绑定全部已读按钮（演示功能）
    document.getElementById('mark-all-read').addEventListener('click', function() {
        if (!allData.length) return;
        // 前端模拟：将所有通知加上已读标志或直接清空
        list.innerHTML = `<div class="pc-empty-state"><i class="fa-regular fa-circle-check" style="font-size:48px;opacity:0.2;display:block;margin-bottom:16px;color:#2ecc71;"></i><h3>已全部标记为已读</h3></div>`;
        count.textContent = '0';
        this.textContent = '已读';
        this.style.color = '#2ecc71';
    });

    loadData();
})();