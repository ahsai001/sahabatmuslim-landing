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
import sys
import urllib.parse
from datetime import datetime
import psycopg2
import psycopg2.extras

PORT = 8890
DB_NAME = "sahabatmuslim_db"
DB_USER = "hermes"

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
            user_id = query.get("user_id", [""])[0].strip()
            email = query.get("email", [""])[0].strip()

            if not user_id and not email:
                self.send_json(400, {"ok": False, "error": "user_id atau email diperlukan"})
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
                            self.send_json(200, {
                                "ok": True,
                                "found": True,
                                "data": row
                            })
                        else:
                            self.send_json(200, {
                                "ok": True,
                                "found": False,
                                "message": "Belum ada data tersimpan di server"
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

        if path == "/api/sync":
            user_id = str(body.get("user_id") or "").strip()
            email = str(body.get("email") or "").strip()
            name = str(body.get("name") or "").strip()
            avatar_url = str(body.get("avatar_url") or "").strip()
            payload = body.get("payload") or {}
            client_updated_at = body.get("client_updated_at")

            if not user_id:
                user_id = email

            if not user_id:
                self.send_json(400, {"ok": False, "error": "user_id atau email wajib diisi"})
                return

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
                                payload = EXCLUDED.payload,
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

                self.send_json(200, {
                    "ok": True,
                    "success": True,
                    "message": "Data amalan berhasil dicadangkan ke database PostgreSQL",
                    "user_id": user_id,
                    "updated_at": updated_at.isoformat()
                })
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
            return

        self.send_json(404, {"ok": False, "error": "Not Found"})

    def log_message(self, format, *args):
        sys.stderr.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {self.address_string()} - {format % args}\n")

if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), SahabatMuslimHandler)
    print(f"🕌 Sahabat Muslim API running at http://127.0.0.1:{PORT}")
    server.serve_forever()
