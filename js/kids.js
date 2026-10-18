/**
 * Sahabat Muslim Kids — Controller
 * Fitur:
 * 1. Filter Kategori (Semua, Aqidah & Tauhid, Kisah Nabi, Hijaiyah, Sains & Alam, Aktivitas)
 * 2. Pencarian Instan (Nama channel, materi, tag)
 * 3. YouTube Embed Video Player Bebas Rekomendasi Luar (youtube-nocookie.com)
 * 4. Timer Batas Menonton (Parental Screen Time Control: 15m, 30m, 45m, 60m)
 * 5. Favorit Tersimpan di LocalStorage
 */

(function () {
    const STATE = {
        activeCategory: "all",
        searchQuery: "",
        favorites: [],
        activeVideo: null,
        timerMinutes: 0,
        timerRemainingSec: 0,
        timerInterval: null
    };

    function init() {
        loadFavorites();
        loadStoredTimer();
        setupEvents();
        renderStats();
        renderChannelGrid();
        renderTimerUI();
        loadChannelsFromApi();

        window.addEventListener('sm:sync-applied', () => {
            loadFavorites();
            loadStoredTimer();
            renderChannelGrid();
            renderTimerUI();
        });
    }

    async function loadChannelsFromApi() {
        try {
            const res = await fetch('/api/kids/channels');
            if (res.ok) {
                const data = await res.json();
                if (data.ok && Array.isArray(data.channels) && data.channels.length > 0) {
                    window.KIDS_CHANNELS = data.channels;
                    renderStats();
                    renderChannelGrid();
                }
            }
        } catch (e) {
            console.warn('Kids channels API offline, using embedded fallback data', e);
        }
    }

    function loadFavorites() {
        try {
            const saved = localStorage.getItem('sm_kids_favorites');
            if (saved) {
                STATE.favorites = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Gagal membaca favorit anak', e);
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem('sm_kids_favorites', JSON.stringify(STATE.favorites));
            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        } catch (e) {
            console.error('Gagal menyimpan favorit', e);
        }
    }

    function loadStoredTimer() {
        try {
            const saved = localStorage.getItem('sm_kids_screentime');
            if (saved) {
                STATE.timerMinutes = parseInt(saved, 10) || 0;
            }
        } catch (e) {}
    }

    function setupEvents() {
        // Search input
        const searchInput = document.getElementById('kids-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                STATE.searchQuery = e.target.value.trim().toLowerCase();
                renderChannelGrid();
            });
        }

        // Category filter buttons
        document.querySelectorAll('.kids-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-cat');
                setCategory(cat);
            });
        });
    }

    function setCategory(cat) {
        STATE.activeCategory = cat;
        document.querySelectorAll('.kids-cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
        });
        renderChannelGrid();
    }

    function renderStats() {
        const countEl = document.getElementById('kids-channels-count');
        if (countEl && typeof KIDS_CHANNELS !== 'undefined') {
            countEl.textContent = `${KIDS_CHANNELS.length} Channel Terkurasi`;
        }
    }

    function renderChannelGrid() {
        const gridEl = document.getElementById('kids-channels-grid');
        const emptyEl = document.getElementById('kids-empty-state');
        if (!gridEl || typeof KIDS_CHANNELS === 'undefined') return;

        let filtered = KIDS_CHANNELS.filter(item => {
            // Category filter
            if (STATE.activeCategory === 'favorites') {
                return STATE.favorites.includes(item.id);
            }
            if (STATE.activeCategory !== 'all' && item.category !== STATE.activeCategory) {
                return false;
            }
            // Search filter
            if (STATE.searchQuery) {
                const q = STATE.searchQuery;
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchDesc = item.description.toLowerCase().includes(q);
                const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
                return matchTitle || matchDesc || matchTags;
            }
            return true;
        });

        if (filtered.length === 0) {
            gridEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';

        let html = '';
        filtered.forEach(item => {
            const isFav = STATE.favorites.includes(item.id);
            html += `
                <div class="kids-card" data-id="${item.id}">
                    <div class="kids-card-header">
                        <div class="kids-avatar-box" style="border-color: ${item.badgeColor};">
                            <span class="kids-avatar-emoji">${item.avatar}</span>
                        </div>
                        <div class="kids-header-info">
                            <h3 class="kids-channel-title">${escapeHtml(item.title)}</h3>
                            <span class="kids-handle-text">${escapeHtml(item.handle)}</span>
                        </div>
                        <button type="button" class="kids-btn-fav ${isFav ? 'is-fav' : ''}" onclick="window.KidsApp.toggleFavorite('${item.id}', event)" title="Simpan ke Favorit">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                    </div>

                    <div class="kids-card-body">
                        <span class="kids-cat-pill" style="background: ${item.badgeColor}15; color: ${item.badgeColor}; border-color: ${item.badgeColor}40;">
                            ${escapeHtml(item.categoryLabel)}
                        </span>
                        <p class="kids-channel-desc">${escapeHtml(item.description)}</p>
                        
                        <div class="kids-tags-row">
                            ${item.tags.map(t => `<span class="kids-mini-tag">#${escapeHtml(t)}</span>`).join('')}
                        </div>
                    </div>

                    <div class="kids-card-footer">
                        <button type="button" class="kids-btn-watch" onclick="window.KidsApp.openPlayer('${item.id}')">
                            <span>▶️</span> Putar Video
                        </button>
                    </div>
                </div>
            `;
        });

        gridEl.innerHTML = html;
    }

    function toggleFavorite(id, event) {
        if (event) event.stopPropagation();
        const idx = STATE.favorites.indexOf(id);
        if (idx === -1) {
            STATE.favorites.push(id);
            showToast('Ditambahkan ke koleksi Favorit! ❤️');
        } else {
            STATE.favorites.splice(idx, 1);
            showToast('Dihapus dari Favorit');
        }
        saveFavorites();
        renderChannelGrid();
    }

    // -------------------------------------------------------------
    // VIDEO PLAYER & EMBED MODAL
    // -------------------------------------------------------------
    function openPlayer(id) {
        const item = KIDS_CHANNELS.find(c => c.id === id);
        if (!item) return;

        STATE.activeVideo = item;
        STATE.activeVideoId = item.featuredVideoId;
        const modal = document.getElementById('kids-player-modal');
        const titleEl = document.getElementById('player-modal-title');
        const channelEl = document.getElementById('player-modal-channel');
        const iframeEl = document.getElementById('player-modal-iframe');

        if (titleEl) titleEl.textContent = item.featuredTitle;
        if (channelEl) channelEl.textContent = `${item.title} (${item.handle})`;

        // Use privacy-enhanced YouTube embed with recommended params
        if (iframeEl) {
            iframeEl.src = `https://www.youtube-nocookie.com/embed/${item.featuredVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        }

        // Fetch & render playlist for this channel
        fetchChannelPlaylist(item);

        if (modal) modal.classList.add('active');

        // Start screen time timer if set
        if (STATE.timerMinutes > 0 && !STATE.timerInterval) {
            startScreenTimeTimer();
        }
    }

    async function fetchChannelPlaylist(item) {
        const playlistContainer = document.getElementById('player-playlist-items');
        if (!playlistContainer) return;

        // Show loading state
        playlistContainer.innerHTML = `
            <div style="font-size: 0.8rem; color: #9ca3af; padding: 0.5rem;">
                ⏳ Memuat daftar video terbaru dari ${escapeHtml(item.title)}...
            </div>
        `;

        try {
            const res = await fetch(`/api/kids/videos?channel_id=${encodeURIComponent(item.id)}`);
            const json = await res.json();
            const videos = (json.ok && Array.isArray(json.data) && json.data.length > 0)
                ? json.data
                : (item.videos || [{ videoId: item.featuredVideoId, title: item.featuredTitle, thumbnail: `https://i.ytimg.com/vi/${item.featuredVideoId}/hqdefault.jpg` }]);

            renderPlaylistItems(videos, item);
        } catch (e) {
            console.warn('Gagal fetch live videos, fallback ke default:', e);
            const fallbackVideos = item.videos || [{ videoId: item.featuredVideoId, title: item.featuredTitle, thumbnail: `https://i.ytimg.com/vi/${item.featuredVideoId}/hqdefault.jpg` }];
            renderPlaylistItems(fallbackVideos, item);
        }
    }

    function renderPlaylistItems(videos, channelItem) {
        const playlistContainer = document.getElementById('player-playlist-items');
        if (!playlistContainer) return;

        let html = '';
        videos.forEach(v => {
            const isPlaying = (v.videoId === STATE.activeVideoId);
            html += `
                <button type="button" class="playlist-thumb-btn ${isPlaying ? 'active' : ''}" onclick="window.KidsApp.playVideo('${v.videoId}', '${escapeHtml(v.title).replace(/'/g, "\\'")}')">
                    <img src="${v.thumbnail || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}" alt="${escapeHtml(v.title)}" class="playlist-thumb-img" onerror="this.src='https://via.placeholder.com/160x90/000/fff?text=Video+Sunnah'">
                    <span class="playlist-thumb-title">${isPlaying ? '▶️ ' : ''}${escapeHtml(v.title)}</span>
                </button>
            `;
        });

        playlistContainer.innerHTML = html;
    }

    function playVideo(videoId, title) {
        STATE.activeVideoId = videoId;
        const titleEl = document.getElementById('player-modal-title');
        const iframeEl = document.getElementById('player-modal-iframe');

        if (titleEl) titleEl.textContent = title;
        if (iframeEl) {
            iframeEl.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        }

        // Highlight active thumbnail
        document.querySelectorAll('.playlist-thumb-btn').forEach(btn => {
            const isCurr = btn.getAttribute('onclick').includes(videoId);
            btn.classList.toggle('active', isCurr);
        });
    }

    function closePlayer() {
        const modal = document.getElementById('kids-player-modal');
        const iframeEl = document.getElementById('player-modal-iframe');
        if (iframeEl) iframeEl.src = '';
        if (modal) modal.classList.remove('active');
        STATE.activeVideo = null;
    }

    // -------------------------------------------------------------
    // PARENTAL SCREEN TIME TIMER
    // -------------------------------------------------------------
    function setScreenTimeLimit(minutes) {
        STATE.timerMinutes = parseInt(minutes, 10) || 0;
        localStorage.setItem('sm_kids_screentime', String(STATE.timerMinutes));
        if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
            window.smSync.scheduleSync();
        }
        
        if (STATE.timerInterval) {
            clearInterval(STATE.timerInterval);
            STATE.timerInterval = null;
        }

        if (STATE.timerMinutes > 0) {
            STATE.timerRemainingSec = STATE.timerMinutes * 60;
            showToast(`Batas menonton diatur: ${STATE.timerMinutes} menit ⏱️`);
        } else {
            STATE.timerRemainingSec = 0;
            showToast('Batas waktu menonton dimatikan (Bebas)');
        }

        renderTimerUI();
    }

    function startScreenTimeTimer() {
        if (STATE.timerMinutes <= 0) return;
        if (STATE.timerRemainingSec <= 0) {
            STATE.timerRemainingSec = STATE.timerMinutes * 60;
        }

        if (STATE.timerInterval) clearInterval(STATE.timerInterval);

        STATE.timerInterval = setInterval(() => {
            STATE.timerRemainingSec--;
            renderTimerUI();

            if (STATE.timerRemainingSec <= 0) {
                clearInterval(STATE.timerInterval);
                STATE.timerInterval = null;
                onScreenTimeUp();
            }
        }, 1000);
    }

    function onScreenTimeUp() {
        closePlayer();
        const alertModal = document.getElementById('kids-timeout-modal');
        if (alertModal) alertModal.classList.add('active');
    }

    function closeTimeoutModal() {
        const alertModal = document.getElementById('kids-timeout-modal');
        if (alertModal) alertModal.classList.remove('active');
    }

    function renderTimerUI() {
        const timerBadge = document.getElementById('screentime-display');
        const timerSelect = document.getElementById('screentime-select');

        if (timerSelect) {
            timerSelect.value = String(STATE.timerMinutes);
        }

        if (!timerBadge) return;

        if (STATE.timerMinutes === 0) {
            timerBadge.textContent = '⏱️ Batas: Tanpa Batas';
            timerBadge.className = 'screentime-badge badge-off';
        } else if (STATE.timerRemainingSec > 0) {
            const m = Math.floor(STATE.timerRemainingSec / 60);
            const s = STATE.timerRemainingSec % 60;
            timerBadge.textContent = `⏳ Sisa: ${m}:${String(s).padStart(2, '0')}`;
            timerBadge.className = 'screentime-badge badge-active';
        } else {
            timerBadge.textContent = `⏱️ Batas: ${STATE.timerMinutes} Menit`;
            timerBadge.className = 'screentime-badge badge-ready';
        }
    }

    // -------------------------------------------------------------
    // HELPERS & TOAST
    // -------------------------------------------------------------
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function showToast(msg) {
        let toast = document.getElementById('kids-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'kids-toast';
            toast.className = 'kids-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
    }

    // EXPOSE PUBLIC API
    window.KidsApp = {
        init,
        setCategory,
        toggleFavorite,
        openPlayer,
        closePlayer,
        playVideo,
        setScreenTimeLimit,
        closeTimeoutModal
    };

    document.addEventListener('DOMContentLoaded', init);
})();
