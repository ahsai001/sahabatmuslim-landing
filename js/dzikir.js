// Dzikir Harian - Sahabat Muslim Interactive Controller
// Data sourced from ahsai001/dzikirharian (Ustadz Yazid bin Abdul Qadir Jawas, Pustaka Imam Asy-Syafi'i)

(function () {
    let currentCategory = 'pagi'; // 'pagi', 'petang', 'sholat'
    let currentSholatSub = 'semua'; // 'semua', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i'
    let arabicFontSize = 1.55; // rem
    let showLatin = true;
    let showTerjemah = true;
    let counters = {};
    let currentAudio = null;
    let playingItemId = null;

    // Load persisted state
    function loadStorage() {
        try {
            const savedCounters = localStorage.getItem('sm_dzikir_counters_v2');
            if (savedCounters) counters = JSON.parse(savedCounters);
            const savedSize = localStorage.getItem('sm_dzikir_font_size');
            if (savedSize) arabicFontSize = parseFloat(savedSize);
            const savedLatin = localStorage.getItem('sm_dzikir_show_latin');
            if (savedLatin !== null) showLatin = savedLatin === 'true';
            const savedTerjemah = localStorage.getItem('sm_dzikir_show_terjemah');
            if (savedTerjemah !== null) showTerjemah = savedTerjemah === 'true';
        } catch (e) {
            console.warn('Could not load dzikir preferences from localStorage', e);
        }
    }

    function saveStorage() {
        try {
            localStorage.setItem('sm_dzikir_counters_v2', JSON.stringify(counters));
            localStorage.setItem('sm_dzikir_font_size', arabicFontSize.toString());
            localStorage.setItem('sm_dzikir_show_latin', showLatin.toString());
            localStorage.setItem('sm_dzikir_show_terjemah', showTerjemah.toString());
            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        } catch (e) {
            console.warn('Could not save dzikir preferences', e);
        }
    }

    function showToast(message) {
        let toast = document.getElementById('dzikir-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dzikir-toast';
            toast.className = 'dzikir-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    function getItems() {
        if (!window.DZIKIR_DATA) return [];
        if (currentCategory === 'pagi') return window.DZIKIR_DATA.pagi || [];
        if (currentCategory === 'petang') return window.DZIKIR_DATA.petang || [];
        if (currentCategory === 'sholat') {
            if (currentSholatSub === 'sholat_subuh') return window.DZIKIR_DATA.sholat_subuh || [];
            if (currentSholatSub === 'sholat_maghrib') return window.DZIKIR_DATA.sholat_maghrib || [];
            if (currentSholatSub === 'sholat_dz_a_i') return window.DZIKIR_DATA.sholat_dz_a_i || [];
            // Default 'semua': gunakan sholat_subuh sebagai referensi terlengkap (11 bacaan)
            return window.DZIKIR_DATA.sholat_subuh || [];
        }
        return [];
    }

    function updateProgress(items) {
        const countText = document.getElementById('dzikir-progress-count');
        const fillBar = document.getElementById('dzikir-progress-fill');
        if (!items || items.length === 0) return;

        let completed = 0;
        items.forEach(it => {
            const count = counters[it.id] || 0;
            if (count >= it.target) completed++;
        });

        const percent = Math.round((completed / items.length) * 100);
        if (countText) {
            countText.innerHTML = `Dibaca: <strong>${completed}</strong> / ${items.length} dzikir (${percent}%)`;
        }
        if (fillBar) {
            fillBar.style.width = `${percent}%`;
        }
    }

    function renderDzikirList() {
        const container = document.getElementById('dzikir-card-list');
        const subpillsContainer = document.getElementById('dzikir-sholat-subpills');
        const infoTitle = document.getElementById('dzikir-category-title');
        const infoSubtitle = document.getElementById('dzikir-category-subtitle');
        if (!container) return;

        // Tampilkan/sembunyikan sub-filter sholat
        if (subpillsContainer) {
            subpillsContainer.style.display = currentCategory === 'sholat' ? 'flex' : 'none';
        }

        // Update header keterangan kategori
        if (infoTitle && infoSubtitle) {
            if (currentCategory === 'pagi') {
                infoTitle.textContent = '🌅 Dzikir Pagi Hari';
                infoSubtitle.textContent = 'Waktu utama: Antara shubuh hingga terbit matahari. Melindungi diri dan melapangkan hati sepanjang hari.';
            } else if (currentCategory === 'petang') {
                infoTitle.textContent = '🌇 Dzikir Petang / Sore Hari';
                infoSubtitle.textContent = "Waktu utama: Antara 'ashar hingga terbenam matahari. Menjaga keselamatan jiwa dari marabahaya malam.";
            } else {
                if (currentSholatSub === 'sholat_subuh') {
                    infoTitle.textContent = '🕌 Dzikir Sesudah Sholat Shubuh';
                    infoSubtitle.textContent = '11 bacaan dzikir khusus sesudah shalat Shubuh sesuai sunnah.';
                } else if (currentSholatSub === 'sholat_maghrib') {
                    infoTitle.textContent = '🕌 Dzikir Sesudah Sholat Maghrib';
                    infoSubtitle.textContent = '10 bacaan dzikir khusus sesudah shalat Maghrib sesuai sunnah.';
                } else if (currentSholatSub === 'sholat_dz_a_i') {
                    infoTitle.textContent = '🕌 Dzikir Sesudah Sholat Zhuhur, Ashar & Isya';
                    infoSubtitle.textContent = '9 bacaan dzikir sesudah shalat fardhu Zhuhur, Ashar, dan Isya.';
                } else {
                    infoTitle.textContent = '🕌 Dzikir Sesudah Sholat Fardhu';
                    infoSubtitle.textContent = 'Sunnah Rasulullah ﷺ selesai mendirikan shalat fardhu lima waktu.';
                }
            }
        }

        const items = getItems();
        if (items.length === 0) {
            container.innerHTML = `<div style="text-align: center; padding: 3rem; color: #6b7280;">Sedang memuat data dzikir...</div>`;
            return;
        }

        updateProgress(items);

        let html = '';
        items.forEach((item, idx) => {
            const currentCount = counters[item.id] || 0;
            const isCompleted = currentCount >= item.target;
            const remaining = Math.max(0, item.target - currentCount);

            // Format Arabic: replace newlines with line breaks
            const formattedArabic = item.arabic.replace(/\n/g, '<br>');

            html += `
            <div class="dzikir-card ${isCompleted ? 'is-completed' : ''}" id="card-${item.id}" data-id="${item.id}" data-target="${item.target}">
                <div class="dzikir-card-header">
                    <div class="dzikir-card-meta">
                        <div class="dzikir-card-number">${idx + 1}</div>
                        <div>
                            <h3 class="dzikir-card-title">${escapeHtml(item.title)}</h3>
                            <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                                ${escapeHtml(item.runningtext)}
                            </div>
                        </div>
                    </div>
                    <div class="dzikir-target-badge ${isCompleted ? 'done' : ''}" id="badge-${item.id}">
                        ${isCompleted ? '✓ Selesai' : (item.target > 1 ? `Target: ${item.target}x` : '1x')}
                    </div>
                </div>

                <div class="dzikir-arabic-text" style="font-size: ${arabicFontSize}rem;">
                    ${formattedArabic}
                </div>

                <div class="dzikir-latin-text" style="display: ${showLatin ? 'block' : 'none'};">
                    ${escapeHtml(item.latin)}
                </div>

                <div class="dzikir-trans-text" style="display: ${showTerjemah ? 'block' : 'none'};">
                    <strong style="color: var(--green-900); display: block; margin-bottom: 0.25rem;">Artinya:</strong>
                    ${escapeHtml(item.terjemah)}
                </div>

                ${item.dalil ? `
                <div class="dzikir-dalil-box" style="display: ${showTerjemah ? 'block' : 'none'};">
                    <div class="dzikir-dalil-title">
                        <span>📜</span> Referensi & Dalil:
                    </div>
                    <div>${escapeHtml(item.dalil)}</div>
                </div>
                ` : ''}

                <div class="dzikir-card-actions">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button type="button" class="dzikir-counter-btn ${isCompleted ? 'completed' : ''}" id="btn-count-${item.id}" onclick="window.smDzikir.increment('${item.id}', ${item.target})">
                            <span class="btn-icon">${isCompleted ? '✅' : '📿'}</span>
                            <span class="btn-label">${isCompleted ? `Selesai (${item.target}x)` : `Hitung (${currentCount}/${item.target})`}</span>
                        </button>
                        ${currentCount > 0 ? `
                        <button type="button" class="dzikir-icon-btn" title="Ulangi hitungan doa ini" onclick="window.smDzikir.resetItem('${item.id}')">
                            ↺
                        </button>
                        ` : ''}
                    </div>

                    <div class="dzikir-secondary-actions">
                        ${item.sound ? `
                        <button type="button" class="dzikir-icon-btn" id="btn-audio-${item.id}" title="Dengarkan bacaan doa" onclick="window.smDzikir.toggleAudio('${item.id}', '${item.sound}')">
                            ${playingItemId === item.id && currentAudio && !currentAudio.paused ? '⏸' : '🔊'}
                        </button>
                        ` : ''}
                        <button type="button" class="dzikir-icon-btn" title="Salin doa dan artinya" onclick="window.smDzikir.copyItem('${item.id}')">
                            📋
                        </button>
                        <button type="button" class="dzikir-icon-btn" title="Bagikan dzikir" onclick="window.smDzikir.shareItem('${item.id}')">
                            📤
                        </button>
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function increment(itemId, target) {
        const cur = counters[itemId] || 0;
        if (cur < target) {
            counters[itemId] = cur + 1;
        } else {
            // Jika sudah selesai dan diklik lagi, beritahu
            showToast('Alhamdulillah, dzikir ini sudah selesai dibaca!');
            return;
        }

        saveStorage();

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
        }

        const isCompleted = counters[itemId] >= target;
        const currentCount = counters[itemId];

        // Update card DOM directly without full re-render for smooth response
        const card = document.getElementById(`card-${itemId}`);
        const countBtn = document.getElementById(`btn-count-${itemId}`);
        const badge = document.getElementById(`badge-${itemId}`);

        if (card && countBtn && badge) {
            if (isCompleted) {
                card.classList.add('is-completed');
                countBtn.classList.add('completed');
                countBtn.innerHTML = `<span class="btn-icon">✅</span> <span class="btn-label">Selesai (${target}x)</span>`;
                badge.classList.add('done');
                badge.textContent = '✓ Selesai';
                showToast(`Selesai dibaca ${target}x! ✨`);
            } else {
                countBtn.innerHTML = `<span class="btn-icon">📿</span> <span class="btn-label">Hitung (${currentCount}/${target})</span>`;
            }
        }

        // Render mini reset button if not already present
        const actionsDiv = card?.querySelector('.dzikir-card-actions > div:first-child');
        if (actionsDiv && !actionsDiv.querySelector('.dzikir-icon-btn')) {
            const resetBtn = document.createElement('button');
            resetBtn.type = 'button';
            resetBtn.className = 'dzikir-icon-btn';
            resetBtn.title = 'Ulangi hitungan doa ini';
            resetBtn.innerHTML = '↺';
            resetBtn.onclick = () => resetItem(itemId);
            actionsDiv.appendChild(resetBtn);
        }

        updateProgress(getItems());
    }

    function resetItem(itemId) {
        delete counters[itemId];
        saveStorage();
        renderDzikirList();
        showToast('Hitungan dzikir direset ke 0');
    }

    function resetCategoryCounters() {
        if (!confirm('Apakah Anda yakin ingin mengulang kembali seluruh hitungan dzikir di menu ini?')) return;
        const items = getItems();
        items.forEach(it => {
            delete counters[it.id];
        });
        saveStorage();
        renderDzikirList();
        showToast('Seluruh hitungan dzikir berhasil direset');
    }

    function updateUrlQuery() {
        try {
            if (window.history && window.history.replaceState) {
                const url = new URL(window.location.href);
                url.searchParams.set('cat', currentCategory);
                if (currentCategory === 'sholat') {
                    url.searchParams.set('sub', currentSholatSub);
                } else {
                    url.searchParams.delete('sub');
                }
                window.history.replaceState({}, '', url.toString());
            }
        } catch (e) {}
    }

    function setCategory(cat) {
        currentCategory = cat;
        // Update active tab buttons
        document.querySelectorAll('.dzikir-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === cat);
        });
        updateUrlQuery();
        renderDzikirList();
    }

    function setSholatSub(sub) {
        currentSholatSub = sub;
        document.querySelectorAll('.dzikir-subpill-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sub === sub);
        });
        updateUrlQuery();
        renderDzikirList();
    }

    function adjustFontSize(delta) {
        arabicFontSize = Math.max(1.2, Math.min(2.4, arabicFontSize + delta));
        saveStorage();
        document.querySelectorAll('.dzikir-arabic-text').forEach(el => {
            el.style.fontSize = `${arabicFontSize}rem`;
        });
        showToast(`Ukuran font arab: ${Math.round(arabicFontSize * 16)}px`);
    }

    function toggleLatin() {
        showLatin = !showLatin;
        saveStorage();
        const btn = document.getElementById('btn-toggle-latin');
        if (btn) btn.classList.toggle('active', showLatin);
        document.querySelectorAll('.dzikir-latin-text').forEach(el => {
            el.style.display = showLatin ? 'block' : 'none';
        });
        showToast(showLatin ? 'Teks latin ditampilkan' : 'Teks latin disembunyikan');
    }

    function toggleTerjemah() {
        showTerjemah = !showTerjemah;
        saveStorage();
        const btn = document.getElementById('btn-toggle-trans');
        if (btn) btn.classList.toggle('active', showTerjemah);
        document.querySelectorAll('.dzikir-trans-text, .dzikir-dalil-box').forEach(el => {
            el.style.display = showTerjemah ? 'block' : 'none';
        });
        showToast(showTerjemah ? 'Arti & Dalil ditampilkan' : 'Arti & Dalil disembunyikan');
    }

    function getItemById(itemId) {
        if (!window.DZIKIR_DATA) return null;
        for (const cat of ['pagi', 'petang', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i']) {
            const list = window.DZIKIR_DATA[cat] || [];
            const found = list.find(it => it.id === itemId);
            if (found) return found;
        }
        return null;
    }


    function toggleAudio(itemId, soundFile) {
        if (!soundFile) {
            showToast('Audio untuk dzikir ini belum tersedia');
            return;
        }

        const audioBtn = document.getElementById(`btn-audio-${itemId}`);

        if (currentAudio && playingItemId === itemId) {
            if (!currentAudio.paused) {
                currentAudio.pause();
                if (audioBtn) audioBtn.innerHTML = '🔊';
                showToast('Audio dijeda');
                return;
            } else {
                currentAudio.play();
                if (audioBtn) audioBtn.innerHTML = '⏸';
                showToast('Memutar audio...');
                return;
            }
        }

        // Stop previous audio if playing
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            if (playingItemId) {
                const prevBtn = document.getElementById(`btn-audio-${playingItemId}`);
                if (prevBtn) prevBtn.innerHTML = '🔊';
            }
        }

        const audioPath = 'audio/' + soundFile;
        currentAudio = new Audio(audioPath);
        playingItemId = itemId;
        if (audioBtn) audioBtn.innerHTML = '⏸';
        showToast('Memutar audio dzikir...');

        currentAudio.onended = function() {
            if (audioBtn) audioBtn.innerHTML = '🔊';
            currentAudio = null;
            playingItemId = null;
        };

        currentAudio.onerror = function() {
            showToast('File audio belum tersedia');
            if (audioBtn) audioBtn.innerHTML = '🔊';
            currentAudio = null;
            playingItemId = null;
        };

        currentAudio.play().catch(e => {
            console.warn('Audio play failed', e);
            if (audioBtn) audioBtn.innerHTML = '🔊';
        });
    }

    function copyItem(itemId) {
        const item = getItemById(itemId);
        if (!item) return;

        const textToCopy = `*${item.title}* (${item.runningtext})\n\n${item.arabic}\n\n_Artinya:_\n"${item.terjemah}"\n\n_Referensi:_\n${item.dalil || 'Dzikir Harian Sesuai Sunnah'}\n\n— Sahabat Muslim (https://sahabatmuslim.ahsailabs.my.id/dzikir)`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Teks doa & artinya berhasil disalin! 📋');
        }).catch(() => {
            showToast('Gagal menyalin teks');
        });
    }

    function shareItem(itemId) {
        const item = getItemById(itemId);
        if (!item) return;

        const text = `*${item.title}*\n\n${item.arabic}\n\n"${item.terjemah}"\n\nBaca selengkapnya di Sahabat Muslim: https://sahabatmuslim.ahsailabs.my.id/dzikir`;

        if (navigator.share) {
            navigator.share({
                title: `${item.title} — Dzikir Harian Sahabat Muslim`,
                text: text,
                url: 'https://sahabatmuslim.ahsailabs.my.id/dzikir'
            }).catch(() => {});
        } else {
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    }

    // Mode Dengarkan Dzikir (Continuous Audio Player with repetition)
    let playerItems = [];
    let playerCurrentIndex = 0;
    let playerCurrentRep = 1;
    let playerTargetRep = 1;
    let playerAudio = null;
    let playerAutoCount = true;

    function openPlayerModal() {
        const items = getItems().filter(it => it.sound);
        if (!items || items.length === 0) {
            showToast('Tidak ada file audio tersedia untuk kategori ini');
            return;
        }

        // Hentikan audio individual jika sedang menyala
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            if (playingItemId) {
                const prevBtn = document.getElementById(`btn-audio-${playingItemId}`);
                if (prevBtn) prevBtn.innerHTML = '🔊';
            }
            currentAudio = null;
            playingItemId = null;
        }

        playerItems = items;
        playerCurrentIndex = 0;
        playerCurrentRep = 1;

        const modal = document.getElementById('dzikir-player-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        loadAndPlayCurrentPlayerItem(true);
    }

    function closePlayerModal() {
        if (playerAudio) {
            playerAudio.pause();
            playerAudio.currentTime = 0;
            playerAudio = null;
        }

        const modal = document.getElementById('dzikir-player-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function updatePlayerUI() {
        const item = playerItems[playerCurrentIndex];
        if (!item) return;

        // Badge Kategori
        const catBadge = document.getElementById('dzikir-player-cat-badge');
        if (catBadge) {
            if (currentCategory === 'pagi') catBadge.textContent = '🌅 Dzikir Pagi';
            else if (currentCategory === 'petang') catBadge.textContent = '🌇 Dzikir Petang';
            else if (currentSholatSub === 'sholat_subuh') catBadge.textContent = '🕌 Sesudah Shubuh';
            else if (currentSholatSub === 'sholat_maghrib') catBadge.textContent = '🕌 Sesudah Maghrib';
            else if (currentSholatSub === 'sholat_dz_a_i') catBadge.textContent = "🕌 Sesudah Zhuhur/'Ashar/'Isya";
            else catBadge.textContent = '🕌 Sesudah Sholat';
        }

        // Judul & Counter Repetisi
        const titleEl = document.getElementById('dzikir-player-title');
        if (titleEl) titleEl.textContent = item.title;

        const curRepEl = document.getElementById('dzikir-player-cur-rep');
        if (curRepEl) curRepEl.textContent = playerCurrentRep;

        const targetRepEl = document.getElementById('dzikir-player-target-rep');
        if (targetRepEl) targetRepEl.textContent = playerTargetRep;

        // Progress Dzikir dalam Kategori
        const itemIdxEl = document.getElementById('dzikir-player-item-index');
        if (itemIdxEl) itemIdxEl.textContent = playerCurrentIndex + 1;

        const totalItemsEl = document.getElementById('dzikir-player-total-items');
        if (totalItemsEl) totalItemsEl.textContent = playerItems.length;

        const targetTextEl = document.getElementById('dzikir-player-item-target-text');
        if (targetTextEl) targetTextEl.textContent = item.runningtext || `Dibaca ${item.target}x`;

        const fillEl = document.getElementById('dzikir-player-progress-fill');
        if (fillEl) {
            const pct = Math.round(((playerCurrentIndex + 1) / playerItems.length) * 100);
            fillEl.style.width = `${pct}%`;
        }

        // Teks Preview
        const arEl = document.getElementById('dzikir-player-arabic');
        if (arEl) arEl.textContent = item.arabic || '';

        const ltEl = document.getElementById('dzikir-player-latin');
        if (ltEl) ltEl.textContent = item.latin || '';

        const trEl = document.getElementById('dzikir-player-trans');
        if (trEl) trEl.textContent = item.terjemah ? `"${item.terjemah}"` : '';

        // Tombol Play/Pause
        const playBtn = document.getElementById('dzikir-player-play-btn');
        if (playBtn) {
            if (playerAudio && !playerAudio.paused) {
                playBtn.innerHTML = '⏸';
                playBtn.title = 'Jeda';
            } else {
                playBtn.innerHTML = '▶';
                playBtn.title = 'Putar';
            }
        }
    }

    function loadAndPlayCurrentPlayerItem(autoPlay = true) {
        const item = playerItems[playerCurrentIndex];
        if (!item || !item.sound) {
            showToast('Selesai mendengarkan seluruh rangkaian dzikir 🎉');
            closePlayerModal();
            return;
        }

        playerTargetRep = item.target || 1;
        updatePlayerUI();

        if (playerAudio) {
            playerAudio.pause();
            playerAudio.currentTime = 0;
            playerAudio = null;
        }

        const audioPath = 'audio/' + item.sound;
        playerAudio = new Audio(audioPath);

        const slider = document.getElementById('dzikir-player-slider');
        const curTimeEl = document.getElementById('dzikir-player-cur-time');
        const durationEl = document.getElementById('dzikir-player-duration');

        playerAudio.ontimeupdate = function() {
            if (!playerAudio) return;
            const cur = playerAudio.currentTime || 0;
            const dur = playerAudio.duration || 0;
            if (curTimeEl) curTimeEl.textContent = formatTime(cur);
            if (durationEl && dur > 0) durationEl.textContent = formatTime(dur);
            if (slider && dur > 0) {
                slider.value = Math.round((cur / dur) * 100);
            }
        };

        playerAudio.onloadedmetadata = function() {
            if (durationEl && playerAudio.duration) {
                durationEl.textContent = formatTime(playerAudio.duration);
            }
        };

        playerAudio.onended = function() {
            // Jika repetisi belum mencapai target (misal target 3x, baru putaran ke-1 atau ke-2)
            if (playerCurrentRep < playerTargetRep) {
                // Tambah hitungan tasbih jika opsi aktif
                if (playerAutoCount) {
                    increment(item.id, item.target);
                }

                playerCurrentRep++;
                updatePlayerUI();

                // Beri jeda halus 400ms sebelum putaran berikutnya
                setTimeout(() => {
                    if (playerAudio) {
                        playerAudio.currentTime = 0;
                        playerAudio.play().catch(e => console.warn('Replay failed', e));
                        updatePlayerUI();
                    }
                }, 400);
            } else {
                // Repetisi untuk bacaan ini sudah tuntas
                if (playerAutoCount) {
                    increment(item.id, item.target);
                }

                // Lanjut ke dzikir berikutnya dalam urutan
                if (playerCurrentIndex < playerItems.length - 1) {
                    playerCurrentIndex++;
                    playerCurrentRep = 1;
                    setTimeout(() => {
                        loadAndPlayCurrentPlayerItem(true);
                    }, 500);
                } else {
                    // Semua selesai!
                    updatePlayerUI();
                    showToast('Alhamdulillah, seluruh dzikir selesai diperdengarkan! 🤲');
                    setTimeout(() => {
                        closePlayerModal();
                    }, 1200);
                }
            }
        };

        playerAudio.onerror = function() {
            console.warn('Audio failed for item:', item.id);
            showToast(`Audio untuk "${item.title}" tidak dapat dimuat, melewati...`);
            nextPlayerItem();
        };

        if (autoPlay) {
            playerAudio.play().then(() => {
                updatePlayerUI();
            }).catch(e => {
                console.warn('Playback error (browser policy or user interaction needed):', e);
                updatePlayerUI();
            });
        } else {
            updatePlayerUI();
        }
    }

    function togglePlayerPlay() {
        if (!playerAudio) {
            loadAndPlayCurrentPlayerItem(true);
            return;
        }

        if (playerAudio.paused) {
            playerAudio.play().then(() => {
                updatePlayerUI();
            }).catch(e => console.warn('Play failed', e));
        } else {
            playerAudio.pause();
            updatePlayerUI();
        }
    }

    function prevPlayerItem() {
        if (playerCurrentIndex > 0) {
            playerCurrentIndex--;
            playerCurrentRep = 1;
            loadAndPlayCurrentPlayerItem(true);
        } else {
            showToast('Ini adalah dzikir urutan pertama');
        }
    }

    function nextPlayerItem() {
        if (playerCurrentIndex < playerItems.length - 1) {
            playerCurrentIndex++;
            playerCurrentRep = 1;
            loadAndPlayCurrentPlayerItem(true);
        } else {
            showToast('Ini adalah dzikir urutan terakhir');
        }
    }

    function seekPlayerAudio(val) {
        if (!playerAudio || !playerAudio.duration) return;
        const targetTime = (val / 100) * playerAudio.duration;
        playerAudio.currentTime = targetTime;
    }

    function toggleAutoCount(checked) {
        playerAutoCount = checked;
    }

    function openFaedahModal() {
        const modal = document.getElementById('dzikir-faedah-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeFaedahModal() {
        const modal = document.getElementById('dzikir-faedah-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async function loadDhikrFromApi() {
        try {
            const res = await fetch('/api/dhikr');
            if (res.ok) {
                const data = await res.json();
                if (data.ok && data.categories && Object.keys(data.categories).length > 0) {
                    window.DZIKIR_DATA = data.categories;
                    renderDzikirList();
                }
            }
        } catch (e) {
            console.warn('Dhikr API offline, using embedded fallback data', e);
        }
    }

    // Expose public API
    window.smDzikir = {
        init: function () {
            loadStorage();
            const btnLatin = document.getElementById('btn-toggle-latin');
            if (btnLatin) btnLatin.classList.toggle('active', showLatin);
            const btnTrans = document.getElementById('btn-toggle-trans');
            if (btnTrans) btnTrans.classList.toggle('active', showTerjemah);

            // Cek parameter URL (misal: ?cat=pagi, ?cat=petang, ?cat=sholat&sub=sholat_subuh)
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const catParam = urlParams.get('cat');
                const subParam = urlParams.get('sub');
                if (catParam && ['pagi', 'petang', 'sholat'].includes(catParam)) {
                    currentCategory = catParam;
                } else if (subParam && ['semua', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i'].includes(subParam)) {
                    currentCategory = 'sholat';
                }
                if (subParam && ['semua', 'sholat_subuh', 'sholat_maghrib', 'sholat_dz_a_i'].includes(subParam)) {
                    currentSholatSub = subParam;
                }
                document.querySelectorAll('.dzikir-tab-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === currentCategory);
                });
                document.querySelectorAll('.dzikir-subpill-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.sub === currentSholatSub);
                });
            } catch (e) {
                console.warn('URL parameter parsing failed:', e);
            }

            window.addEventListener('sm:sync-applied', () => {
                loadStorage();
                renderDzikirList();
            });

            renderDzikirList();
            loadDhikrFromApi();
        },
        setCategory,
        setSholatSub,
        increment,
        resetItem,
        resetCategoryCounters,
        adjustFontSize,
        toggleLatin,
        toggleTerjemah,
        copyItem,
        shareItem,
        toggleAudio,
        openFaedahModal,
        closeFaedahModal,
        openPlayerModal,
        closePlayerModal,
        togglePlayerPlay,
        prevPlayerItem,
        nextPlayerItem,
        seekPlayerAudio,
        toggleAutoCount
    };

    // Auto init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.smDzikir.init);
    } else {
        window.smDzikir.init();
    }
})();
