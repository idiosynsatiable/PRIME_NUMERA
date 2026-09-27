import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const port = Number(process.env.PORT || 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

createServer(async (req, res) => {
  try {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", ...securityHeaders });
      res.end(JSON.stringify({ ok: true, service: "prime-numera" }));
      return;
    }

    const pathname = new URL(req.url || "/", "http://localhost").pathname;
    const requested = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
    const filePath = join(root, safePath);
    const body = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600",
      ...securityHeaders
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", ...securityHeaders });
    res.end("Not found");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`PRIME NUMERA listening on port ${port}`);
});
