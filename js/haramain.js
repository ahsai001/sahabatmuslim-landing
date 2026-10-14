/**
 * Sahabat Muslim — Logika Interaktif Video & Live Tilawah Haramain
 */

(function () {
    'use strict';

    const STATE = {
        activeStream: 'makkah',
        activeCategory: 'all',
        searchQuery: '',
        activeVideo: null,
        ambientPlaying: false,
        ambientSurah: 1,
        ambientQari: '03' // Default: Abdurrahman As-Sudais
    };

    const AMBIENT_QARIS = [
        { id: '03', name: 'Syaikh Abdurrahman As-Sudais', role: 'Imam Besar Masjidil Haram' },
        { id: '01', name: 'Syaikh Abdullah Al-Juhany', role: 'Imam Masjidil Haram' },
        { id: '06', name: 'Syaikh Yasser Al-Dossari', role: 'Imam Masjidil Haram' },
        { id: '02', name: 'Syaikh Abdul Muhsin Al-Qasim', role: 'Imam Masjid An-Nabawi' }
    ];

    let ambientAudio = null;

    function init() {
        initClocks();
        switchLiveStream('makkah');
        renderVideoList();
        initAmbientPlayer();

        // Keyboard navigation (Esc to close modal)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeVideoModal();
            }
        });
    }

    // 1. Digital Clock for Makkah & WIB
    function initClocks() {
        function update() {
            const now = new Date();

            // Makkah: UTC+3
            const makkahTimeFormatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Riyadh',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const makkahDateFormatter = new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Riyadh',
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const makkahTimeEl = document.getElementById('clock-makkah-time');
            const makkahDateEl = document.getElementById('clock-makkah-date');
            if (makkahTimeEl) makkahTimeEl.textContent = makkahTimeFormatter.format(now).replace(/\./g, ':');
            if (makkahDateEl) makkahDateEl.textContent = makkahDateFormatter.format(now);

            // WIB: UTC+7
            const wibTimeFormatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const wibDateFormatter = new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const wibTimeEl = document.getElementById('clock-wib-time');
            const wibDateEl = document.getElementById('clock-wib-date');
            if (wibTimeEl) wibTimeEl.textContent = wibTimeFormatter.format(now).replace(/\./g, ':');
            if (wibDateEl) wibDateEl.textContent = wibDateFormatter.format(now);
        }

        update();
        setInterval(update, 1000);
    }

    // 2. Live Stream Switcher
    function switchLiveStream(streamKey) {
        const stream = HARAMAIN_STREAMS[streamKey];
        if (!stream) return;

        STATE.activeStream = streamKey;

        // Toggle Buttons
        const btnMakkah = document.getElementById('btn-stream-makkah');
        const btnMadinah = document.getElementById('btn-stream-madinah');
        if (btnMakkah) btnMakkah.classList.toggle('active', streamKey === 'makkah');
        if (btnMadinah) btnMadinah.classList.toggle('active', streamKey === 'madinah');

        // Update Metadata
        const titleEl = document.getElementById('live-stream-title');
        const subEl = document.getElementById('live-stream-sub');
        const descEl = document.getElementById('live-stream-desc');
        const ytLinkEl = document.getElementById('live-stream-yt-link');
        const badgeEl = document.getElementById('live-stream-badge');

        if (titleEl) titleEl.textContent = stream.title;
        if (subEl) subEl.textContent = stream.subtitle;
        if (descEl) descEl.textContent = stream.description;
        if (ytLinkEl) ytLinkEl.href = stream.youtubeLiveUrl;
        if (badgeEl) {
            badgeEl.textContent = stream.badge;
            badgeEl.style.backgroundColor = stream.badgeColor;
        }

        // Update Iframe
        const iframe = document.getElementById('live-stream-iframe');
        if (iframe) {
            iframe.src = stream.embedUrl;
        }
    }

    function refreshLiveStream() {
        const stream = HARAMAIN_STREAMS[STATE.activeStream];
        const iframe = document.getElementById('live-stream-iframe');
        if (iframe && stream) {
            iframe.src = '';
            setTimeout(() => {
                iframe.src = `${stream.embedUrl}&t=${Date.now()}`;
            }, 150);
        }
    }

    // 3. Video Catalog Rendering & Filter
    function setCategory(catKey) {
        STATE.activeCategory = catKey;
        document.querySelectorAll('.haramain-cat-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === catKey);
        });
        renderVideoList();
    }

    function onSearchVideo(query) {
        STATE.searchQuery = (query || '').toLowerCase().trim();
        renderVideoList();
    }

    function renderVideoList() {
        const container = document.getElementById('haramain-video-grid');
        if (!container) return;

        let list = [...HARAMAIN_VIDEOS];

        // Filter Category
        if (STATE.activeCategory !== 'all') {
            list = list.filter(v => v.category === STATE.activeCategory);
        }

        // Filter Search
        if (STATE.searchQuery) {
            const q = STATE.searchQuery;
            list = list.filter(v => {
                const combined = `${v.title} ${v.imam} ${v.locationLabel} ${v.momen} ${v.tags.join(' ')}`.toLowerCase();
                return combined.includes(q);
            });
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 16px; border: 1.5px dashed var(--gray-300);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
                    <h3 style="color: var(--green-900); font-size: 1.15rem; margin-bottom: 0.35rem;">Video tidak ditemukan</h3>
                    <p style="color: var(--gray-500); font-size: 0.9rem;">Coba gunakan kata kunci lain seperti: Sudais, Dossari, Tarawih, Hujan, atau Al-Fatihah.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(v => {
            const thumbUrl = `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
            return `
            <div class="haramain-video-card" onclick="window.smHaramain.openVideoModal('${v.id}')">
                <div class="video-thumb-wrap">
                    <img src="${thumbUrl}" alt="${v.title}" loading="lazy" class="video-thumb-img">
                    <span class="video-duration-badge">${v.duration}</span>
                    <div class="video-play-overlay">
                        <div class="play-circle-icon">▶</div>
                    </div>
                </div>
                <div class="video-card-body">
                    <div class="video-card-meta">
                        <span class="video-loc-tag">${v.locationLabel}</span>
                        <span class="video-momen-tag">${v.momen}</span>
                    </div>
                    <h4 class="video-card-title">${v.title}</h4>
                    <p class="video-imam-name">🎙️ <strong>${v.imam}</strong></p>
                    <p class="video-card-desc">${v.description}</p>
                </div>
            </div>
            `;
        }).join('');
    }

    // 4. Modal Video Player
    function openVideoModal(videoId) {
        const video = HARAMAIN_VIDEOS.find(v => v.id === videoId);
        if (!video) return;

        STATE.activeVideo = video;
        const modal = document.getElementById('haramain-player-modal');
        const iframe = document.getElementById('player-modal-iframe');
        const titleEl = document.getElementById('player-modal-title');
        const imamEl = document.getElementById('player-modal-imam');
        const directLinkEl = document.getElementById('player-modal-direct-link');

        if (titleEl) titleEl.textContent = video.title;
        if (imamEl) imamEl.textContent = `${video.locationLabel} • ${video.imam} (${video.momen})`;
        if (directLinkEl) directLinkEl.href = `https://www.youtube.com/watch?v=${video.videoId}`;
        if (iframe) {
            iframe.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;
        }

        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        const modal = document.getElementById('haramain-player-modal');
        const iframe = document.getElementById('player-modal-iframe');
        if (iframe) iframe.src = '';
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        STATE.activeVideo = null;
    }

    // 5. Ambient Tilawah Mode (Audio + Visual Ka'bah)
    function initAmbientPlayer() {
        ambientAudio = new Audio();

        const selectSurah = document.getElementById('ambient-surah-select');
        const selectQari = document.getElementById('ambient-qari-select');

        if (selectSurah && window.QURAN_SURAT_LIST) {
            selectSurah.innerHTML = window.QURAN_SURAT_LIST.map(s => `
                <option value="${s.nomor}">${s.nomor}. ${s.namaLatin} (${s.nama})</option>
            `).join('');
            selectSurah.value = '1';
        }

        if (selectQari) {
            selectQari.innerHTML = AMBIENT_QARIS.map(q => `
                <option value="${q.id}">${q.name} (${q.role})</option>
            `).join('');
            selectQari.value = '03';
        }

        ambientAudio.addEventListener('ended', () => {
            // Auto-play next surah
            if (STATE.ambientSurah < 114) {
                STATE.ambientSurah++;
                if (selectSurah) selectSurah.value = STATE.ambientSurah;
                playAmbientAudio();
            } else {
                setAmbientPlayState(false);
            }
        });

        ambientAudio.addEventListener('error', () => {
            setAmbientPlayState(false);
            showToast('Gagal memutar audio tilawah ambient.');
        });
    }

    function toggleAmbientPlayer() {
        if (STATE.ambientPlaying) {
            pauseAmbientAudio();
        } else {
            playAmbientAudio();
        }
    }

    function playAmbientAudio() {
        const selectSurah = document.getElementById('ambient-surah-select');
        const selectQari = document.getElementById('ambient-qari-select');
        if (selectSurah) STATE.ambientSurah = parseInt(selectSurah.value, 10);
        if (selectQari) STATE.ambientQari = selectQari.value;

        if (!window.QURAN_SURAT_LIST) return;
        const surah = window.QURAN_SURAT_LIST.find(s => s.nomor === STATE.ambientSurah);
        if (!surah || !surah.audioFull) return;

        const audioUrl = surah.audioFull[STATE.ambientQari] || surah.audioFull['03'] || surah.audioFull['01'];
        if (!audioUrl) return;

        ambientAudio.src = audioUrl;
        ambientAudio.play().then(() => {
            setAmbientPlayState(true);
            const qariObj = AMBIENT_QARIS.find(q => q.id === STATE.ambientQari);
            showToast(`Memutar Surah ${surah.namaLatin} • ${qariObj ? qariObj.name : ''} 🎧`);
        }).catch(err => {
            console.error('Audio playback error:', err);
            setAmbientPlayState(false);
        });
    }

    function pauseAmbientAudio() {
        if (ambientAudio) ambientAudio.pause();
        setAmbientPlayState(false);
    }

    function setAmbientPlayState(isPlaying) {
        STATE.ambientPlaying = isPlaying;
        const btn = document.getElementById('btn-ambient-play');
        const visualCard = document.getElementById('ambient-visual-card');

        if (btn) {
            btn.innerHTML = isPlaying ? '<span>⏸️</span> Jeda Lantunan' : '<span>▶️</span> Mulai Tilawah Khusyuk';
            btn.classList.toggle('playing', isPlaying);
        }

        if (visualCard) {
            visualCard.classList.toggle('active-ambient', isPlaying);
        }
    }

    function onAmbientSurahChange() {
        if (STATE.ambientPlaying) {
            playAmbientAudio();
        }
    }

    function onAmbientQariChange() {
        if (STATE.ambientPlaying) {
            playAmbientAudio();
        }
    }

    // Helper Toast
    function showToast(msg) {
        const toast = document.getElementById('haramain-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    // Expose API
    window.smHaramain = {
        init,
        switchLiveStream,
        refreshLiveStream,
        setCategory,
        onSearchVideo,
        openVideoModal,
        closeVideoModal,
        toggleAmbientPlayer,
        onAmbientSurahChange,
        onAmbientQariChange
    };

    document.addEventListener('DOMContentLoaded', init);
})();
