/**
 * Sahabat Muslim Kids — Kuis Santri Cilik
 * Interaktif, Edukatif, Ramah Anak, Terintegrasi PostgreSQL
 */

(function () {
    'use strict';

    // Offline fallback data (15 Soal Cadangan saat koneksi internet mati)
    const FALLBACK_QUESTIONS = [
        {
            id: 101,
            category: "aqidah",
            level: "mudah",
            question: "Siapakah satu-satunya Tuhan yang wajib kita sembah dan menciptakan alam semesta?",
            options: ["Malaikat", "Allah Subhanahu wa Ta'ala", "Nabi dan Rasul"],
            correct_index: 1,
            explanation: "Masya Allah benar! Hanya Allah yang berhak disembah dan tiada sekutu bagi-Nya (QS. Al-Ikhlas: 1-4)."
        },
        {
            id: 102,
            category: "aqidah",
            level: "mudah",
            question: "Ada berapa jumlah Rukun Iman yang wajib diyakini setiap muslim?",
            options: ["5 Rukun", "6 Rukun", "7 Rukun"],
            correct_index: 1,
            explanation: "Hebat! Rukun Iman ada 6: Iman kepada Allah, Malaikat, Kitab, Rasul, Hari Kiamat, & Takdir."
        },
        {
            id: 103,
            category: "sirah",
            level: "mudah",
            question: "Siapakah Nabi dan Rasul terakhir yang diutus Allah untuk seluruh manusia?",
            options: ["Nabi Isa 'alaihissalam", "Nabi Muhammad ﷺ", "Nabi Musa 'alaihissalam"],
            correct_index: 1,
            explanation: "Benar sekali! Nabi Muhammad ﷺ adalah penutup para Nabi dan Rasul."
        },
        {
            id: 104,
            category: "sirah",
            level: "mudah",
            question: "Nabi yang pernah ditelan ikan paus besar lalu diselamatkan Allah adalah...?",
            options: ["Nabi Yunus 'alaihissalam", "Nabi Luth 'alaihissalam", "Nabi Yusuf 'alaihissalam"],
            correct_index: 0,
            explanation: "Tepat sekali! Nabi Yunus terus berdzikir memohon ampun di dalam perut paus."
        },
        {
            id: 105,
            category: "adab",
            level: "mudah",
            question: "Saat hendak makan dan minum, tangan manakah yang diajarkan oleh Rasulullah ﷺ?",
            options: ["Tangan kanan", "Tangan kiri", "Bebas tangan mana saja"],
            correct_index: 0,
            explanation: "Masya Allah! Rasulullah bersabda: 'Makanlah dengan tangan kananmu!' (HR. Bukhari)."
        },
        {
            id: 106,
            category: "adab",
            level: "mudah",
            question: "Ucapan doa dan salam saat bertemu sesama saudara muslim adalah...?",
            options: ["Halo apa kabar", "Assalamu'alaikum warahmatullah", "Selamat pagi kawan"],
            correct_index: 1,
            explanation: "Tepat! Menyebarkan salam adalah tanda kasih sayang sesama muslim."
        },
        {
            id: 107,
            category: "ibadah",
            level: "mudah",
            question: "Ada berapa waktu sholat fardhu (wajib) yang dikerjakan setiap hari?",
            options: ["3 waktu", "5 waktu", "7 waktu"],
            correct_index: 1,
            explanation: "Alhamdulillah tepat! Sholat fardhu ada 5: Subuh, Dzuhur, Ashar, Maghrib, dan Isya."
        },
        {
            id: 108,
            category: "ibadah",
            level: "mudah",
            question: "Surah apakah di dalam Al-Qur'an yang wajib dibaca pada setiap raka'at sholat?",
            options: ["Surah Al-Ikhlas", "Surah Al-Fatihah", "Surah An-Nas"],
            correct_index: 1,
            explanation: "Hebat! Surah Al-Fatihah (Ummul Qur'an) wajib dibaca di setiap raka'at sholat."
        },
        {
            id: 109,
            category: "adab",
            level: "mudah",
            question: "Kaki manakah yang disunnahkan melangkah lebih dulu saat masuk ke dalam Masjid?",
            options: ["Kaki kiri", "Kaki kanan", "Bebas saja"],
            correct_index: 1,
            explanation: "Benar! Masuk masjid menggunakan kaki kanan sambil berdoa meminta rahmat Allah."
        },
        {
            id: 110,
            category: "sirah",
            level: "mudah",
            question: "Nabi yang diperintahkan Allah membuat kapal bahtera besar adalah...?",
            options: ["Nabi Nuh 'alaihissalam", "Nabi Adam 'alaihissalam", "Nabi Isa 'alaihissalam"],
            correct_index: 0,
            explanation: "Masya Allah! Nabi Nuh membuat kapal besar untuk menyelamatkan orang beriman dari banjir."
        }
    ];

    const QUIZ_STATE = {
        category: 'all',
        level: 'all',
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false,
        selectedOption: null,
        isPlaying: false,
        totalQuestions: 10,
        playerName: localStorage.getItem('sm_kids_player_name') || ''
    };

    // Category labels and icons
    const CATEGORIES = {
        all: { label: 'Semua Kategori', icon: '🌟' },
        aqidah: { label: 'Aqidah & Tauhid', icon: '☝️' },
        sirah: { label: 'Kisah Nabi & Sahabat', icon: '🎙️' },
        adab: { label: 'Adab & Akhlak', icon: '🌿' },
        ibadah: { label: 'Ibadah & Al-Qur\'an', icon: '🕌' }
    };

    // Synthesized Sound Effects for Kids via Web Audio API (Zero External Files)
    function playQuizAudio(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            if (type === 'correct') {
                // Cheerful ascending melody C5, E5, G5, C6
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                    gain.gain.setValueAtTime(0.14, now + idx * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.07);
                    osc.stop(now + idx * 0.07 + 0.28);
                });
            } else if (type === 'wrong') {
                // Gentle warm boop (not harsh)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(349.23, now); // F4
                osc.frequency.setValueAtTime(261.63, now + 0.12); // C4
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.32);
            } else if (type === 'finish') {
                // Celebration Fanfare
                const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                fanfare.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.09);
                    gain.gain.setValueAtTime(0.16, now + idx * 0.09);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.38);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.09);
                    osc.stop(now + idx * 0.09 + 0.38);
                });
            }
        } catch (e) {
            // Audio context not allowed or unsupported
        }
    }

    // Switch main tabs: Videos vs Quiz vs Hijaiyah vs Tahfizh
    function switchMainTab(tab) {
        const current = tab || 'videos';
        const TAB_BUTTON_IDS = {
            videos: 'tab-btn-videos',
            quiz: 'tab-btn-quiz',
            hijaiyah: 'tab-btn-hijaiyah',
            tahfizh: 'tab-btn-tahfizh'
        };
        const SECTION_IDS = {
            quiz: 'kids-quiz-section',
            hijaiyah: 'kids-hijaiyah-section',
            tahfizh: 'kids-tahfizh-section'
        };

        const filterSection = document.querySelector('.kids-filter-section');
        const contentSection = document.querySelector('.kids-content-section');

        // Aktifkan tombol tab yang dipilih
        Object.keys(TAB_BUTTON_IDS).forEach(key => {
            const btn = document.getElementById(TAB_BUTTON_IDS[key]);
            if (btn) btn.classList.toggle('active', key === current);
        });

        // Tab videos menampilkan daftar channel, tab lain menyembunyikannya
        const showVideos = current === 'videos';
        if (filterSection) filterSection.style.display = showVideos ? 'block' : 'none';
        if (contentSection) contentSection.style.display = showVideos ? 'block' : 'none';

        // Tampilkan hanya section tab aktif
        let activeSection = null;
        Object.keys(SECTION_IDS).forEach(key => {
            const section = document.getElementById(SECTION_IDS[key]);
            if (!section) return;
            section.style.display = (key === current) ? 'block' : 'none';
            if (key === current) activeSection = section;
        });

        // Render isi tab sesuai kebutuhan
        if (current === 'quiz') {
            renderQuizLobby();
        } else if (current === 'hijaiyah' && window.KidsHijaiyah && typeof window.KidsHijaiyah.render === 'function') {
            window.KidsHijaiyah.render();
        } else if (current === 'tahfizh' && window.KidsTahfizh && typeof window.KidsTahfizh.render === 'function') {
            window.KidsTahfizh.render();
        }

        // Scroll lembut ke section tab (kecuali tab videos)
        if (current !== 'videos' && activeSection) {
            activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Render Quiz Lobby / Selection Screen
    function renderQuizLobby() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-lobby-card">
                <div class="quiz-lobby-badge">🎯 Kuis Cerdas Ceria Islam</div>
                <h2 class="quiz-lobby-title">Santri Cilik Berprestasi ✨</h2>
                <p class="quiz-lobby-desc">Ayo uji wawasan keislamanmu sambil mengumpulkan bintang emas! Pilih topik yang ingin kamu pelajari:</p>

                <div class="quiz-cat-selector">
                    ${Object.keys(CATEGORIES).map(key => `
                        <button type="button" class="quiz-cat-pill ${QUIZ_STATE.category === key ? 'active' : ''}" onclick="window.KidsQuiz.selectCategory('${key}')">
                            <span class="cat-icon">${CATEGORIES[key].icon}</span>
                            <span>${CATEGORIES[key].label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="quiz-player-name-card">
                    <label for="lobby-player-name">
                        <span>🧒</span>
                        <span>Siapa Namamu, Santri Cilik?</span>
                    </label>
                    <input type="text" id="lobby-player-name" class="quiz-player-input" placeholder="Tulis namamu (misal: Ahmad / Aisyah)" value="${escapeHtml(QUIZ_STATE.playerName)}" oninput="window.KidsQuiz.setPlayerName(this.value)">
                </div>

                <div style="display: flex; justify-content: center; gap: 0.85rem; flex-wrap: wrap;">
                    <button type="button" class="quiz-btn-start" onclick="window.KidsQuiz.startQuiz()">
                        🚀 Mulai Kuis Ceria (10 Soal)
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.openLeaderboard()">
                        🏆 Papan Juara Santri
                    </button>
                </div>

                <div class="quiz-lobby-footer-note">
                    <span>✨ Materi edukasi Islam shahih & aman sesuai Al-Qur'an dan Sunnah</span>
                </div>
            </div>
        `;
    }

    function setPlayerName(name) {
        QUIZ_STATE.playerName = (name || '').trim();
        try {
            localStorage.setItem('sm_kids_player_name', QUIZ_STATE.playerName);
        } catch (e) {}
    }

    function selectCategory(cat) {
        QUIZ_STATE.category = cat;
        renderQuizLobby();
    }

    // Start Quiz: Fetch from API or fallback
    async function startQuiz() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        // Smooth scroll to quiz card
        const quizSection = document.getElementById('kids-quiz-section');
        if (quizSection) quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        container.innerHTML = `
            <div class="quiz-lobby-card" style="padding: 4rem 1rem;">
                <div class="quiz-spinner"></div>
                <p style="margin-top: 1.25rem; font-weight: 800; font-size: 1.1rem; color: #065f46; font-family: 'Comic Neue', cursive, sans-serif;">Menyiapkan soal kuis ceria...</p>
            </div>
        `;

        let questions = [];
        try {
            const catParam = QUIZ_STATE.category !== 'all' ? `&category=${encodeURIComponent(QUIZ_STATE.category)}` : '';
            const res = await fetch(`/api/kids/quiz?limit=10${catParam}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data && data.ok && Array.isArray(data.questions) && data.questions.length > 0) {
                    questions = data.questions;
                }
            }
        } catch (e) {
            console.warn('Gagal memuat kuis dari API, menggunakan data cadangan offline:', e);
        }

        // Fallback if API returns empty or failed
        if (!questions || questions.length === 0) {
            let pool = FALLBACK_QUESTIONS;
            if (QUIZ_STATE.category !== 'all') {
                pool = FALLBACK_QUESTIONS.filter(q => q.category === QUIZ_STATE.category);
                if (pool.length === 0) pool = FALLBACK_QUESTIONS;
            }
            // Shuffle
            questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        QUIZ_STATE.questions = questions;
        QUIZ_STATE.currentIndex = 0;
        QUIZ_STATE.score = 0;
        QUIZ_STATE.answered = false;
        QUIZ_STATE.selectedOption = null;
        QUIZ_STATE.isPlaying = true;

        renderCurrentQuestion();
    }

    // Render Active Question
    function renderCurrentQuestion() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        const q = QUIZ_STATE.questions[QUIZ_STATE.currentIndex];
        if (!q) {
            renderQuizResult();
            return;
        }

        const currentNum = QUIZ_STATE.currentIndex + 1;
        const total = QUIZ_STATE.questions.length;
        const progressPercent = Math.round((currentNum / total) * 100);
        const catInfo = CATEGORIES[q.category] || { label: q.category, icon: '📖' };

        container.innerHTML = `
            <div class="quiz-play-card">
                <!-- Top Progress Bar -->
                <div class="quiz-play-header">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <span class="quiz-cat-tag">${catInfo.icon} ${catInfo.label}</span>
                        <span class="quiz-question-counter-pill">Soal ${currentNum} / ${total}</span>
                    </div>
                    <div class="quiz-score-badge">
                        <span>⭐</span>
                        <span>${QUIZ_STATE.score} Poin</span>
                    </div>
                </div>

                <div class="quiz-progress-bar-wrap">
                    <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>

                <!-- Question Text (Speech Bubble) -->
                <div class="quiz-question-box">
                    <h3 class="quiz-question-text">${q.question}</h3>
                </div>

                <!-- Options Grid -->
                <div class="quiz-options-grid">
                    ${q.options.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx); // A, B, C
                        let stateClass = '';
                        let iconHtml = letter;
                        if (QUIZ_STATE.answered) {
                            if (idx === q.correct_index) {
                                stateClass = 'is-correct';
                                iconHtml = '✓';
                            } else if (idx === QUIZ_STATE.selectedOption) {
                                stateClass = 'is-wrong';
                                iconHtml = '✕';
                            } else {
                                stateClass = 'is-disabled';
                            }
                        }
                        return `
                            <button type="button" class="quiz-option-btn ${stateClass}" 
                                    ${QUIZ_STATE.answered ? 'disabled' : ''} 
                                    onclick="window.KidsQuiz.handleAnswer(${idx})">
                                <span class="quiz-option-letter">${iconHtml}</span>
                                <span class="quiz-option-text">${opt}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- Explanation Feedback Box -->
                <div id="quiz-feedback-box" class="quiz-feedback-box" style="display: ${QUIZ_STATE.answered ? 'block' : 'none'};">
                    ${QUIZ_STATE.answered ? renderFeedbackContent(q) : ''}
                </div>
            </div>
        `;

        // If answered, auto-scroll gently to the feedback
        if (QUIZ_STATE.answered) {
            setTimeout(() => {
                const feedbackBox = document.getElementById('quiz-feedback-box');
                if (feedbackBox) {
                    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 60);
        }
    }

    function renderFeedbackContent(q) {
        const isCorrect = QUIZ_STATE.selectedOption === q.correct_index;
        return `
            <div class="quiz-feedback-banner ${isCorrect ? 'banner-correct' : 'banner-wrong'}">
                <div class="quiz-feedback-title">
                    <span>${isCorrect ? '🎉 Masya Allah, Tepat Sekali! (+10 Poin)' : '💡 Belum Tepat, Tetap Semangat Ya!'}</span>
                </div>
                <p class="quiz-feedback-desc">${q.explanation || ''}</p>
                <div style="text-align: right; margin-top: 0.5rem;">
                    <button type="button" class="quiz-btn-next" onclick="window.KidsQuiz.nextQuestion()">
                        ${QUIZ_STATE.currentIndex + 1 >= QUIZ_STATE.questions.length ? 'Lihat Hasil Akhir 🏆' : 'Soal Berikutnya ➔'}
                    </button>
                </div>
            </div>
        `;
    }

    // Handle Option Click
    function handleAnswer(optionIdx) {
        if (QUIZ_STATE.answered) return;

        QUIZ_STATE.answered = true;
        QUIZ_STATE.selectedOption = optionIdx;

        const q = QUIZ_STATE.questions[QUIZ_STATE.currentIndex];
        const isCorrect = optionIdx === q.correct_index;

        if (isCorrect) {
            QUIZ_STATE.score += 10;
            playQuizAudio('correct');
        } else {
            playQuizAudio('wrong');
        }

        renderCurrentQuestion();
    }

    // Next Question or Finish
    function nextQuestion() {
        QUIZ_STATE.currentIndex++;
        QUIZ_STATE.answered = false;
        QUIZ_STATE.selectedOption = null;

        if (QUIZ_STATE.currentIndex < QUIZ_STATE.questions.length) {
            renderCurrentQuestion();
            setTimeout(() => {
                const card = document.querySelector('.quiz-play-card') || document.getElementById('kids-quiz-section');
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 30);
        } else {
            renderQuizResult();
        }
    }

    // Render Final Results
    function renderQuizResult() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        // Play celebration audio
        playQuizAudio('finish');

        // Scroll to top of quiz
        const quizSection = document.getElementById('kids-quiz-section');
        if (quizSection) quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const totalQ = QUIZ_STATE.questions.length;
        const maxScore = totalQ * 10;
        const percentage = Math.round((QUIZ_STATE.score / maxScore) * 100);

        let stars = 3;
        let starStr = '⭐⭐⭐';
        let gradeBadge = 'Mumtaz! 🌟 Luar Biasa!';
        let appreciation = 'Masya Allah Tabarakallah! Kamu santri cilik yang sangat cerdas & berprestasi!';
        if (percentage < 50) {
            stars = 1;
            starStr = '⭐';
            gradeBadge = 'Alhamdulillah 📚 Terus Semangat!';
            appreciation = 'Tetap semangat ya! Belajar lagi materi keislaman dan coba kuis ini sekali lagi.';
        } else if (percentage < 80) {
            stars = 2;
            starStr = '⭐⭐';
            gradeBadge = 'Jayyid Jiddan 👏 Hebat Sekali!';
            appreciation = 'Bagus sekali! Sedikit lagi kamu bisa meraih nilai sempurna 3 bintang emas.';
        }

        container.innerHTML = `
            <div class="quiz-result-card">
                <div class="quiz-result-stars">${starStr}</div>
                <h2 style="font-size: 2.2rem; color: #065f46; font-family: 'Comic Neue', cursive, sans-serif; margin-bottom: 0.35rem;">Alhamdulillah Selesai! 🎉</h2>
                <p style="font-size: 1.1rem; color: #4b5563; margin-bottom: 1.5rem; line-height: 1.5;">${appreciation}</p>

                <div class="quiz-score-summary-box">
                    <div class="quiz-score-num">${QUIZ_STATE.score} <span style="font-size: 1.2rem; font-weight: 700; color: #6b7280;">/ ${maxScore} Poin</span></div>
                    <div class="quiz-score-grade-badge">${gradeBadge}</div>
                    <div style="font-size: 0.92rem; font-weight: 600; color: #4b5563; margin-top: 0.6rem;">
                        Tingkat Ketepatan: <strong>${percentage}%</strong> (${Math.round(QUIZ_STATE.score / 10)} dari ${totalQ} Soal Benar)
                    </div>
                </div>

                <!-- Simpan ke Leaderboard Form -->
                <form class="quiz-save-score-wrap" id="quiz-save-box" onsubmit="event.preventDefault(); window.KidsQuiz.submitScore(${stars});">
                    <label for="quiz-player-name" style="display: block; font-size: 0.92rem; font-weight: 800; color: #065f46; margin-bottom: 0.5rem; font-family: 'Comic Neue', cursive, sans-serif;">
                        🏆 Tulis namamu untuk masuk ke Papan Juara Santri:
                    </label>
                    <div style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto;">
                        <input type="text" id="quiz-player-name" class="quiz-player-input" placeholder="Nama Santri Cilik (misal: Ahmad)" value="${escapeHtml(QUIZ_STATE.playerName)}" required>
                        <button type="submit" class="quiz-btn-submit-score">
                            Simpan 🏆
                        </button>
                    </div>
                    <div id="quiz-save-msg" style="display: none; font-size: 0.88rem; font-weight: 700; color: #047857; margin-top: 0.6rem;"></div>
                </form>

                <!-- Action Buttons -->
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 0.85rem; flex-wrap: wrap;">
                    <button type="button" class="quiz-btn-start" onclick="window.KidsQuiz.startQuiz()">
                        🔁 Main Kuis Lagi
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.renderQuizLobby()">
                        🎯 Ganti Topik
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.openLeaderboardFromResult(${stars})">
                        🏆 Papan Juara
                    </button>
                </div>
            </div>
        `;
    }

    // Submit Score to PostgreSQL API
    async function submitScore(stars) {
        const nameInput = document.getElementById('quiz-player-name');
        const msgEl = document.getElementById('quiz-save-msg');
        if (!nameInput) return;

        const name = (nameInput.value || '').trim();
        if (!name) {
            nameInput.focus();
            return;
        }

        setPlayerName(name);

        if (msgEl) {
            msgEl.textContent = 'Menyimpan skormu ke papan juara...';
            msgEl.style.display = 'block';
            msgEl.style.color = '#047857';
        }

        try {
            const res = await fetch('/api/kids/quiz/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_name: name,
                    category: QUIZ_STATE.category,
                    score: QUIZ_STATE.score,
                    stars: stars,
                    total_questions: QUIZ_STATE.questions.length
                })
            });

            if (res.ok) {
                if (msgEl) {
                    msgEl.textContent = '✅ Masya Allah! Skor berhasil dicatat di Papan Juara!';
                    msgEl.style.color = '#047857';
                }
            } else {
                throw new Error('Server returned ' + res.status);
            }
        } catch (e) {
            console.warn('Gagal simpan skor ke database:', e);
            if (msgEl) {
                msgEl.textContent = 'Skor tersimpan di browser Anda!';
                msgEl.style.color = '#b45309';
            }
        }
    }

    // Open Leaderboard From Result with Auto-Save
    async function openLeaderboardFromResult(stars) {
        const nameInput = document.getElementById('quiz-player-name');
        const name = nameInput ? (nameInput.value || '').trim() : QUIZ_STATE.playerName;
        if (name) {
            submitScore(stars);
        }
        openLeaderboard();
    }

    // Open Leaderboard Modal
    async function openLeaderboard() {
        let modal = document.getElementById('quiz-leaderboard-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quiz-leaderboard-modal';
            modal.className = 'modal-overlay';
            modal.onclick = (e) => { if (e.target === modal) closeLeaderboard(); };
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="quiz-leaderboard-modal-box">
                <div class="quiz-leaderboard-header">
                    <button type="button" class="quiz-leaderboard-close-btn" onclick="window.KidsQuiz.closeLeaderboard()" title="Tutup">✕</button>
                    <span class="quiz-leaderboard-trophy">🏆</span>
                    <h3 class="quiz-leaderboard-title">Papan Juara Santri Cilik</h3>
                    <p class="quiz-leaderboard-sub">Santri tergiat berprestasi di Kuis Cerdas Ceria</p>
                </div>

                <div id="leaderboard-list-body" class="quiz-leaderboard-list">
                    <div style="text-align: center; padding: 2.5rem 0; color: #64748b;">
                        <div class="quiz-spinner"></div>
                        <p style="margin-top: 0.85rem; font-size: 0.92rem; font-weight: 700; font-family: 'Comic Neue', cursive, sans-serif;">Memuat papan juara...</p>
                    </div>
                </div>

                <div class="quiz-leaderboard-footer">
                    <button type="button" class="quiz-btn-modal-action" onclick="window.KidsQuiz.closeLeaderboard(); window.KidsQuiz.startQuiz();">
                        🚀 Main Kuis Sekarang
                    </button>
                    <button type="button" class="quiz-btn-modal-close" onclick="window.KidsQuiz.closeLeaderboard()">
                        Tutup
                    </button>
                </div>
            </div>
        `;
        modal.classList.add('active');

        // Fetch leaderboard data from PostgreSQL API
        const bodyEl = document.getElementById('leaderboard-list-body');
        try {
            const res = await fetch('/api/kids/quiz/leaderboard?limit=15', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data && data.ok && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
                    bodyEl.innerHTML = data.leaderboard.map((item, idx) => {
                        const rankClass = idx === 0 ? 'is-gold' : idx === 1 ? 'is-silver' : idx === 2 ? 'is-bronze' : '';
                        const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                        const stars = '⭐'.repeat(Math.max(1, Math.min(3, item.stars || 1)));
                        const catObj = CATEGORIES[item.category];
                        const catLabel = catObj ? catObj.label : (item.category || 'Semua Topik');
                        return `
                            <div class="leaderboard-item-row ${rankClass}">
                                <div class="leaderboard-rank-badge">${rankMedal}</div>
                                <div style="flex: 1; text-align: left;">
                                    <div class="leaderboard-name">${escapeHtml(item.player_name)}</div>
                                    <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;">
                                        <span>${stars}</span> • <span>${escapeHtml(catLabel)}</span>
                                    </div>
                                </div>
                                <div class="leaderboard-score">${item.score} Pts</div>
                            </div>
                        `;
                    }).join('');
                    return;
                }
            }
            bodyEl.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: #64748b; font-weight: 600;">Belum ada skor kuis tercatat. Jadilah yang pertama! 🌟</div>`;
        } catch (e) {
            bodyEl.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: #64748b; font-weight: 600;">Gagal memuat papan juara. Silakan coba lagi.</div>`;
        }
    }

    function closeLeaderboard() {
        const modal = document.getElementById('quiz-leaderboard-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Expose Global API
    window.KidsQuiz = {
        switchMainTab,
        selectCategory,
        setPlayerName,
        startQuiz,
        handleAnswer,
        nextQuestion,
        renderQuizLobby,
        openLeaderboard,
        openLeaderboardFromResult,
        closeLeaderboard,
        submitScore
    };

    // Auto-init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        // Tab click listener check
        const quizTabBtn = document.getElementById('tab-btn-quiz');
        if (quizTabBtn) {
            quizTabBtn.addEventListener('click', () => {
                switchMainTab('quiz');
            });
        }
    });

})();
