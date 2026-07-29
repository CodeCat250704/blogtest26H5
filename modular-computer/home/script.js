/* 
内容：主页全功能逻辑 (整合亮暗自适应、动态数据读取、播放器)
文件目录：JASPERBLOG/modular-computer/home/script.js
*/
(function() {
    console.log("Home JS 已启动 (系统自适应模式)");

    // 绑定 DOM 元素
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    const nextBtn = document.getElementById('carouselNext');
    const prevBtn = document.getElementById('carouselPrev');
    const historyList = document.getElementById('historyList');
    const announcementList = document.getElementById('announcementList');
    const musicListContainer = document.getElementById('musicListContainer');

    // 获取全局路由跳转函数
    const navigateTo = (module) => {
        const targetLi = document.querySelector(`[data-module="${module}"]`);
        if (targetLi) targetLi.click();
    };

    // ==========================================================
    // 【全局播放器核心配置】
    // ==========================================================
    let allSongs = [];
    let currentSongIndex = 0;
    let playMode = 'list';
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;
    let volumeSlider = null;

    // ==========================================================
    // 【核心数据读取函数】(容错并适应亮暗模式)
    // ==========================================================
    async function loadHomeData() {
        try {
            // 尝试获取 catalog.json (相对路径)
            const catalogRes = await fetch('../../../data-base/catalog.json');
            
            let catalogData = null;
            let noticeList = [];

            if (catalogRes.ok) {
                catalogData = await catalogRes.json();
                const noticeRes = await fetch('../../../data-base/notice/index.json');
                if (noticeRes.ok) noticeList = await noticeRes.json();
            }

            // 【自我救场】：确保数据存在，如果JSON为空则使用内置假数据
            if (!catalogData || !catalogData.posts || !catalogData.music) {
                console.warn("⚠️ 未检测到有效远程数据，启用内置演示数据！");
                catalogData = {
                    "announcements": ["欢迎来到 Cat Blog！", "亮暗模式已完美联动。"],
                    "posts": [
                        { "title": "星空猫测试", "subtitle": "毛玻璃风格尝试", "category": "分类", "date": "2026-07-29" },
                        { "title": "蓝光特效测试", "subtitle": "Web 3D 探索", "category": "分类", "date": "2026-07-28" }
                    ],
                    "music": ["StarSky.mp3", "GentleDream.mp3"]
                };
            }

            // ===== 1. 公告版 =====
            if (catalogData.announcements && catalogData.announcements.length > 0) {
                announcementList.innerHTML = catalogData.announcements.map(text => `<p style="margin:4px 0; color:var(--text-main);">${text}</p>`).join('');
            } else {
                announcementList.innerHTML = '<p style="color:var(--text-muted);">暂无公告</p>';
            }

            // ===== 2. 历史发布与轮播图 =====
            const posts = catalogData.posts || [];
            if (posts.length > 0) {
                const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                historyList.innerHTML = sortedPosts.map(post => 
                    `<li class="history-link" data-title="${post.title}" style="cursor:pointer; transition:0.2s; color:var(--text-muted);">· ${post.title}</li>`
                ).join('');
                
                document.querySelectorAll('.history-link').forEach(el => {
                    el.onclick = () => { navigateTo('categories'); };
                    el.onmouseenter = function() { this.style.color = 'var(--text-main)'; this.style.transform = 'translateX(6px)'; };
                    el.onmouseleave = function() { this.style.color = ''; this.style.transform = ''; };
                });

                renderCarouselWithImage(sortedPosts);
            } else {
                historyList.innerHTML = '<li style="color:var(--text-muted);">暂无文章</li>';
            }

            // ===== 3. 音乐数据 =====
            if (catalogData.music && catalogData.music.length > 0) {
                allSongs = catalogData.music;
                renderMusicPlayerUI(catalogData.music);
            } else {
                musicListContainer.innerHTML = '<p style="color:var(--text-muted);">暂无音乐数据</p>';
            }

        } catch (error) {
            console.error("发生严重错误:", error);
            announcementList.innerHTML = '<p style="color:var(--text-muted);">数据加载失败，请检查路径</p>';
        }
    }
    
    // ==========================================================
    // 【带图片的轮播图渲染 - 完美变色版】
    // ==========================================================
    let currentSlide = 0;
    function renderCarouselWithImage(posts) {
        // 【修复重点】：去掉了 `background-color: #333;` 和死路径
        track.innerHTML = posts.map((post) => {
            const imgPath = post.cover ? `../../../data-base/${post.cover}` : ''; 
            return `
                <li class="carousel-slide" style="cursor:pointer;">
                    <!-- 使用 var(--bg-card) 兜底，这样亮色模式就是白色，暗色就是深色 -->
                    <div class="slide-bg" style="background-image: url('${imgPath}'); background-color: var(--bg-card);"></div>
                    <div class="slide-content-overlay">
                        <div class="slide-text">
                            <h2 style="color:var(--text-main);">${post.title}</h2>
                            <p style="color:var(--text-muted);">${post.subtitle || post.category}</p>
                            <div class="click-hint" style="margin-top: 10px; font-size: 12px; opacity: 0.6; color:var(--text-muted);">点击查看详情</div>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        document.querySelectorAll('.carousel-slide').forEach(el => {
            el.onclick = () => { navigateTo('categories'); };
        });

        indicators.innerHTML = posts.map((_, index) => `<button class="indicator ${index === 0 ? 'active' : ''}"></button>`).join('');

        const updateCarousel = () => {
            if (!track.firstElementChild) return;
            const width = track.firstElementChild.getBoundingClientRect().width;
            track.style.transform = `translateX(-${width * currentSlide}px)`;
            document.querySelectorAll('.indicator').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        };

        nextBtn.onclick = () => { currentSlide = (currentSlide + 1) % posts.length; updateCarousel(); };
        prevBtn.onclick = () => { currentSlide = (currentSlide - 1 + posts.length) % posts.length; updateCarousel(); };
        let autoSlideInterval = setInterval(() => nextBtn.click(), 5000);
        document.getElementById('heroCarousel').onmouseenter = () => clearInterval(autoSlideInterval);
        document.getElementById('heroCarousel').onmouseleave = () => { autoSlideInterval = setInterval(() => nextBtn.click(), 5000); };
    }

    // ==========================================================
    // 【全功能 UI 播放器渲染】(适配亮暗色)
    // ==========================================================
    function renderMusicPlayerUI(songs) {
        setTimeout(function() {
            musicListContainer.innerHTML = `
                <style>
                    .player-progress-bar { height: 4px; background: var(--bg-card); border-radius: 2px; cursor: pointer; width: 100%; position: relative; margin: 6px 0; border: 1px solid var(--border-color); }
                    .player-progress-bar .progress-fill { height: 100%; width: 0%; background: #4F9CF7; border-radius: 2px; position: absolute; left: 0; top: 0; pointer-events: none; }
                    .player-controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; flex-wrap: wrap;}
                    .ctrl-btn { background: transparent; border: none; color: var(--text-muted); font-size: 16px; cursor: pointer; transition: all 0.2s; padding: 0 4px; }
                    .ctrl-btn:hover { color: var(--text-main); transform: scale(1.05); }
                    .mode-btn { background: transparent; border: none; color: var(--text-muted); font-size: 14px; cursor: pointer; transition: 0.2s; }
                    .vol-slider { width: 50px; height: 3px; background: var(--bg-card); border-radius: 2px; border: 1px solid var(--border-color); outline: none; cursor: pointer; }
                    .time-display { font-size: 11px; color: var(--text-muted); min-width: 70px; text-align: center;}
                    .music-search-box { width: 100%; background: transparent; border: 1px solid var(--border-color); border-radius: 8px; padding: 4px 10px; color: var(--text-main); font-size: 13px; outline: none; margin-bottom: 8px; box-sizing: border-box;}
                    .music-search-box:focus { border-color: #4F9CF7; }
                    .music-search-box::placeholder { color: var(--text-muted); }
                    .lyric-display { text-align: center; font-size: 13px; color: var(--text-muted); height: 24px; line-height: 24px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px; transition: 0.3s; }
                    .lyric-display.playing { color: var(--text-main); }
                    .music-item-active { background: rgba(79, 156, 247, 0.15); color: var(--text-main); border-radius: 6px; }
                </style>

                <div class="player-panel" style="padding: 6px 0;">
                    <div class="player-progress-bar" id="playerProgressBar"><div class="progress-fill" id="progressFill"></div></div>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted);">
                        <span id="currentTimeDisplay">0:00</span><span id="totalTimeDisplay">0:00</span>
                    </div>
                    <div class="lyric-display" id="lyricDisplay">🎵 准备好享受音乐了...</div>
                    <div class="player-controls">
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <button class="mode-btn list active" id="modeBtn"><i class="fa-solid fa-repeat"></i></button>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <button class="ctrl-btn" id="prevTrackBtn"><i class="fa-solid fa-backward-step"></i></button>
                            <button class="ctrl-btn" id="playPauseBtn" style="font-size: 20px;"><i class="fa-solid fa-circle-play"></i></button>
                            <button class="ctrl-btn" id="nextTrackBtn"><i class="fa-solid fa-forward-step"></i></button>
                        </div>
                        <div class="volume-container" style="display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-volume-high" style="color: var(--text-muted); font-size: 14px;"></i>
                            <input type="range" class="vol-slider" id="musicVolumeSlider" min="0" max="1" step="0.01" value="0.5">
                        </div>
                    </div>
                </div>

                <input type="text" class="music-search-box" id="musicSearchInput" placeholder="搜索歌曲名称...">
                <div class="music-item-container" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px; max-height: 130px; overflow-y: auto; padding-right: 4px;">
                    ${songs.map((name, index) => `
                        <div class="music-item" data-index="${index}" style="padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; color: var(--text-muted);">
                            <i class="fa-regular fa-circle-play" style="margin-right: 8px; font-size: 12px; color: var(--text-muted);"></i>
                            <span class="song-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex:1;">${name.replace(/\.mp3$/i, '')}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            // 绑定播放器事件 (保持原版逻辑)
            const progressBar = document.getElementById('playerProgressBar');
            const progressFill = document.getElementById('progressFill');
            const currentTimeDisplay = document.getElementById('currentTimeDisplay');
            const totalTimeDisplay = document.getElementById('totalTimeDisplay');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const prevBtnCtrl = document.getElementById('prevTrackBtn');
            const nextBtnCtrl = document.getElementById('nextTrackBtn');
            const modeBtn = document.getElementById('modeBtn');
            const lyricDisplay = document.getElementById('lyricDisplay');
            const searchInput = document.getElementById('musicSearchInput');
            volumeSlider = document.getElementById('musicVolumeSlider');

            function playSong(index) {
                if (index < 0 || index >= allSongs.length) return;
                currentSongIndex = index;
                const songName = allSongs[index];
                audioPlayer.src = `../../../data-base/music/${songName}`;
                audioPlayer.play();
                
                document.querySelectorAll('.music-item').forEach((el, i) => {
                    el.classList.toggle('music-item-active', i === index);
                    el.style.color = (i === index) ? 'var(--text-main)' : 'var(--text-muted)';
                });
                playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
                lyricDisplay.textContent = `🎵 正在播放: ${songName.replace(/\.mp3$/i, '')}`;
                lyricDisplay.className = 'lyric-display playing';
            }

            audioPlayer.ontimeupdate = function() {
                if (!isNaN(audioPlayer.duration)) {
                    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
                    progressFill.style.width = percent + '%';
                    const curMin = Math.floor(audioPlayer.currentTime / 60);
                    const curSec = Math.floor(audioPlayer.currentTime % 60);
                    currentTimeDisplay.textContent = `${curMin}:${curSec.toString().padStart(2, '0')}`;
                    const totMin = Math.floor(audioPlayer.duration / 60);
                    const totSec = Math.floor(audioPlayer.duration % 60);
                    totalTimeDisplay.textContent = `${totMin}:${totSec.toString().padStart(2, '0')}`;
                }
            };

            progressBar.onclick = function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const clickPercent = x / rect.width;
                if (!isNaN(audioPlayer.duration)) audioPlayer.currentTime = clickPercent * audioPlayer.duration;
            };

            playPauseBtn.onclick = () => {
                if (!audioPlayer.src) { playSong(0); return; }
                if (audioPlayer.paused) { audioPlayer.play(); playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>'; } 
                else { audioPlayer.pause(); playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>'; }
            };
            
            prevBtnCtrl.onclick = () => { if(allSongs.length) playSong((currentSongIndex - 1 + allSongs.length) % allSongs.length); };
            nextBtnCtrl.onclick = () => { if(allSongs.length) playSong((currentSongIndex + 1) % allSongs.length); };
            
            modeBtn.onclick = function() {
                if (playMode === 'list') { playMode = 'single'; this.innerHTML = '<i class="fa-solid fa-repeat-1"></i>'; } 
                else { playMode = 'list'; this.innerHTML = '<i class="fa-solid fa-repeat"></i>'; }
            };
            
            audioPlayer.onended = function() {
                playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                lyricDisplay.className = 'lyric-display';
                if (playMode === 'single') { audioPlayer.play(); } else { nextBtnCtrl.click(); }
            };
            volumeSlider.oninput = function() { audioPlayer.volume = parseFloat(this.value); };
            searchInput.oninput = function() {
                const val = this.value.toLowerCase();
                document.querySelectorAll('.music-item').forEach(el => {
                    const name = el.querySelector('.song-name').textContent.toLowerCase();
                    el.style.display = name.includes(val) ? 'flex' : 'none';
                });
            };
            document.querySelectorAll('.music-item').forEach(el => {
                el.onclick = function() { playSong(parseInt(this.getAttribute('data-index'))); };
            });

        }, 200);
    }

    loadHomeData();
})();