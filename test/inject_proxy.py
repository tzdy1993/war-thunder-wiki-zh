"""本地注入代理：转发真实 wiki 页面，在 HTML 里注入汉化脚本，保留真实 CSS/JS。

用法: python war-thunder-zh/test/inject_proxy.py
浏览器访问 http://127.0.0.1:8933/unit/xxx（等同 wiki.warthunder.com/unit/xxx + 脚本生效）
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import urlopen, Request
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
USER_JS = os.path.join(HERE, '..', 'wt-wiki-zh.user.js')
TARGET = 'https://wiki.warthunder.com'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')


class Proxy(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        if self.path == '/__wt_zh__.js':
            data = open(USER_JS, 'rb').read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # 非 HTML 资源（css/js/图片/字体）直接重定向回原站，浏览器直连（快且真实）
        if not self.path.endswith(('.html', '/')) and '.' in self.path.rsplit('/', 1)[-1]:
            self.send_response(302)
            self.send_header('Location', TARGET + self.path)
            self.end_headers()
            return

        url = TARGET + self.path
        req = Request(url, headers={
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })
        try:
            resp = urlopen(req, timeout=40)
            data = resp.read()
            ctype = resp.headers.get('Content-Type', '')
            if 'text/html' in ctype and os.environ.get('NOINJECT') != '1':
                inject = b'<script src="/__wt_zh__.js"></script>'
                if b'</body>' in data:
                    data = data.replace(b'</body>', inject + b'</body>', 1)
                else:
                    data = data + inject
            self.send_response(resp.status)
            for k, v in resp.headers.items():
                kl = k.lower()
                if kl in ('content-security-policy', 'content-length', 'transfer-encoding', 'connection', 'content-security-policy-report-only'):
                    continue
                self.send_header(k, v)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            body = f'proxy error: {e}'.encode()
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def do_POST(self):
        # 动态内容 API（getInfoBlocks 等）：转发到原站，不改写
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b''
        req = Request(TARGET + self.path, data=body, headers={
            'User-Agent': UA,
            'Content-Type': self.headers.get('Content-Type', 'application/json'),
            'Accept': self.headers.get('Accept', 'application/json'),
            'X-Requested-With': self.headers.get('X-Requested-With', ''),
        })
        try:
            resp = urlopen(req, timeout=40)
            data = resp.read()
            self.send_response(resp.status)
            for k, v in resp.headers.items():
                kl = k.lower()
                if kl in ('content-length', 'transfer-encoding', 'connection', 'content-security-policy'):
                    continue
                self.send_header(k, v)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            body = f'proxy error: {e}'.encode()
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    def log_message(self, fmt, *args):
        sys.stderr.write('PROXY %s\n' % (fmt % args))


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8933
    print(f'inject proxy on http://127.0.0.1:{port} -> {TARGET}')
    HTTPServer(('127.0.0.1', port), Proxy).serve_forever()
