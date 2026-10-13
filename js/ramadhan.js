/**
 * Sahabat Muslim — Pusat Ibadah Ramadhan 1447 H / 2026 M
 * Modul: Jadwal Imsakiyah 30 Hari, Target Khatam Qur'an, Mutaba'ah Yaumiyah, & Hybrid Auth
 */

(function () {
    // -------------------------------------------------------------
    // DATA CONSTANTS & STATE
    // -------------------------------------------------------------
    const RAMADHAN_YEAR_HIJRI = 1447;
    const RAMADHAN_MONTH_HIJRI = 9;

    const CITIES = [
        { name: "Jakarta", label: "DKI Jakarta", lat: -6.2088, lng: 106.8456 },
        { name: "Bandung", label: "Bandung", lat: -6.9175, lng: 107.6191 },
        { name: "Surabaya", label: "Surabaya", lat: -7.2575, lng: 112.7521 },
        { name: "Semarang", label: "Semarang", lat: -6.9667, lng: 110.4167 },
        { name: "Yogyakarta", label: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
        { name: "Medan", label: "Medan", lat: 3.5952, lng: 98.6722 },
        { name: "Makassar", label: "Makassar", lat: -5.1477, lng: 119.4327 },
        { name: "Palembang", label: "Palembang", lat: -2.9761, lng: 104.7754 },
        { name: "Banda Aceh", label: "Banda Aceh", lat: 5.5483, lng: 95.3238 },
        { name: "Padang", label: "Padang", lat: -0.9471, lng: 100.4172 },
        { name: "Pekanbaru", label: "Pekanbaru", lat: 0.5071, lng: 101.4478 },
        { name: "Banjarmasin", label: "Banjarmasin", lat: -3.3194, lng: 114.5908 },
        { name: "Balikpapan", label: "Balikpapan", lat: -1.2379, lng: 116.8289 },
        { name: "Pontianak", label: "Pontianak", lat: -0.0263, lng: 109.3425 },
        { name: "Samarinda", label: "Samarinda", lat: -0.5022, lng: 117.1536 },
        { name: "Denpasar", label: "Denpasar (Bali)", lat: -8.6705, lng: 115.2126 },
        { name: "Mataram", label: "Mataram (Lombok)", lat: -8.5833, lng: 116.1167 },
        { name: "Kupang", label: "Kupang", lat: -10.1772, lng: 123.6070 },
        { name: "Manado", label: "Manado", lat: 1.4748, lng: 124.8428 },
        { name: "Ambon", label: "Ambon", lat: -3.6554, lng: 128.1908 },
        { name: "Jayapura", label: "Jayapura", lat: -2.5916, lng: 140.6690 }
    ];

    const JUZ_LIST = [
        { juz: 1, surahStart: 1, surahName: "Al-Fatihah 1 - Al-Baqarah 141" },
        { juz: 2, surahStart: 2, surahName: "Al-Baqarah 142 - Al-Baqarah 252" },
        { juz: 3, surahStart: 2, surahName: "Al-Baqarah 253 - Ali 'Imran 92" },
        { juz: 4, surahStart: 3, surahName: "Ali 'Imran 93 - An-Nisa' 23" },
        { juz: 5, surahStart: 4, surahName: "An-Nisa' 24 - An-Nisa' 147" },
        { juz: 6, surahStart: 4, surahName: "An-Nisa' 148 - Al-Ma'idah 81" },
        { juz: 7, surahStart: 5, surahName: "Al-Ma'idah 82 - Al-An'am 110" },
        { juz: 8, surahStart: 6, surahName: "Al-An'am 111 - Al-A'raf 87" },
        { juz: 9, surahStart: 7, surahName: "Al-A'raf 88 - Al-Anfal 40" },
        { juz: 10, surahStart: 8, surahName: "Al-Anfal 41 - At-Taubah 92" },
        { juz: 11, surahStart: 9, surahName: "At-Taubah 93 - Hud 5" },
        { juz: 12, surahStart: 11, surahName: "Hud 6 - Yusuf 52" },
        { juz: 13, surahStart: 12, surahName: "Yusuf 53 - Ibrahim 52" },
        { juz: 14, surahStart: 15, surahName: "Al-Hijr 1 - An-Nahl 128" },
        { juz: 15, surahStart: 17, surahName: "Al-Isra' 1 - Al-Kahf 74" },
        { juz: 16, surahStart: 18, surahName: "Al-Kahf 75 - Ta-Ha 135" },
        { juz: 17, surahStart: 21, surahName: "Al-Anbiya' 1 - Al-Hajj 78" },
        { juz: 18, surahStart: 23, surahName: "Al-Mu'minun 1 - Al-Furqan 20" },
        { juz: 19, surahStart: 25, surahName: "Al-Furqan 21 - An-Naml 55" },
        { juz: 20, surahStart: 27, surahName: "An-Naml 56 - Al-'Ankabut 45" },
        { juz: 21, surahStart: 29, surahName: "Al-'Ankabut 46 - Al-Ahzab 30" },
        { juz: 22, surahStart: 33, surahName: "Al-Ahzab 31 - Ya-Sin 27" },
        { juz: 23, surahStart: 36, surahName: "Ya-Sin 28 - Az-Zumar 31" },
        { juz: 24, surahStart: 39, surahName: "Az-Zumar 32 - Fussilat 46" },
        { juz: 25, surahStart: 41, surahName: "Fussilat 47 - Al-Jatsiyah 37" },
        { juz: 26, surahStart: 46, surahName: "Al-Ahqaf 1 - Az-Zariyat 30" },
        { juz: 27, surahStart: 51, surahName: "Az-Zariyat 31 - Al-Hadid 29" },
        { juz: 28, surahStart: 58, surahName: "Al-Mujadilah 1 - At-Tahrim 12" },
        { juz: 29, surahStart: 67, surahName: "Al-Mulk 1 - Al-Mursalat 50" },
        { juz: 30, surahStart: 78, surahName: "An-Naba' 1 - An-Nas 6" }
    ];

    const MUTABAAH_ITEMS = [
        { id: "puasa", label: "Puasa Ramadhan", icon: "🌙", desc: "Menjalankan ibadah puasa wajib hari ini" },
        { id: "subuh", label: "Sholat Subuh", icon: "🕌", desc: "Sholat Subuh tepat waktu (diutamakan berjamaah)" },
        { id: "dzuhur", label: "Sholat Dzuhur", icon: "🕌", desc: "Sholat Dzuhur tepat waktu" },
        { id: "ashar", label: "Sholat Ashar", icon: "🕌", desc: "Sholat Ashar tepat waktu" },
        { id: "maghrib", label: "Sholat Maghrib", icon: "🕌", desc: "Sholat Maghrib tepat waktu" },
        { id: "isya", label: "Sholat Isya", icon: "🕌", desc: "Sholat Isya tepat waktu" },
        { id: "tarawih", label: "Tarawih & Witir", icon: "🤲", desc: "Sholat Qiyamul Lail / Tarawih & Witir" },
        { id: "tilawah", label: "Tilawah Al-Qur'an", icon: "📖", desc: "Membaca Al-Qur'an (minimal 1 Juz atau target harian)" },
        { id: "sedekah", label: "Sedekah Subuh / Harian", icon: "💰", desc: "Berbagi sedekah / infaq kepada yang membutuhkan" },
        { id: "dzikir_pagi", label: "Dzikir Pagi", icon: "📿", desc: "Membaca wirid dzikir pagi sunnah" },
        { id: "dzikir_petang", label: "Dzikir Petang", icon: "📿", desc: "Membaca wirid dzikir petang sunnah" },
        { id: "ilmu", label: "Kultum / Menuntut Ilmu", icon: "📚", desc: "Menyimak ceramah kajian / membaca tafsir" }
    ];

    const STATE = {
        city: "Jakarta",
        cityLabel: "DKI Jakarta",
        coords: null,
        method: "20", // 20 = Kemenag RI
        activeTab: "imsakiyah", // imsakiyah, quran, mutabaah, panduan
        selectedMutabaahDay: 1,
        imsakiyahData: [],
        countdownTimer: null,
        userProfile: null,
        quranProgress: {
            target: 1, // 1x khatam, 2x, 3x
            completed: [] // Array of completed juz numbers [1, 2, ...]
        },
        mutabaahData: {} // { "day_1": { puasa: true, subuh: true, ... }, ... }
    };

    // -------------------------------------------------------------
    // INITIALIZATION & STORAGE
    // -------------------------------------------------------------
    function init() {
        loadStoredLocation();
        loadStoredUserData();
        setupTabs();
        populateCitySelect();
        initGoogleSignIn();

        // Check hash or URL param for initial tab
        const hash = window.location.hash.replace('#', '');
        if (['imsakiyah', 'quran', 'mutabaah', 'panduan'].includes(hash)) {
            switchTab(hash);
        } else {
            switchTab('imsakiyah');
        }

        fetchImsakiyahData();
        renderQuranPlanner();
        renderMutabaahCalendar();
        renderMutabaahChecklist();
        updateHybridUI();

        // If user profile is already logged in, sync latest data from PostgreSQL
        if (STATE.userProfile && (STATE.userProfile.sub || STATE.userProfile.email)) {
            fetchFromPostgres(STATE.userProfile.sub || STATE.userProfile.email);
        }
    }

    function loadStoredLocation() {
        try {
            const savedLoc = localStorage.getItem('sm_prayer_location');
            if (savedLoc) {
                const parsed = JSON.parse(savedLoc);
                if (parsed.city) {
                    STATE.city = parsed.city;
                    STATE.cityLabel = parsed.label || parsed.city;
                }
                if (parsed.lat && parsed.lng) {
                    STATE.coords = { lat: parsed.lat, lng: parsed.lng };
                }
            }
            const savedMethod = localStorage.getItem('sm_prayer_method');
            if (savedMethod) STATE.method = savedMethod;
        } catch (e) {
            console.warn('Gagal membaca saved location', e);
        }
    }

    function loadStoredUserData() {
        try {
            // User Profile (Hybrid Auth)
            const savedUser = localStorage.getItem('sm_ramadhan_user');
            if (savedUser) STATE.userProfile = JSON.parse(savedUser);

            // Quran Progress
            const savedQuran = localStorage.getItem('sm_ramadhan_quran');
            if (savedQuran) {
                const parsed = JSON.parse(savedQuran);
                STATE.quranProgress = {
                    target: parsed.target || 1,
                    completed: Array.isArray(parsed.completed) ? parsed.completed : []
                };
            }

            // Mutabaah Data
            const savedMutabaah = localStorage.getItem('sm_ramadhan_mutabaah');
            if (savedMutabaah) STATE.mutabaahData = JSON.parse(savedMutabaah);
        } catch (e) {
            console.warn('Gagal membaca data ramadhan', e);
        }
    }

    let syncDebounceTimer = null;

    function saveUserData(autoSync = true) {
        try {
            localStorage.setItem('sm_ramadhan_quran', JSON.stringify(STATE.quranProgress));
            localStorage.setItem('sm_ramadhan_mutabaah', JSON.stringify(STATE.mutabaahData));
            if (STATE.userProfile) {
                localStorage.setItem('sm_ramadhan_user', JSON.stringify(STATE.userProfile));
            } else {
                localStorage.removeItem('sm_ramadhan_user');
            }
        } catch (e) {
            console.error('Gagal menyimpan data ke localStorage', e);
        }

        // Auto-sync to PostgreSQL if logged in
        if (autoSync && STATE.userProfile && (STATE.userProfile.sub || STATE.userProfile.email)) {
            if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
            syncDebounceTimer = setTimeout(() => {
                syncToPostgres(true);
            }, 1200);
        }
    }

    // -------------------------------------------------------------
    // POSTGRESQL CLOUD SYNC & HYBRID AUTH
    // -------------------------------------------------------------
    async function syncToPostgres(silent = false) {
        if (!STATE.userProfile || (!STATE.userProfile.sub && !STATE.userProfile.email)) {
            if (!silent) triggerGoogleLogin();
            return;
        }

        const userId = STATE.userProfile.sub || STATE.userProfile.email;
        const payload = {
            user_id: userId,
            email: STATE.userProfile.email || '',
            name: STATE.userProfile.name || '',
            avatar_url: STATE.userProfile.picture || '',
            client_updated_at: new Date().toISOString(),
            payload: {
                city: STATE.city,
                quranProgress: STATE.quranProgress,
                mutabaahData: STATE.mutabaahData
            }
        };

        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                STATE.lastSyncedAt = data.updated_at;
                updateHybridUI();
                if (!silent) {
                    showToast('Alhamdulillah! Data amalan berhasil dicadangkan ke PostgreSQL server. ☁️✅');
                }
            } else {
                throw new Error(data.error || 'Gagal menyimpan ke server');
            }
        } catch (err) {
            console.warn('Sync to PostgreSQL error:', err);
            if (!silent) {
                showToast('Gagal mencadangkan ke PostgreSQL: ' + err.message);
            }
        }
    }

    async function fetchFromPostgres(userId) {
        if (!userId) return;
        try {
            const res = await fetch(`/api/sync?user_id=${encodeURIComponent(userId)}`);
            const json = await res.json();
            if (res.ok && json.ok && json.found && json.data) {
                const cloudPayload = json.data.payload;
                if (cloudPayload) {
                    if (cloudPayload.quranProgress) {
                        STATE.quranProgress = cloudPayload.quranProgress;
                    }
                    if (cloudPayload.mutabaahData) {
                        // Merge or replace
                        STATE.mutabaahData = {
                            ...STATE.mutabaahData,
                            ...cloudPayload.mutabaahData
                        };
                    }
                    if (cloudPayload.city) {
                        STATE.city = cloudPayload.city;
                    }
                }
                saveUserData(false);
                renderQuranPlanner();
                renderMutabaahCalendar();
                renderMutabaahChecklist();
                showToast('Alhamdulillah! Data amalan dipulihkan dari PostgreSQL server. ☁️🔄');
            }
        } catch (err) {
            console.warn('Fetch from PostgreSQL error:', err);
        }
    }

    function updateHybridUI() {
        const userBadge = document.getElementById('hybrid-user-badge');
        const loginBtn = document.getElementById('hybrid-login-btn');
        const logoutBtn = document.getElementById('hybrid-logout-btn');

        if (!userBadge) return;

        if (STATE.userProfile && STATE.userProfile.name) {
            userBadge.innerHTML = `
                <div class="user-avatar-pill">
                    <img src="${STATE.userProfile.picture || 'https://via.placeholder.com/32'}" alt="${STATE.userProfile.name}" class="user-avatar-img" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(STATE.userProfile.name)}&background=047857&color=fff'">
                    <div class="user-avatar-info">
                        <span class="user-name">${escapeHtml(STATE.userProfile.name)}</span>
                        <span class="user-status-text">🟢 Tersinkronisasi PostgreSQL Server</span>
                    </div>
                </div>
            `;
            if (loginBtn) {
                loginBtn.innerHTML = `<span>☁️ Sinkronkan PostgreSQL</span>`;
                loginBtn.onclick = () => syncToPostgres(false);
            }
            if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        } else {
            userBadge.innerHTML = `
                <div class="guest-pill">
                    <span class="guest-dot"></span>
                    <span class="guest-text"><strong>Mode Tamu</strong> (Tersimpan di Perangkat Ini)</span>
                </div>
            `;
            if (loginBtn) {
                loginBtn.innerHTML = `<span>☁️ Cadangkan ke Server</span>`;
                loginBtn.onclick = () => triggerGoogleLogin();
                loginBtn.style.display = 'inline-flex';
            }
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    function initGoogleSignIn() {
        window.handleGoogleCredentialResponse = async function (response) {
            try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                STATE.userProfile = {
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    sub: payload.sub,
                    loginTime: new Date().toISOString()
                };

                saveUserData(false);
                updateHybridUI();
                closeLoginModal();
                showToast(`Alhamdulillah, berhasil masuk sebagai ${payload.name}! 🎉`);

                // Check cloud data in PostgreSQL
                await fetchFromPostgres(payload.sub);
                await syncToPostgres(true);
            } catch (err) {
                console.error('GSI decode error', err);
                showToast('Gagal memproses data login Google');
            }
        };
    }

    function triggerGoogleLogin() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.add('active');
    }

    function closeLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.remove('active');
    }

    async function handleManualProfile(e) {
        if (e) e.preventDefault();
        const nameInput = document.getElementById('manual-name-input');
        const emailInput = document.getElementById('manual-email-input');
        if (!nameInput || !nameInput.value.trim()) return;

        const emailVal = emailInput ? emailInput.value.trim() : '';
        const nameVal = nameInput.value.trim();

        STATE.userProfile = {
            name: nameVal,
            email: emailVal,
            sub: emailVal || nameVal.toLowerCase().replace(/\s+/g, '_'),
            picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameVal)}&background=047857&color=fff`,
            loginTime: new Date().toISOString()
        };

        saveUserData(false);
        updateHybridUI();
        closeLoginModal();
        showToast(`Profil ${STATE.userProfile.name} berhasil disimpan! 🎉`);

        await fetchFromPostgres(STATE.userProfile.sub);
        await syncToPostgres(true);
    }

    function logoutUser() {
        if (confirm('Keluar dari akun? Data catatan ibadah tetap tersimpan di browser perangkat ini.')) {
            STATE.userProfile = null;
            saveUserData();
            updateHybridUI();
            showToast('Anda kembali ke Mode Tamu');
        }
    }

    // Export JSON Backup
    function exportBackup() {
        const backupData = {
            version: "1.0",
            appName: "Sahabat Muslim - Ramadhan Hub",
            exportedAt: new Date().toISOString(),
            user: STATE.userProfile,
            city: STATE.city,
            quranProgress: STATE.quranProgress,
            mutabaahData: STATE.mutabaahData
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `SahabatMuslim_Ramadhan_Backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('File cadangan (.json) berhasil diunduh! 📥');
    }

    // Import JSON Backup
    function importBackup(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.quranProgress) STATE.quranProgress = imported.quranProgress;
                if (imported.mutabaahData) STATE.mutabaahData = imported.mutabaahData;
                if (imported.user) STATE.userProfile = imported.user;
                if (imported.city) STATE.city = imported.city;

                saveUserData();
                renderQuranPlanner();
                renderMutabaahCalendar();
                renderMutabaahChecklist();
                updateHybridUI();
                showToast('Alhamdulillah! Data amalan berhasil dipulihkan dari cadangan. ✅');
            } catch (err) {
                console.error('Import error', err);
                alert('Format file cadangan tidak valid atau rusak.');
            }
        };
        reader.readAsText(file);
    }

    // -------------------------------------------------------------
    // NAVIGATION & TAB SWITCHING
    // -------------------------------------------------------------
    function setupTabs() {
        document.querySelectorAll('.ramadhan-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });
    }

    function switchTab(tabId) {
        STATE.activeTab = tabId;
        window.history.replaceState(null, '', `#${tabId}`);

        document.querySelectorAll('.ramadhan-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        document.querySelectorAll('.ramadhan-tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabId}`);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // -------------------------------------------------------------
    // TAB 1: JADWAL IMSAKIYAH 30 HARI & COUNTDOWN
    // -------------------------------------------------------------
    function populateCitySelect() {
        const select = document.getElementById('imsakiyah-city-select');
        if (!select) return;
        select.innerHTML = CITIES.map(c =>
            `<option value="${c.name}" ${c.name.toLowerCase() === STATE.city.toLowerCase() ? 'selected' : ''}>${c.label}</option>`
        ).join('');
    }

    async function fetchImsakiyahData() {
        const loadingEl = document.getElementById('imsakiyah-loading');
        const contentEl = document.getElementById('imsakiyah-content');
        const cityHeaderEl = document.getElementById('imsakiyah-active-city-label');

        if (loadingEl) loadingEl.style.display = 'block';
        if (contentEl) contentEl.style.display = 'none';
        if (cityHeaderEl) cityHeaderEl.textContent = STATE.cityLabel || STATE.city;

        let url = '';
        if (STATE.coords) {
            url = `https://api.aladhan.com/v1/hijriCalendar/${RAMADHAN_YEAR_HIJRI}/${RAMADHAN_MONTH_HIJRI}?latitude=${STATE.coords.lat}&longitude=${STATE.coords.lng}&method=${STATE.method}`;
        } else {
            url = `https://api.aladhan.com/v1/hijriCalendarByCity/${RAMADHAN_YEAR_HIJRI}/${RAMADHAN_MONTH_HIJRI}?city=${encodeURIComponent(STATE.city)}&country=Indonesia&method=${STATE.method}`;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.code === 200 && Array.isArray(json.data)) {
                STATE.imsakiyahData = json.data;
                renderImsakiyahTable(json.data);
                startCountdown(json.data);
            } else {
                throw new Error('Format data tidak sesuai');
            }
        } catch (err) {
            console.error('Gagal mengambil jadwal imsakiyah:', err);
            // Render Fallback Template
            renderImsakiyahFallback();
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
        }
    }

    function renderImsakiyahTable(days) {
        const tbody = document.getElementById('imsakiyah-table-body');
        if (!tbody) return;

        const todayStr = getTodayFormatted(); // DD-MM-YYYY

        let html = '';
        days.forEach((item, index) => {
            const dayNum = index + 1;
            const greg = item.date.gregorian;
            const gregDateStr = greg.date; // e.g. "18-02-2026"
            const isToday = (gregDateStr === todayStr);

            // Clean time: "04:39 (WIB)" -> "04:39"
            const clean = (t) => t ? t.split(' ')[0] : '-';

            const imsakTime = clean(item.timings.Imsak || item.timings.Fajr);
            const subuhTime = clean(item.timings.Fajr);
            const terbitTime = clean(item.timings.Sunrise);
            const dzuhurTime = clean(item.timings.Dhuhr);
            const asharTime = clean(item.timings.Asr);
            const maghribTime = clean(item.timings.Maghrib);
            const isyaTime = clean(item.timings.Isha);

            html += `
                <tr class="${isToday ? 'row-today' : ''}">
                    <td class="col-day">
                        <strong>${dayNum} Ramadhan</strong>
                        ${isToday ? '<span class="today-badge">Hari Ini</span>' : ''}
                    </td>
                    <td class="col-date">${greg.weekday.en ? translateDay(greg.weekday.en) + ', ' : ''}${greg.day} ${translateMonth(greg.month.number)} ${greg.year}</td>
                    <td class="time-imsak"><strong>${imsakTime}</strong></td>
                    <td>${subuhTime}</td>
                    <td class="time-muted">${terbitTime}</td>
                    <td>${dzuhurTime}</td>
                    <td>${asharTime}</td>
                    <td class="time-maghrib"><strong>${maghribTime}</strong></td>
                    <td>${isyaTime}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    function renderImsakiyahFallback() {
        const tbody = document.getElementById('imsakiyah-table-body');
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--gray-600);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                    <p><strong>Tidak dapat terhubung ke server Aladhan.</strong></p>
                    <p style="font-size: 0.85rem; margin-top: 0.25rem;">Periksa koneksi internet Anda atau coba ubah pilihan kota.</p>
                    <button class="btn btn-secondary" onclick="window.RamadhanApp.fetchImsakiyah()" style="margin-top: 1rem; padding: 0.5rem 1.25rem; font-size: 0.85rem;">Coba Lagi 🔄</button>
                </td>
            </tr>
        `;
    }

    function startCountdown(days) {
        if (STATE.countdownTimer) clearInterval(STATE.countdownTimer);

        const cardLabel = document.getElementById('countdown-target-label');
        const cardTargetTime = document.getElementById('countdown-target-time');
        const hoursEl = document.getElementById('cd-hours');
        const minutesEl = document.getElementById('cd-minutes');
        const secondsEl = document.getElementById('cd-seconds');
        const subtextEl = document.getElementById('countdown-subtext');

        function tick() {
            const now = new Date();
            const todayStr = getTodayFormatted(); // "18-02-2026"
            let todayData = days.find(d => d.date.gregorian.date === todayStr);

            // If current date is outside Ramadhan, use Day 1 for preview calculation
            let isPreview = false;
            if (!todayData) {
                todayData = days[0];
                isPreview = true;
            }

            if (!todayData) return;

            const cleanTime = (t) => t ? t.split(' ')[0] : '00:00';
            const maghribStr = cleanTime(todayData.timings.Maghrib);
            const imsakStr = cleanTime(todayData.timings.Imsak || todayData.timings.Fajr);

            const [mH, mM] = maghribStr.split(':').map(Number);
            const [iH, iM] = imsakStr.split(':').map(Number);

            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const maghribMinutes = mH * 60 + mM;
            const imsakMinutes = iH * 60 + iM;

            let targetName = "";
            let targetHour = 0;
            let targetMinute = 0;
            let isMaghribTarget = false;

            if (nowMinutes < imsakMinutes) {
                // Before imsak today -> countdown to Imsak
                targetName = "Menuju Waktu Imsak (Sahur)";
                targetHour = iH;
                targetMinute = iM;
            } else if (nowMinutes < maghribMinutes) {
                // Between imsak & maghrib -> countdown to Buka Puasa (Maghrib)
                targetName = "Menuju Waktu Berbuka Puasa";
                targetHour = mH;
                targetMinute = mM;
                isMaghribTarget = true;
            } else {
                // After maghrib -> countdown to tomorrow's Imsak
                targetName = "Menuju Waktu Imsak Esok Hari";
                targetHour = iH + 24; // next day
                targetMinute = iM;
            }

            const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0);
            let diffMs = targetDate.getTime() - now.getTime();
            if (diffMs < 0) diffMs = 0;

            const totalSec = Math.floor(diffMs / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;

            if (cardLabel) cardLabel.textContent = isPreview ? `Simulasi Ramadhan — ${targetName}` : targetName;
            if (cardTargetTime) cardTargetTime.textContent = isMaghribTarget ? `Pukul ${maghribStr}` : `Pukul ${imsakStr}`;
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');

            if (subtextEl) {
                subtextEl.textContent = isMaghribTarget
                    ? `Waktu Berbuka (${STATE.cityLabel || STATE.city}): ${maghribStr} WIB • Jangan lupa berdoa saat berbuka!`
                    : `Waktu Imsak (${STATE.cityLabel || STATE.city}): ${imsakStr} WIB • Segerakan sahur sebelum fajar.`;
            }
        }

        tick();
        STATE.countdownTimer = setInterval(tick, 1000);
    }

    // -------------------------------------------------------------
    // TAB 2: TARGET & PLANNER KHATAM QUR'AN
    // -------------------------------------------------------------
    function renderQuranPlanner() {
        const gridEl = document.getElementById('quran-juz-grid');
        const progressBar = document.getElementById('quran-progress-fill');
        const progressText = document.getElementById('quran-progress-percent');
        const statCompleted = document.getElementById('quran-stat-completed');
        const statRemaining = document.getElementById('quran-stat-remaining');
        const statPace = document.getElementById('quran-stat-pace');
        const targetSelect = document.getElementById('quran-target-select');

        if (targetSelect) targetSelect.value = STATE.quranProgress.target || 1;

        const completedCount = STATE.quranProgress.completed.length;
        const total = 30;
        const percent = Math.round((completedCount / total) * 100);

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}% Selesai`;
        if (statCompleted) statCompleted.textContent = `${completedCount} Juz`;
        if (statRemaining) statRemaining.textContent = `${total - completedCount} Juz`;
        if (statPace) {
            const target = STATE.quranProgress.target || 1;
            statPace.textContent = target === 1 ? "1 Juz / hari (4 hal/sholat)" : `${target} Juz / hari`;
        }

        if (!gridEl) return;

        let html = '';
        JUZ_LIST.forEach(item => {
            const isDone = STATE.quranProgress.completed.includes(item.juz);
            html += `
                <div class="juz-card ${isDone ? 'completed' : ''}" data-juz="${item.juz}">
                    <div class="juz-card-header">
                        <label class="juz-checkbox-label">
                            <input type="checkbox" ${isDone ? 'checked' : ''} onchange="window.RamadhanApp.toggleJuz(${item.juz})">
                            <span class="juz-num">Juz ${item.juz}</span>
                        </label>
                        <span class="juz-status-pill">${isDone ? '✅ Selesai' : 'Belum'}</span>
                    </div>
                    <div class="juz-card-body">
                        <p class="juz-surah-info">${item.surahName}</p>
                    </div>
                    <div class="juz-card-footer">
                        <a href="/quran?surah=${item.surahStart}" class="btn-read-juz">
                            Baca di Quran ↗
                        </a>
                    </div>
                </div>
            `;
        });

        gridEl.innerHTML = html;
    }

    function toggleJuz(juzNumber) {
        const idx = STATE.quranProgress.completed.indexOf(juzNumber);
        if (idx === -1) {
            STATE.quranProgress.completed.push(juzNumber);
            showToast(`Alhamdulillah! Juz ${juzNumber} ditandai selesai! 📖✨`);
        } else {
            STATE.quranProgress.completed.splice(idx, 1);
        }
        STATE.quranProgress.completed.sort((a, b) => a - b);
        saveUserData();
        renderQuranPlanner();
    }

    function changeQuranTarget(targetValue) {
        STATE.quranProgress.target = parseInt(targetValue, 10) || 1;
        saveUserData();
        renderQuranPlanner();
        showToast(`Target khatam diubah menjadi ${targetValue}x Khatam`);
    }

    // -------------------------------------------------------------
    // TAB 3: MUTABA'AH YAUMIYAH (RAMADHAN HABIT TRACKER)
    // -------------------------------------------------------------
    function renderMutabaahCalendar() {
        const calGrid = document.getElementById('mutabaah-days-grid');
        if (!calGrid) return;

        let html = '';
        for (let i = 1; i <= 30; i++) {
            const dayKey = `day_${i}`;
            const dayRecord = STATE.mutabaahData[dayKey] || {};
            const keys = Object.keys(dayRecord);
            const checkedCount = keys.filter(k => dayRecord[k] === true).length;
            const totalItems = MUTABAAH_ITEMS.length;

            let badgeClass = "badge-empty";
            if (checkedCount === totalItems) badgeClass = "badge-full";
            else if (checkedCount > 0) badgeClass = "badge-partial";

            const isSelected = (i === STATE.selectedMutabaahDay);

            html += `
                <button type="button" class="mutabaah-day-btn ${isSelected ? 'active' : ''} ${badgeClass}" onclick="window.RamadhanApp.selectMutabaahDay(${i})">
                    <span class="day-label">H-${i}</span>
                    <span class="day-ratio">${checkedCount}/${totalItems}</span>
                </button>
            `;
        }

        calGrid.innerHTML = html;
    }

    function renderMutabaahChecklist() {
        const dayTitle = document.getElementById('mutabaah-current-day-title');
        const checklistEl = document.getElementById('mutabaah-checklist-items');
        const scoreEl = document.getElementById('mutabaah-score-badge');

        if (dayTitle) dayTitle.textContent = `Catatan Amalan: Hari ke-${STATE.selectedMutabaahDay} Ramadhan`;

        const dayKey = `day_${STATE.selectedMutabaahDay}`;
        const dayRecord = STATE.mutabaahData[dayKey] || {};

        const checkedCount = Object.keys(dayRecord).filter(k => dayRecord[k] === true).length;
        const totalItems = MUTABAAH_ITEMS.length;
        const percent = Math.round((checkedCount / totalItems) * 100);

        if (scoreEl) {
            scoreEl.textContent = `${checkedCount} dari ${totalItems} Amalan Selesai (${percent}%)`;
            scoreEl.className = `mutabaah-score-badge ${percent === 100 ? 'score-full' : (percent > 50 ? 'score-good' : '')}`;
        }

        if (!checklistEl) return;

        let html = '';
        MUTABAAH_ITEMS.forEach(item => {
            const isChecked = dayRecord[item.id] === true;
            html += `
                <label class="mutabaah-item-card ${isChecked ? 'item-checked' : ''}">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.RamadhanApp.toggleMutabaahItem('${item.id}')">
                    <div class="mutabaah-item-icon">${item.icon}</div>
                    <div class="mutabaah-item-text">
                        <strong>${item.label}</strong>
                        <p>${item.desc}</p>
                    </div>
                    <div class="mutabaah-item-check-indicator">
                        ${isChecked ? '✓' : ''}
                    </div>
                </label>
            `;
        });

        checklistEl.innerHTML = html;
    }

    function selectMutabaahDay(dayNumber) {
        STATE.selectedMutabaahDay = dayNumber;
        renderMutabaahCalendar();
        renderMutabaahChecklist();
    }

    function toggleMutabaahItem(itemId) {
        const dayKey = `day_${STATE.selectedMutabaahDay}`;
        if (!STATE.mutabaahData[dayKey]) {
            STATE.mutabaahData[dayKey] = {};
        }

        const currentVal = STATE.mutabaahData[dayKey][itemId] === true;
        STATE.mutabaahData[dayKey][itemId] = !currentVal;

        saveUserData();
        renderMutabaahCalendar();
        renderMutabaahChecklist();
    }

    // -------------------------------------------------------------
    // LOCATION ACTIONS
    // -------------------------------------------------------------
    function onCityChange(cityName) {
        const found = CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        STATE.city = cityName;
        STATE.cityLabel = found ? found.label : cityName;
        STATE.coords = null;

        localStorage.setItem('sm_prayer_location', JSON.stringify({
            city: STATE.city,
            label: STATE.cityLabel,
            type: 'city'
        }));

        fetchImsakiyahData();
        showToast(`Lokasi Imsakiyah diubah ke ${STATE.cityLabel}`);
    }

    function useGPS() {
        if (!navigator.geolocation) {
            alert('Browser tidak mendukung pendeteksian lokasi GPS.');
            return;
        }

        showToast('Mendeteksi koordinat GPS...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                STATE.coords = { lat, lng };
                STATE.city = "Lokasi GPS";
                STATE.cityLabel = `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

                localStorage.setItem('sm_prayer_location', JSON.stringify({
                    lat,
                    lng,
                    label: STATE.cityLabel,
                    type: 'coords'
                }));

                fetchImsakiyahData();
                showToast('Lokasi berhasil disesuaikan dengan GPS Anda! 📍');
            },
            (err) => {
                console.warn('GPS Error', err);
                alert('Gagal mendeteksi lokasi GPS. Pastikan izin akses lokasi telah diaktifkan.');
            },
            { timeout: 10000 }
        );
    }

    // -------------------------------------------------------------
    // HELPERS & UTILITIES
    // -------------------------------------------------------------
    function getTodayFormatted() {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    }

    function translateDay(en) {
        const map = {
            'Sunday': 'Ahad',
            'Monday': 'Senin',
            'Tuesday': 'Selasa',
            'Wednesday': 'Rabu',
            'Thursday': 'Kamis',
            'Friday': 'Jumat',
            'Saturday': 'Sabtu'
        };
        return map[en] || en;
    }

    function translateMonth(m) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const num = parseInt(m, 10);
        return months[num - 1] || m;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function showToast(msg) {
        let toast = document.getElementById('ramadhan-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ramadhan-toast';
            toast.className = 'ramadhan-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }

    function printImsakiyah() {
        window.print();
    }

    // Modal Doa Buka Puasa
    function openDoaBukaModal() {
        const modal = document.getElementById('doa-buka-modal');
        if (modal) modal.classList.add('active');
    }

    function closeDoaBukaModal() {
        const modal = document.getElementById('doa-buka-modal');
        if (modal) modal.classList.remove('active');
    }

    // -------------------------------------------------------------
    // EXPOSE PUBLIC API
    // -------------------------------------------------------------
    window.RamadhanApp = {
        init,
        switchTab,
        onCityChange,
        useGPS,
        fetchImsakiyah: fetchImsakiyahData,
        printImsakiyah,
        toggleJuz,
        changeQuranTarget,
        selectMutabaahDay,
        toggleMutabaahItem,
        triggerGoogleLogin,
        closeLoginModal,
        handleManualProfile,
        logoutUser,
        exportBackup,
        importBackup,
        openDoaBukaModal,
        closeDoaBukaModal,
        syncToPostgres,
        fetchFromPostgres
    };

    // Auto-init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
})();
