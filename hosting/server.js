const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
  if (!file.startsWith(root)) return res.writeHead(403).end();
  fs.readFile(file, (error, data) => {
    if (error) return fs.readFile(path.join(root, 'index.html'), (fallbackError, fallback) => fallbackError ? res.writeHead(500).end() : res.writeHead(200, {'Content-Type': types['.html']}).end(fallback));
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'}).end(data);
  });
}).listen(process.env.PORT || 8080);
