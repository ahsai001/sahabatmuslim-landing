// Doa Harian - Sahabat Muslim Interactive Controller
// Data sourced from SimpleTools collection (equran.id/doa - 227 items)

(function () {
    let currentGroup = '';
    let currentSearch = '';
    let arabicFontSize = 1.55; // rem
    let showLatin = true;
    let showTerjemah = true;
    let favorites = new Set();

    function loadStorage() {
        try {
            const savedFavs = localStorage.getItem('sm_doa_favorites');
            if (savedFavs) favorites = new Set(JSON.parse(savedFavs));
            const savedSize = localStorage.getItem('sm_doa_font_size');
            if (savedSize) arabicFontSize = parseFloat(savedSize);
            const savedLatin = localStorage.getItem('sm_doa_show_latin');
            if (savedLatin !== null) showLatin = savedLatin === 'true';
            const savedTerjemah = localStorage.getItem('sm_doa_show_terjemah');
            if (savedTerjemah !== null) showTerjemah = savedTerjemah === 'true';
        } catch (e) {
            console.warn('Could not load doa preferences', e);
        }
    }

    function saveStorage() {
        try {
            localStorage.setItem('sm_doa_favorites', JSON.stringify(Array.from(favorites)));
            localStorage.setItem('sm_doa_font_size', arabicFontSize.toString());
            localStorage.setItem('sm_doa_show_latin', showLatin.toString());
            localStorage.setItem('sm_doa_show_terjemah', showTerjemah.toString());
            if (window.smSync && typeof window.smSync.scheduleSync === 'function') {
                window.smSync.scheduleSync();
            }
        } catch (e) {
            console.warn('Could not save doa preferences', e);
        }
    }

    function showToast(message) {
        let toast = document.getElementById('doa-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'doa-toast';
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

    function populateGroupSelect(items) {
        const select = document.getElementById('doa-group-select');
        if (!select) return;

        const groups = {};
        items.forEach(it => {
            const g = it.grup || 'Umum';
            groups[g] = (groups[g] || 0) + 1;
        });

        const sortedGroups = Object.keys(groups).sort();
        let opts = `<option value="">Semua Kategori (${items.length} Doa)</option>`;
        opts += `<option value="__fav__">⭐ Doa Favorit Saya (${favorites.size})</option>`;
        sortedGroups.forEach(g => {
            opts += `<option value="${escapeHtml(g)}">${escapeHtml(g)} (${groups[g]})</option>`;
        });
        select.innerHTML = opts;
        select.value = currentGroup;
    }

    function getFilteredItems() {
        if (!window.DOA_DATA) return [];
        let list = window.DOA_DATA;

        if (currentGroup === '__fav__') {
            list = list.filter(it => favorites.has(it.id));
        } else if (currentGroup) {
            list = list.filter(it => it.grup === currentGroup);
        }

        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            list = list.filter(it => {
                const tagStr = Array.isArray(it.tag) ? it.tag.join(' ') : (it.tag || '');
                return (it.nama || '').toLowerCase().includes(q) ||
                    (it.tr || '').toLowerCase().includes(q) ||
                    (it.idn || '').toLowerCase().includes(q) ||
                    (it.grup || '').toLowerCase().includes(q) ||
                    tagStr.toLowerCase().includes(q) ||
                    (it.tentang || '').toLowerCase().includes(q);
            });
        }

        return list;
    }

    function renderDoaList() {
        const container = document.getElementById('doa-card-list');
        const countInfo = document.getElementById('doa-count-info');
        if (!container) return;

        const items = getFilteredItems();

        if (countInfo) {
            countInfo.innerHTML = `Menampilkan <strong>${items.length}</strong> dari ${window.DOA_DATA?.length || 227} doa`;
        }

        if (items.length === 0) {
            container.innerHTML = `
            <div class="kajian-empty" style="grid-column: 1 / -1; margin-top: 2rem;">
                <span class="kajian-empty-icon">🔍</span>
                <h3>Doa Tidak Ditemukan</h3>
                <p>Tidak ada doa yang cocok dengan kata kunci atau kategori yang Anda pilih.</p>
                <button type="button" class="btn-gps" style="margin-top: 1rem; padding: 0.6rem 1.25rem;" onclick="window.smDoa.resetFilter()">
                    Tampilkan Semua Doa
                </button>
            </div>
            `;
            return;
        }

        let html = '';
        items.forEach((item, idx) => {
            const isFav = favorites.has(item.id);
            const formattedArabic = (item.ar || '').replace(/\n/g, '<br>');
            const tagStr = Array.isArray(item.tag) ? item.tag.join(', ') : (item.tag || '');

            html += `
            <div class="dzikir-card" id="doa-${item.id}">
                <div class="dzikir-card-header">
                    <div class="dzikir-card-meta">
                        <div class="dzikir-card-number">${item.id}</div>
                        <div>
                            <span style="display: inline-block; font-size: 0.78rem; font-weight: 600; color: #059669; background: #ecfdf5; padding: 0.2rem 0.6rem; border-radius: 6px; margin-bottom: 4px; border: 1px solid #a7f3d0;">
                                ${escapeHtml(item.grup || 'Doa')}
                            </span>
                            <h3 class="dzikir-card-title">${escapeHtml(item.nama)}</h3>
                        </div>
                    </div>
                    <button type="button" class="dzikir-icon-btn ${isFav ? 'active' : ''}" style="color: ${isFav ? '#eab308' : '#94a3b8'}; border-color: ${isFav ? '#fde047' : 'var(--gray-200)'};" title="${isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}" onclick="window.smDoa.toggleFavorite(${item.id})">
                        ${isFav ? '★' : '☆'}
                    </button>
                </div>

                <div class="dzikir-arabic-text" style="font-size: ${arabicFontSize}rem;">
                    ${formattedArabic}
                </div>

                <div class="dzikir-latin-text" style="display: ${showLatin ? 'block' : 'none'};">
                    ${escapeHtml(item.tr)}
                </div>

                <div class="dzikir-trans-text" style="display: ${showTerjemah ? 'block' : 'none'};">
                    <strong style="color: var(--green-900); display: block; margin-bottom: 0.25rem;">Artinya:</strong>
                    ${escapeHtml(item.idn)}
                </div>

                ${item.tentang ? `
                <div class="dzikir-dalil-box" style="display: ${showTerjemah ? 'block' : 'none'};">
                    <div class="dzikir-dalil-title">
                        <span>📜</span> Riwayat & Penjelasan:
                    </div>
                    <div>${escapeHtml(item.tentang)}</div>
                </div>
                ` : ''}

                <div class="dzikir-card-actions">
                    <span style="font-size: 0.8rem; color: #64748b;">
                        ${tagStr ? '🏷️ ' + escapeHtml(tagStr) : ''}
                    </span>

                    <div class="dzikir-secondary-actions">
                        <button type="button" class="dzikir-icon-btn" title="Salin doa dan artinya" onclick="window.smDoa.copyItem(${item.id})">
                            📋
                        </button>
                        <button type="button" class="dzikir-icon-btn" title="Bagikan doa" onclick="window.smDoa.shareItem(${item.id})">
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
        if (!str && str !== 0) return '';
        if (typeof str !== 'string') {
            if (Array.isArray(str)) str = str.join(', ');
            else str = String(str);
        }
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function toggleFavorite(id) {
        if (favorites.has(id)) {
            favorites.delete(id);
            showToast('Dihapus dari doa favorit');
        } else {
            favorites.add(id);
            showToast('Disimpan ke doa favorit! ⭐');
        }
        saveStorage();
        populateGroupSelect(window.DOA_DATA || []);
        renderDoaList();
    }

    function copyItem(id) {
        const item = (window.DOA_DATA || []).find(it => it.id === id);
        if (!item) return;

        const textToCopy = `*${item.nama}*\n_${item.grup}_\n\n${item.ar}\n\n_Artinya:_\n"${item.idn}"\n\n_Referensi:_\n${item.tentang || 'Doa Harian Sunnah'}\n\n— Sahabat Muslim (https://sahabatmuslim.ahsailabs.my.id/doa)`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Doa & artinya berhasil disalin! 📋');
        }).catch(() => {
            showToast('Gagal menyalin teks');
        });
    }

    function shareItem(id) {
        const item = (window.DOA_DATA || []).find(it => it.id === id);
        if (!item) return;

        const text = `*${item.nama}*\n\n${item.ar}\n\n"${item.idn}"\n\nBaca selengkapnya di Sahabat Muslim: https://sahabatmuslim.ahsailabs.my.id/doa`;

        if (navigator.share) {
            navigator.share({
                title: item.nama,
                text: text,
                url: 'https://sahabatmuslim.ahsailabs.my.id/doa'
            }).catch(() => {});
        } else {
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        }
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

    function onSearchChange(val) {
        currentSearch = (val || '').trim();
        renderDoaList();
    }

    function onGroupChange(val) {
        currentGroup = val || '';
        // sync quick pills
        document.querySelectorAll('.tag-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.group === currentGroup);
        });
        renderDoaList();
    }

    function selectQuickGroup(grp) {
        currentGroup = grp || '';
        const select = document.getElementById('doa-group-select');
        if (select) select.value = currentGroup;
        document.querySelectorAll('.tag-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.group === currentGroup);
        });
        renderDoaList();
    }

    function resetFilter() {
        currentGroup = '';
        currentSearch = '';
        const input = document.getElementById('doa-search-input');
        if (input) input.value = '';
        const select = document.getElementById('doa-group-select');
        if (select) select.value = '';
        document.querySelectorAll('.tag-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.group === '');
        });
        renderDoaList();
    }

    // Expose API
    window.smDoa = {
        init: function () {
            loadStorage();
            const btnLatin = document.getElementById('btn-toggle-latin');
            if (btnLatin) btnLatin.classList.toggle('active', showLatin);
            const btnTrans = document.getElementById('btn-toggle-trans');
            if (btnTrans) btnTrans.classList.toggle('active', showTerjemah);

            if (window.DOA_DATA) {
                populateGroupSelect(window.DOA_DATA);
                renderDoaList();
            }

            window.addEventListener('sm:sync-applied', () => {
                loadStorage();
                renderDoaList();
            });
        },
        toggleFavorite,
        copyItem,
        shareItem,
        adjustFontSize,
        toggleLatin,
        toggleTerjemah,
        onSearchChange,
        onGroupChange,
        selectQuickGroup,
        resetFilter
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.smDoa.init);
    } else {
        window.smDoa.init();
    }
})();
