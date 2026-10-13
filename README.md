# 🕌 Sahabat Muslim — Platform All-in-One Kaum Muslimin

Platform web ibadah digital all-in-one yang ringan, cepat, responsif, dan kaya fitur untuk membantu aktivitas ibadah harian kaum muslimin di Indonesia.

- 🌐 **Live Production URL**: [https://sahabatmuslim.ahsailabs.my.id](https://sahabatmuslim.ahsailabs.my.id)
- 🏢 **Pengembang**: [AhsaiLabs](https://ahsailabs.my.id)
- 📜 **Lisensi**: MIT / Proprietary

---

## 📑 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur Sistem & Tech Stack](#-arsitektur-sistem--tech-stack)
3. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
4. [Database & Backend Microservice](#-database--backend-microservice)
5. [Logika Sinkronisasi (Smart Merge)](#-logika-sinkronisasi-smart-merge)
6. [Alur Deployment (SOP)](#-alur-deployment-sop)
7. [Dokumentasi API](#-dokumentasi-api)

---

## ✨ Fitur Utama

### 1. ⏰ Waktu Sholat 5 Waktu & Kalender Hijriyah (`index.html`)
- Jadwal sholat akurat berdasarkan standar **Kemenag RI** (Metode 20) dan metode internasional lainnya via Aladhan API.
- Fitur **Deteksi Lokasi GPS** otomatis serta pilihan kota/kabupaten di seluruh Indonesia.
- Koreksi penanggalan Hijriyah (-1, 0, +1) tersinkronisasi kalender Kemenag RI (MyQuran API).
- Countdown interaktif menuju waktu sholat berikutnya.

### 2. 🌙 Pusat Ibadah Ramadhan 1447 H / 2026 M (`ramadhan.html` & `/imsakiyah`)
- **Tabel Imsakiyah 30 Hari**: Jadwal Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib (Buka), dan Isya sebulan penuh.
- **Live Countdown Berbuka & Imsak**: Penghitung mundur real-time dengan status sahur/puasa.
- **Target & Planner Khatam Qur'an**: Checklist 30 Juz interaktif dengan target 1x, 2x, 3x khatam, progress bar, dan tombol cepat buka surah di Al-Qur'an.
- **Mutaba'ah Yaumiyah (Habit Tracker 30 Hari)**: Kalender 30 hari dengan 12 checklist amalan harian (puasa, sholat berjamaah, tarawih, sedekah, dzikir, ilmu).
- **Panduan & Doa Shahih Ramadhan**: Doa buka puasa shahih (HR. Abu Dawud), niat puasa, doa Lailatul Qadar, doa bukber, dan doa zakat fitrah.
- **Fitur Cetak / PDF**: Desain cetak siap pakai untuk kalender imsakiyah masjid/keluarga.

### 3. 📖 Al-Qur'an Online 30 Juz (`quran.html`)
- 114 Surah lengkap berbasis API `equran.id` v2 (matching repo `ahsai001/quran-id-online`).
- Teks Arab berharakat (`font-family: 'Amiri'`), transliterasi Latin, dan terjemahan resmi bahasa Indonesia.
- Audio murottal per ayat dan per surah dengan 6 pilihan Qari ternama dunia (Misyari Rasyid Al-Afasi, Abdurrahman As-Sudais, dll.).
- Navigasi URL query dinamis (contoh: `/quran?surah=18` untuk langsung membuka Surah Al-Kahf).
- Pengaturan ukuran font Arab, bookmark ayat terakhir, dan fitur salin/bagikan ayat ke WhatsApp.

### 4. 📿 Dzikir Harian Sunnah (`dzikir.html`)
- Mengadopsi konten dari aplikasi Android *Dzikir Harian* (`ahsai001/dzikirharian`):
  - **Dzikir Pagi**
  - **Dzikir Petang**
  - **Dzikir Setelah Sholat Fardhu**
- Dilengkapi counter dzikir interaktif per butir, teks Arab, latin, terjemahan, dan keterangan faedah/hadits shahih.

### 5. 🤲 Kumpulan 227 Doa Sunnah (`doa.html`)
- Diambil dari data aplikasi Android *Simple Tools* (`ahsai001`).
- Fitur pencarian instan berbasis nama doa, teks latin, atau terjemahan.
- Filter berdasarkan kategori (Pagi/Petang, Sholat, Rumah, Makanan, Perjalanan, Sakit, dll.).
- Modal bacaan detail dan tombol salin doa.

### 6. 🧭 Kompas Penunjuk Arah Kiblat (`kiblat.html`)
- Kompas Ka'bah presisi berbasis sensor perangkat (`DeviceOrientationEvent` / magnetometer) dan koordinat GPS.
- Kalkulasi rumus *Great Circle / Haversine* menuju koordinat Ka'bah di Makkah (21.4225° N, 39.8262° E).
- Indikator getar (*haptic vibration*) dan banner hijau saat perangkat tepat mengarah ke Ka'bah.

### 7. 🕌 Jadwal Kajian Sunnah (`kajian.html`)
- Integrasi langsung dengan API Muslim Lifecenter (`kajian-api.derrylab.com`).
- Filter radius GPS terdekat (≤ 5 km, ≤ 10 km, ≤ 25 km, ≤ 50 km, dan semua).
- Filter hari (Hari ini, Besok, Minggu Ini, Semua).
- Modal detail flyer kajian, info pemateri/ustadz, dan tautan Google Maps masjid.

### 8. 🎧 Ruqyah Syar'iyyah ↗
- Tautan shortcut langsung ke web streaming audio ruqyah penenang jiwa: [https://ruqyah.ahsailabs.my.id/](https://ruqyah.ahsailabs.my.id/).

---

## 🏗️ Arsitektur Sistem & Tech Stack

```
[ Client / Browser (Mobile & Desktop) ]
                │
                ▼ (HTTPS / Cloudflare CDN)
        [ Nginx Web Server ]
         │               │
         ├───────────────┼────────────────────────┐
         ▼ (Static)      ▼ (Proxy :8890)          ▼ (Proxy External)
  [ HTML / CSS / JS ]  [ Python API Microservice ]  [ Kajian API ]
                         │
                         ▼ (Peer Auth)
                  [ PostgreSQL 16 ]
                 (sahabatmuslim_db)
```

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3, ES6+ JavaScript | Ringan, bebas build step, waktu muat < 1 detik. |
| **Typography** | Inter & Amiri (Google Fonts) | Teks Arab murni berbasis font (bukan gambar). |
| **Web Server** | Nginx 1.24+ di VPS Ubuntu | Reverse proxy, static asset caching, SSL HTTPS. |
| **Backend API** | Python 3.12 (`http.server` + `psycopg2`) | Microservice mandiri pada port `8890` via systemd. |
| **Database** | PostgreSQL 16 (`sahabatmuslim_db`) | Penyimpanan sinkronisasi amalan user (`JSONB`). |
| **Auth Mode** | Hybrid (Guest Mode + Google GSI) | Tanpa login by default; opsi sync akun Google. |

---

## 📁 Struktur Direktori Proyek

```
sahabatmuslim-landing/
├── index.html              # Halaman Utama (Hero, Jadwal Sholat, Cuplikan Kajian)
├── ramadhan.html           # Pusat Ibadah Ramadhan (Imsakiyah, Khatam, Mutabaah)
├── imsakiyah.html          # Alias redirect ke /ramadhan#imsakiyah
├── quran.html              # Al-Qur'an Online 30 Juz & Audio Player
├── dzikir.html             # Dzikir Pagi, Petang, & Setelah Sholat
├── doa.html                # Kumpulan 227 Doa Sunnah
├── kajian.html             # Jadwal Kajian Sunnah & Filter Jarak GPS
├── kiblat.html             # Kompas Penunjuk Arah Kiblat Online
│
├── js/
│   ├── nav.js              # Handler navigasi mobile (hamburger & drawer)
│   ├── ramadhan.js         # Logika Imsakiyah, Countdown, Khatam, Mutabaah & Sync
│   ├── quran.js            # Controller Al-Qur'an (audio streaming, search, tafsir)
│   ├── quran-data.js       # Dataset 114 Surah Al-Qur'an
│   ├── dzikir.js           # Controller Dzikir Harian & counter tasbih
│   ├── dzikir-data.js      # Dataset bacaan dzikir pagi/petang/sholat
│   ├── doa.js              # Controller Doa Harian & filter kategori
│   ├── doa-data.js         # Dataset 227 Doa Sunnah
│   └── kiblat.js           # Perhitungan trigonometri arah Ka'bah & sensor kompas
│
├── server/
│   └── sahabatmuslim_api.py # Source code backend API Python (PostgreSQL Sync)
│
├── docs/
│   └── API_AND_DATABASE.md # Dokumentasi skema database & endpoint API
│
└── README.md               # Dokumentasi utama proyek
```

---

## 🗄️ Database & Backend Microservice

### 1. Database PostgreSQL
Database: `sahabatmuslim_db`

#### Tabel `user_sync_data` (Sinkronisasi Amalan Pengguna)
Nama tabel sengaja dirancang **generik** (tidak mengikat ke kata *ramadhan*) agar dapat menampung seluruh amalan ibadah sepanjang tahun:
```sql
CREATE TABLE IF NOT EXISTS user_sync_data (
    user_id VARCHAR(100) PRIMARY KEY,      -- Google Sub ID / Email
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb, -- JSON amalan, quran, kota
    client_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sync_email ON user_sync_data(email);
```

#### Tabel `newsletter_subscribers`
```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) DEFAULT 'landing_page',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Service Systemd di VPS
Microservice berjalan di VPS melalui systemd:
- Nama Service: `sahabatmuslim-api.service`
- Perintah Cek Status: `systemctl status sahabatmuslim-api.service`
- Port Internal: `127.0.0.1:8890`

---

## 🔄 Logika Sinkronisasi (Smart Merge)

Saat pengguna masuk dengan akun Google atau profil perangkat, sistem menjalankan **Smart Merge Otomatis (Set Union)**:

```
[ Data di HP Lokal ] ──┐
                       ├──▶ [ Smart Merge Engine ] ──▶ [ Data Gabungan ]
[ Data di PostgreSQL ] ──┘         (Union Logic)               │
                                                                ├─▶ Disimpan di HP (localStorage)
                                                                └─▶ Disimpan di PostgreSQL (Cloud)
```

- **Tilawah Qur'an**: Juz yang sudah selesai di HP disatukan dengan Juz yang ada di Cloud (`Set Union`). Jika HP mencentang Juz 1 & 3, dan Cloud memiliki Juz 2 & 30, hasilnya adalah `[1, 2, 3, 30]`.
- **Mutaba'ah Harian**: Amalan yang bernilai `true` di salah satu sisi tetap bernilai `true`.
- **Hasil**: Tidak ada amalan ibadah yang tertimpa atau hilang saat berpindah perangkat.

---

## 🚀 Alur Deployment (SOP)

Seluruh pembaruan fitur mengikuti alur kerja standar berikut:

1. **Pengembangan & Pengujian di Lokal (Mac)**:
   - Direktori lokal: `/Users/shabudin/Documents/git/sahabatmuslim-landing`
2. **Commit & Push ke GitHub**:
   ```bash
   git add .
   git commit -m "feat/fix: deskripsi pembaruan"
   git push origin main
   ```
3. **Deploy ke Server Produksi (VPS)**:
   ```bash
   ssh vps-saya "sudo -u hermes git -C /opt/data/home/sahabatmuslim-landing pull origin main"
   ```
4. **Verifikasi Produksi**:
   - Pengecekan via browser di `https://sahabatmuslim.ahsailabs.my.id/`.

---

## 📡 Dokumentasi API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Cek status service dan koneksi database PostgreSQL. |
| `GET` | `/api/sync?user_id=...` | Mengambil data amalan tersimpan milik pengguna dari tabel `user_sync_data`. |
| `POST` | `/api/sync` | Melakukan *upsert* amalan pengguna ke tabel `user_sync_data`. |
| `POST` | `/api/subscribe` | Menyimpan email pendaftar ke tabel `newsletter_subscribers`. |

*Dokumentasi detail format request & response JSON dapat dilihat di [`docs/API_AND_DATABASE.md`](docs/API_AND_DATABASE.md).*

---

© 2026 [AhsaiLabs](https://ahsailabs.my.id) — Platform All-in-One untuk Kaum Muslimin. Dibuat dengan ❤️ untuk kemaslahatan ummat.
