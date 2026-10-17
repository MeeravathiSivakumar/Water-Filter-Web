import http.server
import socketserver
import webbrowser
import os
import sys
import re

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIRECTORY)


class RangeHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Silence per-request console I/O to eliminate server thread lag
        pass

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Accept-Ranges", "bytes")
        path_lower = self.path.split("?")[0].lower()
        if path_lower.endswith((".mp4", ".webm", ".jpg", ".jpeg", ".png", ".svg", ".webp", ".woff", ".woff2")):
            self.send_header("Cache-Control", "public, max-age=600")
        else:
            self.send_header("Cache-Control", "no-cache, must-revalidate")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        ctype = self.guess_type(path)
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        try:
            fs = os.fstat(f.fileno())
            file_len = fs[6]
            range_header = self.headers.get("Range")

            if range_header:
                m = re.match(r"bytes=(\d*)-(\d*)", range_header)
                if m:
                    start_str, end_str = m.groups()
                    start = int(start_str) if start_str else 0
                    end = int(end_str) if end_str else file_len - 1
                    end = min(end, file_len - 1)
                    if start >= file_len or start > end:
                        self.send_response(416)
                        self.send_header("Content-Range", f"bytes */{file_len}")
                        self.send_header("Content-Length", "0")
                        self.end_headers()
                        f.close()
                        return None

                    length = end - start + 1
                    self.send_response(206)
                    self.send_header("Content-type", ctype)
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_len}")
                    self.send_header("Content-Length", str(length))
                    self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
                    self.end_headers()
                    f.seek(start)
                    self._range_remaining = length
                    return f

            self._range_remaining = None
            self.send_response(200)
            self.send_header("Content-type", ctype)
            self.send_header("Content-Length", str(file_len))
            self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
            self.end_headers()
            return f
        except Exception:
            f.close()
            raise

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_range_remaining", None)
        chunk_size = 64 * 1024
        try:
            if remaining is None:
                super().copyfile(source, outputfile)
            else:
                while remaining > 0:
                    buf = source.read(min(chunk_size, remaining))
                    if not buf:
                        break
                    outputfile.write(buf)
                    remaining -= len(buf)
        except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
            pass


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def run():
    with ThreadedHTTPServer(("127.0.0.1", PORT), RangeHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("==================================================")
        print(" M SQUARE WATERTECH SERVICE LLP - Fast Media Server")
        print(f" Server running at: {url}")
        print("==================================================")
        sys.stdout.flush()
        httpd.serve_forever()


if __name__ == "__main__":
    run()
