#!/usr/bin/env python3
"""Loopback-only, dependency-free preview server with bounded artifact saving."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, os
ROOT = Path(__file__).resolve().parent
HOST = os.environ.get('HOST', '127.0.0.1')
PORT = int(os.environ.get('PORT', '8766'))
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_POST(self):
        paths = {'/api/save/png': ('studio.png', b'\x89PNG\r\n\x1a\n'), '/api/save/glb': ('studio.glb', b'glTF')}
        origin = self.headers.get('Origin', '')
        if origin and origin not in ('http://127.0.0.1:8766', 'http://localhost:8766'):
            self.send_error(403); return
        if self.path not in paths:
            self.send_error(404); return
        try: length = int(self.headers.get('Content-Length', '0'))
        except ValueError: self.send_error(400); return
        if not 0 < length < 100_000_000:
            self.send_error(413); return
        name, magic = paths[self.path]
        data = self.rfile.read(length)
        if not data.startswith(magic): self.send_error(415); return
        output = ROOT / 'renders' / name
        output.parent.mkdir(exist_ok=True)
        output.write_bytes(data)
        result = json.dumps({'path': 'renders/' + name}).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(result))); self.end_headers(); self.wfile.write(result)
if __name__ == '__main__':
    print(f'Open http://{HOST}:{PORT} — Ctrl-C to stop', flush=True)
    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except PermissionError:
        raise SystemExit(f'Cannot listen on {HOST}:{PORT}. Run this script in a local terminal or try another port: PORT=8767 python3 serve.py')
    except OSError as exc:
        raise SystemExit(f'Cannot start the local server at {HOST}:{PORT}: {exc}. If the port is in use, try PORT=8767 python3 serve.py')
    server.serve_forever()
