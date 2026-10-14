// Quran Online - Sahabat Muslim Interactive Controller
// Data source: equran.id API v2 (matching ahsai001/quran-id-online)

(function () {
    const STATE = {
        surahList: [],
        currentSurahNumber: null,
        currentSurahDetail: null,
        currentTafsirData: null,
        searchQuery: '',
        filterType: 'all', // all, Mekah, Madinah, popular
        arabicFontSize: 1.75, // rem
        showLatin: true,
        showTranslation: true,
        selectedQari: '05', // 05 = Misyari Rasyid Al-Afasi
        audioPlayer: null,
        isPlayingFull: false,
        playingAyahNumber: null,
        lastRead: null
    };

    const QARI_LIST = {
        '05': 'Misyari Rasyid Al-Afasi',
        '01': 'Abdullah Al-Juhany',
        '02': 'Abdul Muhsin Al-Qasim',
        '03': 'Abdurrahman As-Sudais',
        '04': 'Ibrahim Al-Dossari',
        '06': 'Yasser Al-Dosari'
    };

    const POPULAR_SURAHS = [1, 18, 36, 55, 56, 67, 112, 113, 114];

    // Local Storage Helpers
    function loadPreferences() {
        try {
            const savedSize = localStorage.getItem('sm_quran_font_size');
            if (savedSize) STATE.arabicFontSize = parseFloat(savedSize);
            const savedLatin = localStorage.getItem('sm_quran_show_latin');
            if (savedLatin !== null) STATE.showLatin = savedLatin === 'true';
            const savedTrans = localStorage.getItem('sm_quran_show_trans');
            if (savedTrans !== null) STATE.showTranslation = savedTrans === 'true';
            const savedQari = localStorage.getItem('sm_quran_selected_qari');
            if (savedQari && QARI_LIST[savedQari]) STATE.selectedQari = savedQari;
            const savedLast = localStorage.getItem('sm_quran_last_read');
            if (savedLast) STATE.lastRead = JSON.parse(savedLast);
        } catch (e) {
            console.warn('Failed to load Quran preferences', e);
        }
    }

    function savePreferences() {
        try {
            localStorage.setItem('sm_quran_font_size', STATE.arabicFontSize.toString());
            localStorage.setItem('sm_quran_show_latin', STATE.showLatin.toString());
            localStorage.setItem('sm_quran_show_trans', STATE.showTranslation.toString());
            localStorage.setItem('sm_quran_selected_qari', STATE.selectedQari);
            if (STATE.lastRead) {
                localStorage.setItem('sm_quran_last_read', JSON.stringify(STATE.lastRead));
            }
            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        } catch (e) {
            console.warn('Failed to save Quran preferences', e);
        }
    }

    function showToast(message) {
        let toast = document.getElementById('quran-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'quran-toast';
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

    // Audio helper
    function getAudioElement() {
        if (!STATE.audioPlayer) {
            STATE.audioPlayer = new Audio();
            STATE.audioPlayer.addEventListener('ended', onAudioEnded);
            STATE.audioPlayer.addEventListener('pause', onAudioPause);
            STATE.audioPlayer.addEventListener('play', onAudioPlay);
            STATE.audioPlayer.addEventListener('timeupdate', onAudioTimeUpdate);
            STATE.audioPlayer.addEventListener('error', () => {
                showToast('Gagal memuat audio murottal');
                updateFullAudioUI(false);
            });
        }
        return STATE.audioPlayer;
    }

    function onAudioPlay() {
        if (STATE.playingAyahNumber === null) {
            updateFullAudioUI(true);
        }
    }

    function onAudioPause() {
        if (STATE.playingAyahNumber === null) {
            updateFullAudioUI(false);
        }
    }

    function onAudioEnded() {
        if (STATE.playingAyahNumber !== null) {
            const btn = document.getElementById(`btn-play-ayah-${STATE.playingAyahNumber}`);
            if (btn) btn.innerHTML = '▶';
            STATE.playingAyahNumber = null;
        } else {
            updateFullAudioUI(false);
        }
    }

    function onAudioTimeUpdate() {
        const audio = STATE.audioPlayer;
        if (!audio || !audio.duration) return;
        const progress = document.getElementById('quran-audio-progress');
        const timeText = document.getElementById('quran-audio-time');
        if (progress) {
            progress.value = (audio.currentTime / audio.duration) * 100;
        }
        if (timeText) {
            timeText.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function updateFullAudioUI(playing) {
        STATE.isPlayingFull = playing;
        const btn = document.getElementById('btn-play-full-surah');
        if (btn) {
            btn.innerHTML = playing ? '⏸ Jeda Murottal' : '▶ Putar 1 Surah Penuh';
            btn.classList.toggle('playing', playing);
        }
    }

    // Surah list rendering
    function renderSurahList() {
        const grid = document.getElementById('quran-surah-grid');
        const countInfo = document.getElementById('quran-count-info');
        if (!grid) return;

        let filtered = STATE.surahList;

        if (STATE.filterType === 'Mekah' || STATE.filterType === 'Madinah') {
            filtered = filtered.filter(s => s.tempatTurun === STATE.filterType);
        } else if (STATE.filterType === 'popular') {
            filtered = filtered.filter(s => POPULAR_SURAHS.includes(s.nomor));
        }

        if (STATE.searchQuery) {
            const q = STATE.searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.namaLatin.toLowerCase().includes(q) ||
                s.arti.toLowerCase().includes(q) ||
                s.nomor.toString() === q ||
                s.nama.includes(q)
            );
        }

        if (countInfo) {
            countInfo.innerHTML = `Menampilkan <strong>${filtered.length}</strong> dari 114 Surah`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
            <div class="kajian-empty" style="grid-column: 1 / -1; margin-top: 1.5rem;">
                <span class="kajian-empty-icon">🔍</span>
                <h3>Surah Tidak Ditemukan</h3>
                <p>Tidak ada surah yang cocok dengan pencarian "${escapeHtml(STATE.searchQuery)}".</p>
                <button type="button" class="btn-gps" style="margin-top: 1rem; padding: 0.6rem 1.25rem;" onclick="window.smQuran.resetFilter()">
                    Tampilkan Semua Surah
                </button>
            </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(s => {
            const typeLabel = s.tempatTurun === 'Mekah' ? 'Makkiyyah' : 'Madaniyyah';
            const typeClass = s.tempatTurun === 'Mekah' ? 'badge-mekah' : 'badge-madinah';

            html += `
            <div class="quran-surah-card" onclick="window.smQuran.openSurah(${s.nomor})">
                <div class="quran-surah-card-header">
                    <div class="quran-surah-num">${s.nomor}</div>
                    <div class="quran-surah-meta">
                        <h3 class="quran-surah-title">${escapeHtml(s.namaLatin)}</h3>
                        <div class="quran-surah-sub">
                            <span>${escapeHtml(s.arti)}</span> • <span>${s.jumlahAyat} Ayat</span>
                        </div>
                    </div>
                    <div class="quran-surah-arabic">${escapeHtml(s.nama)}</div>
                </div>
                <div class="quran-surah-card-footer">
                    <span class="quran-type-badge ${typeClass}">${typeLabel}</span>
                    <span class="quran-read-btn">Baca Surah →</span>
                </div>
            </div>
            `;
        });

        grid.innerHTML = html;
        renderLastReadBanner();
    }

    function renderLastReadBanner() {
        const container = document.getElementById('quran-last-read-banner');
        if (!container) return;

        if (STATE.lastRead && STATE.lastRead.surah) {
            container.style.display = 'flex';
            container.innerHTML = `
                <div class="quran-last-read-content">
                    <span class="quran-last-read-icon">🔖</span>
                    <div>
                        <div style="font-size: 0.78rem; color: #047857; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Terakhir Dibaca</div>
                        <div style="font-size: 1rem; font-weight: 700; color: #064e3b;">Surah ${escapeHtml(STATE.lastRead.surahName)} : Ayat ${STATE.lastRead.ayah}</div>
                    </div>
                </div>
                <button type="button" class="btn-gps" onclick="window.smQuran.openSurah(${STATE.lastRead.surah}, ${STATE.lastRead.ayah})">
                    Lanjutkan Membaca ↗
                </button>
            `;
        } else {
            container.style.display = 'none';
        }
    }

    // Detail Surah Loading & View
    async function openSurah(surahNumber, targetAyah = null) {
        STATE.currentSurahNumber = surahNumber;
        window.history.pushState(null, '', `?surah=${surahNumber}`);

        const listSection = document.getElementById('quran-list-section');
        const detailSection = document.getElementById('quran-detail-section');
        const loadingBox = document.getElementById('quran-detail-loading');
        const contentBox = document.getElementById('quran-detail-content');

        if (listSection) listSection.style.display = 'none';
        if (detailSection) detailSection.style.display = 'block';
        if (loadingBox) loadingBox.style.display = 'block';
        if (contentBox) contentBox.style.display = 'none';

        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            // Check memory cache
            let detail = STATE[`cache_surah_${surahNumber}`];
            if (!detail) {
                const res = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
                const json = await res.json();
                if (json.code === 200 && json.data) {
                    detail = json.data;
                    STATE[`cache_surah_${surahNumber}`] = detail;
                } else {
                    throw new Error(json.message || 'Gagal memuat detail surah');
                }
            }

            STATE.currentSurahDetail = detail;
            renderSurahDetail(detail, targetAyah);
        } catch (err) {
            console.error('Error fetching surah detail:', err);
            if (loadingBox) {
                loadingBox.innerHTML = `
                    <div class="kajian-empty" style="margin-top: 2rem;">
                        <span class="kajian-empty-icon">⚠️</span>
                        <h3>Gagal Memuat Surah</h3>
                        <p>Terjadi kesalahan saat mengambil teks ayat: ${escapeHtml(err.message)}</p>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                            <button type="button" class="btn-gps" onclick="window.smQuran.openSurah(${surahNumber})">Coba Lagi</button>
                            <button type="button" class="btn-gps" style="background: var(--gray-600);" onclick="window.smQuran.backToList()">Kembali ke Daftar</button>
                        </div>
                    </div>
                `;
            }
        }
    }

    function renderSurahDetail(data, targetAyah = null) {
        const loadingBox = document.getElementById('quran-detail-loading');
        const contentBox = document.getElementById('quran-detail-content');
        if (loadingBox) loadingBox.style.display = 'none';
        if (contentBox) contentBox.style.display = 'block';

        // Title and meta
        const titleLatin = document.getElementById('detail-surah-title');
        const titleArabic = document.getElementById('detail-surah-arabic');
        const subtitle = document.getElementById('detail-surah-subtitle');
        const deskripsi = document.getElementById('detail-surah-deskripsi');

        if (titleLatin) titleLatin.textContent = `${data.nomor}. ${data.namaLatin}`;
        if (titleArabic) titleArabic.textContent = data.nama;
        if (subtitle) {
            const typeLabel = data.tempatTurun === 'Mekah' ? 'Makkiyyah' : 'Madaniyyah';
            subtitle.textContent = `Arti: ${data.arti} • ${typeLabel} • ${data.jumlahAyat} Ayat`;
        }
        if (deskripsi) {
            deskripsi.innerHTML = data.deskripsi || '';
        }

        // Qari select sync
        const qariSelect = document.getElementById('detail-qari-select');
        if (qariSelect) {
            let opts = '';
            Object.keys(QARI_LIST).forEach(k => {
                opts += `<option value="${k}" ${k === STATE.selectedQari ? 'selected' : ''}>${QARI_LIST[k]}</option>`;
            });
            qariSelect.innerHTML = opts;
        }

        // Bismillah Banner (Show if not Surah 9 (At-Taubah) and not Surah 1 (Al-Fatihah already has verse 1))
        const bismillahBanner = document.getElementById('detail-bismillah-banner');
        if (bismillahBanner) {
            bismillahBanner.style.display = (data.nomor !== 1 && data.nomor !== 9) ? 'block' : 'none';
        }

        // Ayah list
        const ayahContainer = document.getElementById('detail-ayah-list');
        if (ayahContainer) {
            let html = '';
            data.ayat.forEach(a => {
                html += `
                <div class="quran-ayah-card" id="ayah-${a.nomorAyat}">
                    <div class="quran-ayah-header">
                        <div class="quran-ayah-num-badge">
                            <span>${data.nomor}:${a.nomorAyat}</span>
                        </div>
                        <div class="quran-ayah-actions">
                            <button type="button" class="quran-icon-btn" id="btn-play-ayah-${a.nomorAyat}" title="Putar bacaan ayat ini" onclick="window.smQuran.playAyahAudio(${a.nomorAyat})">
                                ▶
                            </button>
                            <button type="button" class="quran-icon-btn" title="Tandai terakhir dibaca" onclick="window.smQuran.setLastRead(${data.nomor}, '${escapeHtml(data.namaLatin)}', ${a.nomorAyat})">
                                🔖
                            </button>
                            <button type="button" class="quran-icon-btn" title="Salin ayat & artinya" onclick="window.smQuran.copyAyah(${a.nomorAyat})">
                                📋
                            </button>
                            <button type="button" class="quran-icon-btn" title="Tafsir Kemenag ayat ini" onclick="window.smQuran.openAyahTafsir(${data.nomor}, ${a.nomorAyat})">
                                📖
                            </button>
                            <button type="button" class="quran-icon-btn" title="Bagikan ayat ini" onclick="window.smQuran.shareAyah(${a.nomorAyat})">
                                📤
                            </button>
                        </div>
                    </div>

                    <div class="quran-ayah-arabic" style="font-size: ${STATE.arabicFontSize}rem;">
                        ${a.teksArab}
                        <span class="quran-ayah-end-num">﴿${a.nomorAyat}﴾</span>
                    </div>

                    <div class="quran-ayah-latin" style="display: ${STATE.showLatin ? 'block' : 'none'};">
                        ${escapeHtml(a.teksLatin)}
                    </div>

                    <div class="quran-ayah-trans" style="display: ${STATE.showTranslation ? 'block' : 'none'};">
                        ${escapeHtml(a.teksIndonesia)}
                    </div>
                </div>
                `;
            });
            ayahContainer.innerHTML = html;
        }

        // Prev & Next navigation
        const prevBtn = document.getElementById('btn-prev-surah');
        const nextBtn = document.getElementById('btn-next-surah');
        if (prevBtn) {
            if (data.suratSebelumnya) {
                prevBtn.style.display = 'inline-flex';
                prevBtn.textContent = `← ${data.suratSebelumnya.nomor}. ${data.suratSebelumnya.namaLatin}`;
                prevBtn.onclick = () => openSurah(data.suratSebelumnya.nomor);
            } else {
                prevBtn.style.display = 'none';
            }
        }
        if (nextBtn) {
            if (data.suratSelanjutnya) {
                nextBtn.style.display = 'inline-flex';
                nextBtn.textContent = `${data.suratSelanjutnya.nomor}. ${data.suratSelanjutnya.namaLatin} →`;
                nextBtn.onclick = () => openSurah(data.suratSelanjutnya.nomor);
            } else {
                nextBtn.style.display = 'none';
            }
        }

        // Scroll to target ayah if requested
        if (targetAyah) {
            setTimeout(() => {
                const el = document.getElementById(`ayah-${targetAyah}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlight-ayah');
                    setTimeout(() => el.classList.remove('highlight-ayah'), 3000);
                }
            }, 300);
        }
    }

    function backToList() {
        if (STATE.audioPlayer) {
            STATE.audioPlayer.pause();
        }
        updateFullAudioUI(false);
        STATE.playingAyahNumber = null;
        STATE.currentSurahNumber = null;

        window.history.pushState(null, '', window.location.pathname);

        const listSection = document.getElementById('quran-list-section');
        const detailSection = document.getElementById('quran-detail-section');
        if (listSection) listSection.style.display = 'block';
        if (detailSection) detailSection.style.display = 'none';

        renderLastReadBanner();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Full Surah audio
    function toggleFullSurahAudio() {
        const detail = STATE.currentSurahDetail;
        if (!detail || !detail.audioFull) return;

        const audio = getAudioElement();
        if (STATE.isPlayingFull) {
            audio.pause();
            updateFullAudioUI(false);
            return;
        }

        const audioUrl = detail.audioFull[STATE.selectedQari] || Object.values(detail.audioFull)[0];
        if (!audioUrl) {
            showToast('Audio murottal belum tersedia untuk surah ini');
            return;
        }

        STATE.playingAyahNumber = null;
        audio.src = audioUrl;
        audio.play().then(() => {
            updateFullAudioUI(true);
            showToast(`Memutar murottal: ${detail.namaLatin} (${QARI_LIST[STATE.selectedQari]})`);
        }).catch(e => {
            console.error('Play error:', e);
            showToast('Gagal memutar audio');
            updateFullAudioUI(false);
        });
    }

    function onQariChange(newQari) {
        STATE.selectedQari = newQari;
        savePreferences();
        if (STATE.isPlayingFull) {
            toggleFullSurahAudio(); // stop
            toggleFullSurahAudio(); // restart with new qari
        }
    }

    // Ayah audio
    function playAyahAudio(ayahNumber) {
        const detail = STATE.currentSurahDetail;
        if (!detail) return;
        const ayah = detail.ayat.find(a => a.nomorAyat === ayahNumber);
        if (!ayah || !ayah.audio) return;

        const audioUrl = ayah.audio[STATE.selectedQari] || Object.values(ayah.audio)[0];
        if (!audioUrl) {
            showToast('Audio ayat ini tidak tersedia');
            return;
        }

        const audio = getAudioElement();

        // If clicking the currently playing ayah -> pause it
        if (STATE.playingAyahNumber === ayahNumber && !audio.paused) {
            audio.pause();
            const btn = document.getElementById(`btn-play-ayah-${ayahNumber}`);
            if (btn) btn.innerHTML = '▶';
            STATE.playingAyahNumber = null;
            return;
        }

        // Reset previous buttons
        if (STATE.playingAyahNumber !== null) {
            const prevBtn = document.getElementById(`btn-play-ayah-${STATE.playingAyahNumber}`);
            if (prevBtn) prevBtn.innerHTML = '▶';
        }
        updateFullAudioUI(false);

        STATE.playingAyahNumber = ayahNumber;
        const btn = document.getElementById(`btn-play-ayah-${ayahNumber}`);
        if (btn) btn.innerHTML = '⏸';

        audio.src = audioUrl;
        audio.play().catch(e => {
            console.error('Ayah audio play error:', e);
            showToast('Gagal memutar audio ayat');
            if (btn) btn.innerHTML = '▶';
            STATE.playingAyahNumber = null;
        });
    }

    // Tafsir Modal
    async function openAyahTafsir(surahNumber, ayahNumber) {
        const modal = document.getElementById('quran-tafsir-modal');
        const modalTitle = document.getElementById('quran-tafsir-title');
        const modalBody = document.getElementById('quran-tafsir-body');

        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (modalTitle) modalTitle.textContent = `Tafsir Kemenag RI — QS. ${STATE.currentSurahDetail?.namaLatin || surahNumber} : ${ayahNumber}`;
        if (modalBody) modalBody.innerHTML = '<div style="text-align: center; padding: 2rem;">⏳ Memuat tafsir Kemenag RI...</div>';

        try {
            let tafsirData = STATE[`cache_tafsir_${surahNumber}`];
            if (!tafsirData) {
                const res = await fetch(`https://equran.id/api/v2/tafsir/${surahNumber}`);
                const json = await res.json();
                if (json.code === 200 && json.data) {
                    tafsirData = json.data;
                    STATE[`cache_tafsir_${surahNumber}`] = tafsirData;
                } else {
                    throw new Error(json.message || 'Gagal mengambil tafsir');
                }
            }

            const item = tafsirData.tafsir.find(t => t.ayat === ayahNumber);
            if (item && item.teks) {
                modalBody.innerHTML = `
                    <div style="font-size: 0.95rem; line-height: 1.8; color: var(--gray-800); white-space: pre-line;">
                        ${escapeHtml(item.teks)}
                    </div>
                `;
            } else {
                modalBody.innerHTML = '<p>Penjelasan tafsir untuk ayat ini belum tersedia.</p>';
            }
        } catch (err) {
            if (modalBody) {
                modalBody.innerHTML = `<p style="color: #dc2626;">Gagal memuat tafsir: ${escapeHtml(err.message)}</p>`;
            }
        }
    }

    function closeTafsirModal() {
        const modal = document.getElementById('quran-tafsir-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Set Last Read
    function setLastRead(surah, surahName, ayah) {
        STATE.lastRead = { surah, surahName, ayah, date: new Date().toISOString() };
        savePreferences();
        showToast(`Tersimpan! Terakhir dibaca: ${surahName} ayat ${ayah} 🔖`);
    }

    // Copy Ayah
    function copyAyah(ayahNumber) {
        const detail = STATE.currentSurahDetail;
        if (!detail) return;
        const a = detail.ayat.find(it => it.nomorAyat === ayahNumber);
        if (!a) return;

        const text = `QS. ${detail.namaLatin} : ${a.nomorAyat}\n\n${a.teksArab}\n\n"${a.teksIndonesia}"\n\n— Sahabat Muslim (https://sahabatmuslim.ahsailabs.my.id/quran?surah=${detail.nomor})`;

        navigator.clipboard.writeText(text).then(() => {
            showToast(`Ayat ${ayahNumber} berhasil disalin! 📋`);
        }).catch(() => {
            showToast('Gagal menyalin ayat');
        });
    }

    // Share Ayah
    function shareAyah(ayahNumber) {
        const detail = STATE.currentSurahDetail;
        if (!detail) return;
        const a = detail.ayat.find(it => it.nomorAyat === ayahNumber);
        if (!a) return;

        const text = `*QS. ${detail.namaLatin} : ${a.nomorAyat}*\n\n${a.teksArab}\n\n_${a.teksLatin}_\n\n"${a.teksIndonesia}"\n\nBaca Al-Qur'an lengkap di Sahabat Muslim: https://sahabatmuslim.ahsailabs.my.id/quran?surah=${detail.nomor}`;

        if (navigator.share) {
            navigator.share({
                title: `QS. ${detail.namaLatin} : ${a.nomorAyat}`,
                text: text,
                url: `https://sahabatmuslim.ahsailabs.my.id/quran?surah=${detail.nomor}`
            }).catch(() => {});
        } else {
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
    }

    // Font and Display Controls
    function adjustFontSize(delta) {
        STATE.arabicFontSize = Math.max(1.3, Math.min(2.8, STATE.arabicFontSize + delta));
        savePreferences();
        document.querySelectorAll('.quran-ayah-arabic').forEach(el => {
            el.style.fontSize = `${STATE.arabicFontSize}rem`;
        });
        showToast(`Ukuran teks Arab: ${Math.round(STATE.arabicFontSize * 16)}px`);
    }

    function toggleLatin() {
        STATE.showLatin = !STATE.showLatin;
        savePreferences();
        const btn = document.getElementById('btn-quran-toggle-latin');
        if (btn) btn.classList.toggle('active', STATE.showLatin);
        document.querySelectorAll('.quran-ayah-latin').forEach(el => {
            el.style.display = STATE.showLatin ? 'block' : 'none';
        });
        showToast(STATE.showLatin ? 'Teks Latin ditampilkan' : 'Teks Latin disembunyikan');
    }

    function toggleTranslation() {
        STATE.showTranslation = !STATE.showTranslation;
        savePreferences();
        const btn = document.getElementById('btn-quran-toggle-trans');
        if (btn) btn.classList.toggle('active', STATE.showTranslation);
        document.querySelectorAll('.quran-ayah-trans').forEach(el => {
            el.style.display = STATE.showTranslation ? 'block' : 'none';
        });
        showToast(STATE.showTranslation ? 'Terjemahan ditampilkan' : 'Terjemahan disembunyikan');
    }

    function onSearchChange(val) {
        STATE.searchQuery = (val || '').trim();
        renderSurahList();
    }

    function selectFilter(type) {
        STATE.filterType = type;
        document.querySelectorAll('.quran-filter-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === type);
        });
        renderSurahList();
    }

    function resetFilter() {
        STATE.searchQuery = '';
        STATE.filterType = 'all';
        const input = document.getElementById('quran-search-input');
        if (input) input.value = '';
        document.querySelectorAll('.quran-filter-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        renderSurahList();
    }

    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        if (typeof str !== 'string') str = String(str);
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Init Page
    function init() {
        loadPreferences();

        const btnLatin = document.getElementById('btn-quran-toggle-latin');
        if (btnLatin) btnLatin.classList.toggle('active', STATE.showLatin);
        const btnTrans = document.getElementById('btn-quran-toggle-trans');
        if (btnTrans) btnTrans.classList.toggle('active', STATE.showTranslation);

        if (window.QURAN_SURAT_LIST) {
            STATE.surahList = window.QURAN_SURAT_LIST;
            renderSurahList();
        } else {
            // Fetch dynamically if pre-bundled data is missing
            fetch('https://equran.id/api/v2/surat')
                .then(r => r.json())
                .then(res => {
                    if (res.code === 200 && res.data) {
                        STATE.surahList = res.data;
                        renderSurahList();
                    }
                })
                .catch(err => console.error('Failed to load surah list:', err));
        }

        // Check URL params for direct surah linking
        const params = new URLSearchParams(window.location.search);
        const surahParam = params.get('surah') || params.get('surat');
        const ayahParam = params.get('ayah') || params.get('ayat');
        if (surahParam) {
            const surahNum = parseInt(surahParam, 10);
            const ayahNum = ayahParam ? parseInt(ayahParam, 10) : null;
            if (surahNum >= 1 && surahNum <= 114) {
                openSurah(surahNum, ayahNum);
            }
        }

        window.addEventListener('sm:sync-applied', () => {
            loadPreferences();
            renderLastReadBanner();
        });
    }

    // Expose API
    window.smQuran = {
        init,
        openSurah,
        backToList,
        toggleFullSurahAudio,
        playAyahAudio,
        openAyahTafsir,
        closeTafsirModal,
        setLastRead,
        copyAyah,
        shareAyah,
        adjustFontSize,
        toggleLatin,
        toggleTranslation,
        onSearchChange,
        selectFilter,
        resetFilter,
        onQariChange
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
