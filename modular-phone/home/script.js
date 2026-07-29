/* 手机端主页逻辑：四种模式切换 + 整合时间轴 */
/* 文件目录：JASPERBLOG/modular-phone/home/script.js */
(function() {
    "use strict";
    
    // 获取 DOM 元素
    const modeTabs = document.querySelectorAll('.mode-tab');
    const timelineList = document.getElementById('timelineList');
    // 轮播图元素 ...
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('carouselNext');
    const prevBtn = document.getElementById('carouselPrev');
    // ...

    // 保存读取到的所有数据
    let allData = {
        posts: [],
        announcements: []
    };

    // ==========================
    // 1. 数据读取 (复用 computer 的逻辑)
    // ==========================
    async function loadPhoneHomeData() {
        try {
            const res = await fetch('/data-base/catalog.json');
            if (res.ok) {
                const data = await res.json();
                allData.posts = data.posts || [];
                allData.announcements = data.announcements || [];
                
                // 渲染轮播图 (完全复用 computer 的 renderCarouselWithImage 逻辑)
                // renderCarousel(allData.posts); 
                
                // 渲染时间轴 (默认加载“时间轴”模式)
                renderTimeline('timeline');
                
                // 挂载模式切换事件
                bindModeSwitcher();
            }
        } catch (e) {
            console.error("数据读取失败:", e);
            timelineList.innerHTML = '<div style="color:rgba(255,255,255,0.5); text-align:center;">数据加载失败</div>';
        }
    }

    // ==========================
    // 2. 核心功能：时间轴渲染
    // ==========================
    function renderTimeline(mode) {
        timelineList.innerHTML = ''; // 清空

        // 【逻辑】：将 公告 和 文章 混合，按时间排序生成时间轴
        let combinedItems = [];

        // 1. 处理公告
        if (allData.announcements) {
            allData.announcements.forEach(text => {
                combinedItems.push({
                    type: 'notice',
                    date: new Date().toISOString().split('T')[0], // 公告默认为当天
                    title: '公告',
                    desc: text,
                    rawDate: new Date()
                });
            });
        }

        // 2. 处理文章
        if (allData.posts) {
            allData.posts.forEach(post => {
                combinedItems.push({
                    type: 'post',
                    date: post.date,
                    title: post.title,
                    desc: post.subtitle || post.category || '点击查看详情',
                    rawDate: new Date(post.date)
                });
            });
        }

        // 3. 按照日期倒序排列（最新的在最上面）
        combinedItems.sort((a, b) => b.rawDate - a.rawDate);

        // 4. 根据选中的 Mode 进行逻辑过滤 (如果是 timeline 模式，显示全部。如果是推荐/最新，可以截取前5条)
        let displayItems = combinedItems;
        if (mode === 'recommend') {
            displayItems = combinedItems.slice(0, 6); // 只显示前6条
        } else if (mode === 'latest') {
            displayItems = combinedItems.slice(0, 10);
        }

        // 5. 生成 HTML
        if (displayItems.length === 0) {
            timelineList.innerHTML = '<div style="color:rgba(255,255,255,0.5); text-align:center;">暂无内容</div>';
            return;
        }

        displayItems.forEach(item => {
            // 格式化日期显示 (去掉年份，只留 月-日)
            const dateParts = item.date.split('-');
            const displayDate = dateParts[1] + '月' + dateParts[2] + '日';

            const html = `
                <div class="timeline-item">
                    <div class="timeline-dot" style="background: ${item.type === 'notice' ? '#fff' : '#4F9CF7'};"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">${displayDate}</div>
                        <div class="timeline-title">${item.title}</div>
                        <div class="timeline-desc">${item.desc}</div>
                    </div>
                </div>
            `;
            timelineList.insertAdjacentHTML('beforeend', html);
        });
    }

    // ==========================
    // 3. 模式切换功能绑定
    // ==========================
    function bindModeSwitcher() {
        modeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 切换高亮状态
                modeTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // 获取当前模式
                const mode = this.dataset.mode;
                
                // 触发数据渲染逻辑 (传入 'recommend', 'latest', 'hot', 'timeline')
                renderTimeline(mode);
            });
        });
    }

    // 启动
    loadPhoneHomeData();

})();