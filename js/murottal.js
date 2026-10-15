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
            id: '67',
            name: 'Syaikh Abdul Muhsin Al-Qasim',
            arabicName: 'عبد المحسن القاسم',
            desc: 'Imam & Khatib Masjid Nabawi Madinah • Bacaan tartil tenang & fasih',
            server: 'https://cdn.mp3quran.net/audio/abdulmohsen-qasim/r1/'
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
        },
        {
            id: '24',
            name: 'Syaikh Khalifah Al-Tunaiji',
            altName: 'Khalifah Ath-Thaniyjiy Khalifa Altunaiji khalifa tunaiji at tunaiji al tunaiji',
            arabicName: 'خليفة الطنيجي',
            desc: 'Uni Emirat Arab • Tartil fasih, tenang, artikulasi sangat jelas & jernih',
            server: 'https://cdn.mp3quran.net/audio/khalifa-tunaiji/r1/'
        }
    ];

    const POPULAR_SURAH_NUMBERS = [1, 18, 36, 55, 56, 67, 112, 113, 114];

    // Quran.com Reciter IDs mapping for millisecond verse timestamps
    const QURAN_COM_RECITERS = {
        '123': 7,  // Syaikh Misyari Rasyid Al-Afasy (Mishari Rashid al-`Afasy)
        '54': 3,   // Syaikh Abdurrahman As-Sudais (Abdur-Rahman as-Sudais)
        '4': 4,    // Syaikh Abu Bakr Asy-Syathiri (Abu Bakr al-Shatri)
        '89': 5,   // Syaikh Hani Ar-Rifai (Hani ar-Rifai)
        '118': 6,  // Syaikh Mahmud Khalil Al-Husary (Mahmoud Khalil Al-Husary)
        '112': 9,  // Syaikh Muhammad Siddiq Al-Minshawi (Mohamed Siddiq al-Minshawi)
        '51': 2    // Syaikh Abdul Basit Abdul Samad (AbdulBaset AbdulSamad Murattal)
    };

    const AYAT_CACHE = {};
    const TIMESTAMP_CACHE = {};

    function getQuranComReciterId(reciter) {
        if (!reciter) return null;
        if (reciter.id && QURAN_COM_RECITERS[reciter.id]) {
            return QURAN_COM_RECITERS[reciter.id];
        }
        const name = (reciter.name || '').toLowerCase();
        if (name.includes('afasy') || name.includes('mishari') || name.includes('misyari')) return 7;
        if (name.includes('sudais') || name.includes('sudaisi')) return 3;
        if (name.includes('shatri') || name.includes('syathiri')) return 4;
        if (name.includes('rifai') || name.includes('al-refai')) return 5;
        if (name.includes('husary') || name.includes('al-husari')) return 6;
        if (name.includes('minshawi') || name.includes('al-minshawi')) return 9;
        if (name.includes('abdul basit') || name.includes('abdulbaset')) return 2;
        return null;
    }

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
        reciterScope: 'popular', // 'popular' | 'all'
        allReciters: [],
        recitersLoaded: false,
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
        pendingPlaylistQariId: null,
        playlistReciterScope: 'popular',
        downloadingKeys: new Set(),
        verseDrawerOpen: false,
        verseDisplayMode: localStorage.getItem('sm_murottal_verse_mode') || 'single', // Default 1 Ayat
        currentSingleAyah: 1,
        verseFontSize: 1.1, // Default paling kecil
        verseShowLatin: false,
        verseShowTrans: false, // Default tanpa terjemah
        verseAutoScroll: true, // Default auto scroll
        currentAyatData: null,
        currentTimestamps: null,
        currentActiveAyah: null,
        hasSyncTimestamps: false,
        isLoadingVerses: false
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

        // Real-time verse highlight sync
        updateActiveVerseSync(a.currentTime);
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
                album: 'Al-Qur\'an 30 Juz — Sahabat Muslim'
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

        // Check if reciter has this surah available (for partial recitations)
        if (reciter.surahList && typeof reciter.surahList === 'string') {
            const availableSurahs = reciter.surahList.split(',');
            if (!availableSurahs.includes(String(surahNumber))) {
                showToast(`Audio Surah ${surah.namaLatin} tidak tersedia untuk ${reciter.name} di MP3Quran.`);
                return;
            }
        }

        const a = initAudio();
        const stickyBar = document.getElementById('sticky-player-bar');
        if (stickyBar) stickyBar.classList.remove('hidden');

        // Check offline cache first!
        const cached = await MurottalDB.get(reciter.id, surahNumber);
        let audioSrc = '';
        let isOffline = false;

        // Concurrently load verses and timestamps
        const ayatPromise = loadSurahAyatData(surahNumber, reciter);

        if (cached && cached.blob) {
            audioSrc = URL.createObjectURL(cached.blob);
            isOffline = true;
            await ayatPromise;
        } else {
            const ayatResult = await ayatPromise;
            if (ayatResult && ayatResult.quranComAudioUrl) {
                audioSrc = ayatResult.quranComAudioUrl;
            } else {
                audioSrc = `${reciter.server}${pad3(surahNumber)}.mp3`;
            }
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

        const fakeReciter = {
            id: item.qariId,
            name: item.qariName,
            server: item.qariServer
        };
        const ayatPromise = loadSurahAyatData(item.surahNumber, fakeReciter);

        if (cached && cached.blob) {
            audioSrc = URL.createObjectURL(cached.blob);
            isOffline = true;
            await ayatPromise;
        } else {
            const ayatResult = await ayatPromise;
            if (ayatResult && ayatResult.quranComAudioUrl) {
                audioSrc = ayatResult.quranComAudioUrl;
            } else {
                audioSrc = `${item.qariServer}${pad3(item.surahNumber)}.mp3`;
            }
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

    // ==========================================
    // Real-Time Verse Display & Sync Controller
    // ==========================================

    async function loadSurahAyatData(surahNumber, reciter) {
        STATE.isLoadingVerses = true;
        STATE.currentActiveAyah = null;
        STATE.currentTimestamps = null;
        STATE.hasSyncTimestamps = false;

        const badgeEl = document.getElementById('verse-drawer-surah-badge');
        const syncEl = document.getElementById('verse-drawer-sync-status');
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        if (badgeEl && surah) {
            badgeEl.textContent = `${surah.nomor}. ${surah.namaLatin}`;
        }
        if (syncEl) {
            syncEl.textContent = '⏳ Memuat...';
            syncEl.style.color = 'var(--gray-500)';
        }

        const bodyEl = document.getElementById('verse-drawer-body');
        if (bodyEl && (!STATE.currentAyatData || STATE.currentAyatData.nomor !== surahNumber)) {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); font-size: 0.9rem;">
                    <div style="display: inline-block; width: 22px; height: 22px; border: 3px solid var(--gray-300); border-top-color: var(--green-600); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 0.5rem;"></div>
                    <div>Memuat teks ayat & terjemahan ${surah ? surah.namaLatin : ''}...</div>
                </div>
            `;
        }

        // 1. Fetch Verses text (equran.id API v2)
        let ayatData = AYAT_CACHE[surahNumber];
        if (!ayatData) {
            try {
                const res = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.data) {
                        ayatData = json.data;
                        AYAT_CACHE[surahNumber] = ayatData;
                    }
                }
            } catch (e) {
                console.warn('Gagal memuat teks ayat dari equran.id:', e);
            }
        }
        STATE.currentAyatData = ayatData;

        // 2. Fetch Timestamps from Quran.com if reciter is supported
        const quranComId = getQuranComReciterId(reciter);
        let quranComAudioUrl = null;
        if (quranComId) {
            const cacheKey = `${quranComId}_${surahNumber}`;
            let tsData = TIMESTAMP_CACHE[cacheKey];
            if (!tsData) {
                try {
                    const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${quranComId}/${surahNumber}?segments=true`);
                    if (res.ok) {
                        const json = await res.json();
                        if (json && json.audio_file && json.audio_file.timestamps) {
                            tsData = {
                                audio_url: json.audio_file.audio_url,
                                timestamps: json.audio_file.timestamps
                            };
                            TIMESTAMP_CACHE[cacheKey] = tsData;
                        }
                    }
                } catch (e) {
                    console.warn('Gagal memuat timestamps dari quran.com:', e);
                }
            }

            if (tsData && tsData.timestamps && tsData.timestamps.length > 0) {
                STATE.currentTimestamps = tsData.timestamps;
                STATE.hasSyncTimestamps = true;
                quranComAudioUrl = tsData.audio_url;
            }
        }

        // Update badge & indicator
        if (syncEl) {
            if (STATE.hasSyncTimestamps) {
                syncEl.innerHTML = '<span style="color: #059669; font-weight: 700;">⚡ Sinkron Audio Otomatis</span>';
            } else {
                syncEl.innerHTML = '<span style="color: var(--gray-600);">📖 Mode Teks Manual</span>';
            }
        }

        const lyricsBtn = document.getElementById('btn-player-lyrics');
        if (lyricsBtn) {
            if (STATE.hasSyncTimestamps) {
                lyricsBtn.innerHTML = '<span>⚡</span><span class="hide-mobile">Teks & Sync</span>';
                lyricsBtn.title = 'Teks Ayat Sinkron Otomatis dengan Audio (Live Highlight)';
            } else {
                lyricsBtn.innerHTML = '<span>📖</span><span class="hide-mobile">Teks & Arti</span>';
                lyricsBtn.title = 'Teks Ayat & Terjemahan (Mode Manual)';
            }
        }

        STATE.isLoadingVerses = false;
        renderVerseContent();

        return { ayatData, quranComAudioUrl, hasSyncTimestamps: STATE.hasSyncTimestamps };
    }

    function renderVerseContent() {
        if (STATE.verseDisplayMode === 'single') {
            renderSingleVerse();
        } else {
            renderVerseList();
        }
    }

    function setVerseDisplayMode(mode) {
        STATE.verseDisplayMode = mode;
        try {
            localStorage.setItem('sm_murottal_verse_mode', mode);
        } catch (e) {}

        const listBtn = document.getElementById('btn-verse-mode-list');
        const singleBtn = document.getElementById('btn-verse-mode-single');
        const autoScrollBtn = document.getElementById('btn-verse-toggle-autoscroll');

        if (listBtn) listBtn.classList.toggle('active', mode === 'list');
        if (singleBtn) singleBtn.classList.toggle('active', mode === 'single');
        if (autoScrollBtn) autoScrollBtn.style.display = (mode === 'single') ? 'none' : 'inline-flex';

        renderVerseContent();
    }

    function renderSingleVerse(targetAyah) {
        const bodyEl = document.getElementById('verse-drawer-body');
        if (!bodyEl) return;

        if (!STATE.currentAyatData || !STATE.currentAyatData.ayat) {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); font-size: 0.9rem;">
                    <p style="margin-bottom: 0.5rem;">⚠️ Teks ayat belum dapat dimuat.</p>
                    <button type="button" class="verse-tool-btn" onclick="window.smMurottal.retryLoadVerses()">Coba Muat Ulang</button>
                </div>
            `;
            return;
        }

        const data = STATE.currentAyatData;
        const totalAyat = data.ayat.length;

        let ayahNum = targetAyah || STATE.currentActiveAyah || STATE.currentSingleAyah || 1;
        if (ayahNum < 1) ayahNum = 1;
        if (ayahNum > totalAyat) ayahNum = totalAyat;
        STATE.currentSingleAyah = ayahNum;

        const ayah = data.ayat.find(a => a.nomorAyat === ayahNum) || data.ayat[0];
        const isPlaying = STATE.currentActiveAyah === ayah.nomorAyat;
        const hasPrev = ayah.nomorAyat > 1;
        const hasNext = ayah.nomorAyat < totalAyat;

        bodyEl.innerHTML = `
            <div class="verse-single-wrap">
                <div class="verse-card-item active-playing-verse verse-single-card" id="verse-card-${ayah.nomorAyat}">
                    <div class="verse-card-header">
                        <span class="verse-num-badge">Ayat ${ayah.nomorAyat} dari ${totalAyat}</span>
                        <span class="verse-active-indicator" style="display: ${isPlaying ? 'inline-flex' : 'none'};">
                            <span>🔊 Sedang Diputar</span>
                        </span>
                    </div>
                    <div class="verse-arabic-text verse-single-arabic" style="font-size: ${STATE.verseFontSize}rem; text-align: center; line-height: 2.1;">
                        ${ayah.teksArab}
                    </div>
                    <div class="verse-latin-text" style="display: ${STATE.verseShowLatin ? 'block' : 'none'}; text-align: center; margin-top: 0.6rem; font-size: 0.92rem;">
                        ${ayah.teksLatin}
                    </div>
                    <div class="verse-trans-text" style="display: ${STATE.verseShowTrans ? 'block' : 'none'}; text-align: center; font-size: 0.92rem; line-height: 1.6; margin-top: 0.5rem;">
                        "${ayah.teksIndonesia}"
                    </div>
                </div>

                <!-- Navigasi 1 Ayat Sebelumnya / Berikutnya -->
                <div class="verse-single-nav">
                    <button type="button" class="verse-single-nav-btn" ${hasPrev ? '' : 'disabled'} onclick="window.smMurottal.navigateSingleAyah(-1)" title="Ayat Sebelumnya">
                        <span>⏮️</span><span class="nav-btn-text"> <span class="nav-btn-word-ayat">Ayat </span>Sebelumnya</span>
                    </button>
                    <span class="verse-single-nav-pos">
                        ${ayah.nomorAyat} / ${totalAyat}
                    </span>
                    <button type="button" class="verse-single-nav-btn" ${hasNext ? '' : 'disabled'} onclick="window.smMurottal.navigateSingleAyah(1)" title="Ayat Berikutnya">
                        <span class="nav-btn-text"><span class="nav-btn-word-ayat">Ayat </span>Berikutnya </span><span>⏭️</span>
                    </button>
                </div>
            </div>
        `;
    }

    function navigateSingleAyah(delta) {
        if (!STATE.currentAyatData || !STATE.currentAyatData.ayat) return;
        const total = STATE.currentAyatData.ayat.length;
        const current = STATE.currentSingleAyah || STATE.currentActiveAyah || 1;
        const target = current + delta;
        if (target >= 1 && target <= total) {
            seekToAyah(target);
            if (STATE.verseDisplayMode === 'single') {
                renderSingleVerse(target);
            }
        }
    }

    function renderVerseList() {
        const bodyEl = document.getElementById('verse-drawer-body');
        if (!bodyEl) return;

        if (!STATE.currentAyatData || !STATE.currentAyatData.ayat) {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); font-size: 0.9rem;">
                    <p style="margin-bottom: 0.5rem;">⚠️ Teks ayat belum dapat dimuat.</p>
                    <button type="button" class="verse-tool-btn" onclick="window.smMurottal.retryLoadVerses()">Coba Muat Ulang</button>
                </div>
            `;
            return;
        }

        const data = STATE.currentAyatData;
        const html = data.ayat.map((ayah) => {
            const isPlaying = STATE.currentActiveAyah === ayah.nomorAyat;
            return `
                <div class="verse-card-item ${isPlaying ? 'active-playing-verse' : ''}" 
                     id="verse-card-${ayah.nomorAyat}" 
                     data-ayah="${ayah.nomorAyat}"
                     onclick="window.smMurottal.seekToAyah(${ayah.nomorAyat})">
                    <div class="verse-card-header">
                        <span class="verse-num-badge">Ayat ${ayah.nomorAyat}</span>
                        <span class="verse-active-indicator">
                            <span>🔊 Sedang Diputar</span>
                        </span>
                    </div>
                    <div class="verse-arabic-text" style="font-size: ${STATE.verseFontSize}rem;">
                        ${ayah.teksArab}
                    </div>
                    <div class="verse-latin-text" style="display: ${STATE.verseShowLatin ? 'block' : 'none'};">
                        ${ayah.teksLatin}
                    </div>
                    <div class="verse-trans-text" style="display: ${STATE.verseShowTrans ? 'block' : 'none'};">
                        ${ayah.teksIndonesia}
                    </div>
                </div>
            `;
        }).join('');

        bodyEl.innerHTML = html;

        if (STATE.currentActiveAyah) {
            highlightActiveVerse(STATE.currentActiveAyah, false);
        }
    }

    function highlightActiveVerse(ayahNum, shouldScroll = true) {
        STATE.currentActiveAyah = ayahNum;
        STATE.currentSingleAyah = ayahNum;

        if (STATE.verseDisplayMode === 'single') {
            renderSingleVerse(ayahNum);
            return;
        }

        const oldCard = document.querySelector('.verse-card-item.active-playing-verse');
        if (oldCard && oldCard.id !== `verse-card-${ayahNum}`) {
            oldCard.classList.remove('active-playing-verse');
        }

        const newCard = document.getElementById(`verse-card-${ayahNum}`);
        if (newCard) {
            newCard.classList.add('active-playing-verse');
            if (shouldScroll && STATE.verseAutoScroll && STATE.verseDrawerOpen) {
                const body = document.getElementById('verse-drawer-body');
                if (body) {
                    const cardTop = newCard.offsetTop - body.offsetTop;
                    body.scrollTo({
                        top: Math.max(0, cardTop - 30),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }

    function updateActiveVerseSync(currentTimeSec) {
        if (!STATE.hasSyncTimestamps || !STATE.currentTimestamps || STATE.currentTimestamps.length === 0) {
            return;
        }
        const curMs = currentTimeSec * 1000;
        const match = STATE.currentTimestamps.find(ts => curMs >= ts.timestamp_from && curMs < ts.timestamp_to);
        if (match) {
            const parts = match.verse_key.split(':');
            const ayahNum = parseInt(parts[1], 10);
            if (!isNaN(ayahNum) && ayahNum !== STATE.currentActiveAyah) {
                highlightActiveVerse(ayahNum, true);
            }
        } else if (curMs >= STATE.currentTimestamps[STATE.currentTimestamps.length - 1].timestamp_to) {
            const lastTs = STATE.currentTimestamps[STATE.currentTimestamps.length - 1];
            const parts = lastTs.verse_key.split(':');
            const ayahNum = parseInt(parts[1], 10);
            if (!isNaN(ayahNum) && ayahNum !== STATE.currentActiveAyah) {
                highlightActiveVerse(ayahNum, true);
            }
        }
    }

    function seekToAyah(ayahNumber) {
        STATE.currentSingleAyah = ayahNumber;
        if (!STATE.audio) return;
        if (STATE.hasSyncTimestamps && STATE.currentTimestamps) {
            const surahNum = STATE.currentlyPlaying ? STATE.currentlyPlaying.surahNumber : 1;
            const targetKey = `${surahNum}:${ayahNumber}`;
            const ts = STATE.currentTimestamps.find(t => t.verse_key === targetKey);
            if (ts) {
                STATE.audio.currentTime = ts.timestamp_from / 1000;
                highlightActiveVerse(ayahNumber, false);
                if (STATE.audio.paused) {
                    STATE.audio.play().catch(() => {});
                }
                return;
            }
        }
        if (STATE.verseDisplayMode === 'single') {
            renderSingleVerse(ayahNumber);
        } else {
            const card = document.getElementById(`verse-card-${ayahNumber}`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function toggleVerseDrawer(forceState) {
        const drawer = document.getElementById('player-verse-drawer');
        const lyricsBtn = document.getElementById('btn-player-lyrics');
        if (!drawer) return;

        if (typeof forceState === 'boolean') {
            STATE.verseDrawerOpen = forceState;
        } else {
            STATE.verseDrawerOpen = !STATE.verseDrawerOpen;
        }

        if (STATE.verseDrawerOpen) {
            drawer.classList.add('open');
            if (lyricsBtn) lyricsBtn.classList.add('active');
            if (STATE.currentActiveAyah) {
                setTimeout(() => {
                    highlightActiveVerse(STATE.currentActiveAyah, true);
                }, 100);
            }
        } else {
            drawer.classList.remove('open');
            if (lyricsBtn) lyricsBtn.classList.remove('active');
        }
    }

    function adjustVerseFontSize(delta) {
        STATE.verseFontSize = Math.min(3.2, Math.max(1.0, +(STATE.verseFontSize + delta).toFixed(2)));
        renderVerseContent();
    }

    function toggleVerseLatin() {
        STATE.verseShowLatin = !STATE.verseShowLatin;
        const btn = document.getElementById('btn-verse-toggle-latin');
        if (btn) btn.classList.toggle('active', STATE.verseShowLatin);
        renderVerseContent();
    }

    function toggleVerseTrans() {
        STATE.verseShowTrans = !STATE.verseShowTrans;
        const btn = document.getElementById('btn-verse-toggle-trans');
        if (btn) btn.classList.toggle('active', STATE.verseShowTrans);
        renderVerseContent();
    }

    function toggleVerseAutoScroll() {
        STATE.verseAutoScroll = !STATE.verseAutoScroll;
        const btn = document.getElementById('btn-verse-toggle-autoscroll');
        if (btn) btn.classList.toggle('active', STATE.verseAutoScroll);
        showToast(STATE.verseAutoScroll ? 'Auto scroll aktif 📜' : 'Auto scroll nonaktif');
    }

    function retryLoadVerses() {
        if (STATE.currentlyPlaying) {
            loadSurahAyatData(STATE.currentlyPlaying.surahNumber, {
                id: STATE.currentlyPlaying.qariId,
                name: STATE.currentlyPlaying.qariName
            });
        }
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

        // Check if reciter has this surah available
        if (reciter.surahList && typeof reciter.surahList === 'string') {
            const availableSurahs = reciter.surahList.split(',');
            if (!availableSurahs.includes(String(surahNumber))) {
                showToast(`Audio Surah ${surah.namaLatin} tidak tersedia untuk ${reciter.name} di MP3Quran.`);
                return;
            }
        }

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
        if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
            window.smSync.scheduleSync();
        }
    }

    function updatePlaylistBadge() {
        const badge = document.getElementById('badge-playlist-count');
        if (badge) badge.textContent = STATE.customPlaylist.length;
    }

    function openAddPlaylistModal(surahNumber) {
        const surah = STATE.surahList.find(s => s.nomor === surahNumber);
        if (!surah) return;
        STATE.pendingPlaylistSurah = surah;
        STATE.pendingPlaylistQariId = STATE.currentReciter.id;
        STATE.playlistReciterScope = 'popular';

        const titleEl = document.getElementById('add-playlist-surah-title');
        if (titleEl) {
            titleEl.innerHTML = `Tambahkan <strong>Surah ${surah.nomor}. ${surah.namaLatin}</strong> ke Playlist:`;
        }

        const searchInput = document.getElementById('playlist-qari-search');
        if (searchInput) searchInput.value = '';

        const btnPop = document.getElementById('btn-playlist-scope-popular');
        const btnAll = document.getElementById('btn-playlist-scope-all');
        if (btnPop) btnPop.classList.add('active');
        if (btnAll) btnAll.classList.remove('active');

        // Render reciters in modal
        filterPlaylistReciters('');

        // Ensure all reciters are loaded in background
        if (!STATE.recitersLoaded) {
            loadAllReciters();
        }

        const modal = document.getElementById('add-playlist-modal');
        if (modal) modal.classList.add('active');
    }

    function setPlaylistScope(scope) {
        STATE.playlistReciterScope = scope;
        const btnPop = document.getElementById('btn-playlist-scope-popular');
        const btnAll = document.getElementById('btn-playlist-scope-all');
        if (btnPop) btnPop.classList.toggle('active', scope === 'popular');
        if (btnAll) btnAll.classList.toggle('active', scope === 'all');

        const searchInput = document.getElementById('playlist-qari-search');
        const query = searchInput ? searchInput.value : '';
        filterPlaylistReciters(query);
    }

    function filterPlaylistReciters(query) {
        const rawQ = (query || '').toLowerCase().trim();
        let sourceList = POPULAR_RECITERS;

        if (STATE.playlistReciterScope === 'all') {
            sourceList = STATE.allReciters.length > 0 ? STATE.allReciters : POPULAR_RECITERS;
        }

        // When user types a search query, search across all 240+ reciters if available
        if (rawQ && STATE.allReciters.length > 0) {
            sourceList = STATE.allReciters;
        }

        const qWords = normalizeSearch(rawQ).split(/\s+/).filter(w => w.length > 1);

        const filtered = sourceList.filter(r => {
            if (!rawQ) return true;
            const fullRaw = `${r.name} ${r.altName || ''} ${r.desc || ''} ${r.arabicName || ''}`.toLowerCase();
            if (fullRaw.includes(rawQ)) return true;

            const normTarget = normalizeSearch(`${r.name} ${r.altName || ''}`);
            if (qWords.length > 0 && qWords.every(w => normTarget.includes(w))) {
                return true;
            }
            return false;
        });

        renderPlaylistReciterOptions(filtered);
    }

    function renderPlaylistReciterOptions(list) {
        const container = document.getElementById('playlist-qari-list-container');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem 1rem; color: var(--gray-500); font-size: 0.88rem;">
                    🔍 Tidak ditemukan qari yang cocok. Silakan coba kata kunci lain.
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(r => {
            const isSelected = r.id === STATE.pendingPlaylistQariId;
            const isPopular = POPULAR_RECITERS.some(p => p.id === r.id);
            const hasSync = !!getQuranComReciterId(r);
            return `
            <div class="reciter-option-card ${isSelected ? 'selected' : ''}" onclick="window.smMurottal.selectPlaylistQari('${r.id}')" style="cursor: pointer; padding: 0.75rem 1rem;">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: baseline; gap: 0.35rem; font-size: 0.92rem; color: var(--green-900); flex-wrap: wrap; margin-bottom: 2px;">
                        <span style="font-weight: 700; line-height: 1.35; word-break: break-word;">${r.name}</span>
                        ${isSelected ? '<span style="color: #059669; font-weight: bold; font-size: 0.85rem;">✓</span>' : ''}
                        ${hasSync ? '<span style="font-size: 0.7rem; color: #065f46; background: #a7f3d0; padding: 1px 6px; border-radius: 9999px; font-weight: 700; white-space: nowrap;">⚡ Sync Ayat</span>' : ''}
                        ${isPopular && !hasSync ? '<span style="font-size: 0.7rem; color: #047857; background: #d1fae5; padding: 1px 5px; border-radius: 9999px; white-space: nowrap;">Populer</span>' : ''}
                    </div>
                    <span style="font-size: 0.78rem; color: var(--gray-500); display: block; line-height: 1.4;">${r.desc || ''}</span>
                </div>
                <div style="font-family: 'Amiri', serif; font-size: 1.15rem; color: var(--green-700); text-align: right; flex-shrink: 0; padding-left: 0.5rem; white-space: nowrap;">
                    ${r.arabicName || ''}
                </div>
            </div>
            `;
        }).join('');
    }

    function selectPlaylistQari(reciterId) {
        STATE.pendingPlaylistQariId = reciterId;
        const select = document.getElementById('playlist-qari-select');
        if (select) select.value = reciterId;

        // Re-render to show active selection
        const searchInput = document.getElementById('playlist-qari-search');
        filterPlaylistReciters(searchInput ? searchInput.value : '');
    }

    function closeAddPlaylistModal() {
        const modal = document.getElementById('add-playlist-modal');
        if (modal) modal.classList.remove('active');
        STATE.pendingPlaylistSurah = null;
        STATE.pendingPlaylistQariId = null;
    }

    function confirmAddToPlaylist() {
        if (!STATE.pendingPlaylistSurah) return;
        const qariId = STATE.pendingPlaylistQariId || STATE.currentReciter.id;
        let qari = POPULAR_RECITERS.find(r => r.id === qariId);
        if (!qari && STATE.allReciters.length > 0) {
            qari = STATE.allReciters.find(r => r.id === qariId);
        }
        qari = qari || STATE.currentReciter;

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

    // Reciter Data Manager
    async function loadAllReciters() {
        if (STATE.recitersLoaded && STATE.allReciters.length > 0) return STATE.allReciters;
        try {
            const res = await fetch('js/mp3quran-reciters.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                STATE.allReciters = data;
                STATE.recitersLoaded = true;
                return STATE.allReciters;
            }
        } catch (err) {
            console.warn('Failed to load local reciters JSON, fallback to API:', err);
            try {
                const apiRes = await fetch('https://mp3quran.net/api/v3/reciters?language=id');
                const apiData = await apiRes.json();
                if (apiData && Array.isArray(apiData.reciters)) {
                    STATE.allReciters = apiData.reciters.map(r => {
                        const m = (r.moshaf && r.moshaf[0]) || {};
                        return {
                            id: String(r.id),
                            name: r.name,
                            arabicName: r.letter || '',
                            desc: (m.name || 'Murattal') + ' • ' + (m.surah_total || 114) + ' Surah',
                            server: m.server || '',
                            surahTotal: m.surah_total || 114,
                            surahList: m.surah_list || ''
                        };
                    });
                    STATE.recitersLoaded = true;
                }
            } catch (apiErr) {
                console.error('All reciters fallback error:', apiErr);
                STATE.allReciters = [...POPULAR_RECITERS];
            }
        }
        return STATE.allReciters;
    }

    function setReciterScope(scope) {
        STATE.reciterScope = scope;
        const btnPop = document.getElementById('btn-scope-popular');
        const btnAll = document.getElementById('btn-scope-all');
        if (btnPop) btnPop.classList.toggle('active', scope === 'popular');
        if (btnAll) btnAll.classList.toggle('active', scope === 'all');

        const searchInput = document.getElementById('reciter-search-box');
        const query = searchInput ? searchInput.value : '';
        filterReciters(query);
    }

    // Reciter Selector Modal
    async function openReciterModal() {
        const modal = document.getElementById('reciter-modal');
        if (modal) modal.classList.add('active');

        // Render current scope
        const searchInput = document.getElementById('reciter-search-box');
        const query = searchInput ? searchInput.value : '';
        filterReciters(query);

        // Preload all reciters in background if not yet loaded
        if (!STATE.recitersLoaded) {
            await loadAllReciters();
            if (STATE.reciterScope === 'all' || (searchInput && searchInput.value.trim())) {
                filterReciters(searchInput ? searchInput.value : '');
            }
        }
    }

    function closeReciterModal() {
        const modal = document.getElementById('reciter-modal');
        if (modal) modal.classList.remove('active');
    }

    function renderReciterOptions(list) {
        const container = document.getElementById('reciter-options-list');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--gray-500); font-size: 0.9rem;">
                    🔍 Tidak ditemukan qari yang cocok. Silakan coba kata kunci lain.
                </div>
            `;
            return;
        }

        container.innerHTML = list.map(r => {
            const isSelected = r.id === STATE.currentReciter.id;
            const isPopular = POPULAR_RECITERS.some(p => p.id === r.id);
            const hasSync = !!getQuranComReciterId(r);
            return `
            <div class="reciter-option-card ${isSelected ? 'selected' : ''}" onclick="window.smMurottal.selectReciter('${r.id}')" style="cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.95rem; color: var(--green-900); flex-wrap: wrap; margin-bottom: 3px;">
                        <span style="font-weight: 700; line-height: 1.35; word-break: break-word;">${r.name}</span>
                        ${r.id === '76' ? '⭐' : ''}
                        ${hasSync ? '<span style="font-size: 0.7rem; color: #065f46; background: #a7f3d0; padding: 1px 6px; border-radius: 9999px; font-weight: 700; white-space: nowrap;">⚡ Sync Ayat</span>' : ''}
                        ${isPopular && !hasSync ? '<span style="font-size: 0.72rem; color: #047857; background: #d1fae5; padding: 1px 6px; border-radius: 9999px; white-space: nowrap;">Populer</span>' : ''}
                    </div>
                    <span style="font-size: 0.78rem; color: var(--gray-500); display: block; line-height: 1.4;">${r.desc || ''}</span>
                </div>
                <div style="font-family: 'Amiri', serif; font-size: 1.15rem; color: var(--green-700); text-align: right; flex-shrink: 0; padding-left: 0.75rem; white-space: nowrap;">
                    ${r.arabicName || ''}
                </div>
            </div>
        `;
        }).join('');
    }

    function normalizeSearch(str) {
        return (str || '')
            .toLowerCase()
            .replace(/[-_']/g, ' ')
            .replace(/\b(al|at|ath|as|asy|ar|an)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function filterReciters(query) {
        const rawQ = (query || '').toLowerCase().trim();
        let sourceList = POPULAR_RECITERS;

        if (STATE.reciterScope === 'all') {
            sourceList = STATE.allReciters.length > 0 ? STATE.allReciters : POPULAR_RECITERS;
        }

        // When user types a search query, search across all 240+ reciters if available
        if (rawQ && STATE.allReciters.length > 0) {
            sourceList = STATE.allReciters;
        }

        const qWords = normalizeSearch(rawQ).split(/\s+/).filter(w => w.length > 1);

        const filtered = sourceList.filter(r => {
            if (!rawQ) return true;
            const fullRaw = `${r.name} ${r.altName || ''} ${r.desc || ''} ${r.arabicName || ''}`.toLowerCase();
            if (fullRaw.includes(rawQ)) return true;

            const normTarget = normalizeSearch(`${r.name} ${r.altName || ''}`);
            if (qWords.length > 0 && qWords.every(w => normTarget.includes(w))) {
                return true;
            }
            return false;
        });

        renderReciterOptions(filtered);
    }

    function selectReciter(reciterId) {
        let chosen = POPULAR_RECITERS.find(r => r.id === reciterId);
        if (!chosen && STATE.allReciters.length > 0) {
            chosen = STATE.allReciters.find(r => r.id === reciterId);
        }

        if (chosen) {
            STATE.currentReciter = chosen;
            try {
                localStorage.setItem('sm_murottal_reciter_id', chosen.id);
                localStorage.setItem('sm_murottal_reciter_custom', JSON.stringify(chosen));
            } catch (e) {}

            updateActiveReciterBannerUI(chosen);
            closeReciterModal();
            showToast(`Qari aktif: ${chosen.name} 🎙️`);
            renderSurahList();

            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        }
    }

    function updateActiveReciterBannerUI(reciter) {
        const nameEl = document.getElementById('active-reciter-name');
        const descEl = document.getElementById('active-reciter-desc');
        if (!nameEl || !reciter) return;
        const isDefault = reciter.id === '76';
        const hasSync = !!getQuranComReciterId(reciter);
        const syncBadge = hasSync ? '<span style="font-size: 0.72rem; background: #d1fae5; color: #047857; padding: 0.15rem 0.55rem; border-radius: 9999px; font-weight: 700; margin-left: 4px;">⚡ Sync Ayat</span>' : '';
        const sourceBadge = isDefault ? '<span style="font-size: 0.8rem; background: #d1fae5; color: #065f46; padding: 0.2rem 0.55rem; border-radius: 9999px;">Pilihan Utama ⭐</span>' : '<span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 0.15rem 0.5rem; border-radius: 9999px;">MP3Quran 🌍</span>';
        nameEl.innerHTML = `${reciter.name} ${sourceBadge} ${syncBadge}`;
        if (descEl) descEl.textContent = reciter.desc || '';
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

        // Restore saved reciter
        try {
            const savedReciterJson = localStorage.getItem('sm_murottal_reciter_custom');
            const savedReciterId = localStorage.getItem('sm_murottal_reciter_id');
            if (savedReciterJson) {
                const parsed = JSON.parse(savedReciterJson);
                if (parsed && parsed.id && parsed.server) {
                    STATE.currentReciter = parsed;
                }
            } else if (savedReciterId) {
                const found = POPULAR_RECITERS.find(r => r.id === savedReciterId);
                if (found) STATE.currentReciter = found;
            }
        } catch (e) {}

        // UI active reciter setup
        updateActiveReciterBannerUI(STATE.currentReciter);

        loadPlaylist();
        await refreshOfflineState();
        renderSurahList();

        // Preload all 240+ reciters in background
        loadAllReciters();

        setVerseDisplayMode(STATE.verseDisplayMode);
        const transBtn = document.getElementById('btn-verse-toggle-trans');
        if (transBtn) transBtn.classList.toggle('active', !!STATE.verseShowTrans);
        const autoScrollBtn = document.getElementById('btn-verse-toggle-autoscroll');
        if (autoScrollBtn) autoScrollBtn.classList.toggle('active', !!STATE.verseAutoScroll);

        // Listen for cloud sync updates
        window.addEventListener('sm:sync-applied', () => {
            loadPlaylist();
            renderPlaylist();
            const savedReciterJson = localStorage.getItem('sm_murottal_reciter_custom');
            if (savedReciterJson) {
                try {
                    const parsed = JSON.parse(savedReciterJson);
                    if (parsed && parsed.id && parsed.id !== STATE.currentReciter.id) {
                        STATE.currentReciter = parsed;
                        updateActiveReciterBannerUI(parsed);
                        renderSurahList();
                    }
                } catch (e) {}
            }
        });
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
        setReciterScope,
        loadAllReciters,
        openAddPlaylistModal,
        closeAddPlaylistModal,
        confirmAddToPlaylist,
        setPlaylistScope,
        filterPlaylistReciters,
        selectPlaylistQari,
        removeFromPlaylist,
        playEntirePlaylist,
        downloadAllPlaylist,
        clearPlaylist,
        downloadSurahOffline,
        deleteSurahOffline,
        downloadMp3ToDevice,
        clearAllOfflineStorage,
        onSearchSurah,
        setFilter,
        toggleVerseDrawer,
        adjustVerseFontSize,
        toggleVerseLatin,
        toggleVerseTrans,
        toggleVerseAutoScroll,
        seekToAyah,
        retryLoadVerses,
        setVerseDisplayMode,
        navigateSingleAyah
    };

    document.addEventListener('DOMContentLoaded', init);
})();
