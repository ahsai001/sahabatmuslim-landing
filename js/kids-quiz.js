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
        adab: { label: 'Adab Sunnah & Akhlak', icon: '🌿' },
        ibadah: { label: 'Ibadah & Al-Qur\'an', icon: '🕌' }
    };

    // Switch main tabs: Videos vs Quiz
    function switchMainTab(tab) {
        const videoBtn = document.getElementById('tab-btn-videos');
        const quizBtn = document.getElementById('tab-btn-quiz');
        const filterSection = document.querySelector('.kids-filter-section');
        const contentSection = document.querySelector('.kids-content-section');
        const quizSection = document.getElementById('kids-quiz-section');

        if (tab === 'quiz') {
            if (videoBtn) videoBtn.classList.remove('active');
            if (quizBtn) quizBtn.classList.add('active');
            if (filterSection) filterSection.style.display = 'none';
            if (contentSection) contentSection.style.display = 'none';
            if (quizSection) quizSection.style.display = 'block';
            
            // Scroll gently to quiz
            quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            renderQuizLobby();
        } else {
            if (videoBtn) videoBtn.classList.add('active');
            if (quizBtn) quizBtn.classList.remove('active');
            if (filterSection) filterSection.style.display = 'block';
            if (contentSection) contentSection.style.display = 'block';
            if (quizSection) quizSection.style.display = 'none';
        }
    }

    // Render Quiz Lobby / Selection Screen
    function renderQuizLobby() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        container.innerHTML = `
            <div class="quiz-lobby-card">
                <div class="quiz-lobby-badge">🎯 Kuis Cerdas Ceria Islam</div>
                <h2 class="quiz-lobby-title">Santri Cilik Berprestasi</h2>
                <p class="quiz-lobby-desc">Ayo uji wawasan keislamanmu sambil mengumpulkan bintang prestasi! Pilih topik kuis yang ingin kamu pelajari:</p>

                <div class="quiz-cat-selector">
                    ${Object.keys(CATEGORIES).map(key => `
                        <button type="button" class="quiz-cat-pill ${QUIZ_STATE.category === key ? 'active' : ''}" onclick="window.KidsQuiz.selectCategory('${key}')">
                            <span>${CATEGORIES[key].icon}</span>
                            <span>${CATEGORIES[key].label}</span>
                        </button>
                    `).join('')}
                </div>

                <div style="margin: 1.25rem auto 0; max-width: 320px; text-align: left;">
                    <label for="lobby-player-name" style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--gray-700); margin-bottom: 0.35rem; text-align: center;">
                        👤 Nama Santri Cilik:
                    </label>
                    <input type="text" id="lobby-player-name" class="quiz-player-input" style="text-align: center; font-weight: 700;" placeholder="Contoh: Ahmad" value="${escapeHtml(QUIZ_STATE.playerName)}" oninput="window.KidsQuiz.setPlayerName(this.value)">
                </div>

                <div style="margin: 1.5rem 0 1rem; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                    <button type="button" class="quiz-btn-start" onclick="window.KidsQuiz.startQuiz()">
                        🚀 Mulai Kuis Sekarang (10 Soal)
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.openLeaderboard()">
                        🏆 Papan Peringkat Santri
                    </button>
                </div>

                <div class="quiz-lobby-footer-note">
                    <span>⚡ Terhubung database PostgreSQL & kurasi materi sesuai Al-Qur'an dan Sunnah</span>
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

        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <div class="quiz-spinner"></div>
                <p style="margin-top: 1rem; font-weight: 600; color: var(--green-800);">Memuat soal kuis dari server...</p>
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
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="quiz-cat-tag">${catInfo.icon} ${catInfo.label}</span>
                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--gray-600);">Soal ${currentNum} dari ${total}</span>
                    </div>
                    <div class="quiz-score-badge">
                        <span>⭐</span>
                        <span>Skor: ${QUIZ_STATE.score}</span>
                    </div>
                </div>

                <div class="quiz-progress-bar-wrap">
                    <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                </div>

                <!-- Question Text -->
                <div class="quiz-question-box">
                    <h3 class="quiz-question-text">${q.question}</h3>
                </div>

                <!-- Options Grid -->
                <div class="quiz-options-grid">
                    ${q.options.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx); // A, B, C
                        let stateClass = '';
                        if (QUIZ_STATE.answered) {
                            if (idx === q.correct_index) {
                                stateClass = 'is-correct';
                            } else if (idx === QUIZ_STATE.selectedOption) {
                                stateClass = 'is-wrong';
                            } else {
                                stateClass = 'is-disabled';
                            }
                        }
                        return `
                            <button type="button" class="quiz-option-btn ${stateClass}" 
                                    ${QUIZ_STATE.answered ? 'disabled' : ''} 
                                    onclick="window.KidsQuiz.handleAnswer(${idx})">
                                <span class="quiz-option-letter">${letter}</span>
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
    }

    function renderFeedbackContent(q) {
        const isCorrect = QUIZ_STATE.selectedOption === q.correct_index;
        return `
            <div class="quiz-feedback-banner ${isCorrect ? 'banner-correct' : 'banner-wrong'}">
                <div class="quiz-feedback-title">
                    <span>${isCorrect ? '🎉 Masya Allah, Tepat Sekali!' : '💡 Hampir Benar!'}</span>
                </div>
                <p class="quiz-feedback-desc">${q.explanation || ''}</p>
                <div style="margin-top: 1rem; text-align: right;">
                    <button type="button" class="quiz-btn-next" onclick="window.KidsQuiz.nextQuestion()">
                        ${QUIZ_STATE.currentIndex + 1 >= QUIZ_STATE.questions.length ? 'Lihat Hasil Akhir 🏆' : 'Soal Berikutnya ➡️'}
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
        } else {
            renderQuizResult();
        }
    }

    // Render Final Results
    function renderQuizResult() {
        const container = document.getElementById('quiz-view-container');
        if (!container) return;

        const totalQ = QUIZ_STATE.questions.length;
        const maxScore = totalQ * 10;
        const percentage = Math.round((QUIZ_STATE.score / maxScore) * 100);

        let stars = 3;
        let starStr = '⭐⭐⭐';
        let appreciation = 'Masya Allah Tabarakallah! Kamu santri cilik yang luar biasa cerdas!';
        if (percentage < 50) {
            stars = 1;
            starStr = '⭐';
            appreciation = 'Alhamdulillah, tetap semangat ya! Belajar lagi dan coba kuis ini sekali lagi.';
        } else if (percentage < 80) {
            stars = 2;
            starStr = '⭐⭐';
            appreciation = 'Bagus sekali! Sedikit lagi kamu bisa meraih nilai sempurna 3 bintang.';
        }

        container.innerHTML = `
            <div class="quiz-result-card">
                <div class="quiz-result-stars">${starStr}</div>
                <h2 style="font-size: 1.85rem; color: var(--green-900); margin-bottom: 0.35rem;">Alhamdulillah Selesai!</h2>
                <p style="font-size: 1.1rem; color: var(--gray-700); margin-bottom: 1.25rem;">${appreciation}</p>

                <div class="quiz-score-summary-box">
                    <div class="quiz-score-num">${QUIZ_STATE.score} <span style="font-size: 1.1rem; font-weight: 500; color: var(--gray-500);">/ ${maxScore} Poin</span></div>
                    <div style="font-size: 0.88rem; color: var(--gray-600); margin-top: 0.25rem;">
                        Tingkat Ketepatan: <strong>${percentage}%</strong> (${Math.round(QUIZ_STATE.score / 10)} dari ${totalQ} Soal Benar)
                    </div>
                </div>

                <!-- Simpan ke Leaderboard Form -->
                <form class="quiz-save-score-wrap" id="quiz-save-box" onsubmit="event.preventDefault(); window.KidsQuiz.submitScore(${stars});">
                    <label for="quiz-player-name" style="display: block; font-size: 0.88rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.4rem;">
                        🏆 Tulis namamu untuk masuk ke Papan Peringkat Santri:
                    </label>
                    <div style="display: flex; gap: 0.5rem; max-width: 380px; margin: 0 auto;">
                        <input type="text" id="quiz-player-name" class="quiz-player-input" placeholder="Nama Santri Cilik (misal: Ahmad)" value="${escapeHtml(QUIZ_STATE.playerName)}" required>
                        <button type="submit" class="quiz-btn-submit-score">
                            Simpan 🏆
                        </button>
                    </div>
                    <div id="quiz-save-msg" style="display: none; font-size: 0.85rem; font-weight: 600; color: var(--green-700); margin-top: 0.5rem;"></div>
                </form>

                <!-- Action Buttons -->
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                    <button type="button" class="quiz-btn-start" onclick="window.KidsQuiz.startQuiz()">
                        🔁 Main Kuis Lagi
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.renderQuizLobby()">
                        🎯 Ganti Topik
                    </button>
                    <button type="button" class="quiz-btn-secondary" onclick="window.KidsQuiz.openLeaderboardFromResult(${stars})">
                        🏆 Papan Peringkat
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

        const name = nameInput.value.trim() || 'Santri Cilik';
        QUIZ_STATE.playerName = name;
        try {
            localStorage.setItem('sm_kids_player_name', name);
        } catch (e) {}

        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.innerHTML = 'Menyimpan skor ke database...';
        }

        try {
            const res = await fetch('/api/kids/quiz/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_name: name,
                    score: QUIZ_STATE.score,
                    total_questions: QUIZ_STATE.questions.length,
                    stars: stars,
                    category: QUIZ_STATE.category
                })
            });

            if (res.ok) {
                QUIZ_STATE.scoreSaved = true;
                if (msgEl) {
                    msgEl.innerHTML = '✅ Masya Allah, skormu berhasil disimpan di database! <a href="javascript:void(0)" onclick="window.KidsQuiz.openLeaderboard()" style="color: #059669; text-decoration: underline; font-weight: 700; display: inline-block; margin-top: 4px;">Lihat Peringkatmu 🏆</a>';
                    msgEl.style.color = 'var(--green-700)';
                }
            } else {
                throw new Error('Gagal menyimpan');
            }
        } catch (err) {
            if (msgEl) {
                msgEl.innerHTML = '💾 Tersimpan di perangkat (offline mode).';
                msgEl.style.color = 'var(--gray-600)';
            }
        }
    }

    function openLeaderboardFromResult(stars) {
        const nameInput = document.getElementById('quiz-player-name');
        if (nameInput && nameInput.value.trim() && !QUIZ_STATE.scoreSaved) {
            submitScore(stars).then(() => {
                openLeaderboard();
            });
            return;
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
                    <h3 class="quiz-leaderboard-title">Papan Peringkat Santri Cilik</h3>
                    <p class="quiz-leaderboard-sub">Santri tergiat berprestasi di Kuis Ceria</p>
                    <span class="quiz-leaderboard-badge-live">🟢 Terhubung Database PostgreSQL</span>
                </div>

                <div id="leaderboard-list-body" class="quiz-leaderboard-list">
                    <div style="text-align: center; padding: 2rem 0; color: #64748b;">
                        <div class="quiz-spinner"></div>
                        <p style="margin-top: 0.85rem; font-size: 0.88rem; font-weight: 600;">Memuat peringkat santri...</p>
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
                        const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-other';
                        const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                        const isNumRank = idx >= 3;
                        const stars = '⭐'.repeat(Math.max(1, Math.min(3, item.stars || 1)));
                        const catObj = CATEGORIES[item.category];
                        const catLabel = catObj ? catObj.label : (item.category || 'Semua');
                        return `
                            <div class="leaderboard-item-row ${rankClass}">
                                <div class="leaderboard-rank ${isNumRank ? 'num-rank' : ''}">${rankMedal}</div>
                                <div class="leaderboard-name-info">
                                    <div class="leaderboard-name">${escapeHtml(item.player_name)}</div>
                                    <div class="leaderboard-meta">
                                        <span>${stars}</span>
                                        <span>•</span>
                                        <span>Topik: ${escapeHtml(catLabel)}</span>
                                    </div>
                                </div>
                                <div class="leaderboard-score">${item.score} Pts</div>
                            </div>
                        `;
                    }).join('');
                    return;
                }
            }
            bodyEl.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--gray-500);">Belum ada skor kuis tercatat. Jadilah yang pertama! 🌟</div>`;
        } catch (e) {
            bodyEl.innerHTML = `<div style="text-align: center; padding: 2rem 0; color: var(--gray-500);">Gagal memuat papan peringkat. Silakan coba lagi.</div>`;
        }
    }

    function closeLeaderboard() {
        const modal = document.getElementById('quiz-leaderboard-modal');
        if (modal) modal.classList.remove('active');
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

    // Expose API
    window.KidsQuiz = {
        switchMainTab,
        renderQuizLobby,
        setPlayerName,
        selectCategory,
        startQuiz,
        handleAnswer,
        nextQuestion,
        renderQuizResult,
        submitScore,
        openLeaderboard,
        openLeaderboardFromResult,
        closeLeaderboard
    };

    // Auto-bind to KidsApp if exists
    if (window.KidsApp) {
        window.KidsApp.switchMainTab = switchMainTab;
    }

    // Support URL hash: #quiz
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#quiz') {
            setTimeout(() => switchMainTab('quiz'), 300);
        }
    });

})();
