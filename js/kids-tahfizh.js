// ============================================================
// kids-tahfizh.js — Pohon Hafalan Juz 'Amma (Sahabat Muslim Kids)
// Vanilla ES6+ (Tanpa framework / bundler), No-Login First.
// Progress hafalan disimpan di localStorage
// (sm_kids_tahfizh_progress) & auto-sync jika window.smSync ada.
// ============================================================

(function () {
    'use strict';

    const STORAGE_KEY = 'sm_kids_tahfizh_progress';
    const AUDIO_BASE_URL = 'https://equran.nos.wjv-1.neo.id/audio-full/Misyari-Rasyid-Al-Afasi/';

    // -------------------------------------------------------------
    // DATA: 37 Surat Juz 30 (78 An-Naba' s.d. 114 An-Nas)
    // -------------------------------------------------------------
    const SURAHS = [
        { no: 78, arabic: 'النبأ', latin: "An-Naba'", ayat: 40, arti: 'Kabar Besar' },
        { no: 79, arabic: 'النازعات', latin: 'An-Naziat', ayat: 46, arti: 'Malaikat yang Mencabut' },
        { no: 80, arabic: 'عبس', latin: "'Abasa", ayat: 42, arti: 'Ia Bermuka Masam' },
        { no: 81, arabic: 'التكوير', latin: 'At-Takwir', ayat: 29, arti: 'Menggulung' },
        { no: 82, arabic: 'الانفطار', latin: 'Al-Infitar', ayat: 19, arti: 'Terbelah' },
        { no: 83, arabic: 'المطففين', latin: 'Al-Mutaffifin', ayat: 36, arti: 'Orang yang Curang' },
        { no: 84, arabic: 'الانشقاق', latin: 'Al-Inshiqaq', ayat: 25, arti: 'Terbelah (Langit)' },
        { no: 85, arabic: 'البروج', latin: 'Al-Buruj', ayat: 22, arti: 'Gugusan Bintang' },
        { no: 86, arabic: 'الطارق', latin: 'At-Tariq', ayat: 17, arti: 'Yang Datang di Malam Hari' },
        { no: 87, arabic: 'الأعلى', latin: "Al-A'la", ayat: 19, arti: 'Yang Paling Tinggi' },
        { no: 88, arabic: 'الغاشية', latin: 'Al-Ghasyiyah', ayat: 26, arti: 'Hari Pembalasan' },
        { no: 89, arabic: 'الفجر', latin: 'Al-Fajr', ayat: 30, arti: 'Fajar' },
        { no: 90, arabic: 'البلد', latin: 'Al-Balad', ayat: 20, arti: 'Negeri' },
        { no: 91, arabic: 'الشمس', latin: 'Asy-Syams', ayat: 15, arti: 'Matahari' },
        { no: 92, arabic: 'الليل', latin: 'Al-Lail', ayat: 21, arti: 'Malam' },
        { no: 93, arabic: 'الضحى', latin: 'Ad-Duha', ayat: 11, arti: 'Waktu Duha' },
        { no: 94, arabic: 'الشرح', latin: 'Asy-Syarah', ayat: 8, arti: 'Melapangkan' },
        { no: 95, arabic: 'التين', latin: 'At-Tin', ayat: 8, arti: 'Buah Tin' },
        { no: 96, arabic: 'العلق', latin: "Al-'Alaq", ayat: 19, arti: 'Segumpal Darah' },
        { no: 97, arabic: 'القدر', latin: 'Al-Qadr', ayat: 5, arti: 'Kemuliaan' },
        { no: 98, arabic: 'البينة', latin: 'Al-Bayyinah', ayat: 8, arti: 'Penerang' },
        { no: 99, arabic: 'الزلزلة', latin: 'Az-Zalzalah', ayat: 8, arti: 'Kiamat' },
        { no: 100, arabic: 'العاديات', latin: "Al-'Adiyat", ayat: 11, arti: 'Kuda yang Bertanding' },
        { no: 101, arabic: 'القارعة', latin: "Al-Qari'ah", ayat: 11, arti: 'Hari Kiamat' },
        { no: 102, arabic: 'التكاثر', latin: 'At-Takatsur', ayat: 8, arti: 'Bermegah-megahan' },
        { no: 103, arabic: 'العصر', latin: "Al-'Asr", ayat: 3, arti: 'Masa' },
        { no: 104, arabic: 'الهمزة', latin: 'Al-Humazah', ayat: 9, arti: 'Pengumpat' },
        { no: 105, arabic: 'الفيل', latin: 'Al-Fil', ayat: 5, arti: 'Gajah' },
        { no: 106, arabic: 'قريش', latin: 'Quraisy', ayat: 4, arti: 'Suku Quraisy' },
        { no: 107, arabic: 'الماعون', latin: "Al-Ma'un", ayat: 7, arti: 'Barang yang Berguna' },
        { no: 108, arabic: 'الكوثر', latin: 'Al-Kautsar', ayat: 3, arti: 'Nikmat Berlimpah' },
        { no: 109, arabic: 'الكافرون', latin: 'Al-Kafirun', ayat: 6, arti: 'Orang Kafir' },
        { no: 110, arabic: 'النصر', latin: 'An-Nasr', ayat: 3, arti: 'Pertolongan' },
        { no: 111, arabic: 'المسد', latin: 'Al-Masad', ayat: 5, arti: 'Tali Tembak' },
        { no: 112, arabic: 'الإخلاص', latin: 'Al-Ikhlas', ayat: 4, arti: 'Ikhlas' },
        { no: 113, arabic: 'الفلق', latin: 'Al-Falaq', ayat: 5, arti: 'Waktu Subuh' },
        { no: 114, arabic: 'الناس', latin: 'An-Nas', ayat: 6, arti: 'Manusia' }
    ];

    const STATUS_META = {
        0: { icon: '🔒', label: 'Belum Hafal', cardIcon: '🌱' },
        1: { icon: '🌿', label: 'Sedang Dihafal', cardIcon: '🌿' },
        2: { icon: '⭐', label: 'Sudah Hafal', cardIcon: '⭐' }
    };

    const state = {
        filter: 'all',
        modalSurahNo: null
    };

    // -------------------------------------------------------------
    // PENYIMPANAN PROGRESS (localStorage + auto sync)
    // -------------------------------------------------------------
    function loadProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    function saveProgress(progress) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
            console.warn('[KidsTahfizh] Gagal menyimpan progress:', e);
        }
        // Auto-sync ke cloud jika pengguna sedang login
        if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
            try {
                window.smSync.scheduleSync();
            } catch (e) {
                /* abaikan bila sync tidak siap */
            }
        }
    }

    function getStatus(surahNo) {
        const progress = loadProgress();
        const value = Number(progress[String(surahNo)]);
        return (value === 1 || value === 2) ? value : 0;
    }

    function setStatus(surahNo, status) {
        const progress = loadProgress();
        progress[String(surahNo)] = status;
        saveProgress(progress);
    }

    function countByStatus(status) {
        let count = 0;
        SURAHS.forEach(s => {
            if (getStatus(s.no) === status) count += 1;
        });
        return count;
    }

    // -------------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------------
    function getContainer() {
        return document.getElementById('tahfizh-view-container');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function toast(msg) {
        let el = document.getElementById('kids-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'kids-toast';
            el.className = 'kids-toast';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => el.classList.remove('show'), 2800);
    }

    function audioUrl(surahNo) {
        return AUDIO_BASE_URL + String(surahNo).padStart(3, '0') + '.mp3';
    }

    function filteredSurahs() {
        if (state.filter === 'all') return SURAHS;
        const wanted = state.filter === 'done' ? 2 : (state.filter === 'learning' ? 1 : 0);
        return SURAHS.filter(s => getStatus(s.no) === wanted);
    }

    // -------------------------------------------------------------
    // TAMPILAN Pohon Hafalan
    // -------------------------------------------------------------
    function render() {
        const container = getContainer();
        if (!container) return;

        const doneCount = countByStatus(2);
        const percent = Math.round((doneCount / SURAHS.length) * 100);

        const filterDefs = [
            { key: 'all', label: 'Semua Surat', icon: '📚' },
            { key: 'done', label: 'Sudah Hafal', icon: '⭐' },
            { key: 'learning', label: 'Sedang Dihafal', icon: '🌿' },
            { key: 'none', label: 'Belum Hafal', icon: '🔒' }
        ];

        container.innerHTML = `
            <div class="tf-progress-card">
                <div class="tf-progress-emoji" aria-hidden="true">🌳</div>
                <div class="tf-progress-body">
                    <h2 class="tf-progress-title">Pohon Hafalan Juz 'Amma</h2>
                    <p class="tf-progress-text" id="tf-progress-text"></p>
                    <div class="tf-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
                        <div class="tf-progress-fill" id="tf-progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
            </div>

            <div class="tf-filters" id="tf-filters">
                ${filterDefs.map(f => `
                    <button type="button" class="tf-filter-btn ${state.filter === f.key ? 'active' : ''}"
                        data-filter="${f.key}" onclick="window.KidsTahfizh.setFilter('${f.key}')">
                        <span>${f.icon}</span> ${f.label}
                    </button>
                `).join('')}
            </div>

            <div class="tf-grid" id="tf-grid"></div>

            <div class="modal-overlay" id="tf-modal" role="dialog" aria-modal="true">
                <div class="tf-modal-card" id="tf-modal-card"></div>
            </div>
        `;

        renderProgressText();
        renderGrid();

        const modal = document.getElementById('tf-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    }

    function renderProgressText() {
        const doneCount = countByStatus(2);
        const percent = Math.round((doneCount / SURAHS.length) * 100);
        const textEl = document.getElementById('tf-progress-text');
        const fillEl = document.getElementById('tf-progress-fill');
        if (textEl) {
            textEl.innerHTML = `Alhamdulillah sudah hafal <b>${doneCount}</b> dari <b>${SURAHS.length}</b> Surat Juz 'Amma (<b>${percent}%</b>)`;
        }
        if (fillEl) fillEl.style.width = `${percent}%`;
    }

    function renderGrid() {
        const grid = document.getElementById('tf-grid');
        if (!grid) return;

        const list = filteredSurahs();
        if (list.length === 0) {
            grid.innerHTML = `
                <div class="tf-empty">
                    <div class="tf-empty-icon">🌿</div>
                    <h3>Belum ada surat di sini</h3>
                    <p>Coba pilih filter lain yuk!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(s => {
            const status = getStatus(s.no);
            const meta = STATUS_META[status];
            return `
                <button type="button" class="tf-card tf-st-${status}" data-no="${s.no}"
                    onclick="window.KidsTahfizh.openSurah(${s.no})" aria-label="Surat ${escapeHtml(s.latin)}">
                    <span class="tf-leaf" aria-hidden="true">${meta.cardIcon}</span>
                    <span class="tf-surah-no">${s.no}</span>
                    <span class="tf-surah-arabic arabic">${s.arabic}</span>
                    <span class="tf-surah-latin">${escapeHtml(s.latin)}</span>
                    <span class="tf-surah-ayat">${s.ayat} ayat</span>
                    <span class="tf-badge tf-badge-st-${status}"
                        role="button" tabindex="0"
                        onclick="window.KidsTahfizh.cycleStatus(${s.no}, event)"
                        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.KidsTahfizh.cycleStatus(${s.no}, event);}">
                        ${meta.icon} ${meta.label}
                    </span>
                </button>
            `;
        }).join('');
    }

    function setFilter(key) {
        state.filter = key;
        document.querySelectorAll('#tf-filters .tf-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter') === key);
        });
        renderGrid();
    }

    // Ubah status hafalan dalam 1 ketukan: Belum ➡️ Sedang ➡️ Sudah ➡️ Belum
    function cycleStatus(surahNo, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const current = getStatus(surahNo);
        const next = (current + 1) % 3;
        setStatus(surahNo, next);

        const meta = STATUS_META[next];
        const surah = SURAHS.find(s => s.no === surahNo);
        toast(`${meta.icon} ${surah ? surah.latin : ''} — ${meta.label}`);
        renderProgressText();
        renderGrid();

        // Perbarui pill status di modal jika sedang terbuka
        if (state.modalSurahNo === surahNo) renderModal(surahNo);
    }

    // -------------------------------------------------------------
    // MODAL AUDIO & LATIHAN HAFALAN
    // -------------------------------------------------------------
    function openSurah(surahNo) {
        state.modalSurahNo = surahNo;
        renderModal(surahNo);
        const modal = document.getElementById('tf-modal');
        if (modal) modal.classList.add('active');
    }

    function closeModal() {
        const modal = document.getElementById('tf-modal');
        const audio = document.getElementById('tf-audio');
        if (audio) {
            try { audio.pause(); } catch (e) { /* abaikan */ }
        }
        if (modal) modal.classList.remove('active');
        state.modalSurahNo = null;
    }

    function renderModal(surahNo) {
        const card = document.getElementById('tf-modal-card');
        const surah = SURAHS.find(s => s.no === surahNo);
        if (!card || !surah) return;

        const status = getStatus(surahNo);
        const meta = STATUS_META[status];

        card.innerHTML = `
            <div class="tf-modal-header">
                <div class="tf-modal-heading">
                    <span class="tf-modal-arabic arabic">${surah.arabic}</span>
                    <div>
                        <h3>${escapeHtml(surah.latin)}</h3>
                        <p>Surat ke-${surah.no} • ${surah.ayat} ayat • ${escapeHtml(surah.arti)}</p>
                    </div>
                </div>
                <button type="button" class="modal-close-btn" aria-label="Tutup" onclick="window.KidsTahfizh.closeModal()">✕</button>
            </div>

            <div class="tf-modal-status tf-st-${status}">
                ${meta.icon} ${meta.label}
            </div>

            <div class="tf-audio-wrap">
                <audio id="tf-audio" controls preload="none" src="${audioUrl(surah.no)}"></audio>
                <p class="tf-audio-note">🎧 Murottal oleh Misyari Rasyid Al-Afasi</p>
            </div>

            <div class="tf-modal-actions">
                <button type="button" class="tf-btn tf-btn-star ${status === 2 ? 'is-active' : ''}"
                    onclick="window.KidsTahfizh.markStatus(${surahNo}, 2)">
                    ⭐ Tandai Sudah Hafal
                </button>
                <button type="button" class="tf-btn tf-btn-leaf ${status === 1 ? 'is-active' : ''}"
                    onclick="window.KidsTahfizh.markStatus(${surahNo}, 1)">
                    🌿 Sedang Menghafal
                </button>
            </div>

            <button type="button" class="tf-btn-reset" onclick="window.KidsTahfizh.markStatus(${surahNo}, 0)">
                Atur ulang ke "Belum Hafal" 🔒
            </button>
        `;
    }

    function markStatus(surahNo, status) {
        setStatus(surahNo, status);
        const meta = STATUS_META[status];
        const surah = SURAHS.find(s => s.no === surahNo);
        toast(`${meta.icon} ${surah ? surah.latin : ''} — ${meta.label}`);
        renderProgressText();
        renderGrid();
        renderModal(surahNo);
    }

    // -------------------------------------------------------------
    // PUBLIC API
    // -------------------------------------------------------------
    window.KidsTahfizh = {
        render,
        setFilter,
        openSurah,
        closeModal,
        cycleStatus,
        markStatus
    };

    // Perbarui tampilan bila data dari cloud selesai digabungkan
    document.addEventListener('sm:sync-applied', () => {
        const section = document.getElementById('kids-tahfizh-section');
        if (section && section.style.display !== 'none' && section.style.display !== '') {
            renderProgressText();
            renderGrid();
        }
    });

    // Dukungan URL hash: #tahfizh
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#tahfizh' && window.KidsQuiz && typeof window.KidsQuiz.switchMainTab === 'function') {
            setTimeout(() => window.KidsQuiz.switchMainTab('tahfizh'), 300);
        }
    });
})();
