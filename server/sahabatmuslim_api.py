#!/usr/bin/env python3
"""
Sahabat Muslim API Server — PostgreSQL sync & subscribe service
Port: 8890
Database: sahabatmuslim_db
Table: user_sync_data, newsletter_subscribers
"""
import http.server
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime
import psycopg2
import psycopg2.extras
import hmac
import hashlib
import base64
import time as _time

# Helper functions for Google Auth and session management

def verify_google_token(id_token):
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    if not client_id:
        return None, {'ok': False, 'error': 'google login belum dikonfigurasi'}
    try:
        url = f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}'
        resp = urllib.request.urlopen(url, timeout=5)
        data = json.load(resp)
    except Exception:
        return None, {'ok': False, 'error': 'invalid Google token'}
    # Validate fields
    aud = data.get('aud')
    iss = data.get('iss')
    exp = int(data.get('exp', 0))
    email_verified = data.get('email_verified')
    if aud != client_id:
        return None, {'ok': False, 'error': 'invalid audience'}
    if iss not in ('accounts.google.com', 'https://accounts.google.com'):
        return None, {'ok': False, 'error': 'invalid issuer'}
    if _time.time() > exp:
        return None, {'ok': False, 'error': 'token expired'}
    if email_verified != 'true':
        return None, {'ok': False, 'error': 'email not verified'}
    return data, None

def generate_session_token(uid):
    secret = os.getenv('SM_SESSION_SECRET')
    if not secret:
        return None
    payload = {'uid': uid, 'exp': int(_time.time()) + 30 * 24 * 3600}
    payload_json = json.dumps(payload, separators=(',', ':')).encode()
    payload_b64 = base64.urlsafe_b64encode(payload_json).rstrip(b'=')
    sig = hmac.new(secret.encode(), payload_b64, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b'=')
    return payload_b64.decode() + '.' + sig_b64.decode()

