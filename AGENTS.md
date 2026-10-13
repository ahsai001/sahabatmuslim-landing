# 🤖 AGENTS.md — Panduan & Rules untuk AI Coding Agent

Dokumen ini adalah **panduan wajib (*mandatory rules & context*)** untuk setiap AI Agent (Antigravity, Claude Code, Cursor, Cline, Windsurf, Hermes, Copilot, dll.) yang bekerja di repositori **Sahabat Muslim**.

---

## 🧭 1. Identitas & Visi Proyek

- **Nama Proyek**: Sahabat Muslim (`sahabatmuslim-landing`)
- **Deskripsi**: Platform web All-in-One untuk kaum muslimin di Indonesia (Jadwal Sholat, Imsakiyah Ramadhan, Al-Qur'an 30 Juz, Dzikir Harian, Kumpulan 227 Doa Sunnah, Kompas Kiblat, Jadwal Kajian Sunnah, dan Ruqyah Syar'iyyah).
- **Domain Produksi**: [https://sahabatmuslim.ahsailabs.my.id](https://sahabatmuslim.ahsailabs.my.id)
- **Pemilik / Developer**: AhsaiLabs ([https://ahsailabs.my.id](https://ahsailabs.my.id))
- **Prinsip Arsitektur**:
  - **Ultra-Fast & Lightweight**: Menggunakan **Vanilla HTML5, CSS3, dan Modern ES6+ JavaScript**. Tidak menggunakan framework berat (React/Vue/Angular) atau bundler (Webpack/Vite) agar web langsung terbuka dalam < 1 detik di koneksi mobile Indonesia.
  - **No-Login First (Frictionless)**: Semua fitur ibadah wajib dapat langsung digunakan seketika tanpa mengharuskan pengguna mendaftar/login (tersimpan di `localStorage` HP). Fitur login (Google GSI / profile) disediakan sebagai opsi pencadangan ke cloud.

---

## 🗺️ 2. Peta Kode Eksisting (*Codebase Map*)

### Halaman Frontend:
| File | Fungsi & Komponen | File Pendukung |
| :--- | :--- | :--- |
| [`index.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/index.html) | Landing page utama, jadwal sholat 5 waktu Kemenag RI/Aladhan, ringkasan kajian terdekat. | `js/nav.js` |
| [`ramadhan.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/ramadhan.html) | Pusat Ibadah Ramadhan: Tabel Imsakiyah 30 hari, Live Countdown Berbuka & Imsak, Target Khatam Qur'an, Mutaba'ah Yaumiyah 30 hari, dan Doa Ramadhan. | `js/ramadhan.js`, `js/nav.js` |
| [`imsakiyah.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/imsakiyah.html) | Shortcut/alias redirect ke `ramadhan.html#imsakiyah`. | - |
| [`quran.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/quran.html) | Al-Qur'an 30 Juz (114 Surah lengkap, teks Arab font Amiri, terjemahan Kemenag RI, audio murottal 6 Qari, filter surah, query `?surah=N`). | `js/quran.js`, `js/quran-data.js` |
| [`dzikir.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/dzikir.html) | Dzikir Pagi, Dzikir Petang, dan Dzikir Setelah Sholat Fardhu dengan counter tasbih interaktif. | `js/dzikir.js`, `js/dzikir-data.js` |
| [`doa.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/doa.html) | Kumpulan 227 Doa Sunnah berdasarkan kategori & pencarian cepat. | `js/doa.js`, `js/doa-data.js` |
| [`kiblat.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/kiblat.html) | Kompas arah Ka'bah presisi berbasis sensor magnetometer perangkat dan GPS. | `js/kiblat.js` |
| [`kajian.html`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/kajian.html) | Jadwal lengkap kajian sunnah dari API Muslim Lifecenter dengan filter radius GPS. | `js/nav.js` |

### Script Bersama (`js/`):
- `js/nav.js`: Handler responsif navigasi mobile (hamburger toggle, drawer menu, proteksi double-trigger & bubbling, auto-close saat link/luar diklik).

### Backend Microservice & Database:
- `server/sahabatmuslim_api.py`: Backend microservice Python pada port `8890` (berjalan via systemd `sahabatmuslim-api.service`).
- Database: **PostgreSQL 16** (`sahabatmuslim_db`).
  - Tabel: `user_sync_data` (Menampung payload JSONB amalan user).
  - Tabel: `newsletter_subscribers` (Menampung email pendaftar early access).
- Reverse Proxy: **Nginx** meneruskan rute `/api/` ke `127.0.0.1:8890`.

---

## ⚠️ 3. Aturan Emas untuk AI Agent (*Golden Rules*)

Setiap AI Agent **WAJIB** mematuhi aturan berikut saat mengubah kode atau menambah fitur:

### 🔴 Aturan 1: Standar Alur Deployment (Local ➔ Git ➔ VPS)
Semua pekerjaan dilakukan di repositori lokal Mac:
1. Edit file di folder lokal `/Users/shabudin/Documents/git/sahabatmuslim-landing`.
2. Commit dan push ke remote GitHub:
   ```bash
   git add .
   git commit -m "feat/fix: deskripsi perubahan"
   git push origin main
   ```
3. Deploy ke VPS production via SSH:
   ```bash
   ssh vps-saya "sudo -u hermes git -C /opt/data/home/sahabatmuslim-landing pull origin main"
   ```
4. Verifikasi perubahan di URL produksi `https://sahabatmuslim.ahsailabs.my.id/`.
> **DILARANG** mengedit kode aplikasi secara langsung di VPS tanpa commit git lokal, karena akan menyebabkan *code drift* dan konflik merge.

---

### 🔴 Aturan 2: Penamaan Database & Tabel (DILARANG Spesifik Ramadhan)
- Nama tabel database **HARUS GENERIK** (contoh: `user_sync_data`, `user_bookmarks`, `user_activity_log`).
- **DILARANG KERAS** menggunakan nama tabel yang mengikat ke satu momen tertentu seperti `ramadhan_sync` atau `tabel_ramadhan`.
- Gunakan kolom bertipe **`JSONB`** untuk data amalan pengguna (`payload JSONB`) agar skema tabel fleksibel untuk amalan di luar bulan Ramadhan (dzikir, doa, hafalan Qur'an, sholat sunnah, dll.).

---

### 🔴 Aturan 3: Logika Sinkronisasi (Wajib Smart Merge / Union)
Saat pengguna melakukan sinkronisasi antara perangkat lokal (`localStorage`) dan cloud (PostgreSQL):
- **JANGAN PERNAH** menimpa (*blind overwrite*) amalan pengguna secara sepihak!
- Terapkan logika **Smart Merge (Union)**:
  - Tilawah Qur'an: Juz yang sudah dicentang di lokal digabung dengan juz yang ada di cloud (`Set Union`).
  - Amalan / Checklist: Jika suatu amalan bernilai `true` di salah satu sisi, nilainya **tetap `true`**.
  - Hasil penggabungan disimpan kembali ke `localStorage` dan di-sync balik ke PostgreSQL.
  - Catatan ibadah seorang muslim tidak boleh hilang karena konflik pergantian perangkat.

---

### 🔴 Aturan 4: Navigasi Mobile & Cache Busting
1. **Navigasi Mobile**:
   - Jika menambah menu baru, pastikan ditambahkan pada **seluruh file HTML** (desktop `.nav-links` dan mobile drawer).
   - Pastikan CSS `.mobile-menu-btn * { pointer-events: none; }` tetap ada agar sentuhan mobile tidak memicu *detached event bubbling bug*.
   - Tombol toggle selalu menggunakan `onclick="toggleMobileMenu(event)"`.
2. **Cache Busting**:
   - Cloudflare dan Nginx mengaktifkan caching agresif untuk file CSS/JS.
   - Setiap kali mengedit file JS bersama (seperti `nav.js`, `ramadhan.js`, `quran.js`), **wajib menaikkan parameter versi** di tag script seluruh HTML (contoh: `nav.js?v=4`).

---

### 🔴 Aturan 5: Standar Teks Arab & Dalil Hadits
- Teks Arab **wajib menggunakan font murni** dengan class `arabic` atau `font-family: 'Amiri', serif`. Jangan pernah menggunakan gambar untuk teks ayat atau doa.
- Wajib menyertakan transliterasi Latin dan terjemahan bahasa Indonesia resmi (standar Kemenag RI).
- Untuk doa dan dzikir, prioritaskan riwayat yang **Shahih** atau **Hasan** serta sebutkan sumber periwayat haditsnya (contoh: *HR. Abu Dawud no. 2357*, *HR. Bukhari no. 1894*).

---

### 🔴 Aturan 6: Dokumentasi Wajib Selalu Diperbarui (*Documentation Sync*)
Setiap kali AI Agent menambahkan fitur baru, memperbaiki bug besar, atau mengubah skema/endpoint API:
1. **Wajib memperbarui [`README.md`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/README.md)** pada bagian ringkasan fitur atau arsitektur.
2. Jika ada perubahan endpoint API atau database, **wajib memperbarui [`docs/API_AND_DATABASE.md`](file:///Users/shabudin/Documents/git/sahabatmuslim-landing/docs/API_AND_DATABASE.md)**.
3. Commit dokumentasi bersamaan dengan kode fitur.

---

## 🛠️ 4. Cheat Sheet Perintah Penting

```bash
# Cek status git lokal
git status

# Push perubahan ke GitHub & deploy ke VPS
git add . && git commit -m "pesan" && git push origin main && ssh vps-saya "sudo -u hermes git -C /opt/data/home/sahabatmuslim-landing pull origin main"

# Cek backend systemd di VPS
ssh vps-saya "sudo systemctl status sahabatmuslim-api.service"

# Restart backend service di VPS jika sahabatmuslim_api.py diupdate
ssh vps-saya "sudo systemctl restart sahabatmuslim-api.service"

# Cek data di PostgreSQL VPS
ssh vps-saya "sudo -u hermes psql -d sahabatmuslim_db -c 'SELECT user_id, email, updated_at FROM user_sync_data;'"

# Cek log error Nginx di VPS
ssh vps-saya "sudo tail -n 50 /var/log/nginx/error.log"
```

---

*Setiap AI Agent diharapkan membaca dokumen ini sebelum memulai sesi interaksi dan mematuhi seluruh aturan di atas.*
