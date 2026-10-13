/**
 * Sahabat Muslim — Kalender & Pusat Ibadah Hijriyah
 * Fitur:
 * 1. Kalender & Jadwal Sholat 12 Bulan Hijriyah (Imsak, Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, Isya)
 * 2. Deteksi Puasa Cerdas:
 *    - Puasa Wajib Ramadhan (Bulan 9)
 *    - Puasa Sunnah Senin & Kamis (Setiap hari Senin & Kamis)
 *    - Puasa Sunnah Ayyamul Bidh (13, 14, 15 Hijriyah)
 *    - Puasa Sunnah Khusus: Asyura & Tasu'a (Muharram), Arafah & Tarwiyah (Dzulhijjah), Syawal, Sya'ban
 * 3. Live Countdown Sholat / Imsak / Berbuka
 * 4. Target & Planner Khatam Qur'an (30 Juz)
 * 5. Mutaba'ah Yaumiyah Sepanjang Tahun (Menyesuaikan Puasa Wajib / Sunnah & Qiyamul Lail / Tarawih)
 * 6. Panduan Doa & Niat Puasa
 * 7. Hybrid Storage (Local Browser + Cloud PostgreSQL Sync dengan Smart Merge)
 */

(function () {
    // -------------------------------------------------------------
    // DATA CONSTANTS & STATE
    // -------------------------------------------------------------
    const HIJRI_MONTHS = [
        { number: 1, name: "Muharram", arabic: "مُحَرَّم", specialFasting: "Puasa Tasu'a & Asyura (9 & 10 Muharram)" },
        { number: 2, name: "Safar", arabic: "صَفَر", specialFasting: "Puasa Sunnah Senin-Kamis & Ayyamul Bidh" },
        { number: 3, name: "Rabi'ul Awwal", arabic: "رَبِيعُ الأَوَّل", specialFasting: "Puasa Sunnah Senin-Kamis & Ayyamul Bidh" },
        { number: 4, name: "Rabi'ul Akhir", arabic: "رَبِيعُ الآخِر", specialFasting: "Puasa Sunnah Senin-Kamis & Ayyamul Bidh" },
        { number: 5, name: "Jumadil Ula", arabic: "جُمَادَى الأُولَى", specialFasting: "Puasa Sunnah Senin-Kamis & Ayyamul Bidh" },
        { number: 6, name: "Jumadil Akhir", arabic: "جُمَادَى الآخِرَة", specialFasting: "Puasa Sunnah Senin-Kamis & Ayyamul Bidh" },
        { number: 7, name: "Rajab", arabic: "رَجَب", specialFasting: "Bulan Haram (Dianjurkan Memperbanyak Puasa Sunnah)" },
        { number: 8, name: "Sya'ban", arabic: "شَعْبَان", specialFasting: "Memperbanyak Puasa Sunnah Menjelang Ramadhan" },
        { number: 9, name: "Ramadhan", arabic: "رَمَضَان", specialFasting: "Puasa Wajib Sebulan Penuh & Qiyam Ramadhan" },
        { number: 10, name: "Syawal", arabic: "شَوَّال", specialFasting: "Puasa Sunnah 6 Hari Syawal (Pahala Setahun Penuh)" },
        { number: 11, name: "Dzulqa'dah", arabic: "ذُو القَعْدَة", specialFasting: "Bulan Haram (Puasa Sunnah Senin-Kamis & Ayyamul Bidh)" },
        { number: 12, name: "Dzulhijjah", arabic: "ذُو الحِجَّة", specialFasting: "1-9 Dzulhijjah, Puasa Tarwiyah (8) & Arafah (9)" }
    ];

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

    const STATE = {
        city: "Jakarta",
        cityLabel: "DKI Jakarta",
        coords: null,
        method: "20", // 20 = Kemenag RI
        activeTab: "imsakiyah", // imsakiyah, quran, mutabaah, panduan
        hijriYear: 1447,
        hijriMonth: 9, // 1 - 12 (Default 9 / Ramadhan)
        todayHijriDate: null,
        selectedMutabaahDay: 1,
        calendarData: [], // 29 or 30 days
        countdownTimer: null,
        userProfile: null,
        quranProgress: {
            target: 1,
            completed: []
        },
        mutabaahData: {} // keys: "m9_d1", "m8_d15", or legacy "day_1"
    };

    // -------------------------------------------------------------
    // FASTING & PRAYER HELPERS
    // -------------------------------------------------------------
    function getFastingInfo(hijriDay, hijriMonth, gregorianWeekdayEn) {
        const monthNum = parseInt(hijriMonth, 10);
        const dayNum = parseInt(hijriDay, 10);
        const weekday = (gregorianWeekdayEn || '').toLowerCase();

        // 1. Bulan Ramadhan
        if (monthNum === 9) {
            return {
                type: "wajib",
                title: "Puasa Wajib Ramadhan",
                badge: "Wajib",
                isRecommended: true,
                desc: "Menjalankan kewajiban rukun Islam puasa Ramadhan hari ini"
            };
        }

        // 2. Hari Tasyrik (11, 12, 13 Dzulhijjah) & Hari Raya (1 Syawal & 10 Dzulhijjah) -> Haram Puasa
        if (monthNum === 10 && dayNum === 1) {
            return {
                type: "haram",
                title: "Idul Fitri (Haram Berpuasa)",
                badge: "Haram",
                isRecommended: false,
                desc: "Hari raya Idul Fitri — Diharamkan berpuasa"
            };
        }
        if (monthNum === 12 && [10, 11, 12, 13].includes(dayNum)) {
            return {
                type: "haram",
                title: dayNum === 10 ? "Idul Adha (Haram Berpuasa)" : `Hari Tasyrik ke-${dayNum - 9} (Haram Puasa)`,
                badge: "Haram",
                isRecommended: false,
                desc: "Hari Raya Idul Adha & Hari Tasyrik — Diharamkan berpuasa"
            };
        }

        // 3. Puasa Ayyamul Bidh (13, 14, 15 Hijriyah)
        if ([13, 14, 15].includes(dayNum) && monthNum !== 12) {
            return {
                type: "sunnah",
                title: `Puasa Sunnah Ayyamul Bidh (${dayNum} ${HIJRI_MONTHS[monthNum - 1].name})`,
                badge: "Ayyamul Bidh",
                isRecommended: true,
                desc: "Puasa hari-hari putih pertengahan bulan Hijriyah (Pahala seperti puasa setahun penuh)"
            };
        }

        // 4. Puasa Khusus Bulan-Bulan Tertentu
        if (monthNum === 1) {
            if (dayNum === 9) return { type: "sunnah", title: "Puasa Sunnah Tasu'a (9 Muharram)", badge: "Sunnah", isRecommended: true, desc: "Penyelaras puasa Asyura yang dianjurkan Rasulullah ﷺ" };
            if (dayNum === 10) return { type: "sunnah", title: "Puasa Sunnah Asyura (10 Muharram)", badge: "Asyura", isRecommended: true, desc: "Menghapuskan dosa setahun yang lalu (HR. Muslim)" };
        }
        if (monthNum === 12) {
            if (dayNum === 8) return { type: "sunnah", title: "Puasa Sunnah Tarwiyah (8 Dzulhijjah)", badge: "Sunnah", isRecommended: true, desc: "Amalan puasa di awal bulan Dzulhijjah" };
            if (dayNum === 9) return { type: "sunnah", title: "Puasa Sunnah Arafah (9 Dzulhijjah)", badge: "Arafah", isRecommended: true, desc: "Menghapuskan dosa 2 tahun (setahun lalu & setahun akan datang - HR. Muslim)" };
        }

        // 5. Puasa Senin & Kamis
        if (weekday === 'monday') {
            return {
                type: "sunnah",
                title: "Puasa Sunnah Hari Senin",
                badge: "Senin",
                isRecommended: true,
                desc: "Hari disetorkannya amalan & hari kelahiran Rasulullah ﷺ (HR. Muslim & Tirmidzi)"
            };
        }
        if (weekday === 'thursday') {
            return {
                type: "sunnah",
                title: "Puasa Sunnah Hari Kamis",
                badge: "Kamis",
                isRecommended: true,
                desc: "Hari diangkatnya amalan kepada Allah Subhanahu wa Ta'ala (HR. Tirmidzi)"
            };
        }

        // 6. Hari biasa di luar Ramadhan
        return {
            type: "mubah",
            title: "Puasa Sunnah / Qadha",
            badge: "Sunnah / Qadha",
            isRecommended: false,
            desc: "Puasa Daud, puasa sunnah mutlak, atau menunaikan qadha puasa wajib"
        };
    }

    function getMutabaahItemsForMonth(monthNum, dayNum, weekdayEn) {
        const isRamadhan = (parseInt(monthNum, 10) === 9);
        const fastingInfo = getFastingInfo(dayNum, monthNum, weekdayEn);

        return [
            {
                id: "puasa",
                label: fastingInfo.title,
                icon: isRamadhan ? "🌙" : "✨",
                desc: fastingInfo.desc,
                badge: fastingInfo.badge,
                badgeType: fastingInfo.type
            },
            { id: "subuh", label: "Sholat Subuh", icon: "🕌", desc: "Sholat Subuh tepat waktu (diutamakan berjamaah)" },
            { id: "dzuhur", label: "Sholat Dzuhur", icon: "🕌", desc: "Sholat Dzuhur tepat waktu" },
            { id: "ashar", label: "Sholat Ashar", icon: "🕌", desc: "Sholat Ashar tepat waktu" },
            { id: "maghrib", label: "Sholat Maghrib", icon: "🕌", desc: "Sholat Maghrib tepat waktu" },
            { id: "isya", label: "Sholat Isya", icon: "🕌", desc: "Sholat Isya tepat waktu" },
            {
                id: "qiyam",
                label: isRamadhan ? "Tarawih & Witir" : "Qiyamul Lail / Tahajjud & Witir",
                icon: "🤲",
                desc: isRamadhan ? "Sholat Qiyam Ramadhan (Tarawih) berjamaah / sendiri" : "Sholat malam (Tahajjud & Witir) mendekatkan diri kepada Allah"
            },
            { id: "tilawah", label: "Tilawah Al-Qur'an", icon: "📖", desc: "Membaca Al-Qur'an (minimal 1 Juz atau target harian)" },
            { id: "sedekah", label: "Sedekah Subuh / Harian", icon: "💰", desc: "Berbagi sedekah / infaq kepada yang membutuhkan" },
            { id: "dzikir_pagi", label: "Dzikir Pagi", icon: "📿", desc: "Membaca wirid dzikir pagi sesuai sunnah" },
            { id: "dzikir_petang", label: "Dzikir Petang", icon: "📿", desc: "Membaca wirid dzikir petang sesuai sunnah" },
            { id: "ilmu", label: "Kajian / Menuntut Ilmu", icon: "📚", desc: "Menyimak ceramah kajian agama / membaca tafsir" }
        ];
    }

    // -------------------------------------------------------------
    // INITIALIZATION & STORAGE
    // -------------------------------------------------------------
    async function init() {
        loadStoredLocation();
        loadStoredUserData();
        setupTabs();
        populateCitySelect();
        populateHijriMonthSelect();
        initGoogleSignIn();

        // Check hash or URL param for initial tab
        const hash = window.location.hash.replace('#', '');
        if (['imsakiyah', 'quran', 'mutabaah', 'panduan'].includes(hash)) {
            switchTab(hash);
        } else {
            switchTab('imsakiyah');
        }

        await fetchCurrentHijriDate();
        await fetchCalendarData();
        renderQuranPlanner();
        renderMutabaahCalendar();
        renderMutabaahChecklist();
        updateHybridUI();

        // If user profile is already logged in, sync latest data from PostgreSQL
        if (STATE.userProfile && (STATE.userProfile.sub || STATE.userProfile.email)) {
            fetchFromPostgres(STATE.userProfile.sub || STATE.userProfile.email);
        }
    }

    async function fetchCurrentHijriDate() {
        try {
            const todayStr = getTodayFormatted();
            const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${todayStr}`);
            const json = await res.json();
            if (json.code === 200 && json.data && json.data.hijri) {
                STATE.todayHijriDate = json.data.hijri;
                const currentMonthNum = parseInt(json.data.hijri.month.number, 10);
                const currentYearNum = parseInt(json.data.hijri.year, 10);

                // Auto set month to current real-time Hijri month if not yet customized by user
                const savedMonth = sessionStorage.getItem('sm_selected_hijri_month');
                if (!savedMonth) {
                    STATE.hijriMonth = currentMonthNum;
                    STATE.hijriYear = currentYearNum;
                }
                const monthSelect = document.getElementById('hijri-month-select');
                if (monthSelect) monthSelect.value = String(STATE.hijriMonth);
            }
        } catch (e) {
            console.warn('Gagal mendeteksi tanggal Hijriyah hari ini:', e);
        }
    }

    function populateHijriMonthSelect() {
        const select = document.getElementById('hijri-month-select');
        if (!select) return;
        select.innerHTML = HIJRI_MONTHS.map(m =>
            `<option value="${m.number}" ${m.number === STATE.hijriMonth ? 'selected' : ''}>${m.number}. ${m.name} (${m.arabic})${m.number === 9 ? ' 🌙' : ''}</option>`
        ).join('');
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
            const savedUser = localStorage.getItem('sm_ramadhan_user') || localStorage.getItem('sm_hijri_user');
            if (savedUser) STATE.userProfile = JSON.parse(savedUser);

            // Quran Progress
            const savedQuran = localStorage.getItem('sm_ramadhan_quran') || localStorage.getItem('sm_hijri_quran');
            if (savedQuran) {
                const parsed = JSON.parse(savedQuran);
                STATE.quranProgress = {
                    target: parsed.target || 1,
                    completed: Array.isArray(parsed.completed) ? parsed.completed : []
                };
            }

            // Mutabaah Data
            const savedMutabaah = localStorage.getItem('sm_ramadhan_mutabaah') || localStorage.getItem('sm_hijri_mutabaah');
            if (savedMutabaah) STATE.mutabaahData = JSON.parse(savedMutabaah);
        } catch (e) {
            console.warn('Gagal membaca data ibadah', e);
        }
    }

    let syncDebounceTimer = null;

    function saveUserData(autoSync = true) {
        try {
            localStorage.setItem('sm_hijri_quran', JSON.stringify(STATE.quranProgress));
            localStorage.setItem('sm_hijri_mutabaah', JSON.stringify(STATE.mutabaahData));
            // Backwards compatibility for Ramadhan keys
            localStorage.setItem('sm_ramadhan_quran', JSON.stringify(STATE.quranProgress));
            localStorage.setItem('sm_ramadhan_mutabaah', JSON.stringify(STATE.mutabaahData));

            if (STATE.userProfile) {
                localStorage.setItem('sm_hijri_user', JSON.stringify(STATE.userProfile));
                localStorage.setItem('sm_ramadhan_user', JSON.stringify(STATE.userProfile));
            } else {
                localStorage.removeItem('sm_hijri_user');
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
                hijriYear: STATE.hijriYear,
                hijriMonth: STATE.hijriMonth,
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

    // Smart Merge Algorithm (Lossless Union)
    function smartMergeData(cloudPayload) {
        if (!cloudPayload) return { hasMergeChanges: false, hadLocalData: false, hadCloudData: false };

        let hasMergeChanges = false;

        // 1. Merge Quran Progress
        const localJuz = Array.isArray(STATE.quranProgress.completed) ? STATE.quranProgress.completed : [];
        const cloudJuz = (cloudPayload.quranProgress && Array.isArray(cloudPayload.quranProgress.completed)) 
            ? cloudPayload.quranProgress.completed 
            : [];

        const mergedJuzSet = new Set([...localJuz, ...cloudJuz]);
        const mergedCompleted = Array.from(mergedJuzSet).sort((a, b) => a - b);

        const cloudTarget = (cloudPayload.quranProgress && cloudPayload.quranProgress.target) || 1;
        const localTarget = STATE.quranProgress.target || 1;
        const mergedTarget = Math.max(localTarget, cloudTarget);

        if (mergedCompleted.length !== localJuz.length || mergedTarget !== localTarget) {
            hasMergeChanges = true;
        }

        STATE.quranProgress = {
            target: mergedTarget,
            completed: mergedCompleted
        };

        // 2. Merge Mutabaah Data
        const cloudMutabaah = cloudPayload.mutabaahData || {};
        const localMutabaah = STATE.mutabaahData || {};
        const mergedMutabaah = { ...localMutabaah };

        const allDays = new Set([...Object.keys(localMutabaah), ...Object.keys(cloudMutabaah)]);
        allDays.forEach(dayKey => {
            const localDay = localMutabaah[dayKey] || {};
            const cloudDay = cloudMutabaah[dayKey] || {};
            const mergedDay = { ...localDay };

            const allItems = new Set([...Object.keys(localDay), ...Object.keys(cloudDay)]);
            allItems.forEach(itemId => {
                if (localDay[itemId] === true || cloudDay[itemId] === true) {
                    if (mergedDay[itemId] !== true) {
                        hasMergeChanges = true;
                    }
                    mergedDay[itemId] = true;
                }
            });

            mergedMutabaah[dayKey] = mergedDay;
        });

        STATE.mutabaahData = mergedMutabaah;

        if (cloudPayload.city && (!STATE.city || STATE.city === 'Jakarta')) {
            STATE.city = cloudPayload.city;
        }

        const hadLocalData = localJuz.length > 0 || Object.keys(localMutabaah).some(k => Object.values(localMutabaah[k]).some(v => v === true));
        const hadCloudData = cloudJuz.length > 0 || Object.keys(cloudMutabaah).some(k => Object.values(cloudMutabaah[k]).some(v => v === true));

        return { hasMergeChanges, hadLocalData, hadCloudData };
    }

    async function fetchFromPostgres(userId) {
        if (!userId) return;
        try {
            const res = await fetch(`/api/sync?user_id=${encodeURIComponent(userId)}`);
            const json = await res.json();
            if (res.ok && json.ok && json.found && json.data) {
                const cloudPayload = json.data.payload;
                if (cloudPayload) {
                    const mergeResult = smartMergeData(cloudPayload);
                    saveUserData(false);
                    renderQuranPlanner();
                    renderMutabaahCalendar();
                    renderMutabaahChecklist();

                    if (mergeResult.hadLocalData && mergeResult.hadCloudData) {
                        showToast('Alhamdulillah! Data perangkat dan cloud berhasil disatukan (Smart Merge). ☁️🔄');
                        await syncToPostgres(true);
                    } else if (mergeResult.hadCloudData) {
                        showToast('Alhamdulillah! Data amalan berhasil dipulihkan dari PostgreSQL server. ☁️✅');
                    }
                }
            } else if (res.ok && json.ok && !json.found) {
                await syncToPostgres(true);
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

    function exportBackup() {
        const backupData = {
            version: "2.0",
            appName: "Sahabat Muslim - Pusat Ibadah Hijriyah",
            exportedAt: new Date().toISOString(),
            user: STATE.userProfile,
            city: STATE.city,
            hijriMonth: STATE.hijriMonth,
            hijriYear: STATE.hijriYear,
            quranProgress: STATE.quranProgress,
            mutabaahData: STATE.mutabaahData
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `SahabatMuslim_Ibadah_Backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('File cadangan (.json) berhasil diunduh! 📥');
    }

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
                if (imported.hijriMonth) STATE.hijriMonth = imported.hijriMonth;

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
    // TAB 1: JADWAL KALENDER HIJRIYAH & COUNTDOWN
    // -------------------------------------------------------------
    function populateCitySelect() {
        const select = document.getElementById('imsakiyah-city-select');
        if (!select) return;
        select.innerHTML = CITIES.map(c =>
            `<option value="${c.name}" ${c.name.toLowerCase() === STATE.city.toLowerCase() ? 'selected' : ''}>${c.label}</option>`
        ).join('');
    }

    function onHijriMonthChange(monthValue) {
        STATE.hijriMonth = parseInt(monthValue, 10);
        sessionStorage.setItem('sm_selected_hijri_month', String(STATE.hijriMonth));
        updateHeroBannerForMonth();
        fetchCalendarData();
        renderMutabaahCalendar();
        renderMutabaahChecklist();
        showToast(`Menampilkan jadwal bulan ${HIJRI_MONTHS[STATE.hijriMonth - 1].name}`);
    }

    function updateHeroBannerForMonth() {
        const monthInfo = HIJRI_MONTHS[STATE.hijriMonth - 1] || HIJRI_MONTHS[8];
        const isRamadhan = (STATE.hijriMonth === 9);

        const heroBadge = document.getElementById('hero-badge-hijri');
        const heroTitle = document.getElementById('hero-title-hijri');
        const heroDesc = document.getElementById('hero-desc-hijri');
        const heroPrintTitle = document.getElementById('hero-print-title');
        const heroFastingTip = document.getElementById('hero-fasting-tip');

        if (heroBadge) {
            heroBadge.innerHTML = isRamadhan 
                ? `<span>🌙</span><span>Spesial Bulan Ramadhan ${STATE.hijriYear} H</span>`
                : `<span>📅</span><span>Kalender Hijriyah ${STATE.hijriYear} H • Bulan ${monthInfo.name}</span>`;
        }
        if (heroTitle) {
            heroTitle.textContent = isRamadhan ? `Pusat Ibadah & Imsakiyah Ramadhan` : `Kalender & Ibadah Bulan ${monthInfo.name}`;
        }
        if (heroDesc) {
            heroDesc.textContent = isRamadhan 
                ? `Jadwal Imsakiyah 30 Hari se-Indonesia, Live Countdown Berbuka, Target Khatam Qur'an, & Mutaba'ah Amal Ramadhan.`
                : `Jadwal Waktu Sholat Sebulan Penuh, Panduan Puasa Sunnah (Senin-Kamis & Ayyamul Bidh), Target Tilawah, & Mutaba'ah Harian.`;
        }
        if (heroPrintTitle) {
            heroPrintTitle.textContent = `JADWAL IBADAH & SHOLAT BULAN ${monthInfo.name.toUpperCase()} ${STATE.hijriYear} H`;
        }
        if (heroFastingTip) {
            heroFastingTip.innerHTML = `<strong>Anjuran Amalan:</strong> ${monthInfo.specialFasting}`;
        }
    }

    async function fetchCalendarData() {
        const loadingEl = document.getElementById('imsakiyah-loading');
        const contentEl = document.getElementById('imsakiyah-content');
        const cityHeaderEl = document.getElementById('imsakiyah-active-city-label');

        if (loadingEl) loadingEl.style.display = 'block';
        if (contentEl) contentEl.style.display = 'none';
        if (cityHeaderEl) cityHeaderEl.textContent = STATE.cityLabel || STATE.city;

        let url = '';
        if (STATE.coords) {
            url = `https://api.aladhan.com/v1/hijriCalendar/${STATE.hijriYear}/${STATE.hijriMonth}?latitude=${STATE.coords.lat}&longitude=${STATE.coords.lng}&method=${STATE.method}`;
        } else {
            url = `https://api.aladhan.com/v1/hijriCalendarByCity/${STATE.hijriYear}/${STATE.hijriMonth}?city=${encodeURIComponent(STATE.city)}&country=Indonesia&method=${STATE.method}`;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.code === 200 && Array.isArray(json.data)) {
                STATE.calendarData = json.data;
                renderCalendarTable(json.data);
                startCountdown(json.data);
            } else {
                throw new Error('Format data tidak sesuai');
            }
        } catch (err) {
            console.error('Gagal mengambil jadwal kalender:', err);
            renderCalendarFallback();
        } finally {
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'block';
        }
    }

    function renderCalendarTable(days) {
        const tbody = document.getElementById('imsakiyah-table-body');
        if (!tbody) return;

        const todayStr = getTodayFormatted(); // DD-MM-YYYY
        const monthInfo = HIJRI_MONTHS[STATE.hijriMonth - 1];

        let html = '';
        days.forEach((item, index) => {
            const dayNum = index + 1;
            const greg = item.date.gregorian;
            const gregDateStr = greg.date;
            const isToday = (gregDateStr === todayStr);

            const fastingInfo = getFastingInfo(dayNum, STATE.hijriMonth, greg.weekday.en);

            const clean = (t) => t ? t.split(' ')[0] : '-';
            const imsakTime = clean(item.timings.Imsak || item.timings.Fajr);
            const subuhTime = clean(item.timings.Fajr);
            const terbitTime = clean(item.timings.Sunrise);
            const dzuhurTime = clean(item.timings.Dhuhr);
            const asharTime = clean(item.timings.Asr);
            const maghribTime = clean(item.timings.Maghrib);
            const isyaTime = clean(item.timings.Isha);

            let fastingBadgeHtml = '';
            if (fastingInfo.type === 'wajib') {
                fastingBadgeHtml = `<span class="fasting-pill wajib">Wajib Ramadhan</span>`;
            } else if (fastingInfo.type === 'sunnah') {
                fastingBadgeHtml = `<span class="fasting-pill sunnah">🌟 ${fastingInfo.badge}</span>`;
            } else if (fastingInfo.type === 'haram') {
                fastingBadgeHtml = `<span class="fasting-pill haram">⛔ ${fastingInfo.badge}</span>`;
            }

            html += `
                <tr class="${isToday ? 'row-today' : ''}">
                    <td class="col-day">
                        <strong>${dayNum} ${monthInfo.name}</strong>
                        ${isToday ? '<span class="today-badge">Hari Ini</span>' : ''}
                        ${fastingBadgeHtml ? `<div style="margin-top: 3px;">${fastingBadgeHtml}</div>` : ''}
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

    function renderCalendarFallback() {
        const tbody = document.getElementById('imsakiyah-table-body');
        if (!tbody) return;
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--gray-600);">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                    <p><strong>Tidak dapat terhubung ke server Aladhan.</strong></p>
                    <p style="font-size: 0.85rem; margin-top: 0.25rem;">Periksa koneksi internet Anda atau coba ubah pilihan kota.</p>
                    <button class="btn btn-secondary" onclick="window.RamadhanApp.fetchCalendar()" style="margin-top: 1rem; padding: 0.5rem 1.25rem; font-size: 0.85rem;">Coba Lagi 🔄</button>
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
            const todayStr = getTodayFormatted();
            let todayData = days.find(d => d.date.gregorian.date === todayStr);

            let isPreview = false;
            if (!todayData) {
                todayData = days[0];
                isPreview = true;
            }

            if (!todayData) return;

            const isRamadhan = (STATE.hijriMonth === 9);
            const fastingInfo = getFastingInfo(todayData.date.hijri.day, STATE.hijriMonth, todayData.date.gregorian.weekday.en);

            const cleanTime = (t) => t ? t.split(' ')[0] : '00:00';
            const maghribStr = cleanTime(todayData.timings.Maghrib);
            const imsakStr = cleanTime(todayData.timings.Imsak || todayData.timings.Fajr);
            const subuhStr = cleanTime(todayData.timings.Fajr);
            const dzuhurStr = cleanTime(todayData.timings.Dhuhr);
            const asharStr = cleanTime(todayData.timings.Asr);
            const isyaStr = cleanTime(todayData.timings.Isha);

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
                targetName = isRamadhan ? "Menuju Waktu Imsak (Sahur)" : "Menuju Waktu Imsak / Sahur Sunnah";
                targetHour = iH;
                targetMinute = iM;
            } else if (nowMinutes < maghribMinutes) {
                targetName = isRamadhan ? "Menuju Waktu Berbuka Puasa" : (fastingInfo.isRecommended ? `Menuju Berbuka (${fastingInfo.badge})` : "Menuju Sholat Maghrib (Buka Puasa)");
                targetHour = mH;
                targetMinute = mM;
                isMaghribTarget = true;
            } else {
                targetName = "Menuju Waktu Imsak Esok Hari";
                targetHour = iH + 24;
                targetMinute = iM;
            }

            const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0);
            let diffMs = targetDate.getTime() - now.getTime();
            if (diffMs < 0) diffMs = 0;

            const totalSec = Math.floor(diffMs / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;

            const monthName = HIJRI_MONTHS[STATE.hijriMonth - 1].name;
            if (cardLabel) cardLabel.textContent = isPreview ? `Simulasi Bulan ${monthName} — ${targetName}` : targetName;
            if (cardTargetTime) cardTargetTime.textContent = isMaghribTarget ? `Pukul ${maghribStr}` : `Pukul ${imsakStr}`;
            if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');

            if (subtextEl) {
                subtextEl.textContent = isMaghribTarget
                    ? `Waktu Maghrib (${STATE.cityLabel || STATE.city}): ${maghribStr} WIB • Jangan lupa berdoa saat berbuka puasa!`
                    : `Waktu Imsak (${STATE.cityLabel || STATE.city}): ${imsakStr} WIB • Segerakan sahur sebelum berkumandangnya adzan subuh (${subuhStr}).`;
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
    // TAB 3: MUTABA'AH YAUMIYAH (ADAPTIVE HABIT TRACKER)
    // -------------------------------------------------------------
    function getMutabaahStorageKey(dayNumber) {
        // If Ramadhan, maintain backward compatibility with 'day_X'
        if (STATE.hijriMonth === 9) {
            return `day_${dayNumber}`;
        }
        return `m${STATE.hijriMonth}_d${dayNumber}`;
    }

    function renderMutabaahCalendar() {
        const calGrid = document.getElementById('mutabaah-days-grid');
        if (!calGrid) return;

        const totalDays = (STATE.calendarData && STATE.calendarData.length) ? STATE.calendarData.length : 30;
        const monthInfo = HIJRI_MONTHS[STATE.hijriMonth - 1];

        let html = '';
        for (let i = 1; i <= totalDays; i++) {
            const dayKey = getMutabaahStorageKey(i);
            const dayRecord = STATE.mutabaahData[dayKey] || {};

            let weekdayEn = '';
            if (STATE.calendarData && STATE.calendarData[i - 1]) {
                weekdayEn = STATE.calendarData[i - 1].date.gregorian.weekday.en;
            }
            const items = getMutabaahItemsForMonth(STATE.hijriMonth, i, weekdayEn);

            const checkedCount = Object.keys(dayRecord).filter(k => dayRecord[k] === true).length;
            const totalItems = items.length;

            let badgeClass = "badge-empty";
            if (checkedCount === totalItems) badgeClass = "badge-full";
            else if (checkedCount > 0) badgeClass = "badge-partial";

            const isSelected = (i === STATE.selectedMutabaahDay);

            const fastingInfo = getFastingInfo(i, STATE.hijriMonth, weekdayEn);
            let indicatorDot = "";
            if (fastingInfo.type === 'wajib') indicatorDot = "<span class='dot-wajib'>🌙</span>";
            else if (fastingInfo.type === 'sunnah') indicatorDot = "<span class='dot-sunnah'>⭐</span>";

            html += `
                <button type="button" class="mutabaah-day-btn ${isSelected ? 'active' : ''} ${badgeClass}" onclick="window.RamadhanApp.selectMutabaahDay(${i})">
                    <span class="day-label">${indicatorDot} H-${i}</span>
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

        const monthInfo = HIJRI_MONTHS[STATE.hijriMonth - 1];

        let weekdayEn = '';
        if (STATE.calendarData && STATE.calendarData[STATE.selectedMutabaahDay - 1]) {
            weekdayEn = STATE.calendarData[STATE.selectedMutabaahDay - 1].date.gregorian.weekday.en;
        }

        const items = getMutabaahItemsForMonth(STATE.hijriMonth, STATE.selectedMutabaahDay, weekdayEn);
        const fastingInfo = getFastingInfo(STATE.selectedMutabaahDay, STATE.hijriMonth, weekdayEn);

        if (dayTitle) {
            dayTitle.innerHTML = `Catatan Amalan: Tanggal ${STATE.selectedMutabaahDay} ${monthInfo.name} ${STATE.hijriYear} H ${fastingInfo.badge ? `<span class="badge-amalan-note">${fastingInfo.badge}</span>` : ''}`;
        }

        const dayKey = getMutabaahStorageKey(STATE.selectedMutabaahDay);
        const dayRecord = STATE.mutabaahData[dayKey] || {};

        const checkedCount = Object.keys(dayRecord).filter(k => dayRecord[k] === true).length;
        const totalItems = items.length;
        const percent = Math.round((checkedCount / totalItems) * 100);

        if (scoreEl) {
            scoreEl.textContent = `${checkedCount} dari ${totalItems} Amalan Selesai (${percent}%)`;
            scoreEl.className = `mutabaah-score-badge ${percent === 100 ? 'score-full' : (percent > 50 ? 'score-good' : '')}`;
        }

        if (!checklistEl) return;

        let html = '';
        items.forEach(item => {
            const isChecked = dayRecord[item.id] === true;
            html += `
                <label class="mutabaah-item-card ${isChecked ? 'item-checked' : ''}">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.RamadhanApp.toggleMutabaahItem('${item.id}')">
                    <div class="mutabaah-item-icon">${item.icon}</div>
                    <div class="mutabaah-item-text">
                        <strong>${item.label} ${item.badge ? `<span class="pill-mini ${item.badgeType}">${item.badge}</span>` : ''}</strong>
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
        const dayKey = getMutabaahStorageKey(STATE.selectedMutabaahDay);
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

        fetchCalendarData();
        showToast(`Lokasi diubah ke ${STATE.cityLabel}`);
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

                fetchCalendarData();
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
        onHijriMonthChange,
        useGPS,
        fetchCalendar: fetchCalendarData,
        fetchImsakiyah: fetchCalendarData,
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
