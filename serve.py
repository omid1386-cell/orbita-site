#!/usr/bin/env python3
"""ORBITA static server with no-cache headers (prevents stale-cache mismatches)."""
import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()
    def log_message(self, fmt, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("0.0.0.0", 5173), H) as httpd:
    print("ORBITA serving on http://0.0.0.0:5173")
    httpd.serve_forever()
