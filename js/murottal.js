// Murottal Player & Custom Playlist Controller — Sahabat Muslim
// Data source audio: MP3Quran.net CDN (CORS enabled, Cloudflare edge)

(function () {
    const POPULAR_RECITERS = [
        {
            id: '76',
            name: 'Syaikh Ali Jaber',
            arabicName: 'علي جابر',
            desc: 'Mantan Imam Besar Masjidil Haram Makkah • Sangat Merdu & Syahdu',
            server: 'https://cdn.mp3quran.net/audio/ali-jaber/r1/'
        },
        {
            id: '123',
            name: 'Syaikh Misyari Rasyid Al-Afasy',
            arabicName: 'مشاري راشد العفاسي',
            desc: 'Kuwait • Qari paling populer & dicintai di seluruh dunia',
            server: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/'
        },
        {
            id: '54',
            name: 'Syaikh Abdurrahman As-Sudais',
            arabicName: 'عبد الرحمن السديس',
            desc: 'Imam Besar & Kepala Pengurus Dua Masjid Suci Makkah & Madinah',
            server: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/'
        },
        {
            id: '30',
            name: 'Syaikh Sa\'ad Al-Ghamidi',
            arabicName: 'سعد الغامدي',
            desc: 'Arab Saudi • Lantunan tartil tenang, jelas, & menggetarkan hati',
            server: 'https://cdn.mp3quran.net/audio/saad-ghamdi/r1/'
        },
        {
            id: '102',
            name: 'Syaikh Maher Al-Muaiqly',
            arabicName: 'ماهر المعيقلي',
            desc: 'Imam Masjidil Haram Makkah • Irama tartil khas nan syahdu',
            server: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/'
        },
        {
            id: '118',
            name: 'Syaikh Mahmud Khalil Al-Husary',
            arabicName: 'محمود خليل الحصري',
            desc: 'Mesir • Rujukan standar mahzab tajwid & tartil dunia Islam',
            server: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1/'
        },
        {
            id: '112',
            name: 'Syaikh Muhammad Siddiq Al-Minshawi',
            arabicName: 'محمد صديق المنشاوي',
            desc: 'Mesir • "Suara yang Menangis", tartil penuh penghayatan mendalam',
            server: 'https://cdn.mp3quran.net/audio/muhammad-minshawi/r1/'
        },
        {
            id: '4',
            name: 'Syaikh Abu Bakr Asy-Syathiri',
            arabicName: 'أبو بكر الشاطري',
            desc: 'Arab Saudi • Tartil lembut yang menenangkan jiwa',
            server: 'https://cdn.mp3quran.net/audio/abubakr-shatri/r1/'
        },
        {
            id: '92',
            name: 'Syaikh Yasser Al-Dosari',
            arabicName: 'ياسر الدوسري',
            desc: 'Imam Masjidil Haram Makkah • Suara bertenaga & nada tinggi merdu',
            server: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/'
        },
        {
            id: '51',
            name: 'Syaikh Abdul Basit Abdul Samad',
            arabicName: 'عبد الباسط عبد الصمد',
            desc: 'Legenda Qari Emas Dunia dari Mesir',
            server: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r1/'
        },
        {
            id: '89',
            name: 'Syaikh Hani Ar-Rifai',
            arabicName: 'هاني الرفاعي',
            desc: 'Imam Masjid Anani Jeddah • Sangat menyentuh & penuh tangis tadabbur',
            server: 'https://cdn.mp3quran.net/audio/hani-rifai/r1/'
        },
        {
            id: '12',
            name: 'Syaikh Idris Abkar',
            arabicName: 'إدريس أبكر',
            desc: 'Imam Masjid Sheikh Zayed Abu Dhabi • Irama doa & tilawah syahdu',
            server: 'https://cdn.mp3quran.net/audio/idrees-abkar/r1/'
        }
    ];

    const POPULAR_SURAH_NUMBERS = [1, 18, 36, 55, 56, 67, 112, 113, 114];

    // IndexedDB Manager for Offline Storage
    const MurottalDB = {
        dbName: 'SahabatMuslim_AudioCache',
        dbVersion: 1,
        storeName: 'murottal_audio',
        db: null,

        async init() {
            if (typeof window === 'undefined' || !window.indexedDB) {
                return null;
            }
            if (this.db) return this.db;
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'key' });
                    }
                };
                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    resolve(this.db);
                };
                request.onerror = (e) => {
                    console.warn('IndexedDB open error:', e);
                    reject(e);
                };
            });
        },

        async get(qariId, surahNum) {
            try {
                const db = await this.init();
                if (!db) return null;
                const key = `${qariId}_${pad3(surahNum)}`;
                return new Promise((resolve) => {
                    const tx = db.transaction(this.storeName, 'readonly');
                    const store = tx.objectStore(this.storeName);
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result || null);
                    req.onerror = () => resolve(null);
                });
            } catch (err) {
                return null;
            }
        },

        async save(qariId, qariName, surahNum, surahName, blob) {
            try {
                const db = await this.init();
                if (!db) throw new Error('Penyimpanan lokal IndexedDB tidak didukung pada browser ini');
                const key = `${qariId}_${pad3(surahNum)}`;
                const item = {
                    key,
                    qariId,
                    qariName,
                    surahNumber: parseInt(surahNum),
                    surahName,
                    blob,
                    size: blob.size,
                    createdAt: new Date().toISOString()
                };
                return new Promise((resolve, reject) => {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    const req = store.put(item);
                    req.onsuccess = () => resolve(true);
                    req.onerror = (e) => reject(e);
                });
            } catch (err) {
                console.error('Save to IndexedDB error:', err);
                throw err;
            }
        },

        async delete(qariId, surahNum) {
            try {
                const db = await this.init();
                if (!db) return false;
                const key = `${qariId}_${pad3(surahNum)}`;
                return new Promise((resolve) => {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    const req = store.delete(key);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                });
            } catch (err) {
                return false;
            }
        },

        async getAll() {
            try {
                const db = await this.init();
                if (!db) return [];
                return new Promise((resolve) => {
                    const tx = db.transaction(this.storeName, 'readonly');
                    const store = tx.objectStore(this.storeName);
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                });
            } catch (err) {
                return [];
            }
        },

        async clear() {
            try {
                const db = await this.init();
                if (!db) return false;
                return new Promise((resolve) => {
                    const tx = db.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    const req = store.clear();
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                });
            } catch (err) {
                return false;
            }
        }
    };

    // State
    const STATE = {
        activeTab: 'surah', // 'surah' | 'playlist' | 'offline'
        currentReciter: POPULAR_RECITERS[0], // Default: Syaikh Ali Jaber
        surahList: [],
        offlineKeys: new Set(),
        searchQuery: '',
        activeFilter: 'all', // 'all' | 'popular' | 'makkiyyah' | 'madaniyyah'
        customPlaylist: [],
        currentlyPlaying: null, // { mode, surahNumber, surahName, qariId, qariName, playlistIndex }
        audio: null,
        isPlaying: false,
        loopMode: 'all', // 'all' | 'one' | 'none'
        speed: 1.0,
        pendingPlaylistSurah: null,
        downloadingKeys: new Set()
    };

    function pad3(num) {
        return num.toString().padStart(3, '0');
    }

    function formatTime(sec) {
        if (isNaN(sec) || !isFinite(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function showToast(msg) {
        const toast = document.getElementById('murottal-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Audio Engine
    function initAudio() {
        if (STATE.audio) return STATE.audio;
        const a = new Audio();
        a.addEventListener('play', () => {
            STATE.isPlaying = true;
            updatePlayPauseUI(true);
            updateMediaSessionState();
        });
        a.addEventListener('pause', () => {
            STATE.isPlaying = false;
            updatePlayPauseUI(false);
            updateMediaSessionState();
        });
        a.addEventListener('ended', onAudioEnded);
        a.addEventListener('timeupdate', onAudioTimeUpdate);
        a.addEventListener('error', (e) => {
            console.error('Audio playback error:', e);
            showToast('Gagal memuat audio murottal. Silakan periksa koneksi internet.');
            updatePlayPauseUI(false);
        });
        STATE.audio = a;
        return a;
    }

    function onAudioTimeUpdate() {
        const a = STATE.audio;
        if (!a || !a.duration) return;
        const cur = document.getElementById('player-current-time');
        const dur = document.getElementById('player-total-duration');
        const slider = document.getElementById('player-timeline-slider');
        if (cur) cur.textContent = formatTime(a.currentTime);
        if (dur) dur.textContent = formatTime(a.duration);
        if (slider && !slider._dragging) {
            slider.value = (a.currentTime / a.duration) * 100;
        }
    }

    function onAudioEnded() {
        if (STATE.loopMode === 'one') {
            STATE.audio.currentTime = 0;
            STATE.audio.play().catch(() => {});
            return;
        }

        if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'playlist') {
            const nextIdx = STATE.currentlyPlaying.playlistIndex + 1;
            if (nextIdx < STATE.customPlaylist.length) {
                playPlaylistItem(nextIdx);
            } else if (STATE.loopMode === 'all' && STATE.customPlaylist.length > 0) {
                playPlaylistItem(0);
            } else {
                updatePlayPauseUI(false);
            }
        } else if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'surah') {
            const nextSurah = STATE.currentlyPlaying.surahNumber + 1;
            if (nextSurah <= 114) {
                playSurah(nextSurah, STATE.currentReciter);
            } else if (STATE.loopMode === 'all') {
                playSurah(1, STATE.currentReciter);
            } else {
                updatePlayPauseUI(false);
            }
        }
    }

    function updatePlayPauseUI(playing) {
        const toggleBtn = document.getElementById('btn-player-play-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = playing ? '⏸' : '▶';
        }
        renderSurahList();
        renderPlaylist();
    }

    function updateMediaSession(surahName, reciterName) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `Surah ${surahName}`,
                artist: reciterName,
                album: 'Al-Qur\'an 30 Juz — Sahabat Muslim',
                artwork: [
                    { src: 'https://sahabatmuslim.ahsailabs.my.id/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'https://sahabatmuslim.ahsailabs.my.id/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
            navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
            navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
            navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        }
    }

    function updateMediaSessionState() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = STATE.isPlaying ? 'playing' : 'paused';
        }
    }

    // Play Engine Logic
    async function playSurah(surahNumber, reciter) {
        reciter = reciter || STATE.currentReciter;
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        if (!surah) return;

        const a = initAudio();
        const stickyBar = document.getElementById('sticky-player-bar');
        if (stickyBar) stickyBar.classList.remove('hidden');

        // Check offline cache first!
        const cached = await MurottalDB.get(reciter.id, surahNumber);
        let audioSrc = '';
        let isOffline = false;

        if (cached && cached.blob) {
            audioSrc = URL.createObjectURL(cached.blob);
            isOffline = true;
        } else {
            audioSrc = `${reciter.server}${pad3(surahNumber)}.mp3`;
        }

        STATE.currentlyPlaying = {
            mode: 'surah',
            surahNumber: surahNumber,
            surahName: surah.namaLatin,
            qariId: reciter.id,
            qariName: reciter.name,
            url: audioSrc,
            isOffline: isOffline,
            playlistIndex: -1
        };

        // Update player header
        const titleEl = document.getElementById('player-track-title');
        const reciterEl = document.getElementById('player-track-reciter');
        const iconEl = document.getElementById('player-track-icon');
        if (titleEl) {
            titleEl.innerHTML = `${surah.nomor}. ${surah.namaLatin} ${isOffline ? '<span style="font-size: 0.72rem; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 4px;">💾 Offline</span>' : ''}`;
        }
        if (reciterEl) reciterEl.textContent = reciter.name;
        if (iconEl) iconEl.textContent = '📖';

        a.src = audioSrc;
        a.playbackRate = STATE.speed;
        a.play().catch(err => {
            console.warn('Playback error:', err);
            showToast('Klik Play untuk memulai pemutaran audio');
        });

        updateMediaSession(surah.namaLatin, reciter.name);
        renderSurahList();
    }

    async function playPlaylistItem(index) {
        if (index < 0 || index >= STATE.customPlaylist.length) return;
        const item = STATE.customPlaylist[index];
        const a = initAudio();

        const stickyBar = document.getElementById('sticky-player-bar');
        if (stickyBar) stickyBar.classList.remove('hidden');

        // Check offline cache
        const cached = await MurottalDB.get(item.qariId, item.surahNumber);
        let audioSrc = '';
        let isOffline = false;

        if (cached && cached.blob) {
            audioSrc = URL.createObjectURL(cached.blob);
            isOffline = true;
        } else {
            audioSrc = `${item.qariServer}${pad3(item.surahNumber)}.mp3`;
        }

        STATE.currentlyPlaying = {
            mode: 'playlist',
            surahNumber: item.surahNumber,
            surahName: item.surahName,
            qariId: item.qariId,
            qariName: item.qariName,
            url: audioSrc,
            isOffline: isOffline,
            playlistIndex: index
        };

        const titleEl = document.getElementById('player-track-title');
        const reciterEl = document.getElementById('player-track-reciter');
        const iconEl = document.getElementById('player-track-icon');
        if (titleEl) {
            titleEl.innerHTML = `[${index + 1}/${STATE.customPlaylist.length}] ${item.surahName} ${isOffline ? '<span style="font-size: 0.72rem; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 4px;">💾 Offline</span>' : ''}`;
        }
        if (reciterEl) reciterEl.textContent = item.qariName;
        if (iconEl) iconEl.textContent = '🎧';

        a.src = audioSrc;
        a.playbackRate = STATE.speed;
        a.play().catch(err => {
            console.warn('Playback error:', err);
        });

        updateMediaSession(item.surahName, item.qariName);
        renderPlaylist();
    }

    function togglePlayPause() {
        const a = STATE.audio;
        if (!a || !a.src) {
            if (STATE.customPlaylist.length > 0 && STATE.activeTab === 'playlist') {
                playPlaylistItem(0);
            } else {
                playSurah(1, STATE.currentReciter);
            }
            return;
        }

        if (a.paused) {
            a.play().catch(() => {});
        } else {
            a.pause();
        }
    }

    function playNext() {
        if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'playlist') {
            const nextIdx = STATE.currentlyPlaying.playlistIndex + 1;
            if (nextIdx < STATE.customPlaylist.length) {
                playPlaylistItem(nextIdx);
            } else {
                playPlaylistItem(0);
            }
        } else if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'surah') {
            let nextSurah = STATE.currentlyPlaying.surahNumber + 1;
            if (nextSurah > 114) nextSurah = 1;
            playSurah(nextSurah, STATE.currentReciter);
        }
    }

    function playPrevious() {
        if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'playlist') {
            const prevIdx = STATE.currentlyPlaying.playlistIndex - 1;
            if (prevIdx >= 0) {
                playPlaylistItem(prevIdx);
            } else {
                playPlaylistItem(STATE.customPlaylist.length - 1);
            }
        } else if (STATE.currentlyPlaying && STATE.currentlyPlaying.mode === 'surah') {
            let prevSurah = STATE.currentlyPlaying.surahNumber - 1;
            if (prevSurah < 1) prevSurah = 114;
            playSurah(prevSurah, STATE.currentReciter);
        }
    }

    function toggleLoopMode() {
        const btn = document.getElementById('btn-player-loop');
        if (STATE.loopMode === 'all') {
            STATE.loopMode = 'one';
            if (btn) {
                btn.innerHTML = '🔂';
                btn.classList.add('active');
                btn.title = 'Ulang 1 Surah Ini';
            }
            showToast('Mode Ulang: Ulang 1 Surah 🔂');
        } else if (STATE.loopMode === 'one') {
            STATE.loopMode = 'none';
            if (btn) {
                btn.innerHTML = '➡️';
                btn.classList.remove('active');
                btn.title = 'Putar Sekali (Tanpa Ulang)';
            }
            showToast('Mode Ulang: Putar Sekali ➡️');
        } else {
            STATE.loopMode = 'all';
            if (btn) {
                btn.innerHTML = '🔁';
                btn.classList.add('active');
                btn.title = 'Ulang Semua Surah / Playlist';
            }
            showToast('Mode Ulang: Ulang Semua 🔁');
        }
    }

    function setPlaybackSpeed(speedVal) {
        STATE.speed = parseFloat(speedVal);
        if (STATE.audio) {
            STATE.audio.playbackRate = STATE.speed;
        }
        showToast(`Kecepatan putar diatur ke ${STATE.speed}x`);
    }

    function onSeek(val) {
        const a = STATE.audio;
        if (!a || !a.duration) return;
        a.currentTime = (parseFloat(val) / 100) * a.duration;
    }

    // Offline Download Manager
    async function downloadSurahOffline(surahNumber, reciter) {
        reciter = reciter || STATE.currentReciter;
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        if (!surah) return;

        const downloadKey = `${reciter.id}_${pad3(surahNumber)}`;
        if (STATE.downloadingKeys.has(downloadKey)) return;

        STATE.downloadingKeys.add(downloadKey);
        renderSurahList();
        renderPlaylist();
        showToast(`Mengunduh Surah ${surah.namaLatin} (${reciter.name})... ⏳`);

        const audioUrl = `${reciter.server}${pad3(surahNumber)}.mp3`;

        try {
            const res = await fetch(audioUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();

            await MurottalDB.save(reciter.id, reciter.name, surahNumber, surah.namaLatin, blob);
            STATE.offlineKeys.add(downloadKey);
            showToast(`Alhamdulillah! Surah ${surah.namaLatin} berhasil disimpan offline. 💾✅`);
        } catch (err) {
            console.error('Download failed:', err);
            showToast(`Gagal mengunduh Surah ${surah.namaLatin}: ${err.message}`);
        } finally {
            STATE.downloadingKeys.delete(downloadKey);
            await refreshOfflineState();
            renderSurahList();
            renderPlaylist();
            renderOffline();
        }
    }

    async function deleteSurahOffline(surahNumber, qariId) {
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        const name = surah ? surah.namaLatin : `Surah ${surahNumber}`;
        await MurottalDB.delete(qariId, surahNumber);
        STATE.offlineKeys.delete(`${qariId}_${pad3(surahNumber)}`);
        showToast(`Cache offline Surah ${name} telah dihapus. 🗑️`);
        await refreshOfflineState();
        renderSurahList();
        renderPlaylist();
        renderOffline();
    }

    function downloadMp3ToDevice(surahNumber, reciter) {
        reciter = reciter || STATE.currentReciter;
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        const fileName = `${pad3(surahNumber)}_${(surah ? surah.namaLatin : 'Surah')}_${reciter.name.replace(/\s+/g, '_')}.mp3`;
        const audioUrl = `${reciter.server}${pad3(surahNumber)}.mp3`;

        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = fileName;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Mengunduh file ${fileName} ke perangkat Anda 📥`);
    }

    // Playlist Manager
    function loadPlaylist() {
        try {
            const saved = localStorage.getItem('sm_murottal_playlist');
            if (saved) {
                STATE.customPlaylist = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load playlist', e);
        }
        updatePlaylistBadge();
    }

    function savePlaylist() {
        try {
            localStorage.setItem('sm_murottal_playlist', JSON.stringify(STATE.customPlaylist));
        } catch (e) {
            console.warn('Failed to save playlist', e);
        }
        updatePlaylistBadge();
    }

    function updatePlaylistBadge() {
        const badge = document.getElementById('badge-playlist-count');
        if (badge) badge.textContent = STATE.customPlaylist.length;
    }

    function openAddPlaylistModal(surahNumber) {
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        if (!surah) return;
        STATE.pendingPlaylistSurah = surah;

        const titleEl = document.getElementById('add-playlist-surah-title');
        if (titleEl) {
            titleEl.innerHTML = `Tambahkan <strong>Surah ${surah.nomor}. ${surah.namaLatin}</strong> ke Playlist:`;
        }

        const select = document.getElementById('playlist-qari-select');
        if (select) {
            select.innerHTML = POPULAR_RECITERS.map(r => `
                <option value="${r.id}" ${r.id === STATE.currentReciter.id ? 'selected' : ''}>
                    ${r.name} (${r.desc.split('•')[0].trim()})
                </option>
            `).join('');
        }

        const modal = document.getElementById('add-playlist-modal');
        if (modal) modal.classList.add('active');
    }

    function closeAddPlaylistModal() {
        const modal = document.getElementById('add-playlist-modal');
        if (modal) modal.classList.remove('active');
        STATE.pendingPlaylistSurah = null;
    }

    function confirmAddToPlaylist() {
        if (!STATE.pendingPlaylistSurah) return;
        const select = document.getElementById('playlist-qari-select');
        const qariId = select ? select.value : STATE.currentReciter.id;
        const qari = POPULAR_RECITERS.find(r => r.id === qariId) || STATE.currentReciter;

        const surah = STATE.pendingPlaylistSurah;
        const newItem = {
            id: Date.now() + Math.random().toString(36).substr(2, 4),
            surahNumber: surah.nomor,
            surahName: surah.namaLatin,
            surahArabic: surah.nama,
            versesCount: surah.jumlahAyat,
            qariId: qari.id,
            qariName: qari.name,
            qariServer: qari.server
        };

        STATE.customPlaylist.push(newItem);
        savePlaylist();
        closeAddPlaylistModal();
        renderPlaylist();
        showToast(`Surah ${surah.namaLatin} (${qari.name}) masuk ke Playlist! 🎧`);
    }

    function removeFromPlaylist(index) {
        if (index >= 0 && index < STATE.customPlaylist.length) {
            const removed = STATE.customPlaylist.splice(index, 1)[0];
            savePlaylist();
            renderPlaylist();
            showToast(`Surah ${removed.surahName} dihapus dari playlist.`);
        }
    }

    function playEntirePlaylist() {
        if (STATE.customPlaylist.length === 0) {
            showToast('Playlist masih kosong. Tambahkan surah terlebih dahulu!');
            return;
        }
        playPlaylistItem(0);
    }

    async function downloadAllPlaylist() {
        if (STATE.customPlaylist.length === 0) {
            showToast('Playlist kosong');
            return;
        }
        showToast(`Memulai download ${STATE.customPlaylist.length} surah di playlist... ⏳`);
        for (const item of STATE.customPlaylist) {
            const qari = POPULAR_RECITERS.find(r => r.id === item.qariId) || { id: item.qariId, name: item.qariName, server: item.qariServer };
            await downloadSurahOffline(item.surahNumber, qari);
        }
        showToast('Semua surah playlist berhasil diunduh! Siap diputar offline 💾✅');
    }

    function clearPlaylist() {
        if (STATE.customPlaylist.length === 0) return;
        if (confirm('Yakin ingin mengosongkan seluruh playlist Anda?')) {
            STATE.customPlaylist = [];
            savePlaylist();
            renderPlaylist();
            showToast('Playlist telah dikosongkan.');
        }
    }

    // Reciter Selector Modal
    function openReciterModal() {
        const modal = document.getElementById('reciter-modal');
        if (modal) modal.classList.add('active');
        renderReciterOptions(POPULAR_RECITERS);
    }

    function closeReciterModal() {
        const modal = document.getElementById('reciter-modal');
        if (modal) modal.classList.remove('active');
    }

    function renderReciterOptions(list) {
        const container = document.getElementById('reciter-options-list');
        if (!container) return;

        container.innerHTML = list.map(r => `
            <div class="reciter-option-card ${r.id === STATE.currentReciter.id ? 'selected' : ''}" onclick="window.smMurottal.selectReciter('${r.id}')">
                <div>
                    <strong style="display: block; font-size: 0.95rem; color: var(--green-900);">
                        ${r.name} ${r.id === '76' ? '⭐' : ''}
                    </strong>
                    <span style="font-size: 0.8rem; color: var(--gray-500);">${r.desc}</span>
                </div>
                <div style="font-family: 'Amiri', serif; font-size: 1.25rem; color: var(--green-700);">
                    ${r.arabicName}
                </div>
            </div>
        `).join('');
    }

    function filterReciters(query) {
        const q = (query || '').toLowerCase().trim();
        const filtered = POPULAR_RECITERS.filter(r => 
            r.name.toLowerCase().includes(q) || 
            r.desc.toLowerCase().includes(q) || 
            r.arabicName.includes(q)
        );
        renderReciterOptions(filtered);
    }

    function selectReciter(reciterId) {
        const chosen = POPULAR_RECITERS.find(r => r.id === reciterId);
        if (chosen) {
            STATE.currentReciter = chosen;
            try {
                localStorage.setItem('sm_murottal_reciter_id', chosen.id);
            } catch (e) {}

            // Update UI card
            const nameEl = document.getElementById('active-reciter-name');
            const descEl = document.getElementById('active-reciter-desc');
            if (nameEl) nameEl.innerHTML = `${chosen.name} ${chosen.id === '76' ? '<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.2rem 0.55rem; border-radius: 9999px;">Pilihan Utama ⭐</span>' : ''}`;
            if (descEl) descEl.textContent = chosen.desc;

            closeReciterModal();
            showToast(`Qari aktif: ${chosen.name} 🎙️`);
            renderSurahList();
        }
    }

    // Refresh offline state
    async function refreshOfflineState() {
        const allStored = await MurottalDB.getAll();
        STATE.offlineKeys = new Set(allStored.map(item => item.key));
        const badge = document.getElementById('badge-offline-count');
        if (badge) badge.textContent = allStored.length;
    }

    // Tab switcher
    function switchTab(tabName) {
        STATE.activeTab = tabName;
        ['surah', 'playlist', 'offline'].forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const content = document.getElementById(`tab-content-${t}`);
            if (btn) btn.classList.toggle('active', t === tabName);
            if (content) content.style.display = (t === tabName) ? 'block' : 'none';
        });

        if (tabName === 'surah') renderSurahList();
        if (tabName === 'playlist') renderPlaylist();
        if (tabName === 'offline') renderOffline();
    }

    // Rendering Surah List
    function renderSurahList() {
        const container = document.getElementById('surah-list-container');
        if (!container) return;

        let list = [...STATE.surahList];

        // Search Filter
        if (STATE.searchQuery) {
            const q = STATE.searchQuery.toLowerCase().trim();
            list = list.filter(s => 
                s.namaLatin.toLowerCase().includes(q) ||
                s.arti.toLowerCase().includes(q) ||
                s.nomor.toString() === q
            );
        }

        // Category Filter
        if (STATE.activeFilter === 'popular') {
            list = list.filter(s => POPULAR_SURAH_NUMBERS.includes(s.nomor));
        } else if (STATE.activeFilter === 'makkiyyah') {
            list = list.filter(s => s.tempatTurun.toLowerCase() === 'mekah');
        } else if (STATE.activeFilter === 'madaniyyah') {
            list = list.filter(s => s.tempatTurun.toLowerCase() === 'madinah');
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background: white; border-radius: 16px; border: 1px dashed var(--gray-300);">
                    <p style="color: var(--gray-500);">Tidak ada surah yang cocok dengan pencarian "<strong>${STATE.searchQuery}</strong>".</p>
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(s => {
            const offlineKey = `${STATE.currentReciter.id}_${pad3(s.nomor)}`;
            const isCached = STATE.offlineKeys.has(offlineKey);
            const isDownloading = STATE.downloadingKeys.has(offlineKey);
            const isPlayingThis = STATE.currentlyPlaying && 
                                  STATE.currentlyPlaying.mode === 'surah' && 
                                  STATE.currentlyPlaying.surahNumber === s.nomor && 
                                  STATE.isPlaying;

            return `
                <div class="surah-row ${isPlayingThis ? 'playing' : ''}">
                    <div class="surah-info-left">
                        <div class="surah-num-badge">${s.nomor}</div>
                        <div class="surah-text-meta">
                            <div class="surah-title-latin">
                                <span>${s.namaLatin}</span>
                                ${isCached ? '<span class="badge-offline-saved">💾 Offline</span>' : ''}
                            </div>
                            <div class="surah-subtitle">${s.arti} • ${s.jumlahAyat} Ayat • ${s.tempatTurun}</div>
                        </div>
                    </div>

                    <div class="surah-arabic-title">${s.nama}</div>

                    <div class="surah-actions">
                        <button type="button" class="btn-action-icon btn-play-primary ${isPlayingThis ? 'playing' : ''}" onclick="window.smMurottal.handleSurahPlayClick(${s.nomor})">
                            <span>${isPlayingThis ? '⏸ Jeda' : '▶ Putar'}</span>
                        </button>
                        <button type="button" class="btn-action-icon" title="Tambah ke Playlist" onclick="window.smMurottal.openAddPlaylistModal(${s.nomor})">
                            <span>➕ Playlist</span>
                        </button>
                        ${isCached ? `
                            <button type="button" class="btn-action-icon" style="color: #0284c7;" title="Hapus dari Penyimpanan Offline" onclick="window.smMurottal.deleteSurahOffline(${s.nomor}, '${STATE.currentReciter.id}')">
                                <span>💾 Tersimpan (🗑️)</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-action-icon ${isDownloading ? 'downloading' : ''}" title="Unduh untuk diputar Offline" onclick="window.smMurottal.downloadSurahOffline(${s.nomor})">
                                <span>${isDownloading ? '⏳ Mengunduh...' : '⬇️ Unduh'}</span>
                            </button>
                        `}
                        <button type="button" class="btn-action-icon" title="Download file MP3 ke perangkat" onclick="window.smMurottal.downloadMp3ToDevice(${s.nomor})">
                            <span>📥 MP3</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Rendering Playlist
    function renderPlaylist() {
        const container = document.getElementById('playlist-items-container');
        if (!container) return;

        if (STATE.customPlaylist.length === 0) {
            container.innerHTML = `
                <div class="empty-playlist-box">
                    <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🎵</div>
                    <h3>Playlist Tilawah Anda Masih Kosong</h3>
                    <p>Klik tombol <strong>"+ Playlist"</strong> pada surah mana pun di tab 114 Surah untuk memilih qari favorit dan meracik daftar putar harian Anda sendiri.</p>
                    <button type="button" class="btn-action-icon btn-play-primary" onclick="window.smMurottal.switchTab('surah')">
                        Pilih Surah Sekarang
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = STATE.customPlaylist.map((item, index) => {
            const offlineKey = `${item.qariId}_${pad3(item.surahNumber)}`;
            const isCached = STATE.offlineKeys.has(offlineKey);
            const isDownloading = STATE.downloadingKeys.has(offlineKey);
            const isPlayingThis = STATE.currentlyPlaying && 
                                  STATE.currentlyPlaying.mode === 'playlist' && 
                                  STATE.currentlyPlaying.playlistIndex === index && 
                                  STATE.isPlaying;

            return `
                <div class="surah-row ${isPlayingThis ? 'playing' : ''}">
                    <div class="surah-info-left">
                        <div class="surah-num-badge" style="background: #fef3c7; color: #92400e;">#${index + 1}</div>
                        <div class="surah-text-meta">
                            <div class="surah-title-latin">
                                <span>${item.surahName}</span>
                                <span class="badge-reciter-tag">🎙️ ${item.qariName}</span>
                                ${isCached ? '<span class="badge-offline-saved">💾 Offline</span>' : ''}
                            </div>
                            <div class="surah-subtitle">Surah ke-${item.surahNumber} • ${item.versesCount} Ayat</div>
                        </div>
                    </div>

                    <div class="surah-arabic-title">${item.surahArabic || ''}</div>

                    <div class="surah-actions">
                        <button type="button" class="btn-action-icon btn-play-primary ${isPlayingThis ? 'playing' : ''}" onclick="window.smMurottal.playPlaylistItem(${index})">
                            <span>${isPlayingThis ? '⏸ Jeda' : '▶ Putar'}</span>
                        </button>
                        ${isCached ? `
                            <button type="button" class="btn-action-icon" style="color: #0284c7;" title="Hapus dari Cache" onclick="window.smMurottal.deleteSurahOffline(${item.surahNumber}, '${item.qariId}')">
                                <span>💾 Offline</span>
                            </button>
                        ` : `
                            <button type="button" class="btn-action-icon ${isDownloading ? 'downloading' : ''}" title="Unduh Offline" onclick="window.smMurottal.downloadSurahOffline(${item.surahNumber}, { id: '${item.qariId}', name: '${item.qariName}', server: '${item.qariServer}' })">
                                <span>${isDownloading ? '⏳' : '⬇️ Unduh'}</span>
                            </button>
                        `}
                        <button type="button" class="btn-action-icon" style="color: #dc2626;" title="Hapus dari Playlist" onclick="window.smMurottal.removeFromPlaylist(${index})">
                            <span>✕ Hapus</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Rendering Offline Tab
    async function renderOffline() {
        const container = document.getElementById('offline-items-container');
        const descEl = document.getElementById('offline-storage-desc');
        if (!container) return;

        const allStored = await MurottalDB.getAll();
        const totalSize = allStored.reduce((acc, cur) => acc + (cur.size || 0), 0);

        if (descEl) {
            descEl.textContent = `Total file tersimpan: ${allStored.length} surah (${formatBytes(totalSize)} digunakan pada memori browser).`;
        }

        if (allStored.length === 0) {
            container.innerHTML = `
                <div class="empty-playlist-box">
                    <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💾</div>
                    <h3>Belum Ada Audio Murottal yang Diunduh</h3>
                    <p>Klik tombol <strong>"⬇️ Unduh"</strong> pada surah pilihan Anda agar dapat didengarkan kapan pun di mana pun secara offline tanpa memerlukan koneksi internet.</p>
                    <button type="button" class="btn-action-icon btn-play-primary" onclick="window.smMurottal.switchTab('surah')">
                        Jelajahi 114 Surah
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = allStored.map(item => {
            const isPlayingThis = STATE.currentlyPlaying && 
                                  STATE.currentlyPlaying.surahNumber === item.surahNumber && 
                                  STATE.currentlyPlaying.qariId === item.qariId && 
                                  STATE.isPlaying;

            return `
                <div class="surah-row ${isPlayingThis ? 'playing' : ''}">
                    <div class="surah-info-left">
                        <div class="surah-num-badge" style="background: #e0f2fe; color: #0369a1;">💾</div>
                        <div class="surah-text-meta">
                            <div class="surah-title-latin">
                                <span>${item.surahName || 'Surah ' + item.surahNumber}</span>
                                <span class="badge-reciter-tag">🎙️ ${item.qariName}</span>
                            </div>
                            <div class="surah-subtitle">Ukuran: ${formatBytes(item.size)} • Tersimpan Offline</div>
                        </div>
                    </div>

                    <div class="surah-actions">
                        <button type="button" class="btn-action-icon btn-play-primary ${isPlayingThis ? 'playing' : ''}" onclick="window.smMurottal.playSurah(${item.surahNumber}, { id: '${item.qariId}', name: '${item.qariName}' })">
                            <span>${isPlayingThis ? '⏸ Jeda' : '▶ Putar'}</span>
                        </button>
                        <button type="button" class="btn-action-icon" style="color: #dc2626;" title="Hapus dari Memori" onclick="window.smMurottal.deleteSurahOffline(${item.surahNumber}, '${item.qariId}')">
                            <span>🗑️ Hapus</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function clearAllOfflineStorage() {
        if (confirm('Yakin ingin membersihkan SEMUA cache audio offline dari memori browser?')) {
            await MurottalDB.clear();
            STATE.offlineKeys.clear();
            showToast('Semua file audio offline telah dibersihkan. 🧹');
            await refreshOfflineState();
            renderSurahList();
            renderPlaylist();
            renderOffline();
        }
    }

    function handleSurahPlayClick(surahNum) {
        if (STATE.currentlyPlaying && 
            STATE.currentlyPlaying.mode === 'surah' && 
            STATE.currentlyPlaying.surahNumber === surahNum && 
            STATE.currentlyPlaying.qariId === STATE.currentReciter.id) {
            togglePlayPause();
        } else {
            playSurah(surahNum, STATE.currentReciter);
        }
    }

    function onSearchSurah(val) {
        STATE.searchQuery = val;
        renderSurahList();
    }

    function setFilter(filterVal) {
        STATE.activeFilter = filterVal;
        document.querySelectorAll('.filter-pills .pill-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterVal);
        });
        renderSurahList();
    }

    // Initialization
    async function init() {
        if (window.QURAN_SURAT_LIST && Array.isArray(window.QURAN_SURAT_LIST)) {
            STATE.surahList = window.QURAN_SURAT_LIST;
        }

        // Saved reciter
        try {
            const savedReciterId = localStorage.getItem('sm_murottal_reciter_id');
            if (savedReciterId) {
                const found = POPULAR_RECITERS.find(r => r.id === savedReciterId);
                if (found) STATE.currentReciter = found;
            }
        } catch (e) {}

        // UI active reciter setup
        const nameEl = document.getElementById('active-reciter-name');
        const descEl = document.getElementById('active-reciter-desc');
        if (nameEl) nameEl.innerHTML = `${STATE.currentReciter.name} ${STATE.currentReciter.id === '76' ? '<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.2rem 0.55rem; border-radius: 9999px;">Pilihan Utama ⭐</span>' : ''}`;
        if (descEl) descEl.textContent = STATE.currentReciter.desc;

        loadPlaylist();
        await refreshOfflineState();
        renderSurahList();
    }

    // Expose API
    window.smMurottal = {
        init,
        switchTab,
        playSurah,
        playPlaylistItem,
        handleSurahPlayClick,
        togglePlayPause,
        playNext,
        playPrevious,
        toggleLoopMode,
        setPlaybackSpeed,
        onSeek,
        openReciterModal,
        closeReciterModal,
        selectReciter,
        filterReciters,
        openAddPlaylistModal,
        closeAddPlaylistModal,
        confirmAddToPlaylist,
        removeFromPlaylist,
        playEntirePlaylist,
        downloadAllPlaylist,
        clearPlaylist,
        downloadSurahOffline,
        deleteSurahOffline,
        downloadMp3ToDevice,
        clearAllOfflineStorage,
        onSearchSurah,
        setFilter
    };

    document.addEventListener('DOMContentLoaded', init);
})();
