
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
os.chdir("C:/Users/csuzy/.zcode/workspace/default")
class H(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/8540-"):
            self.path = "/war-thunder-zh/test/runtime-article.html"
        super().do_GET()
HTTPServer(("127.0.0.1", 8932), H).serve_forever()
