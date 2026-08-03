/* 
内容：主页全功能逻辑
文件目录：JASPERBLOG/modular-computer/home/script.js
*/
(function() {
    "use strict";
    console.log("Home JS 已启动");

    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    const nextBtn = document.getElementById('carouselNext');
    const prevBtn = document.getElementById('carouselPrev');
    const historyList = document.getElementById('historyList');
    const announcementList = document.getElementById('announcementList');
    const musicListContainer = document.getElementById('musicListContainer');

    // 获取全局路由函数
    const navigateTo = (module, targetTitle) => {
        // 如果只是普通路由跳转，不传 target
        if (!targetTitle) {
            const targetLi = document.querySelector(`[data-module="${module}"]`);
            if (targetLi) targetLi.click();
            return;
        }
        // 如果是带着文章标题跳转分类页
        if (module === 'categories' && targetTitle) {
            // 利用 URL 参数传递目标标题
            window.location.href = `/modular-computer/categories/index.html?target=${encodeURIComponent(targetTitle)}`;
        }
    };

    let allSongs = [];
    let currentSongIndex = 0;
    let playMode = 'list';
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;
    let volumeSlider = null;

    async function loadHomeData() {
        try {
            const catalogRes = await fetch('/data-base/catalog.json');
            if (!catalogRes.ok) throw new Error('数据加载失败');
            const catalogData = await catalogRes.json();

            const posts = catalogData.posts || [];
            const announcements = catalogData.announcements || [];

            if (announcements.length > 0) {
                announcementList.innerHTML = announcements.map(text => `<p style="margin:4px 0; color:var(--text-main);">${text}</p>`).join('');
            } else {
                announcementList.innerHTML = '<p style="color:var(--text-muted);">暂无公告</p>';
            }

            if (posts.length > 0) {
                const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // 【核心修改】：去掉 <a> 标签，恢复用 navigateTo 携带 target 参数
                historyList.innerHTML = sortedPosts.map(post => `
                    <li class="history-link" data-title="${post.title}" style="cursor:pointer; transition:0.2s; color:var(--text-muted); list-style:none; margin-bottom:8px;">
                        · ${post.title}
                    </li>
                `).join('');
                
                document.querySelectorAll('.history-link').forEach(el => {
                    el.onclick = function() {
                        const title = this.getAttribute('data-title');
                        // 找到对应的文章对象
                        const targetPost = sortedPosts.find(p => p.title === title);
                        if (targetPost) {
                            // 调用路由函数，携带目标标题
                            navigateTo('categories', targetPost.title);
                        } else {
                            navigateTo('categories');
                        }
                    };
                    el.onmouseenter = function() { this.style.color = 'var(--text-main)'; };
                    el.onmouseleave = function() { this.style.color = ''; };
                });
                
                renderCarouselWithImage(sortedPosts);
            } else {
                historyList.innerHTML = '<li style="color:var(--text-muted);">暂无文章</li>';
            }

            if (catalogData.music && catalogData.music.length > 0) {
                allSongs = catalogData.music;
                renderMusicPlayerUI(catalogData.music);
            } else {
                musicListContainer.innerHTML = '<p style="color:var(--text-muted);">暂无音乐数据</p>';
            }

        } catch (error) {
            console.error("发生严重错误:", error);
            if(announcementList) announcementList.innerHTML = '<p style="color:var(--text-muted);">数据加载失败</p>';
        }
    }
    
    let currentSlide = 0;
    function renderCarouselWithImage(posts) {
        // 【核心修改】：去掉 <a> 标签，恢复用 navigateTo 携带 target 参数
        track.innerHTML = posts.map((post) => {
            const imgPath = post.cover || ''; 
            return `
                <li class="carousel-slide" data-title="${post.title}" style="cursor:pointer;">
                    <div class="slide-bg" style="background-image: url('${imgPath}'); background-color: var(--bg-card);"></div>
                    <div class="slide-content-overlay">
                        <div class="slide-text">
                            <h2 style="color:#ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">${post.title}</h2>
                            <p style="color:#ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.8); opacity:1;">${post.subtitle || post.category}</p>
                            <div class="click-hint" style="margin-top: 10px; font-size: 12px; opacity: 0.6; color:#ffffff;">点击查看文章</div>
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        document.querySelectorAll('.carousel-slide').forEach(el => {
            el.onclick = function() {
                const title = this.getAttribute('data-title');
                const targetPost = posts.find(p => p.title === title);
                if (targetPost) {
                    navigateTo('categories', targetPost.title);
                } else {
                    navigateTo('categories');
                }
            };
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
    // 【全功能 UI 播放器渲染】(极速流式启动、高保真版本)
    // ==========================================================
    function renderMusicPlayerUI(songs) {
        requestAnimationFrame(function() {
            musicListContainer.innerHTML = `
                <div class="player-panel">
                    <div class="player-progress-bar" id="playerProgressBar"><div class="progress-fill" id="progressFill"></div></div>
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); flex-shrink: 0;">
                        <span id="currentTimeDisplay">0:00</span><span id="totalTimeDisplay">0:00</span>
                    </div>
                    <div class="lyric-display" id="lyricDisplay" style="flex-shrink: 0;">准备好享受音乐了...</div>
                    
                    <div class="player-controls" style="flex-shrink: 0;">
                        <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap; justify-content: center;">
                            <button class="sound-quality-btn active" data-quality="original">原声</button>
                            <button class="sound-quality-btn" data-quality="bass">重低音</button>
                            <button class="sound-quality-btn" data-quality="vocal">人声</button>
                            <button class="sound-quality-btn" data-quality="atmos">全景声</button>
                            <button class="sound-quality-btn" data-quality="crystal">清澈</button>
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

                    <input type="text" class="music-search-box" id="musicSearchInput" placeholder="搜索歌曲名称..." style="flex-shrink: 0;">
                    
                    <div class="music-item-container">
                        ${songs.map((name, index) => `
                            <div class="music-item" data-index="${index}">
                                <i class="fa-regular fa-circle-play" style="margin-right: 8px; font-size: 12px; color: var(--text-muted);"></i>
                                <span class="song-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex:1;">${name.replace(/\.mp3$/i, '')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            setTimeout(function() {
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

                const qualityBtns = document.querySelectorAll('.sound-quality-btn');

                let audioCtx = null;
                let source = null;
                let bassFilter = null;
                let trebleFilter = null;
                let vocalFilter = null;
                let panner = null;

                function initAudioContext() {
                    if (!audioCtx) {
                        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        source = audioCtx.createMediaElementSource(audioPlayer);
                        
                        bassFilter = audioCtx.createBiquadFilter();
                        bassFilter.type = 'lowshelf';
                        bassFilter.frequency.value = 100;
                        bassFilter.gain.value = 0;

                        trebleFilter = audioCtx.createBiquadFilter();
                        trebleFilter.type = 'highshelf';
                        trebleFilter.frequency.value = 10000;
                        trebleFilter.gain.value = 0;

                        vocalFilter = audioCtx.createBiquadFilter();
                        vocalFilter.type = 'peaking';
                        vocalFilter.frequency.value = 1000;
                        vocalFilter.Q.value = 0.7;
                        vocalFilter.gain.value = 0;

                        panner = audioCtx.createPanner();
                        panner.panningModel = 'equalpower';
                        panner.setPosition(0, 0, 0);

                        source.connect(bassFilter);
                        bassFilter.connect(trebleFilter);
                        trebleFilter.connect(vocalFilter);
                        vocalFilter.connect(panner);
                        panner.connect(audioCtx.destination);
                    }
                    if (audioCtx.state === 'suspended') audioCtx.resume();
                }

                function applyQuality(mode) {
                    initAudioContext();
                    switch(mode) {
                        case 'original':
                            bassFilter.gain.value = 0; trebleFilter.gain.value = 0; vocalFilter.gain.value = 0; panner.setPosition(0, 0, 0); break;
                        case 'bass':
                            bassFilter.gain.value = 10; trebleFilter.gain.value = 0; vocalFilter.gain.value = -2; panner.setPosition(0, 0, 0); break;
                        case 'vocal':
                            bassFilter.gain.value = -4; trebleFilter.gain.value = 2; vocalFilter.gain.value = 8; panner.setPosition(0, 0, 0); break;
                        case 'atmos':
                            bassFilter.gain.value = 4; trebleFilter.gain.value = 6; vocalFilter.gain.value = -2; panner.setPosition(0, -1.5, 0); break;
                        case 'crystal':
                            bassFilter.gain.value = -8; trebleFilter.gain.value = 10; vocalFilter.gain.value = 2; panner.setPosition(0, 0, 0); break;
                    }
                    qualityBtns.forEach(b => b.classList.remove('active'));
                    document.querySelector(`.sound-quality-btn[data-quality="${mode}"]`).classList.add('active');
                }

                qualityBtns.forEach(btn => {
                    btn.addEventListener('click', function() { applyQuality(this.dataset.quality); });
                });

                // 极简播放函数（完全基于你提供的参考）
                function playSong(index) {
                    if (index < 0 || index >= allSongs.length) return;
                    currentSongIndex = index;
                    const songName = allSongs[index];
                    
                    audioPlayer.preload = 'metadata'; 
                    audioPlayer.src = `/data-base/music/${songName}`;
                    audioPlayer.load();
                    audioPlayer.play().catch(() => {});
                    
                    document.querySelectorAll('.music-item').forEach((el, i) => {
                        el.classList.toggle('music-item-active', i === index);
                        el.style.color = (i === index) ? 'var(--text-main)' : 'var(--text-muted)';
                    });
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
                    lyricDisplay.textContent = `正在播放: ${songName.replace(/\.mp3$/i, '')}`;
                    lyricDisplay.className = 'lyric-display playing';
                    applyQuality('original');
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
                    if (audioPlayer.paused) {
                        audioPlayer.play();
                        playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
                        lyricDisplay.className = 'lyric-display playing';
                    } else {
                        audioPlayer.pause();
                        playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                        lyricDisplay.className = 'lyric-display';
                    }
                };
                
                prevBtnCtrl.onclick = () => { if(allSongs.length) playSong((currentSongIndex - 1 + allSongs.length) % allSongs.length); };
                nextBtnCtrl.onclick = () => { if(allSongs.length) playSong((currentSongIndex + 1) % allSongs.length); };
                
                if (modeBtn) {
                    modeBtn.addEventListener('click', () => {
                        if (playMode === 'list') {
                            playMode = 'single';
                            modeBtn.innerHTML = '<i class="fa-solid fa-repeat-1"></i>';
                        } else {
                            playMode = 'list';
                            modeBtn.innerHTML = '<i class="fa-solid fa-repeat"></i>';
                        }
                    });
                }
                
                audioPlayer.onended = function() {
                    playPauseBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
                    lyricDisplay.className = 'lyric-display';
                    if (playMode === 'single') {
                        audioPlayer.play();
                    } else {
                        nextBtnCtrl.click();
                    }
                };
                volumeSlider.oninput = function() { audioPlayer.volume = parseFloat(this.value); };
                searchInput.oninput = function() {
                    const val = this.value.toLowerCase();
                    document.querySelectorAll('.music-item').forEach(el => {
                        const name = el.querySelector('.song-name').textContent.toLowerCase();
                        el.style.display = name.includes(val) ? 'flex' : 'none';
                    });
                };
                
                // 防错延迟绑定点击播放
                setTimeout(() => {
                    document.querySelectorAll('.music-item').forEach(el => {
                        el.onclick = function() { 
                            const index = parseInt(this.getAttribute('data-index'));
                            playSong(index);
                        };
                    });
                }, 50);

            }, 100);
        });
    }

    loadHomeData();
})();