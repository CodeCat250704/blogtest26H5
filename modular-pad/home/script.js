/* 
内容：平板端主页逻辑 (数据读取、轮播图、时间轴、播放器)
文件目录：JASPERBLOG/modular-pad/home/script.js
*/
(function() {
    "use strict";
    
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    const nextBtn = document.getElementById('carouselNext');
    const prevBtn = document.getElementById('carouselPrev');
    const historyList = document.getElementById('historyList');
    const announcementList = document.getElementById('announcementList');
    const musicListContainer = document.getElementById('musicListContainer');

    const navigateTo = (module) => {
        const targetLi = document.querySelector(`[data-module="${module}"]`);
        if (targetLi) targetLi.click();
    };

    let allSongs = [];
    let currentSongIndex = 0;
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;

    async function loadPadHomeData() {
        try {
            const catalogRes = await fetch('/data-base/catalog.json');
            if (!catalogRes.ok) throw new Error('catalog.json 读取失败');
            const catalogData = await catalogRes.json();

            // 公告板
            if (catalogData.announcements) {
                announcementList.innerHTML = catalogData.announcements.map(text => `<p style="margin:4px 0;">${text}</p>`).join('');
            }

            // 历史发布 & 轮播图
            const posts = catalogData.posts || [];
            if (posts.length > 0) {
                const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                historyList.innerHTML = sortedPosts.map(post => 
                    `<li class="history-link" data-title="${post.title}">· ${post.title}</li>`
                ).join('');
                
                document.querySelectorAll('.history-link').forEach(el => {
                    el.onclick = () => { navigateTo('classification'); };
                });

                renderPadCarousel(sortedPosts);
            }

            // 音乐
            if (catalogData.music && catalogData.music.length > 0) {
                allSongs = catalogData.music;
                renderPadMusicUI(catalogData.music);
            }
        } catch (e) {
            console.error("平板数据加载失败:", e);
        }
    }

    function renderPadCarousel(posts) {
        track.innerHTML = posts.map(post => `
            <li class="carousel-slide" style="cursor:pointer;">
                <div class="slide-bg" style="background-image: url('${post.cover || ''}'); background-color: #333;"></div>
                <div class="slide-content-overlay">
                    <h2>${post.title}</h2>
                    <p>${post.subtitle || post.category}</p>
                </div>
            </li>
        `).join('');

        document.querySelectorAll('.carousel-slide').forEach(el => {
            el.onclick = () => { navigateTo('classification'); };
        });

        indicators.innerHTML = posts.map((_, i) => `<button class="indicator ${i === 0 ? 'active' : ''}"></button>`).join('');

        let currentSlide = 0;
        const updateCarousel = () => {
            const width = track.firstElementChild.getBoundingClientRect().width;
            track.style.transform = `translateX(-${width * currentSlide}px)`;
            document.querySelectorAll('.indicator').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        };

        nextBtn.onclick = () => { currentSlide = (currentSlide + 1) % posts.length; updateCarousel(); };
        prevBtn.onclick = () => { currentSlide = (currentSlide - 1 + posts.length) % posts.length; updateCarousel(); };
        setInterval(() => nextBtn.click(), 5000);
    }

    // 简化版播放器渲染
    function renderPadMusicUI(songs) {
        musicListContainer.innerHTML = `
            <div class="player-panel">
                <div class="player-progress-bar" style="height:4px;background:rgba(255,255,255,0.2);border-radius:2px;cursor:pointer;position:relative;margin:6px 0;">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="player-controls">
                    <div style="display:flex;gap:12px;align-items:center;margin:0 auto;">
                        <button class="ctrl-btn" id="prevTrackBtn"><i class="fa-solid fa-backward-step"></i></button>
                        <button class="ctrl-btn" id="playPauseBtn" style="font-size:22px;"><i class="fa-solid fa-circle-play"></i></button>
                        <button class="ctrl-btn" id="nextTrackBtn"><i class="fa-solid fa-forward-step"></i></button>
                    </div>
                </div>
            </div>
            <div style="margin-top: 12px; max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
                ${songs.map((name, i) => `
                    <div class="music-item" data-index="${i}">
                        <i class="fa-regular fa-circle-play"></i>
                        <span>${name.replace(/\.mp3$/i, '')}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // 简单事件绑定
        const progressFill = document.getElementById('progressFill');
        const playBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevTrackBtn');
        const nextBtn = document.getElementById('nextTrackBtn');

        function playSong(index) {
            if (index < 0 || index >= allSongs.length) return;
            currentSongIndex = index;
            audioPlayer.src = `/data-base/music/${allSongs[index]}`;
            audioPlayer.play();
            playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
            document.querySelectorAll('.music-item').forEach((el, i) => {
                el.classList.toggle('music-item-active', i === index);
            });
        }

        playBtn.onclick = () => {
            if (!audioPlayer.src) { playSong(0); return; }
            if (audioPlayer.paused) { audioPlayer.play(); playBtn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>'; } 
            else { audioPlayer.pause(); playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>'; }
        };
        nextBtn.onclick = () => { if(allSongs.length) playSong((currentSongIndex + 1) % allSongs.length); };
        prevBtn.onclick = () => { if(allSongs.length) playSong((currentSongIndex - 1 + allSongs.length) % allSongs.length); };
        
        audioPlayer.ontimeupdate = () => {
            if (!isNaN(audioPlayer.duration)) progressFill.style.width = (audioPlayer.currentTime / audioPlayer.duration) * 100 + '%';
        };
        audioPlayer.onended = () => { playBtn.innerHTML = '<i class="fa-solid fa-circle-play"></i>'; nextBtn.click(); };
        
        document.querySelectorAll('.music-item').forEach(el => {
            el.onclick = function() { playSong(parseInt(this.dataset.index)); };
        });
    }

    loadPadHomeData();
})();