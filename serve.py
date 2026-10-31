import http.server
import os
import socket
import socketserver
import stat

PORT = 5173


class FastNoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """Static preview handler with byte-range support required by PMTiles."""

    def end_headers(self):
        # Ensure the preview never serves stale app code while testing a patch.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Surrogate-Control', 'no-store')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        try:
            file_obj = open(path, 'rb')
        except OSError:
            return super().send_head()

        try:
            file_stat = os.fstat(file_obj.fileno())
            if not stat.S_ISREG(file_stat.st_mode):
                file_obj.close()
                return super().send_head()
            size = file_stat.st_size
            range_header = self.headers.get('Range')
            self._range_remaining = None
            start, end = 0, size - 1
            status = 200

            if range_header:
                try:
                    unit, value = range_header.split('=', 1)
                    if unit.strip().lower() != 'bytes' or ',' in value:
                        raise ValueError('unsupported range')
                    first, last = value.strip().split('-', 1)
                    if first == '':
                        suffix = int(last)
                        if suffix <= 0:
                            raise ValueError('invalid suffix')
                        start = max(size - suffix, 0)
                    else:
                        start = int(first)
                        end = int(last) if last else size - 1
                    end = min(end, size - 1)
                    if start < 0 or start >= size or end < start:
                        raise ValueError('unsatisfiable range')
                    status = 206
                    self._range_remaining = end - start + 1
                except (ValueError, TypeError):
                    file_obj.close()
                    self.send_response(416)
                    self.send_header('Content-Range', 'bytes */' + str(size))
                    self.send_header('Accept-Ranges', 'bytes')
                    self.end_headers()
                    return None

            self.send_response(status)
            self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Length', str(size if status == 200 else self._range_remaining))
            self.send_header('Last-Modified', self.date_time_string(file_stat.st_mtime))
            self.send_header('Accept-Ranges', 'bytes')
            if status == 206:
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                file_obj.seek(start)
            self.end_headers()
            return file_obj
        except Exception:
            file_obj.close()
            raise

    def copyfile(self, source, outputfile):
        remaining = getattr(self, '_range_remaining', None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            block = source.read(min(64 * 1024, remaining))
            if not block:
                break
            outputfile.write(block)
            remaining -= len(block)

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError, socket.error):
            pass


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == '__main__':
    server = ThreadedHTTPServer(('0.0.0.0', PORT), FastNoCacheHandler)
    print(f"ORBITA range-enabled preview running on http://0.0.0.0:{PORT}")
    while True:
        try:
            server.serve_forever()
        except Exception as e:
            print(f"Server error caught: {e}")
