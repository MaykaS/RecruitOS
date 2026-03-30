const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((request, response) => {
  const requestPath = sanitizePath(request.url || "/");
  const resolvedPath = requestPath === "/" ? path.join(ROOT, "index.html") : path.join(ROOT, requestPath);

  serveFile(resolvedPath, response, requestPath);
});

server.listen(PORT, HOST, () => {
  console.log(`RecruitOS running at http://${HOST}:${PORT}`);
});

function sanitizePath(urlPath) {
  const cleanPath = urlPath.split("?")[0].split("#")[0];
  const decoded = decodeURIComponent(cleanPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return normalized === path.sep ? "/" : normalized.replace(/^[/\\]/, "");
}

function serveFile(filePath, response, requestPath) {
  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isDirectory()) {
      return serveFile(path.join(filePath, "index.html"), response, requestPath);
    }

    if (statError) {
      if (path.extname(requestPath) === "") {
        return serveFile(path.join(ROOT, "index.html"), response, requestPath);
      }
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    fs.readFile(filePath, (readError, content) => {
      if (readError) {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Internal server error");
        return;
      }

      response.writeHead(200, { "Content-Type": contentType });
      response.end(content);
    });
  });
}