def verify_session_token(token):
    secret = os.getenv('SM_SESSION_SECRET')
    if not secret:
        return None
    try:
        payload_b64, sig_b64 = token.split('.')
        expected_sig = hmac.new(secret.encode(), payload_b64.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(base64.urlsafe_b64encode(expected_sig).rstrip(b'='), sig_b64.encode()):
            return None
        payload_json = base64.urlsafe_b64decode(payload_b64 + '==')
        payload = json.loads(payload_json)
        if _time.time() > payload.get('exp', 0):
            return None
        return payload.get('uid')
    except Exception:
        return None

import time as _time

PORT = 8890
DB_NAME = "sahabatmuslim_db"
DB_USER = "hermes"

# -------------------------------------------------------------
# KIDS YOUTUBE CHANNELS & BACKGROUND REFRESHER
# -------------------------------------------------------------
KIDS_TARGETS = [
    {'id': 'yufid-kids', 'handle': '@YufidKids', 'url': 'https://www.youtube.com/@YufidKids/videos'},
    {'id': 'kak-erlan', 'handle': '@KakErlanBercerita', 'url': 'https://www.youtube.com/@KakErlanBercerita/videos'},
    {'id': 'rodja-ceria', 'handle': '@RodjaCeria', 'url': 'https://www.youtube.com/@RodjaCeria/videos'},
    {'id': 'keluarga-hamzi', 'handle': '@KeluargaHamzi', 'url': 'https://www.youtube.com/@KeluargaHamzi/videos'},
    {'id': 'kids-tauhid', 'handle': '@KidsTauhidorid', 'url': 'https://www.youtube.com/@KidsTauhidorid/videos'},
    {'id': 'kak-yogi', 'handle': '@KakErlanBercerita', 'url': 'https://www.youtube.com/@KakErlanBercerita/search?query=Kak+Yogi'},
    {'id': 'jawwada-hijaiyah', 'handle': '@hijaiyahjourneyjawwada', 'url': 'https://www.youtube.com/results?search_query=Hijaiyah+Journey+Jawwada'},
    {'id': 'al-firqatun-najiyah', 'handle': '@alfirqotunnajiyahkids', 'url': 'https://www.youtube.com/@alfirqotunnajiyahkids/videos'},
    {'id': 'sarah-playschool', 'handle': '@Sarahplayschool', 'url': 'https://www.youtube.com/@Sarahplayschool/videos'},
    {'id': 'rofif-kids', 'handle': '@rumayshotv', 'url': 'https://www.youtube.com/@rumayshotv/search?query=rofif'},
    {'id': 'muslim-zone', 'handle': '@muslimzone', 'url': 'https://www.youtube.com/@muslimzone/videos'},
    {'id': 'annawawi-tv', 'handle': '@ANNAWAWITV', 'url': 'https://www.youtube.com/@ANNAWAWITV/videos'},
    {'id': 'anak-cerdas-indonesia', 'handle': '@AnakCerdasIndonesiaOfficial', 'url': 'https://www.youtube.com/@AnakCerdasIndonesiaOfficial/videos'},
    {'id': 'happy-hola', 'handle': '@happyhola', 'url': 'https://www.youtube.com/@happyhola/videos'},
    {'id': 'tumbuh-kembang-anak', 'handle': '@tumbuhkembanganak', 'url': 'https://www.youtube.com/results?search_query=mendidik+anak+sholeh+dan+cerdas+sunnah'}
]

KIDS_CACHE_FILE = "/opt/data/cache/kids_videos_cache.json"
if not os.path.exists("/opt/data/cache"):
    KIDS_CACHE_FILE = "/tmp/kids_videos_cache.json"

KIDS_CACHE = {
    "videos": {},
    "updated_at": None
}

def load_kids_cache_from_disk():
    global KIDS_CACHE
    if os.path.exists(KIDS_CACHE_FILE):
        try:
            with open(KIDS_CACHE_FILE, "r") as f:
                data = json.load(f)
                KIDS_CACHE["videos"] = data.get("videos", {})
                KIDS_CACHE["updated_at"] = data.get("updated_at")
        except Exception as e:
            sys.stderr.write(f"Failed to load kids cache: {e}\n")

def save_kids_cache_to_disk():
    try:
        os.makedirs(os.path.dirname(KIDS_CACHE_FILE), exist_ok=True)
        with open(KIDS_CACHE_FILE, "w") as f:
            json.dump(KIDS_CACHE, f, indent=2)
    except Exception as e:
        sys.stderr.write(f"Failed to save kids cache: {e}\n")

def fetch_channel_videos(url, limit=4):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=8).read().decode("utf-8")
        raw_vids = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', html)
        unique_vids = list(dict.fromkeys(raw_vids))[:limit]
        items = []
        for vid in unique_vids:
            try:
                o_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                o_req = urllib.request.Request(o_url, headers=headers)
                o_data = json.loads(urllib.request.urlopen(o_req, timeout=4).read().decode("utf-8"))
                items.append({
                    "videoId": vid,
                    "title": o_data.get("title") or "Video Edukasi Sunnah",
                    "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                })
            except Exception:
                items.append({
                    "videoId": vid,
                    "title": "Video Edukasi Anak Muslim",
                    "thumbnail": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                })
        return items
    except Exception as e:
        sys.stderr.write(f"Scrape error for {url}: {e}\n")
        return []

def get_active_kids_channels_from_db():
    try:
        with get_db() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute("SELECT id, handle, youtube_url as url FROM kids_channels WHERE is_active = true ORDER BY sort_order ASC, id ASC;")
                rows = cur.fetchall()
                if rows:
                    return rows
    except Exception as e:
        sys.stderr.write(f"DB load error for kids_channels: {e}\n")
    return KIDS_TARGETS

def refresh_kids_videos_job():
    global KIDS_CACHE
    sys.stderr.write("Refreshing kids YouTube videos cache...\n")
    new_data = {}
    targets = get_active_kids_channels_from_db()
    for target in targets:
        cid = target["id"]
        vids = fetch_channel_videos(target["url"], limit=4)
        if vids:
            new_data[cid] = vids
        elif cid in KIDS_CACHE["videos"]:
            new_data[cid] = KIDS_CACHE["videos"][cid]
        time.sleep(0.5)

    if new_data:
        KIDS_CACHE["videos"] = new_data
        KIDS_CACHE["updated_at"] = datetime.now().isoformat()
        save_kids_cache_to_disk()
        sys.stderr.write(f"Kids cache refreshed: {len(new_data)} channels updated\n")

def background_kids_refresher():
    load_kids_cache_from_disk()
    # If cache empty or older than 12 hours, refresh in background
    if not KIDS_CACHE["videos"]:
        refresh_kids_videos_job()
    while True:
        time.sleep(12 * 3600)  # Refresh every 12 hours
        try:
            refresh_kids_videos_job()
        except Exception as e:
            sys.stderr.write(f"Kids refresher periodic error: {e}\n")

def get_kids_videos(channel_id=None):
    load_kids_cache_from_disk()
    if channel_id:
        return KIDS_CACHE["videos"].get(channel_id, [])
    return KIDS_CACHE["videos"]

def get_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER)

class SahabatMuslimHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode("utf-8"))

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length == 0:
                return {}
            raw = self.rfile.read(length).decode("utf-8")
            return json.loads(raw)
        except Exception:
            return None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/health" or path == "/health":
            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT COUNT(*) FROM user_sync_data;")
                        count = cur.fetchone()[0]
                self.send_json(200, {
                    "ok": True,
                    "service": "sahabatmuslim-api",
                    "database": "postgresql",
                    "database_name": DB_NAME,
                    "table": "user_sync_data",
                    "total_synced_users": count,
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/sync":
            # Verify session token for protected access
            auth_header = self.headers.get("Authorization", "")
            token_uid = None
            if auth_header.startswith("Bearer "):
                token_uid = verify_session_token(auth_header.split(" ", 1)[1].strip())

            user_id = query.get("user_id", [""])[0].strip()
            email = query.get("email", [""])[0].strip()

            if not user_id and not email:
                self.send_json(400, {"ok": False, "error": "user_id atau email diperlukan"})
                return

            # If request for google user, enforce token match
            if user_id.startswith("google:"):
                if token_uid != user_id:
                    self.send_json(401, {"ok": False, "error": "invalid or missing session token"})
                    return

            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        if user_id:
                            cur.execute(
                                "SELECT user_id, email, name, avatar_url, payload, client_updated_at, updated_at "
                                "FROM user_sync_data WHERE user_id = %s LIMIT 1;",
                                (user_id,)
                            )
                        else:
                            cur.execute(
                                "SELECT user_id, email, name, avatar_url, payload, client_updated_at, updated_at "
                                "FROM user_sync_data WHERE email = %s LIMIT 1;",
                                (email,)
                            )
                        row = cur.fetchone()

                        if row:
                            self.send_json(200, {"ok": True, "found": True, "data": row})
                        else:
                            self.send_json(200, {"ok": True, "found": False, "message": "Belum ada data tersimpan di server"})
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/kids/videos":
            channel_id = query.get("channel_id", [""])[0].strip()
            data = get_kids_videos(channel_id=channel_id if channel_id else None)
            self.send_json(200, {
                "ok": True,
                "total_channels": len(data),
                "data": data,
                "last_refreshed": KIDS_CACHE.get("updated_at")
            })
            return

        if path == "/api/kids/quiz":
            category = query.get("category", ["all"])[0].strip().lower()
            level = query.get("level", ["all"])[0].strip().lower()
            limit_str = query.get("limit", ["10"])[0].strip()
            try:
                limit = max(1, min(30, int(limit_str)))
            except ValueError:
                limit = 10

            sql = "SELECT id, category, level, question, options, correct_index, explanation FROM kids_quiz_questions WHERE is_active = true"
            params = []
            if category and category != "all":
                sql += " AND category = %s"
                params.append(category)
            if level and level != "all":
                sql += " AND level = %s"
                params.append(level)
            sql += " ORDER BY RANDOM() LIMIT %s;"
            params.append(limit)

            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute(sql, tuple(params))
                        rows = cur.fetchall()
                self.send_json(200, {
                    "ok": True,
                    "total": len(rows),
                    "category": category,
                    "questions": rows
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/kids/quiz/leaderboard":
            limit_str = query.get("limit", ["10"])[0].strip()
            try:
                limit = max(1, min(50, int(limit_str)))
            except ValueError:
                limit = 10
            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute("""
                            SELECT id, player_name, score, total_questions, stars, category, created_at
                            FROM kids_quiz_scores
                            ORDER BY score DESC, created_at DESC
                            LIMIT %s;
                        """, (limit,))
                        rows = cur.fetchall()
                self.send_json(200, {
                    "ok": True,
                    "total": len(rows),
                    "leaderboard": rows
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/kids/channels":
            category = query.get("category", ["all"])[0].strip()
            sql = """
                SELECT id, title, category, category_label as "categoryLabel", 
                       handle, youtube_url as "youtubeUrl", avatar, badge_color as "badgeColor", 
                       description, featured_video_id as "featuredVideoId", 
                       featured_title as "featuredTitle", tags, sort_order 
                FROM kids_channels 
                WHERE is_active = true
            """
            params = []
            if category and category != "all":
                sql += " AND category = %s"
                params.append(category)
            sql += " ORDER BY sort_order ASC, id ASC;"
            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute(sql, tuple(params))
                        rows = cur.fetchall()
                self.send_json(200, {
                    "ok": True,
                    "total": len(rows),
                    "channels": rows
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/duas":
            grup = query.get("grup", [""])[0].strip()
            q = query.get("q", [""])[0].strip().lower()
            sql = """
                SELECT id, grup, nama, ar, tr, idn, tentang, tags as "tag" 
                FROM duas 
                WHERE is_active = true
            """
            params = []
            if grup:
                sql += " AND grup = %s"
                params.append(grup)
            if q:
                sql += " AND (nama ILIKE %s OR idn ILIKE %s OR grup ILIKE %s)"
                term = f"%{q}%"
                params.extend([term, term, term])
            sql += " ORDER BY id ASC;"
            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute(sql, tuple(params))
                        rows = cur.fetchall()
                self.send_json(200, {
                    "ok": True,
                    "total": len(rows),
                    "duas": rows
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/dhikr":
            cat = query.get("category", ["all"])[0].strip()
            sql = """
                SELECT id, category, item_index as index, title, bacaan_key, target, 
                       runningtext, arabic, latin, terjemah, dalil, sound, sort_order 
                FROM dhikr 
                WHERE is_active = true
            """
            params = []
            if cat and cat != "all":
                sql += " AND category = %s"
                params.append(cat)
            sql += " ORDER BY sort_order ASC, item_index ASC;"
            try:
                with get_db() as conn:
                    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute(sql, tuple(params))
                        rows = cur.fetchall()
                
                categories = {}
                for r in rows:
                    c = r["category"]
                    if c not in categories:
                        categories[c] = []
                    categories[c].append(r)

                self.send_json(200, {
                    "ok": True,
                    "total": len(rows),
                    "dhikr": rows,
                    "categories": categories
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        self.send_json(404, {"ok": False, "error": "Not Found"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = self.read_json_body()

        if body is None:
            self.send_json(400, {"ok": False, "error": "Invalid JSON format"})
            return

        if path == "/api/auth/google":
            credential = body.get("credential")
            if not credential:
                self.send_json(400, {"ok": False, "error": "credential missing"})
                return
            data, err = verify_google_token(credential)
            if err:
                self.send_json(503, err)
                return
            uid = f"google:{data.get('sub')}"
            session = generate_session_token(uid)
            if not session:
                self.send_json(503, {"ok": False, "error": "server misconfiguration"})
                return
            resp = {
                "ok": True,
                "session": session,
                "user_id": uid,
                "name": data.get("name"),
                "email": data.get("email"),
                "picture": data.get("picture")
            }
            self.send_json(200, resp)
            return

        if path == "/api/sync":
            auth_header = self.headers.get("Authorization", "")
            token_uid = None
            if auth_header.startswith("Bearer "):
                token_uid = verify_session_token(auth_header.split(" ", 1)[1].strip())

            user_id = str(body.get("user_id") or "").strip()
            email = str(body.get("email") or "").strip()
            if not user_id:
                user_id = email
            if not user_id:
                self.send_json(400, {"ok": False, "error": "user_id atau email wajib diisi"})
                return
            if user_id.startswith("google:"):
                if token_uid != user_id:
                    self.send_json(401, {"ok": False, "error": "invalid or missing session token"})
                    return
            name = str(body.get("name") or "").strip()
            avatar_url = str(body.get("avatar_url") or "").strip()
            payload = body.get("payload") or {}
            client_updated_at = body.get("client_updated_at")
            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO user_sync_data 
                                (user_id, email, name, avatar_url, payload, client_updated_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                            ON CONFLICT (user_id) DO UPDATE SET
                                email = COALESCE(NULLIF(EXCLUDED.email, ''), user_sync_data.email),
                                name = COALESCE(NULLIF(EXCLUDED.name, ''), user_sync_data.name),
                                avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), user_sync_data.avatar_url),
                                payload = COALESCE(user_sync_data.payload, '{}'::jsonb) || EXCLUDED.payload,
                                client_updated_at = EXCLUDED.client_updated_at,
                                updated_at = CURRENT_TIMESTAMP
                            RETURNING updated_at;
                        """, (
                            user_id,
                            email or None,
                            name or None,
                            avatar_url or None,
                            json.dumps(payload),
                            client_updated_at or None
                        ))
                        updated_at = cur.fetchone()[0]
                    conn.commit()
                self.send_json(200, {"ok": True, "success": True, "message": "Data amalan berhasil dicadangkan ke Cloud Server.", "user_id": user_id, "updated_at": updated_at.isoformat()})
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        if path == "/api/subscribe":
            email = str(body.get("email") or "").strip()
            source = str(body.get("source") or "landing_page").strip()

            if not email or "@" not in email:
                self.send_json(400, {"ok": False, "error": "Email tidak valid"})
                return

            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO newsletter_subscribers (email, source)
                            VALUES (%s, %s)
                            ON CONFLICT (email) DO NOTHING;
                        """, (email, source))
                    conn.commit()

                self.send_json(200, {
                    "ok": True,
                    "success": True,
                    "message": "Jazakallahu khairan! Email Anda berhasil didaftarkan."
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
        if path == "/api/kids/quiz/score":
            player_name = str(body.get("player_name") or "Santri Cilik").strip()[:100]
            try:
                score = int(body.get("score", 0))
                total_questions = max(1, int(body.get("total_questions", 10)))
                stars = max(1, min(3, int(body.get("stars", 1))))
            except (ValueError, TypeError):
                self.send_json(400, {"ok": False, "error": "Skor tidak valid"})
                return

            category = str(body.get("category") or "all").strip()[:50]
            user_id = str(body.get("user_id") or "").strip()[:100]

            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO kids_quiz_scores 
                                (user_id, player_name, score, total_questions, stars, category, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                            RETURNING id, created_at;
                        """, (
                            user_id or None,
                            player_name,
                            score,
                            total_questions,
                            stars,
                            category
                        ))
                        row = cur.fetchone()
                        score_id = row[0]
                        created_at = row[1]
                    conn.commit()
                self.send_json(200, {
                    "ok": True,
                    "id": score_id,
                    "message": "Skor kuis berhasil disimpan! Barakallahu fik.",
                    "created_at": created_at.isoformat()
                })
            except Exception as e:
                self.send_json(500, {"ok": False, "error": str(e)})
            return

        self.send_json(404, {"ok": False, "error": "Not Found"})

    def log_message(self, format, *args):
        sys.stderr.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {self.address_string()} - {format % args}\n")

if __name__ == "__main__":
    t = threading.Thread(target=background_kids_refresher, daemon=True)
    t.start()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), SahabatMuslimHandler)
    print(f"🕌 Sahabat Muslim API running at http://127.0.0.1:{PORT}")
    server.serve_forever()
