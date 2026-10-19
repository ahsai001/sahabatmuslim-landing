// Quran Reading Progress, Streak, Trend Analysis & Activity Chart — Sahabat Muslim
// Zero-dependency pure JavaScript & SVG implementation

(function () {
    const TOTAL_QURAN_AYAHS = 6236;
    const DEFAULT_DAILY_GOAL = 20; // ~1 lembar mushaf Madinah

    const STATE = {
        currentTimeframe: 7, // 7, 14, or 30 days
        dailyGoal: DEFAULT_DAILY_GOAL,
        activeTooltipIndex: null
    };

    // Helper: Local Date YYYY-MM-DD
    function toYMD(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // Helper: Format date for display (e.g., "Sen, 19 Okt")
    function formatDayLabel(dateStr) {
        try {
            const parts = dateStr.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${days[d.getDay()]} ${d.getDate()}`;
        } catch (e) {
            return dateStr;
        }
    }

    function formatFullDateIndo(dateStr) {
        try {
            const parts = dateStr.split('-');
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch (e) {
            return dateStr;
        }
    }

    // Storage Management
    function getReadingLog() {
        try {
            const raw = localStorage.getItem('sm_quran_reading_log');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn('Failed to parse reading log', e);
            return {};
        }
    }

    function saveReadingLog(log) {
        try {
            localStorage.setItem('sm_quran_reading_log', JSON.stringify(log));
            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        } catch (e) {
            console.warn('Failed to save reading log', e);
        }
    }

    function getDailyGoal() {
        try {
            const raw = localStorage.getItem('sm_quran_daily_goal');
            return raw ? parseInt(raw, 10) : DEFAULT_DAILY_GOAL;
        } catch (e) {
            return DEFAULT_DAILY_GOAL;
        }
    }

    function setDailyGoal(val) {
        const num = Math.max(1, parseInt(val, 10) || DEFAULT_DAILY_GOAL);
        STATE.dailyGoal = num;
        localStorage.setItem('sm_quran_daily_goal', num.toString());
        renderTrackerDashboard();
    }

    function getReadAyahsSet() {
        try {
            const raw = localStorage.getItem('sm_quran_distinct_ayahs');
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch (e) {
            return new Set();
        }
    }

    function saveReadAyahsSet(setObj) {
        try {
            const arr = Array.from(setObj);
            localStorage.setItem('sm_quran_distinct_ayahs', JSON.stringify(arr));
        } catch (e) {}
    }

    // Record Reading Action
    function recordAyahs(surahNum, fromAyah, toAyah, customDate = null, source = 'online') {
        const sNum = parseInt(surahNum, 10);
        let from = parseInt(fromAyah, 10);
        let to = parseInt(toAyah, 10);

        if (isNaN(sNum) || isNaN(from) || isNaN(to)) return null;
        if (from > to) {
            const temp = from;
            from = to;
            to = temp;
        }

        const count = (to - from) + 1;
        const targetDate = customDate || toYMD();
        const log = getReadingLog();

        if (!log[targetDate]) {
            log[targetDate] = {
                date: targetDate,
                totalAyahs: 0,
                surahs: [],
                entries: []
            };
        }

        // Surah Name Lookup
        let surahName = `Surah ke-${sNum}`;
        if (window.QURAN_SURAT_LIST) {
            const found = window.QURAN_SURAT_LIST.find(s => s.nomor === sNum);
            if (found) surahName = found.namaLatin;
        }

        log[targetDate].totalAyahs += count;
        if (!log[targetDate].surahs.includes(sNum)) {
            log[targetDate].surahs.push(sNum);
        }

        log[targetDate].entries.push({
            surah: sNum,
            surahName: surahName,
            fromAyah: from,
            toAyah: to,
            count: count,
            timestamp: Date.now(),
            source: source
        });

        saveReadingLog(log);

        // Update distinct ayahs for total khatam progress
        const distinctSet = getReadAyahsSet();
        for (let a = from; a <= to; a++) {
            distinctSet.add(`${sNum}:${a}`);
        }
        saveReadAyahsSet(distinctSet);

        // Update UI
        renderTrackerDashboard();

        return {
            count,
            surahName,
            from,
            to,
            targetDate,
            todayTotal: log[targetDate].totalAyahs
        };
    }

    function recordFullSurah(surahNum) {
        const sNum = parseInt(surahNum, 10);
        let jumlahAyat = 7;
        let surahName = '';
        if (window.QURAN_SURAT_LIST) {
            const s = window.QURAN_SURAT_LIST.find(it => it.nomor === sNum);
            if (s) {
                jumlahAyat = s.jumlahAyat;
                surahName = s.namaLatin;
            }
        }
        const res = recordAyahs(sNum, 1, jumlahAyat, null, 'full_surah');
        return res;
    }

    // Streak Calculation
    function calculateStreak() {
        const log = getReadingLog();
        const todayStr = toYMD();
        let currentStreak = 0;
        let activeToday = false;

        const d = new Date();
        // Check today
        if (log[todayStr] && log[todayStr].totalAyahs > 0) {
            activeToday = true;
            currentStreak = 1;
            d.setDate(d.getDate() - 1);
        } else {
            // Check yesterday
            d.setDate(d.getDate() - 1);
            const yesterdayStr = toYMD(d);
            if (!log[yesterdayStr] || log[yesterdayStr].totalAyahs === 0) {
                return { currentStreak: 0, activeToday: false, bestStreak: calculateBestStreak(log) };
            }
            d.setDate(d.getDate() - 1);
            currentStreak = 1;
        }

        // Count previous days
        while (true) {
            const checkStr = toYMD(d);
            if (log[checkStr] && log[checkStr].totalAyahs > 0) {
                currentStreak++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }

        const bestStreak = Math.max(currentStreak, calculateBestStreak(log));
        return { currentStreak, activeToday, bestStreak };
    }

    function calculateBestStreak(log) {
        const dates = Object.keys(log).filter(k => log[k].totalAyahs > 0).sort();
        if (dates.length === 0) return 0;

        let maxStreak = 1;
        let tempStreak = 1;

        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        }
        return maxStreak;
    }

    // Trend Analysis (Meningkat / Stabil / Melemah)
    function calculateTrend(timeframe = 7) {
        const log = getReadingLog();
        const today = new Date();

        // Split timeframe into recent half and previous half
        const half = Math.max(2, Math.floor(timeframe / 2));
        let recentSum = 0;
        let prevSum = 0;
        let totalAllTime = 0;

        Object.values(log).forEach(l => {
            totalAllTime += (l.totalAyahs || 0);
        });

        for (let i = 0; i < half; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const str = toYMD(d);
            recentSum += (log[str]?.totalAyahs || 0);
        }

        for (let i = half; i < half * 2; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const str = toYMD(d);
            prevSum += (log[str]?.totalAyahs || 0);
        }

        const recentAvg = recentSum / half;
        const prevAvg = prevSum / half;

        if (totalAllTime === 0) {
            return {
                status: 'new-state',
                label: '✨ Mulai Hari Ini',
                badgeText: 'Belum Ada Catatan',
                percent: 0,
                message: 'Yuk mulai tilawah dan catat bacaan pertamamu hari ini untuk memantau grafik kemampuan membaca!',
                icon: '🌱'
            };
        }

        if (recentSum === 0 && prevSum === 0) {
            return {
                status: 'decreasing',
                label: '📉 Tilawah Sedang Rehat',
                badgeText: 'Perlu Ditingkatkan',
                percent: -100,
                message: 'Volume membaca sedang menurun beberapa hari terakhir. Yuk luangkan 5 menit tilawah agar streak tidak terputus!',
                icon: '⏳'
            };
        }

        if (prevAvg === 0 && recentAvg > 0) {
            return {
                status: 'increasing',
                label: '🚀 Semangat Baru Meningkat',
                badgeText: 'Meningkat Pesat',
                percent: 100,
                message: `Alhamdulillah! Kemampuan dan keaktifan tilawahmu sedang naik (${Math.round(recentAvg)} ayat/hari). Pertahankan istiqomah!`,
                icon: '📈'
            };
        }

        const ratio = prevAvg > 0 ? (recentAvg / prevAvg) : 1;
        const percentChange = Math.round((ratio - 1) * 100);

        if (ratio >= 1.15) {
            return {
                status: 'increasing',
                label: `📈 Kemampuan Meningkat (+${percentChange}%)`,
                badgeText: `Naik +${percentChange}%`,
                percent: percentChange,
                message: `MasyaAllah! Rata-rata tilawahmu (${Math.round(recentAvg)} ayat/hari) meningkat dibanding periode sebelumnya. Terus jaga ritme ini!`,
                icon: '🚀'
            };
        } else if (ratio <= 0.85) {
            return {
                status: 'decreasing',
                label: `📉 Volume Menurun (${percentChange}%)`,
                badgeText: `Menurun ${Math.abs(percentChange)}%`,
                percent: percentChange,
                message: `Kemampuan membaca agak melambat dibanding periode lalu. Sedikit demi sedikit yang penting dawam (rutin) lebih dicintai Allah.`,
                icon: '🌱'
            };
        } else {
            return {
                status: 'stable',
                label: '➡️ Kemampuan Stabil & Istiqomah',
                badgeText: 'Stabil & Konsisten',
                percent: percentChange,
                message: `Alhamdulillah! Ritme tilawah harianmu sangat stabil (~${Math.round(recentAvg)} ayat/hari). Istiqomah adalah kunci keberkahan Al-Qur'an.`,
                icon: '💎'
            };
        }
    }

    // Comprehensive Stats Calculation
    function calculateStats(timeframe = 7) {
        const log = getReadingLog();
        const goal = getDailyGoal();
        const todayStr = toYMD();
        const todayAyahs = log[todayStr]?.totalAyahs || 0;

        // Distinct ayahs & total ayahs
        const distinctSet = getReadAyahsSet();
        let distinctCount = distinctSet.size;

        // Fallback: If distinctCount is 0 but log has totalAyahs, use sum
        let totalAyahsAllTime = 0;
        let recordDay = { date: '', count: 0 };
        let daysActive = 0;

        Object.keys(log).forEach(k => {
            const cnt = log[k].totalAyahs || 0;
            totalAyahsAllTime += cnt;
            if (cnt > recordDay.count) {
                recordDay = { date: k, count: cnt };
            }
            if (cnt > 0) daysActive++;
        });

        if (distinctCount === 0 && totalAyahsAllTime > 0) {
            distinctCount = Math.min(totalAyahsAllTime, TOTAL_QURAN_AYAHS);
        }

        const khatamPct = ((distinctCount / TOTAL_QURAN_AYAHS) * 100).toFixed(1);

        // Daily average over the timeframe
        const today = new Date();
        let sumTimeframe = 0;
        for (let i = 0; i < timeframe; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const str = toYMD(d);
            sumTimeframe += (log[str]?.totalAyahs || 0);
        }
        const dailyAvg = Math.round(sumTimeframe / timeframe);

        // Days to khatam estimate
        const remaining = Math.max(0, TOTAL_QURAN_AYAHS - distinctCount);
        let daysToKhatam = '—';
        if (dailyAvg > 0) {
            const estDays = Math.ceil(remaining / dailyAvg);
            if (estDays < 30) {
                daysToKhatam = `~${estDays} Hari`;
            } else {
                const months = Math.floor(estDays / 30);
                const daysRem = estDays % 30;
                daysToKhatam = daysRem > 0 ? `~${months} bln ${daysRem} hr` : `~${months} bulan`;
            }
        }

        const streak = calculateStreak();
        const trend = calculateTrend(timeframe);

        return {
            todayAyahs,
            dailyGoal: goal,
            todayProgressPct: Math.min(100, Math.round((todayAyahs / goal) * 100)),
            distinctAyahsRead: distinctCount,
            totalQuranAyahs: TOTAL_QURAN_AYAHS,
            khatamPct,
            totalAyahsAllTime,
            dailyAverage: dailyAvg,
            daysToKhatam,
            recordDay,
            streak,
            trend
        };
    }

    // Responsive SVG Bar Chart Rendering
    function renderChart(timeframe = 7) {
        const container = document.getElementById('qt-chart-svg-wrap');
        if (!container) return;

        const log = getReadingLog();
        const goal = getDailyGoal();
        const today = new Date();

        // Prepare Day-by-Day data
        const data = [];
        for (let i = timeframe - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const str = toYMD(d);
            const count = log[str]?.totalAyahs || 0;
            const entries = log[str]?.entries || [];
            data.push({
                dateStr: str,
                label: i === 0 ? 'Hari Ini' : formatDayLabel(str),
                fullDate: formatFullDateIndo(str),
                count: count,
                isToday: i === 0,
                entries: entries
            });
        }

        // SVG Dimensions
        const width = 720;
        const height = 240;
        const padding = { top: 30, right: 25, bottom: 40, left: 45 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Dynamic Y-axis Max Scale
        const maxDataVal = Math.max(...data.map(d => d.count), goal, 10);
        // Round up to nice number (multiple of 5 or 10 or 25)
        let yMax = 20;
        if (maxDataVal <= 15) yMax = 15;
        else if (maxDataVal <= 30) yMax = 30;
        else if (maxDataVal <= 50) yMax = 50;
        else if (maxDataVal <= 100) yMax = 100;
        else yMax = Math.ceil(maxDataVal / 25) * 25;

        // Y-axis steps (4 divisions)
        const ySteps = 4;
        let gridLines = '';
        for (let s = 0; s <= ySteps; s++) {
            const val = Math.round((yMax / ySteps) * s);
            const yPos = padding.top + chartHeight - (val / yMax) * chartHeight;
            gridLines += `
                <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" class="qt-grid-line" />
                <text x="${padding.left - 8}" y="${yPos + 4}" text-anchor="end" class="qt-axis-text">${val}</text>
            `;
        }

        // Target Goal reference line
        const targetY = padding.top + chartHeight - (Math.min(goal, yMax) / yMax) * chartHeight;
        const targetLineSvg = `
            <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" class="qt-target-line" />
        `;

        // Update target badge in header if element exists
        const targetBadge = document.getElementById('qt-chart-target-badge');
        if (targetBadge) {
            targetBadge.textContent = `🎯 Target: ${goal} ayat/hari`;
        }

        // Bars & X-axis labels
        const barWidth = Math.min(48, Math.max(16, (chartWidth / data.length) * 0.58));
        const colWidth = chartWidth / data.length;

        let barsSvg = '';
        data.forEach((d, idx) => {
            const xCenter = padding.left + (idx * colWidth) + (colWidth / 2);
            const xPos = xCenter - (barWidth / 2);
            const barHeight = Math.max(d.count > 0 ? 4 : 0, (d.count / yMax) * chartHeight);
            const yPos = padding.top + chartHeight - barHeight;

            const isAchieved = d.count >= goal && d.count > 0;
            const fillColor = d.isToday 
                ? (isAchieved ? 'url(#qtBarGradGold)' : 'url(#qtBarGradToday)') 
                : (isAchieved ? 'url(#qtBarGradGreen)' : 'url(#qtBarGradNormal)');

            barsSvg += `
                <g class="qt-bar-group" data-idx="${idx}" tabindex="0" role="button" aria-label="${d.fullDate}: ${d.count} ayat">
                    <!-- Invisible wider touch target for easy clicking -->
                    <rect x="${xCenter - (colWidth / 2)}" y="${padding.top}" width="${colWidth}" height="${chartHeight}" fill="transparent" />
                    
                    <!-- Background bar slot -->
                    <rect x="${xPos}" y="${padding.top}" width="${barWidth}" height="${chartHeight}" rx="6" ry="6" fill="#f8fafc" />
                    
                    <!-- Filled Data Bar -->
                    ${d.count > 0 ? `
                    <rect x="${xPos}" y="${yPos}" width="${barWidth}" height="${barHeight}" rx="6" ry="6" fill="${fillColor}" class="qt-bar-rect">
                        <animate attributeName="height" from="0" to="${barHeight}" dur="0.4s" fill="freeze" />
                        <animate attributeName="y" from="${padding.top + chartHeight}" to="${yPos}" dur="0.4s" fill="freeze" />
                    </rect>
                    ` : `
                    <circle cx="${xCenter}" cy="${padding.top + chartHeight - 4}" r="3" fill="#cbd5e1" />
                    `}

                    <!-- Value above bar if space permits -->
                    ${d.count > 0 ? `
                    <text x="${xCenter}" y="${Math.max(16, yPos - 6)}" text-anchor="middle" class="qt-axis-text" style="font-weight: 700; fill: ${d.isToday ? '#047857' : '#334155'}; font-size: 11px;">
                        ${d.count}
                    </text>
                    ` : ''}

                    <!-- X-axis Label -->
                    <text x="${xCenter}" y="${height - padding.bottom + 18}" text-anchor="middle" class="qt-axis-text" style="font-weight: ${d.isToday ? '700' : '500'}; fill: ${d.isToday ? '#059669' : '#64748b'}; font-size: ${timeframe === 30 ? '9px' : '11px'};">
                        ${d.label}
                    </text>
                </g>
            `;
        });

        // Assemble Full SVG
        container.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" class="qt-svg-chart" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <!-- Normal Day Emerald Gradient -->
                    <linearGradient id="qtBarGradNormal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#34d399" />
                        <stop offset="100%" stop-color="#059669" />
                    </linearGradient>

                    <!-- Target Achieved Green Gradient -->
                    <linearGradient id="qtBarGradGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="100%" stop-color="#047857" />
                    </linearGradient>

                    <!-- Today Active Gradient -->
                    <linearGradient id="qtBarGradToday" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#6ee7b7" />
                        <stop offset="100%" stop-color="#059669" />
                    </linearGradient>

                    <!-- Today Achieved Gold Gradient -->
                    <linearGradient id="qtBarGradGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#fbbf24" />
                        <stop offset="100%" stop-color="#d97706" />
                    </linearGradient>
                </defs>

                <!-- Gridlines & Y Axis -->
                ${gridLines}

                <!-- Target Goal Line -->
                ${targetLineSvg}

                <!-- Bars & Labels -->
                ${barsSvg}
            </svg>
            <div id="qt-chart-tooltip" class="qt-chart-tooltip"></div>
        `;

        // Attach Interactive Hover/Touch Tooltips
        const groups = container.querySelectorAll('.qt-bar-group');
        const tooltip = document.getElementById('qt-chart-tooltip');

        groups.forEach(g => {
            const idx = parseInt(g.dataset.idx, 10);
            const item = data[idx];

            const showTip = (evt) => {
                const rect = g.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const leftPos = rect.left + rect.width / 2 - containerRect.left;
                const topPos = rect.top - containerRect.top;

                const achievedHtml = item.count >= goal && item.count > 0 
                    ? `<span style="color: #34d399; font-weight: 700;">✓ Target Tercapai! 🎉</span>` 
                    : `<span style="color: #94a3b8;">Target: ${goal} ayat</span>`;

                let surahSummary = '';
                if (item.entries && item.entries.length > 0) {
                    const uniqueNames = Array.from(new Set(item.entries.map(e => e.surahName))).slice(0, 3);
                    surahSummary = `<div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 2px;">📖 ${uniqueNames.join(', ')}</div>`;
                }

                tooltip.innerHTML = `
                    <div style="font-weight: 700; margin-bottom: 2px;">${item.fullDate}</div>
                    <div style="font-size: 0.95rem; font-weight: 800; color: #10b981;">${item.count} Ayat Dibaca</div>
                    <div style="font-size: 0.72rem;">${achievedHtml}</div>
                    ${surahSummary}
                `;

                tooltip.style.left = `${leftPos}px`;
                tooltip.style.top = `${topPos}px`;
                tooltip.classList.add('show');
            };

            const hideTip = () => {
                tooltip.classList.remove('show');
            };

            g.addEventListener('mouseenter', showTip);
            g.addEventListener('mouseleave', hideTip);
            g.addEventListener('click', showTip);
            g.addEventListener('focus', showTip);
            g.addEventListener('blur', hideTip);
        });
    }

    // Dashboard View Render
    function renderTrackerDashboard() {
        const stats = calculateStats(STATE.currentTimeframe);

        // Update Today Metrics
        const elToday = document.getElementById('qt-val-today');
        const elTodaySub = document.getElementById('qt-sub-today');
        const elTodayBar = document.getElementById('qt-bar-today');
        if (elToday) elToday.innerHTML = `${stats.todayAyahs} <small>/ ${stats.dailyGoal} Ayat</small>`;
        if (elTodaySub) {
            elTodaySub.innerHTML = stats.todayAyahs >= stats.dailyGoal 
                ? '🎉 <strong>Target Harian Tercapai!</strong>' 
                : `${stats.todayProgressPct}% dari target harian`;
        }
        if (elTodayBar) elTodayBar.style.width = `${stats.todayProgressPct}%`;

        // Update Khatam Progress Metrics
        const elKhatam = document.getElementById('qt-val-khatam');
        const elKhatamSub = document.getElementById('qt-sub-khatam');
        const elKhatamBar = document.getElementById('qt-bar-khatam');
        if (elKhatam) elKhatam.innerHTML = `${stats.khatamPct}% <small>Khatam</small>`;
        if (elKhatamSub) elKhatamSub.textContent = `${stats.distinctAyahsRead.toLocaleString('id-ID')} dari ${stats.totalQuranAyahs.toLocaleString('id-ID')} ayat`;
        if (elKhatamBar) elKhatamBar.style.width = `${Math.min(100, parseFloat(stats.khatamPct))}%`;

        // Update Daily Average & Days to Khatam
        const elAvg = document.getElementById('qt-val-avg');
        const elAvgSub = document.getElementById('qt-sub-avg');
        if (elAvg) elAvg.innerHTML = `${stats.dailyAverage} <small>Ayat/Hari</small>`;
        if (elAvgSub) elAvgSub.textContent = `Estimasi khatam: ${stats.daysToKhatam}`;

        // Update Streak Badge
        const elStreak = document.getElementById('qt-badge-streak');
        if (elStreak) {
            if (stats.streak.currentStreak > 0) {
                elStreak.style.display = 'inline-flex';
                elStreak.innerHTML = `🔥 <strong>${stats.streak.currentStreak} Hari Beruntun</strong>`;
                elStreak.title = stats.streak.activeToday ? 'Streak aktif hari ini!' : 'Yuk baca hari ini agar streak terjaga!';
            } else {
                elStreak.style.display = 'inline-flex';
                elStreak.innerHTML = `🌱 <strong>Mulai Streak</strong>`;
                elStreak.title = 'Baca Al-Quran hari ini untuk memulai streak!';
            }
        }

        // Update Trend Banner
        const elTrend = document.getElementById('qt-trend-banner');
        if (elTrend) {
            elTrend.className = `qt-trend-banner ${stats.trend.status}`;
            elTrend.innerHTML = `
                <span class="qt-trend-icon">${stats.trend.icon}</span>
                <div class="qt-trend-text">
                    <strong>${stats.trend.label}:</strong> ${stats.trend.message}
                </div>
            `;
        }

        // Update Insights
        const elRecord = document.getElementById('qt-insight-record');
        if (elRecord) {
            if (stats.recordDay.count > 0) {
                elRecord.textContent = `${stats.recordDay.count} ayat (${formatDayLabel(stats.recordDay.date)})`;
            } else {
                elRecord.textContent = 'Belum ada rekor';
            }
        }

        // Render Chart
        renderChart(STATE.currentTimeframe);
    }

    // Modal: Record Reading Manual
    function openRecordModal() {
        const modal = document.getElementById('qt-modal-record');
        if (!modal) return;

        // Populate Surah Select
        const sel = document.getElementById('qt-input-surah');
        if (sel && window.QURAN_SURAT_LIST && sel.options.length <= 1) {
            sel.innerHTML = '<option value="">-- Pilih Surah --</option>';
            window.QURAN_SURAT_LIST.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.nomor;
                opt.textContent = `${s.nomor}. ${s.namaLatin} (${s.jumlahAyat} ayat)`;
                sel.appendChild(opt);
            });
        }

        // Reset inputs
        const inDate = document.getElementById('qt-input-date');
        if (inDate) inDate.value = toYMD();
        const inFrom = document.getElementById('qt-input-from');
        if (inFrom) inFrom.value = 1;
        const inTo = document.getElementById('qt-input-to');
        if (inTo) inTo.value = 7;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRecordModal() {
        const modal = document.getElementById('qt-modal-record');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function onSurahSelectChange(surahNum) {
        if (!surahNum || !window.QURAN_SURAT_LIST) return;
        const s = window.QURAN_SURAT_LIST.find(it => it.nomor === parseInt(surahNum, 10));
        if (s) {
            const inTo = document.getElementById('qt-input-to');
            if (inTo) inTo.value = s.jumlahAyat;
            const helper = document.getElementById('qt-surah-helper');
            if (helper) helper.textContent = `Surah ${s.namaLatin} memiliki ${s.jumlahAyat} ayat.`;
        }
    }

    function submitRecordForm(e) {
        if (e) e.preventDefault();
        const selSurah = document.getElementById('qt-input-surah');
        const inFrom = document.getElementById('qt-input-from');
        const inTo = document.getElementById('qt-input-to');
        const inDate = document.getElementById('qt-input-date');

        const sNum = parseInt(selSurah?.value, 10);
        const from = parseInt(inFrom?.value, 10);
        const to = parseInt(inTo?.value, 10);
        const dateVal = inDate?.value || toYMD();

        if (!sNum) {
            alert('Silakan pilih surah yang dibaca');
            return;
        }
        if (isNaN(from) || isNaN(to) || from < 1 || to < 1) {
            alert('Nomor ayat tidak valid');
            return;
        }

        const res = recordAyahs(sNum, from, to, dateVal, 'manual');
        closeRecordModal();

        if (window.smQuran && typeof window.smQuran.showToast === 'function') {
            window.smQuran.showToast(`Alhamdulillah! +${res.count} ayat tersimpan di catatan tilawah 📖`);
        } else {
            alert(`Alhamdulillah! ${res.count} ayat berhasil dicatat.`);
        }
    }

    // Modal: Daily Goal Setting
    function openGoalModal() {
        const modal = document.getElementById('qt-modal-goal');
        if (!modal) return;
        const inGoal = document.getElementById('qt-input-goal');
        if (inGoal) inGoal.value = getDailyGoal();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeGoalModal() {
        const modal = document.getElementById('qt-modal-goal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function submitGoalForm(e) {
        if (e) e.preventDefault();
        const inGoal = document.getElementById('qt-input-goal');
        const val = parseInt(inGoal?.value, 10);
        if (val && val > 0) {
            setDailyGoal(val);
            closeGoalModal();
            if (window.smQuran && typeof window.smQuran.showToast === 'function') {
                window.smQuran.showToast(`Target harian berhasil diubah menjadi ${val} ayat 🎯`);
            }
        }
    }

    function setQuickGoal(val) {
        const inGoal = document.getElementById('qt-input-goal');
        if (inGoal) inGoal.value = val;
    }

    // Timeframe selector
    function setTimeframe(days) {
        STATE.currentTimeframe = days;
        document.querySelectorAll('.qt-timeframe-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.days, 10) === days);
        });
        renderTrackerDashboard();
    }

    // Initialize Tracker on Load
    function init() {
        STATE.dailyGoal = getDailyGoal();
        renderTrackerDashboard();

        // Check if user came with sample initial reading
        const log = getReadingLog();
        const keys = Object.keys(log);
        if (keys.length === 0) {
            // Optional: If user already has lastRead from earlier sessions, seed it
            try {
                const savedLast = localStorage.getItem('sm_quran_last_read');
                if (savedLast) {
                    const parsed = JSON.parse(savedLast);
                    if (parsed.surah && parsed.ayah) {
                        recordAyahs(parsed.surah, 1, parsed.ayah, null, 'bookmark_seed');
                    }
                }
            } catch (e) {}
        }
    }

    // Expose Global API for smQuran and user interaction
    window.smQuranTracker = {
        init,
        recordAyahs,
        recordFullSurah,
        calculateStats,
        calculateStreak,
        calculateTrend,
        renderTrackerDashboard,
        setTimeframe,
        openRecordModal,
        closeRecordModal,
        onSurahSelectChange,
        submitRecordForm,
        openGoalModal,
        closeGoalModal,
        submitGoalForm,
        setQuickGoal
    };

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
