// Unified Cloud Sync Manager — Sahabat Muslim
// Synchronizes all localStorage data (Preferences, Playlists, Bookmarks, Mutaba'ah, Counters, Favorites)
// with PostgreSQL via /api/sync using Lossless Smart Merge (Union).
// NOTE: Downloaded audio files (IndexedDB binary blobs) remain strictly LOCAL on the device.

(function () {
    const SYNC_API_ENDPOINT = '/api/sync';
    let syncDebounceTimer = null;
    let isSyncing = false;

    // Safe JSON parse from localStorage
    function getJson(key, defaultVal = null) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    }

    function setJson(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            console.warn(`[smSync] Failed to write localStorage for ${key}:`, e);
        }
    }

    // Get active user profile
    function getUserProfile() {
        return getJson('sm_hijri_user') || getJson('sm_ramadhan_user') || null;
    }

    function getSessionToken() {
        return localStorage.getItem('sm_session_token') || null;
    }

    function isLoggedIn() {
        const u = getUserProfile();
        return !!(u && (u.sub || u.email));
    }

    // Collect all local storage data into structured payload
    function collectLocalPayload() {
        const prayerLoc = getJson('sm_prayer_location') || {};
        const quranProg = getJson('sm_hijri_quran') || getJson('sm_ramadhan_quran') || { target: 1, completed: [] };
        const mutabaah = getJson('sm_hijri_mutabaah') || getJson('sm_ramadhan_mutabaah') || {};
        const murottalPlaylist = getJson('sm_murottal_playlist') || [];
        const murottalReciter = getJson('sm_murottal_reciter_custom') || null;
        const murottalReciterId = localStorage.getItem('sm_murottal_reciter_id') || '76';
        const quranLastRead = getJson('sm_quran_last_read') || null;
        const dzikirCounters = getJson('sm_dzikir_counters_v2') || {};
        const doaFavs = getJson('sm_doa_favorites') || [];
        const kidsFavs = getJson('sm_kids_favorites') || [];

        return {
            // Backward-compatibility keys for ramadhan / ibadah
            city: prayerLoc.name || 'Jakarta',
            hijriYear: 1447,
            hijriMonth: 9,
            quranProgress: quranProg,
            mutabaahData: mutabaah,

            // Namespaced features
            prayer: {
                location: prayerLoc,
                method: localStorage.getItem('sm_prayer_method') || '20',
                hijriAdj: localStorage.getItem('sm_hijri_adj') || '0'
            },
            murottal: {
                playlist: murottalPlaylist,
                reciter: murottalReciter,
                reciterId: murottalReciterId
            },
            quran: {
                lastRead: quranLastRead,
                fontSize: localStorage.getItem('sm_quran_font_size') || '28',
                showLatin: localStorage.getItem('sm_quran_show_latin') !== 'false',
                showTrans: localStorage.getItem('sm_quran_show_trans') !== 'false',
                selectedQari: localStorage.getItem('sm_quran_selected_qari') || '05'
            },
            dzikir: {
                counters: dzikirCounters,
                fontSize: localStorage.getItem('sm_dzikir_font_size') || '24',
                showLatin: localStorage.getItem('sm_dzikir_show_latin') !== 'false',
                showTerjemah: localStorage.getItem('sm_dzikir_show_terjemah') !== 'false'
            },
            doa: {
                favorites: doaFavs,
                fontSize: localStorage.getItem('sm_doa_font_size') || '24',
                showLatin: localStorage.getItem('sm_doa_show_latin') !== 'false',
                showTerjemah: localStorage.getItem('sm_doa_show_terjemah') !== 'false'
            },
            kids: {
                favorites: kidsFavs,
                screenTime: localStorage.getItem('sm_kids_screentime') || '30'
            }
        };
    }

    // Smart Merge (Union Lossless) of Cloud Data into Local Storage
    function smartMerge(cloud) {
        if (!cloud || typeof cloud !== 'object') return false;
        let hasChanges = false;

        // 1. Murottal Playlist (Smart Union by surahNumber + qariId)
        const cloudMurottal = cloud.murottal || {};
        const cloudPlaylist = Array.isArray(cloudMurottal.playlist) ? cloudMurottal.playlist : [];
        const localPlaylist = getJson('sm_murottal_playlist') || [];

        if (cloudPlaylist.length > 0) {
            const localKeyMap = new Map();
            localPlaylist.forEach(item => {
                const k = `${item.surahNumber}_${item.qariId}`;
                localKeyMap.set(k, item);
            });

            cloudPlaylist.forEach(item => {
                const k = `${item.surahNumber}_${item.qariId}`;
                if (!localKeyMap.has(k)) {
                    localPlaylist.push(item);
                    hasChanges = true;
                }
            });
            setJson('sm_murottal_playlist', localPlaylist);
        }

        // Murottal Reciter
        if (cloudMurottal.reciter && cloudMurottal.reciter.id) {
            const localReciter = getJson('sm_murottal_reciter_custom');
            if (!localReciter || (localReciter.id === '76' && cloudMurottal.reciter.id !== '76')) {
                setJson('sm_murottal_reciter_custom', cloudMurottal.reciter);
                localStorage.setItem('sm_murottal_reciter_id', cloudMurottal.reciter.id);
                hasChanges = true;
            }
        }

        // 2. Quran Last Read (Keep latest timestamp)
        const cloudQuran = cloud.quran || {};
        if (cloudQuran.lastRead && cloudQuran.lastRead.surah) {
            const localLast = getJson('sm_quran_last_read');
            const cloudTime = new Date(cloudQuran.lastRead.updatedAt || 0).getTime();
            const localTime = localLast ? new Date(localLast.updatedAt || 0).getTime() : 0;
            if (!localLast || cloudTime > localTime) {
                setJson('sm_quran_last_read', cloudQuran.lastRead);
                hasChanges = true;
            }
        }

        // 3. Dzikir Counters (Take Math.max per counter ID)
        const cloudDzikir = cloud.dzikir || {};
        const cloudCounters = cloudDzikir.counters || {};
        const localCounters = getJson('sm_dzikir_counters_v2') || {};
        let countersChanged = false;

        Object.keys(cloudCounters).forEach(id => {
            const cVal = Number(cloudCounters[id]) || 0;
            const lVal = Number(localCounters[id]) || 0;
            if (cVal > lVal) {
                localCounters[id] = cVal;
                countersChanged = true;
                hasChanges = true;
            }
        });
        if (countersChanged) {
            setJson('sm_dzikir_counters_v2', localCounters);
        }

        // 4. Doa Favorites (Union set)
        const cloudDoa = cloud.doa || {};
        const cloudDoaFavs = Array.isArray(cloudDoa.favorites) ? cloudDoa.favorites : [];
        const localDoaFavs = getJson('sm_doa_favorites') || [];
        const mergedDoaFavs = Array.from(new Set([...localDoaFavs, ...cloudDoaFavs]));
        if (mergedDoaFavs.length !== localDoaFavs.length) {
            setJson('sm_doa_favorites', mergedDoaFavs);
            hasChanges = true;
        }

        // 5. Kids Favorites (Union set)
        const cloudKids = cloud.kids || {};
        const cloudKidsFavs = Array.isArray(cloudKids.favorites) ? cloudKids.favorites : [];
        const localKidsFavs = getJson('sm_kids_favorites') || [];
        const mergedKidsFavs = Array.from(new Set([...localKidsFavs, ...cloudKidsFavs]));
        if (mergedKidsFavs.length !== localKidsFavs.length) {
            setJson('sm_kids_favorites', mergedKidsFavs);
            hasChanges = true;
        }

        // 6. Ibadah Mutaba'ah (Union true flags)
        const cloudMutabaah = cloud.mutabaahData || (cloud.ibadah && cloud.ibadah.mutabaahData) || {};
        const localMutabaah = getJson('sm_hijri_mutabaah') || getJson('sm_ramadhan_mutabaah') || {};
        let mutabaahChanged = false;

        Object.keys(cloudMutabaah).forEach(dayKey => {
            if (!localMutabaah[dayKey]) localMutabaah[dayKey] = {};
            const cloudDay = cloudMutabaah[dayKey];
            Object.keys(cloudDay).forEach(itemId => {
                if (cloudDay[itemId] === true && localMutabaah[dayKey][itemId] !== true) {
                    localMutabaah[dayKey][itemId] = true;
                    mutabaahChanged = true;
                    hasChanges = true;
                }
            });
        });

        if (mutabaahChanged) {
            setJson('sm_hijri_mutabaah', localMutabaah);
            setJson('sm_ramadhan_mutabaah', localMutabaah);
        }

        // 7. Quran Progress (Union completed juz & max target)
        const cloudProg = cloud.quranProgress || (cloud.ibadah && cloud.ibadah.quranProgress) || {};
        const localProg = getJson('sm_hijri_quran') || getJson('sm_ramadhan_quran') || { target: 1, completed: [] };
        const localJuz = Array.isArray(localProg.completed) ? localProg.completed : [];
        const cloudJuz = Array.isArray(cloudProg.completed) ? cloudProg.completed : [];
        const mergedJuz = Array.from(new Set([...localJuz, ...cloudJuz])).sort((a, b) => a - b);
        const mergedTarget = Math.max(localProg.target || 1, cloudProg.target || 1);

        if (mergedJuz.length !== localJuz.length || mergedTarget !== (localProg.target || 1)) {
            const newProg = { target: mergedTarget, completed: mergedJuz };
            setJson('sm_hijri_quran', newProg);
            setJson('sm_ramadhan_quran', newProg);
            hasChanges = true;
        }

        // 8. Prayer Location
        const cloudPrayer = cloud.prayer || {};
        if (cloudPrayer.location && cloudPrayer.location.name) {
            const localLoc = getJson('sm_prayer_location');
            if (!localLoc || localLoc.name === 'Jakarta') {
                setJson('sm_prayer_location', cloudPrayer.location);
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    // Push local data to PostgreSQL cloud server
    async function push(silent = true) {
        if (!isLoggedIn() || isSyncing) return false;
        const user = getUserProfile();
        const token = getSessionToken();

        isSyncing = true;
        const payloadData = collectLocalPayload();
        const body = {
            user_id: user.sub || user.email,
            email: user.email || '',
            name: user.name || '',
            avatar_url: user.picture || '',
            client_updated_at: new Date().toISOString(),
            payload: payloadData
        };

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(SYNC_API_ENDPOINT, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (!silent && typeof showToast === 'function') {
                    showToast('Semua data Anda berhasil disinkronkan ke Cloud Server! ☁️✅');
                }
                return true;
            }
        } catch (e) {
            console.warn('[smSync] Push sync error:', e);
        } finally {
            isSyncing = false;
        }
        return false;
    }

    // Pull from cloud, smart-merge, and dispatch event
    async function pull(silent = true) {
        if (!isLoggedIn() || isSyncing) return false;
        const user = getUserProfile();
        const token = getSessionToken();
        const userId = user.sub || user.email;

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(`${SYNC_API_ENDPOINT}?user_id=${encodeURIComponent(userId)}`, { headers });
            const json = await res.json();

            if (res.ok && json.ok && json.found && json.data) {
                const cloudPayload = json.data.payload;
                const hasChanges = smartMerge(cloudPayload);

                // Dispatch notification for active page to re-render
                window.dispatchEvent(new CustomEvent('sm:sync-applied', {
                    detail: { cloudPayload, hasChanges }
                }));

                // If local had extra items not in cloud, push merged result to cloud
                await push(true);
                return true;
            } else if (res.ok && json.ok && !json.found) {
                // First time user on cloud: push local data to create record
                await push(true);
                return true;
            }
        } catch (e) {
            console.warn('[smSync] Pull sync error:', e);
        }
        return false;
    }

    // Debounced schedule for auto-syncing when local items change
    function scheduleSync(delay = 1500) {
        if (!isLoggedIn()) return;
        if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
        syncDebounceTimer = setTimeout(() => {
            push(true);
        }, delay);
    }

    // Initialize on page load
    async function init() {
        if (isLoggedIn()) {
            await pull(true);
        }
    }

    // Expose Global smSync API
    window.smSync = {
        init,
        isLoggedIn,
        getUserProfile,
        collectLocalPayload,
        smartMerge,
        push,
        pull,
        scheduleSync
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
