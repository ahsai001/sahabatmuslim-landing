# 📡 Dokumentasi Database & Backend API — Sahabat Muslim

Dokumen teknis ini mencatat skema database PostgreSQL, konfigurasi microservice backend, dan spesifikasi endpoint REST API untuk platform **Sahabat Muslim**.

---

## 1. Database PostgreSQL

- **Host**: `127.0.0.1` (Internal VPS)
- **Port**: `5432`
- **Database**: `sahabatmuslim_db`
- **User**: `hermes` (Otentikasi: UNIX socket peer authentication)

### Skema Tabel

#### A. Tabel `user_sync_data`
Menyimpan cadangan amalan pengguna secara fleksibel menggunakan format `JSONB`. Nama tabel dirancang generik agar dapat digunakan untuk berbagai amalan sepanjang tahun.

```sql
CREATE TABLE IF NOT EXISTS user_sync_data (
    user_id VARCHAR(100) PRIMARY KEY,      -- Google Sub ID atau Email
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    client_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sync_email ON user_sync_data(email);
```

##### Contoh Isi Kolom `payload`:
```json
{
  "city": "Jakarta",
  "quranProgress": {
    "target": 1,
    "completed": [1, 2, 3, 30]
  },
  "mutabaahData": {
    "day_1": {
      "puasa": true,
      "subuh": true,
      "dzuhur": true,
      "ashar": true,
      "maghrib": true,
      "isya": true,
      "tarawih": true,
      "tilawah": true,
      "sedekah": true,
      "dzikir_pagi": true,
      "dzikir_petang": true,
      "ilmu": true
    }
  }
}
```

---

#### B. Tabel `newsletter_subscribers`
Menyimpan email pengguna yang mendaftar melalui form *Early Access* di landing page.

```sql
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) DEFAULT 'landing_page',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Microservice Backend (`sahabatmuslim_api.py`)

Backend ditulis menggunakan Python 3.12 (`http.server` + `psycopg2`) tanpa framework eksternal yang berat, berjalan mandiri dan hemat memori (< 15 MB RAM).

- **Lokasi Skrip di Server**: `/opt/data/scripts/sahabatmuslim_api.py`
- **Port Internal**: `8890`
- **Systemd Service**: `sahabatmuslim-api.service`

### Perintah Manajemen Service:
```bash
# Cek status service
sudo systemctl status sahabatmuslim-api.service

# Restart service setelah update script
sudo systemctl restart sahabatmuslim-api.service

# Melihat log aktivitas
sudo journalctl -u sahabatmuslim-api.service -f
```

---

## 3. Spesifikasi Endpoint REST API

Semua request dan response menggunakan format `application/json; charset=utf-8`.

---

### A. Health Check
Memeriksa apakah service backend dan koneksi database PostgreSQL aktif normal.

- **URL**: `GET /api/health`
- **Response 200 OK**:
```json
{
  "ok": true,
  "service": "sahabatmuslim-api",
  "database": "postgresql",
  "database_name": "sahabatmuslim_db",
  "table": "user_sync_data",
  "total_synced_users": 142,
  "timestamp": "2026-10-13T11:45:00.000000"
}
```

---

### B. Ambil Data Amalan Pengguna (Fetch / Restore)
Mengambil catatan amalan yang tersimpan di PostgreSQL milik pengguna berdasarkan `user_id` atau `email`.

- **URL**: `GET /api/sync?user_id={userId}`
- **Response 200 OK (Data Ditemukan)**:
```json
{
  "ok": true,
  "found": true,
  "data": {
    "user_id": "google_10823456789",
    "email": "user@gmail.com",
    "name": "Fulan",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "payload": {
      "city": "Jakarta",
      "quranProgress": { "target": 1, "completed": [1, 2] },
      "mutabaahData": { "day_1": { "puasa": true } }
    },
    "client_updated_at": "2026-10-13T03:45:12.000Z",
    "updated_at": "2026-10-13 11:45:12.116248"
  }
}
```
- **Response 200 OK (Belum Ada Data)**:
```json
{
  "ok": true,
  "found": false,
  "message": "Belum ada data tersimpan di server"
}
```

---

### C. Cadangkan / Sinkronkan Data Amalan (Upsert)
Menyimpan atau memperbarui data amalan pengguna ke database PostgreSQL.

- **URL**: `POST /api/sync`
- **Request Body**:
```json
{
  "user_id": "google_10823456789",
  "email": "user@gmail.com",
  "name": "Fulan",
  "avatar_url": "https://...",
  "client_updated_at": "2026-10-13T03:45:12.000Z",
  "payload": {
    "city": "Bandung",
    "quranProgress": { "target": 1, "completed": [1, 2, 3] },
    "mutabaahData": { "day_1": { "puasa": true, "subuh": true } }
  }
}
```
- **Response 200 OK**:
```json
{
  "ok": true,
  "success": true,
  "message": "Data amalan berhasil dicadangkan ke database PostgreSQL",
  "user_id": "google_10823456789",
  "updated_at": "2026-10-13T11:45:12.116248"
}
```

---

### D. Pendaftaran Email Newsletter
Menyimpan pendaftaran email dari form landing page.

- **URL**: `POST /api/subscribe`
- **Request Body**:
```json
{
  "email": "jamaah@example.com",
  "source": "landing_page"
}
```
- **Response 200 OK**:
```json
{
  "ok": true,
  "success": true,
  "message": "Jazakallahu khairan! Email Anda berhasil didaftarkan."
}
```

---

## 4. Konfigurasi Nginx Reverse Proxy

Konfigurasi Nginx untuk domain `sahabatmuslim.ahsailabs.my.id` di `/etc/nginx/sites-available/ahsailabs`:

```nginx
server {
    listen 8888;
    server_name sahabatmuslim.ahsailabs.my.id www.sahabatmuslim.ahsailabs.my.id;

    root /opt/data/home/sahabatmuslim-landing;
    index index.html;

    # Proxy ke Python API Service (Port 8890)
    location /api/ {
        proxy_pass http://127.0.0.1:8890/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy ke Kajian API Muslim Lifecenter
    location /api-kajian/ {
        proxy_pass https://kajian-api.derrylab.com/;
        proxy_ssl_server_name on;
        proxy_set_header Host kajian-api.derrylab.com;
    }

    # Clean URL routing
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```
