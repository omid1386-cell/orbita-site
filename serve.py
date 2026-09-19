import http.server
import socketserver
import os
import socket

PORT = 5173

class FastNoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Force browser to never cache stale JS or JSON files under any circumstances
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Surrogate-Control', 'no-store')
        super().end_headers()

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError, socket.error):
            pass

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == '__main__':
    os.chdir('/home/user/spaceapp')
    server = ThreadedHTTPServer(('0.0.0.0', PORT), FastNoCacheHandler)
    print(f"ORBITA fast multi-threaded server running on http://0.0.0.0:{PORT}")
    while True:
        try:
            server.serve_forever()
        except Exception as e:
            print(f"Server error caught: {e}")
