/* 
内容：手表端主页逻辑 (极简流式列表)
文件目录：JASPERBLOG/modular-watch/home/script.js
*/
(function() {
    "use strict";
    
    // DOM
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    const historyList = document.getElementById('watchHistoryList');
    const announcementDiv = document.getElementById('watchAnnouncement');
    const songNameSpan = document.getElementById('watchSongName');

    // 播放器 DOM
    const playBtn = document.getElementById('watchPlay');
    const prevBtn = document.getElementById('watchPrev');
    const nextBtn = document.getElementById('watchNext');

    // 路由
    const navigateTo = (module) => {
        const targetLi = document.querySelector(`[data-module="${module}"]`);
        if (targetLi) targetLi.click();
    };

    let allSongs = [];
    let currentSongIndex = 0;
    const audioPlayer = new Audio();
    audioPlayer.volume = 0.5;

    async function loadWatchHomeData() {
        try {
            const catalogRes = await fetch('/data-base/catalog.json');
            if (!catalogRes.ok) throw new Error('catalog.json 读取失败');
            const catalogData = await catalogRes.json();

            // 公告
            if (catalogData.announcements && catalogData.announcements.length > 0) {
                announcementDiv.innerHTML = catalogData.announcements[0];
            } else {
                announcementDiv.textContent = '暂无公告';
            }

            // 历史发布
            const posts = catalogData.posts || [];
            if (posts.length > 0) {
                const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                historyList.innerHTML = sortedPosts.slice(0, 5).map(post => 
                    `<li onclick="navigateTo('classification')">· ${post.title}</li>`
                ).join('');
            }

            // 轮播图
            if (posts.length > 0) {
                track.innerHTML = posts.slice(0, 4).map(post => `
                    <li class="carousel-slide" style="background-image: url('${post.cover || ''}'); background-color: #333; cursor:pointer;" onclick="navigateTo('classification')">
                        <div class="text">
                            <h3>${post.title}</h3>
                            <p>${post.subtitle || ''}</p>
                        </div>
                    </li>
                `).join('');

                indicators.innerHTML = posts.slice(0, 4).map((_, i) => `<button class="indicator ${i === 0 ? 'active' : ''}"></button>`).join('');

                let currentSlide = 0;
                const updateCarousel = () => {
                    const width = track.firstElementChild.getBoundingClientRect().width;
                    track.style.transform = `translateX(-${width * currentSlide}px)`;
                    document.querySelectorAll('.indicator').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
                };
                setInterval(() => {
                    const postsLen = Math.min(posts.length, 4);
                    if(postsLen > 0) { currentSlide = (currentSlide + 1) % postsLen; updateCarousel(); }
                }, 4000);
            }

            // 音乐列表
            if (catalogData.music && catalogData.music.length > 0) {
                allSongs = catalogData.music;
            }

        } catch (e) {
            console.error("手表数据加载失败:", e);
        }
    }

    // 播放控制
    function playSong(index) {
        if (index < 0 || index >= allSongs.length) return;
        currentSongIndex = index;
        audioPlayer.src = `/data-base/music/${allSongs[index]}`;
        audioPlayer.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        songNameSpan.textContent = allSongs[index].replace(/\.mp3$/i, '');
    }

    playBtn.onclick = () => {
        if (!audioPlayer.src) { if(allSongs.length) playSong(0); return; }
        if (audioPlayer.paused) { audioPlayer.play(); playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'; } 
        else { audioPlayer.pause(); playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; }
    };
    nextBtn.onclick = () => { if(allSongs.length) playSong((currentSongIndex + 1) % allSongs.length); };
    prevBtn.onclick = () => { if(allSongs.length) playSong((currentSongIndex - 1 + allSongs.length) % allSongs.length); };
    audioPlayer.onended = () => {
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        songNameSpan.textContent = '已结束';
    };

    // 启动
    loadWatchHomeData();

})();