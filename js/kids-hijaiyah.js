// ============================================================
// kids-hijaiyah.js — Papan Suara Hijaiyah & Makhraj Interaktif
// Sahabat Muslim Kids | Vanilla ES6+ (Tanpa framework / bundler)
// Fitur: 29 kartu huruf, suara Web SpeechSynthesis (ar-SA),
//        info makhraj & kata contoh, mini game "Tebak Huruf".
// ============================================================

(function () {
    'use strict';

    // -------------------------------------------------------------
    // DATA: 29 Huruf Hijaiyah (Alif s.d. Ya')
    // -------------------------------------------------------------
    const LETTERS = [
        { char: 'ا', name: 'Alif', latin: 'a', speak: 'اَ', makhraj: 'Bibir terbuka lebar dan lidah tetap santai. Alif adalah huruf panjang yang keluar dari tengah mulut.', example: { ar: 'أَسَد', id: 'Singa', emoji: '🦁' } },
        { char: 'ب', name: 'Ba', latin: 'b', speak: 'بَ', makhraj: 'Bibir merapat lalu meletus cepat. Bunyinya keluar dari bibir, "ba".', example: { ar: 'بَيْت', id: 'Rumah', emoji: '🏠' } },
        { char: 'ت', name: 'Ta', latin: 't', speak: 'تَ', makhraj: 'Ujung lidah menempel di belakang gigi depan atas, ringan dan lembut.', example: { ar: 'تُفَّاح', id: 'Apel', emoji: '🍎' } },
        { char: 'ث', name: 'Tsa', latin: 'ts', speak: 'ثَ', makhraj: 'Ujung lidah menyentuh ujung gigi depan, suara halus seperti desisan lembut.', example: { ar: 'ثَعْلَب', id: 'Rubah', emoji: '🦊' } },
        { char: 'ج', name: 'Jim', latin: 'j', speak: 'جَ', makhraj: 'Tengah lidah menjauh dari langit-langit mulut dan sedikit bergetar.', example: { ar: 'جَمَل', id: 'Unta', emoji: '🐪' } },
        { char: 'ح', name: 'Ha', latin: 'h', speak: 'حَ', makhraj: 'Keluar dari tengah kerongkongan dengan halus, seperti tiupan angin.', example: { ar: 'حَصَان', id: 'Kuda', emoji: '🐎' } },
        { char: 'خ', name: 'Kha', latin: 'kh', speak: 'خَ', makhraj: 'Bagian belakang atas kerongkongan, seperti saat menggosok gigi bagian dalam.', example: { ar: 'خُبْز', id: 'Roti', emoji: '🍞' } },
        { char: 'د', name: 'Dal', latin: 'd', speak: 'دَ', makhraj: 'Ujung lidah menyentuh gigi depan atas dengan lembut, tanpa getaran.', example: { ar: 'دَفْتَر', id: 'Buku Tulis', emoji: '📓' } },
        { char: 'ذ', name: 'Dzal', latin: 'dz', speak: 'ذَ', makhraj: 'Ujung lidah di belakang gigi depan sambil bersuara gemetar halus.', example: { ar: 'ذَهَب', id: 'Emas', emoji: '💛' } },
        { char: 'ر', name: 'Ra', latin: 'r', speak: 'رَ', makhraj: 'Ujung lidah bergetar di belakang gigi atas, seperti suara "rrr".', example: { ar: 'رَمْل', id: 'Pasir', emoji: '🏖️' } },
        { char: 'ز', name: 'Zai', latin: 'z', speak: 'زَ', makhraj: 'Seperti Ra, tapi lidahnya lebih santai dan suara lebih tajam.', example: { ar: 'زَهْرَة', id: 'Bunga', emoji: '🌸' } },
        { char: 'س', name: 'Sin', latin: 's', speak: 'سَ', makhraj: 'Ujung lidah di belakang gigi depan, suara mendesis seperti ular.', example: { ar: 'سَمَك', id: 'Ikan', emoji: '🐟' } },
        { char: 'ش', name: 'Syin', latin: 'sy', speak: 'شَ', makhraj: 'Bibir sedikit maju ke depan, suara mendesis seperti angin sepoi.', example: { ar: 'شَمْس', id: 'Matahari', emoji: '☀️' } },
        { char: 'ص', name: 'Shad', latin: 'sh', speak: 'صَ', makhraj: 'Ujung lidah di belakang gigi geraham atas, ada rongga udara di sisi lidah.', example: { ar: 'صَقْر', id: 'Elang', emoji: '🦅' } },
        { char: 'ض', name: 'Dhad', latin: 'dh', speak: 'ضَ', makhraj: 'Seperti Shad, tapi bersuara tebal dari belakang lidah.', example: { ar: 'ضَوْء', id: 'Cahaya', emoji: '💡' } },
        { char: 'ط', name: 'Tha', latin: 'th', speak: 'طَ', makhraj: 'Ujung lidah di belakang gigi depan dengan suara tebal dan kuat.', example: { ar: 'طَائِر', id: 'Burung', emoji: '🐦' } },
        { char: 'ظ', name: 'Zha', latin: 'zh', speak: 'ظَ', makhraj: 'Posisinya seperti Tha, tapi bersuara gemetar dan tebal.', example: { ar: 'ظِلّ', id: 'Bayangan', emoji: '🌑' } },
        { char: 'ع', name: "'Ain", latin: "'a", speak: 'عَ', makhraj: 'Tengah lidah diturunkan, suara keluar dari tengah kerongkongan.', example: { ar: 'عَيْن', id: 'Mata', emoji: '👁️' } },
        { char: 'غ', name: 'Ghain', latin: 'gh', speak: 'غَ', makhraj: 'Belakang kerongkongan bergetar, seperti suara mendengus kambing.', example: { ar: 'غَيْم', id: 'Awan', emoji: '☁️' } },
        { char: 'ف', name: 'Fa', latin: 'f', speak: 'فَ', makhraj: 'Gigi atas menyentuh bibir bawah, udara keluar pelan lewat sela gigi.', example: { ar: 'فِيل', id: 'Gajah', emoji: '🐘' } },
        { char: 'ق', name: 'Qaf', latin: 'q', speak: 'قَ', makhraj: 'Belakang lidah menempel kuat ke langit-langit belakang, lalu lepas.', example: { ar: 'قَمَر', id: 'Bulan', emoji: '🌙' } },
        { char: 'ك', name: 'Kaf', latin: 'k', speak: 'كَ', makhraj: 'Tengah lidah menempel ke langit-langit, keluar keras dan jelas.', example: { ar: 'كِتَاب', id: 'Buku', emoji: '📖' } },
        { char: 'ل', name: 'Lam', latin: 'l', speak: 'لَ', makhraj: 'Ujung lidah menyentuh gigi depan atas, suara mengalir "llu".', example: { ar: 'لَيْمُون', id: 'Lemon', emoji: '🍋' } },
        { char: 'م', name: 'Mim', latin: 'm', speak: 'مَ', makhraj: 'Bibir merapat, lalu suara keluar lewat hidung dengan lembut.', example: { ar: 'مِسْطَرَة', id: 'Penggaris', emoji: '📏' } },
        { char: 'ن', name: 'Nun', latin: 'n', speak: 'نَ', makhraj: 'Ujung lidah di belakang gigi depan dan getaran keluar dari hidung.', example: { ar: 'نَجْمَة', id: 'Bintang', emoji: '⭐' } },
        { char: 'ة', name: "Ha'", latin: 'h', speak: 'ة', makhraj: 'Bibir membentuk lingkaran kecil, suara "ha" manis di ujung kata.', example: { ar: 'فَاطِمَة', id: 'Nama Putri Nabi', emoji: '👧' } },
        { char: 'و', name: 'Wawu', latin: 'w', speak: 'وَ', makhraj: 'Bibir membulat ke depan seperti sedang membunyikan "uu".', example: { ar: 'وَرْدَة', id: 'Bunga Mawar', emoji: '🌹' } },
        { char: 'لا', name: 'Lam Alif', latin: 'la', speak: 'لَا', makhraj: 'Gabungan Lam lalu Alif: ujung lidah menyentuh gigi, kemudian mulut terbuka panjang.', example: { ar: 'إِسْلَام', id: 'Islam', emoji: '☪️' } },
        { char: 'ي', name: "Ya'", latin: 'y', speak: 'يَ', makhraj: 'Bibir sedikit melebar dan lidah naik tinggi, seperti bunyi "ii".', example: { ar: 'يَد', id: 'Tangan', emoji: '✋' } }
    ];

    const TOTAL_ROUNDS = 8;
    const STORAGE_COLOR_CLASSES = ['hj-c0', 'hj-c1', 'hj-c2', 'hj-c3', 'hj-c4', 'hj-c5'];

    const state = {
        rendered: false,
        game: {
            active: false,
            round: 0,
            score: 0,
            targetIndex: -1,
            optionIndexes: [],
            answered: false,
            finished: false
        }
    };

    // -------------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------------
    function getContainer() {
        return document.getElementById('hijaiyah-view-container');
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
        toast._timer = setTimeout(() => el.classList.remove('show'), 2600);
    }

    // Efek suara klik kecil memakai WebAudio (tanpa file MP3)
    function playClick() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!playClick._ctx) playClick._ctx = new AudioCtx();
            const ctx = playClick._ctx;
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 680;
            gain.gain.setValueAtTime(0.0001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            // Efek suara bersifat opsional — diamkan bila tidak didukung
        }
    }

    function pickArabicVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices() || [];
            return voices.find(v => v.lang && /^ar([-_]|$)/i.test(v.lang)) || null;
        } catch (e) {
            return null;
        }
    }

    // Membacakan teks Arab via Web SpeechSynthesis (gratis, tanpa file MP3)
    function speakArabic(text, rate = 0.85) {
        if (!text) return false;
        if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
            toast('Perangkat ini belum mendukung suara. Dibaca bersama Ustaz/Ustazah ya! 🌿');
            return false;
        }
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'ar-SA';
            utter.rate = rate;
            utter.pitch = 1;
            const voice = pickArabicVoice();
            if (voice) utter.voice = voice;
            window.speechSynthesis.speak(utter);
            return true;
        } catch (e) {
            toast('Suara belum siap di perangkat ini. Coba ketuk sekali lagi ya! 🌿');
            return false;
        }
    }

    function shuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    // -------------------------------------------------------------
    // TAMPILAN PAPAN HURUF
    // -------------------------------------------------------------
    function render() {
        const container = getContainer();
        if (!container) return;

        const cardsHtml = LETTERS.map((letter, i) => `
            <button type="button" class="hj-card ${STORAGE_COLOR_CLASSES[i % STORAGE_COLOR_CLASSES.length]}" data-index="${i}"
                onclick="window.KidsHijaiyah.pickLetter(${i})" aria-label="Huruf ${letter.name}">
                <span class="hj-char arabic">${letter.char}</span>
                <span class="hj-name">${letter.name}</span>
                <span class="hj-latin">${letter.latin}</span>
                <span class="hj-play" aria-hidden="true">🔊</span>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="hj-hero">
                <div class="hj-hero-emoji" aria-hidden="true">🔤</div>
                <h2 class="hj-hero-title">Ayo Kenalan Dengan Huruf Hijaiyah!</h2>
                <p class="hj-hero-desc">Ketuk salah satu kartu huruf, lalu dengarkan bunyinya dengan baik. Setiap huruf punya tempat keluar suara (makhraj) dan kata contoh yang seru!</p>
                <button type="button" class="hj-btn-main" id="hj-game-start" onclick="window.KidsHijaiyah.startGame()">
                    🎮 Main Tebak Huruf Cilik
                </button>
            </div>

            <div class="hj-grid" id="hj-grid">
                ${cardsHtml}
            </div>

            <div class="hj-game" id="hj-game" style="display: none;"></div>
        `;

        state.rendered = true;
        state.game.active = false;

        // Modal info huruf (satu per halaman)
        ensureInfoModal();
    }

    function ensureInfoModal() {
        let overlay = document.getElementById('hj-info-modal');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'hj-info-modal';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeInfo();
        });
        overlay.innerHTML = '<div class="hj-info-card" id="hj-info-card"></div>';
        document.body.appendChild(overlay);
        return overlay;
    }

    function pickLetter(index) {
        const letter = LETTERS[index];
        if (!letter) return;

        playClick();

        // Animasi pop pada kartu yang dipilih
        const card = document.querySelector(`#hj-grid .hj-card[data-index="${index}"]`);
        if (card) {
            card.classList.remove('pop');
            // Paksa reflow agar animasi bisa diulang
            void card.offsetWidth;
            card.classList.add('pop');
        }

        speakArabic(letter.speak || letter.char);
        openInfo(index);
    }

    function openInfo(index) {
        const letter = LETTERS[index];
        if (!letter) return;
        const overlay = ensureInfoModal();
        const card = document.getElementById('hj-info-card');
        if (!card) return;

        card.innerHTML = `
            <button type="button" class="modal-close-btn hj-info-close" aria-label="Tutup" onclick="window.KidsHijaiyah.closeInfo()">✕</button>
            <div class="hj-info-top">
                <span class="hj-info-char arabic">${letter.char}</span>
                <div class="hj-info-heading">
                    <h3>Huruf ${letter.name}</h3>
                    <p>Tulisan latin: <b>${letter.latin}</b> • Bunyi: <b>"${letter.speak.replace(/[َُِْ]/g, '')}"</b></p>
                </div>
            </div>
            <div class="hj-info-block">
                <h4>👄 Tempat Keluar Huruf (Makhraj)</h4>
                <p>${letter.makhraj}</p>
            </div>
            <div class="hj-info-block hj-info-example-block">
                <h4>✨ Kata Contoh</h4>
                <p class="hj-info-example">
                    <span class="arabic">${letter.example.ar}</span>
                    <span class="hj-info-example-meaning">${letter.example.emoji} ${letter.example.id}</span>
                </p>
            </div>
            <button type="button" class="hj-btn-main" onclick="window.KidsHijaiyah.speakLetter(${index})">
                🔊 Dengarkan Lagi
            </button>
        `;
        overlay.classList.add('active');
    }

    function closeInfo() {
        const overlay = document.getElementById('hj-info-modal');
        if (overlay) overlay.classList.remove('active');
    }

    function speakLetter(index) {
        const letter = LETTERS[index];
        if (!letter) return;
        playClick();
        speakArabic(letter.speak || letter.char);
    }

    // -------------------------------------------------------------
    // MINI GAME "TEBAK HURUF CILIK"
    // -------------------------------------------------------------
    function startGame() {
        playClick();
        state.game = {
            active: true,
            round: 0,
            score: 0,
            targetIndex: -1,
            optionIndexes: [],
            answered: false,
            finished: false
        };

        const grid = document.getElementById('hj-grid');
        const hero = document.querySelector('.hj-hero');
        const gameEl = document.getElementById('hj-game');
        if (hero) hero.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (gameEl) gameEl.style.display = 'block';

        closeInfo();
        nextRound();
    }

    function buildRound() {
        const target = Math.floor(Math.random() * LETTERS.length);
        const others = [];
        while (others.length < 3) {
            const idx = Math.floor(Math.random() * LETTERS.length);
            if (idx !== target && others.indexOf(idx) === -1) others.push(idx);
        }
        state.game.targetIndex = target;
        state.game.optionIndexes = shuffle([target].concat(others));
        state.game.answered = false;
    }

    function nextRound() {
        if (state.game.round >= TOTAL_ROUNDS) {
            finishGame();
            return;
        }
        state.game.round += 1;
        buildRound();
        renderGame();
    }

    function renderGame() {
        const gameEl = document.getElementById('hj-game');
        if (!gameEl) return;

        const target = LETTERS[state.game.targetIndex];
        const optionsHtml = state.game.optionIndexes.map((idx, pos) => {
            const letter = LETTERS[idx];
            return `
                <button type="button" class="hj-option hj-card ${STORAGE_COLOR_CLASSES[pos % STORAGE_COLOR_CLASSES.length]}"
                    data-index="${idx}" onclick="window.KidsHijaiyah.answer(${idx})"
                    aria-label="Pilihan huruf ${letter.name}">
                    <span class="hj-char arabic">${letter.char}</span>
                    <span class="hj-name">${letter.name}</span>
                </button>
            `;
        }).join('');

        gameEl.innerHTML = `
            <div class="hj-game-card">
                <div class="hj-game-header">
                    <span class="hj-game-pill">Soal ${state.game.round}/${TOTAL_ROUNDS}</span>
                    <span class="hj-game-score">⭐ Skor: ${state.game.score}</span>
                </div>
                <h3 class="hj-game-question">Manakah huruf <b>${target.name}</b> <span class="hj-game-q-hint">(${target.latin})</span>?</h3>
                <div class="hj-options-grid" id="hj-options">
                    ${optionsHtml}
                </div>
                <div id="hj-feedback"></div>
                <button type="button" class="hj-btn-secondary" onclick="window.KidsHijaiyah.exitGame()">⬅️ Kembali ke Papan Huruf</button>
            </div>
        `;
    }

    function answer(index) {
        if (state.game.answered || state.game.finished) return;
        state.game.answered = true;
        playClick();

        const correct = index === state.game.targetIndex;
        const target = LETTERS[state.game.targetIndex];
        const optionButtons = document.querySelectorAll('#hj-options .hj-option');
        optionButtons.forEach(btn => {
            const btnIndex = Number(btn.getAttribute('data-index'));
            btn.disabled = true;
            if (btnIndex === state.game.targetIndex) btn.classList.add('is-correct');
            else if (btnIndex === index) btn.classList.add('is-wrong');
            else btn.classList.add('is-disabled');
        });

        const feedback = document.getElementById('hj-feedback');
        if (correct) {
            state.game.score += 1;
            const scoreEl = document.querySelector('.hj-game-score');
            if (scoreEl) scoreEl.textContent = `⭐ Skor: ${state.game.score}`;
            if (feedback) {
                feedback.innerHTML = `
                    <div class="hj-feedback-banner banner-correct">
                        <strong>🎉 Alhamdulillah, benar sekali!</strong>
                        <p>Hurufnya adalah <span class="arabic">${target.char}</span> — ${target.name}. Hebat! 🌟</p>
                        <button type="button" class="hj-btn-main" onclick="window.KidsHijaiyah.nextRound()">
                            ${state.game.round >= TOTAL_ROUNDS ? '🏆 Lihat Hasil' : 'Soal Berikutnya ➡️'}
                        </button>
                    </div>
                `;
            }
            speakArabic('أَحْسَنْتَ', 0.8);
        } else {
            if (feedback) {
                feedback.innerHTML = `
                    <div class="hj-feedback-banner banner-wrong">
                        <strong>💪 Belum tepat, ayo coba lagi ya!</strong>
                        <p>Jawaban yang benar adalah <span class="arabic">${target.char}</span> — <b>${target.name}</b>.</p>
                        <button type="button" class="hj-btn-main" onclick="window.KidsHijaiyah.nextRound()">
                            ${state.game.round >= TOTAL_ROUNDS ? '🏆 Lihat Hasil' : 'Soal Berikutnya ➡️'}
                        </button>
                    </div>
                `;
            }
        }
    }

    function finishGame() {
        state.game.finished = true;
        const gameEl = document.getElementById('hj-game');
        if (!gameEl) return;

        const score = state.game.score;
        const total = TOTAL_ROUNDS;
        const stars = score >= total ? 3 : (score >= Math.ceil(total / 2) ? 2 : 1);
        const starText = '⭐'.repeat(stars);
        let cheer = 'Ayo latihan lagi ya, adik hebat! 🌱';
        if (stars === 2) cheer = 'Bagus sekali, hampir sempurna! 🌿';
        if (stars === 3) cheer = 'MasyaAllah, luar biasa! Juara huruf Hijaiyah! 🏆';

        gameEl.innerHTML = `
            <div class="hj-game-card hj-result-card">
                <div class="hj-result-stars">${starText}</div>
                <h3 class="hj-game-question">Permainan Selesai!</h3>
                <div class="hj-result-score">${score} / ${total}</div>
                <p class="hj-result-cheer">${cheer}</p>
                <div class="hj-result-actions">
                    <button type="button" class="hj-btn-main" onclick="window.KidsHijaiyah.startGame()">🔁 Main Lagi</button>
                    <button type="button" class="hj-btn-secondary" onclick="window.KidsHijaiyah.exitGame()">⬅️ Papan Huruf</button>
                </div>
            </div>
        `;
        speakArabic('مَا شَاءَ اللَّهُ', 0.8);
    }

    function exitGame() {
        playClick();
        state.game.active = false;
        const gameEl = document.getElementById('hj-game');
        const grid = document.getElementById('hj-grid');
        const hero = document.querySelector('.hj-hero');
        if (gameEl) {
            gameEl.style.display = 'none';
            gameEl.innerHTML = '';
        }
        if (grid) grid.style.display = 'grid';
        if (hero) hero.style.display = 'block';
    }

    // -------------------------------------------------------------
    // PUBLIC API
    // -------------------------------------------------------------
    window.KidsHijaiyah = {
        render,
        pickLetter,
        speakLetter,
        closeInfo,
        startGame,
        answer,
        nextRound,
        exitGame
    };

    // Dukungan URL hash: #hijaiyah
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#hijaiyah' && window.KidsQuiz && typeof window.KidsQuiz.switchMainTab === 'function') {
            setTimeout(() => window.KidsQuiz.switchMainTab('hijaiyah'), 300);
        }
    });
})();
