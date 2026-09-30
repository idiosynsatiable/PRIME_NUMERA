import sharp from "sharp";
import { Revocations } from "./revocations.ts";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, createHash } from "node:crypto";
import { readFileSync, existsSync, chmodSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { assertPublicSharePayloadSafe } from "@prime-numera/numerology-core";
import {
  createShareRecord,
  resolveSharePayload,
  deleteShare,
  assertOpaqueShareId,
} from "@prime-numera/share-engine";
import { SqliteShareStore } from "@prime-numera/share-engine/sqlite";
import {
  renderShareCardSvg,
  renderShareQrPng,
} from "@prime-numera/share-engine/render";

const token = () => randomBytes(32).toString("hex");
const digest = (input: string) =>
  createHash("sha256").update(input).digest("hex");
const DAY = 86400000;
class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
const exact = (v: unknown, keys: string[]): v is Record<string, unknown> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.keys(v).length === keys.length &&
  keys.every((k) => Object.hasOwn(v, k));
async function body(req: IncomingMessage): Promise<unknown> {
  if (req.headers["content-type"]?.split(";")[0] !== "application/json")
    throw new HttpError(415, "Use application/json.");
  let value = "";
  for await (const chunk of req) {
    value += chunk.toString();
    if (Buffer.byteLength(value) > 8192)
      throw new HttpError(413, "Request is too large.");
  }
  try {
    return JSON.parse(value);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
export interface ServerOptions {
  dataDirectory: string;
  staticDirectory: string;
  origin: string;
  secureCookies?: boolean;
  now?: () => number;
}
export function createApplication(options: ServerOptions) {
  const origin = new URL(options.origin);
  if (
    origin.origin !== options.origin ||
    origin.username ||
    origin.password ||
    (origin.protocol !== "https:" &&
      !(
        origin.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(origin.hostname)
      ))
  )
    throw new Error(
      "Set a bare HTTPS APP_ORIGIN (HTTP loopback allowed for development).",
    );
  const secure = options.secureCookies ?? origin.protocol === "https:";
  if (origin.protocol === "https:" && !secure)
    throw new Error("HTTPS requires secure cookies.");
  const now = options.now ?? Date.now;
  const cookieName = secure ? "__Host-numera" : "numera_dev";
  const shares = new SqliteShareStore(
    resolve(options.dataDirectory, "shares.sqlite"),
  );
  const dbPath = resolve(options.dataDirectory, "sessions.sqlite");
  const db = new DatabaseSync(dbPath);
  chmodSync(dbPath, 0o600);
  const version = db.prepare("PRAGMA user_version").get()?.user_version;
  if (version !== 0 && version !== 1) {
    shares.close();
    db.close();
    throw new Error("Unsupported session schema.");
  }
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON; PRAGMA synchronous=FULL;
    BEGIN IMMEDIATE;
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, owner TEXT NOT NULL UNIQUE, csrf TEXT NOT NULL, expires INTEGER NOT NULL) STRICT;
    CREATE TABLE IF NOT EXISTS owned_shares (id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES sessions(owner) ON DELETE CASCADE, expires INTEGER NOT NULL) STRICT;
    CREATE INDEX IF NOT EXISTS owner_shares ON owned_shares(owner);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL) STRICT;
    PRAGMA user_version=1; COMMIT;`);
  const revoked = new Revocations(
    resolve(options.dataDirectory, "revocations.sqlite"),
  );
  const staticRoot = resolve(options.staticDirectory);
  const clock = { now: () => new Date(now()).toISOString() };
  function session(req: IncomingMessage) {
    const raw = req.headers.cookie
      ?.split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
    if (!raw || !/^[a-f0-9]{64}$/.test(raw)) return undefined;
    const row = db
      .prepare("SELECT owner, csrf FROM sessions WHERE id=? AND expires>?")
      .get(digest(raw), now()) as { owner: string; csrf: string } | undefined;
    return row ? { ...row, raw } : undefined;
  }
  function limited(req: IncomingMessage) {
    // Do not trust caller-supplied forwarding headers. Reverse proxies share a conservative ceiling.
    const key = digest(req.socket.remoteAddress ?? "unknown");
    const row = db
      .prepare(
        "INSERT INTO limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<=? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING count",
      )
      .get(key, now() + 60000, now(), now());
    if (Number(row?.count) > 180)
      throw new HttpError(429, "Too many requests. Please wait a minute.");
  }
  async function cleanup() {
    await shares.purgeExpired(clock.now());
    db.prepare("DELETE FROM owned_shares WHERE expires<=?").run(now());
    db.prepare("DELETE FROM sessions WHERE expires<=?").run(now());
    db.prepare("DELETE FROM limits WHERE expires<=?").run(now());
  }
  function send(res: ServerResponse, status: number, value: unknown) {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(JSON.stringify(value));
  }
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    if (secure) res.setHeader("Strict-Transport-Security", "max-age=31536000");
    try {
      const url = new URL(req.url ?? "/", options.origin);
      if (url.search)
        throw new HttpError(400, "Query parameters are not accepted.");
      const path = url.pathname;
      if (path === "/health" && req.method === "GET") {
        db.prepare("SELECT 1").get();
        send(res, 200, { status: "ok" });
        return;
      }
      const isShare = path.startsWith("/s/") || path.startsWith("/api/");
      if (isShare) {
        limited(req);
        res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      }
      const user = session(req);
      if (!["GET", "HEAD"].includes(req.method ?? "")) {
        if (req.headers.origin !== options.origin)
          throw new HttpError(403, "Request origin is not allowed.");
        if (
          path !== "/api/session" &&
          (!user || req.headers["x-csrf-token"] !== user.csrf)
        )
          throw new HttpError(
            403,
            "Your session expired. Reload and try again.",
          );
      }
      if (path === "/api/session" && req.method === "POST") {
        if (user) {
          db.prepare("UPDATE sessions SET expires=? WHERE id=?").run(
            now() + 90 * DAY,
            digest(user.raw),
          );
          res.setHeader(
            "Set-Cookie",
            `${cookieName}=${user.raw}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${90 * 86400}${secure ? "; Secure" : ""}`,
          );
          send(res, 200, { csrf: user.csrf });
          return;
        }
        if (
          Number(
            db.prepare("SELECT COUNT(*) AS count FROM sessions").get()?.count,
          ) >= 100000
        )
          throw new HttpError(503, "New sessions are temporarily unavailable.");
        const raw = token(),
          owner = token(),
          csrf = token();
        db.prepare("INSERT INTO sessions VALUES (?,?,?,?)").run(
          digest(raw),
          owner,
          csrf,
          now() + 90 * DAY,
        );
        res.setHeader(
          "Set-Cookie",
          `${cookieName}=${raw}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${90 * 86400}${secure ? "; Secure" : ""}`,
        );
        send(res, 201, { csrf });
        return;
      }
      if (path === "/api/shares" && req.method === "GET") {
        if (!user) throw new HttpError(401, "Start a session first.");
        send(res, 200, {
          shares: db
            .prepare(
              "SELECT id,expires FROM owned_shares WHERE owner=? AND expires>? ORDER BY expires DESC",
            )
            .all(user.owner, now()),
        });
        return;
      }
      if (path === "/api/shares" && req.method === "POST") {
        const input = await body(req);
        if (
          !exact(input, ["payload", "visibility"]) ||
          !["public", "private"].includes(String(input.visibility))
        )
          throw new HttpError(400, "Invalid share request.");
        assertPublicSharePayloadSafe(input.payload);
        // Product HTTP boundary does not permit free-form labels or birth-day disclosure.
        if (
          input.payload.displayLabel !== null ||
          input.payload.values.some((v) => v.calculation === "birthday")
        )
          throw new HttpError(
            400,
            "Only anonymous derived values can be shared.",
          );
        const count = db
          .prepare(
            "SELECT COUNT(*) AS count FROM owned_shares WHERE owner=? AND expires>?",
          )
          .get(user!.owner, now());
        if (Number(count?.count) >= 50)
          throw new HttpError(
            429,
            "Delete an existing share before creating more.",
          );
        const expires = now() + 30 * DAY;
        const record = createShareRecord(input.payload, {
          createdAt: clock.now(),
          expiresAt: new Date(expires).toISOString(),
          ownerId: user!.owner,
          visibility: input.visibility as "public" | "private",
        });
        await shares.put(record);
        try {
          db.prepare("INSERT INTO owned_shares VALUES (?,?,?)").run(
            record.id,
            user!.owner,
            expires,
          );
        } catch (error) {
          await shares.delete(record.id);
          throw error;
        }
        send(res, 201, {
          id: record.id,
          url: `${options.origin}/s/${record.id}`,
          expiresAt: record.expiresAt,
        });
        return;
      }
      const apiShare = /^\/api\/shares\/([^/]+)$/.exec(path);
      if (apiShare) {
        const id = apiShare[1]!;
        try {
          assertOpaqueShareId(id);
        } catch {
          throw new HttpError(404, "Share unavailable.");
        }
        if (req.method === "DELETE") {
          const existing = await shares.get(id);
          if (!existing || existing.ownerId !== user!.owner)
            throw new HttpError(404, "Share unavailable.");
          revoked.add(id, now());
          if (!(await deleteShare(shares, id, user!.owner)))
            throw new HttpError(404, "Share unavailable.");
          db.prepare("DELETE FROM owned_shares WHERE id=? AND owner=?").run(
            id,
            user!.owner,
          );
          res.writeHead(204);
          res.end();
          return;
        }
        if (req.method === "GET") {
          if (revoked.has(id)) throw new HttpError(404, "Share unavailable.");
          const payload = await resolveSharePayload(
            shares,
            id,
            clock,
            user?.owner,
          );
          if (!payload) throw new HttpError(404, "Share unavailable.");
          send(res, 200, payload);
          return;
        }
      }
      const shared = /^\/s\/([^/]+)(?:\/(card.svg|card.png|qr.png))?$/.exec(
        path,
      );
      if (shared && ["GET", "HEAD"].includes(req.method ?? "")) {
        const id = shared[1]!;
        try {
          assertOpaqueShareId(id);
        } catch {
          throw new HttpError(404, "Share unavailable.");
        }
        if (revoked.has(id)) throw new HttpError(404, "Share unavailable.");
        const payload = await resolveSharePayload(
          shares,
          id,
          clock,
          user?.owner,
        );
        if (!payload)
          throw new HttpError(
            404,
            "This share is expired, private, or revoked.",
          );
        if (shared[2] === "card.png") {
          res.setHeader("Content-Type", "image/png");
          res.end(
            await sharp(Buffer.from(renderShareCardSvg(payload)))
              .png()
              .toBuffer(),
          );
          return;
        }
        if (shared[2] === "card.svg") {
          res.setHeader("Content-Type", "image/svg+xml");
          res.end(renderShareCardSvg(payload));
          return;
        }
        if (shared[2] === "qr.png") {
          if (origin.protocol !== "https:")
            throw new HttpError(
              409,
              "QR sharing requires the configured HTTPS deployment.",
            );
          res.setHeader("Content-Type", "image/png");
          res.end(await renderShareQrPng(options.origin, id));
          return;
        }
        const html = readFileSync(
          resolve(staticRoot, "index.html"),
          "utf8",
        ).replace(
          "<title>",
          `<meta name="robots" content="noindex,nofollow,noarchive"><meta property="og:image" content="${options.origin}/s/${id}/card.png"><meta property="og:url" content="${options.origin}/s/${id}"><title>`,
        );
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
        return;
      }
      if (!["GET", "HEAD"].includes(req.method ?? ""))
        throw new HttpError(405, "Method not allowed.");
      if (path === "/robots.txt") {
        res.setHeader("Content-Type", "text/plain");
        res.end(
          `User-agent: *\nDisallow: /s/\nDisallow: /api/\nSitemap: ${options.origin}/sitemap.xml\n`,
        );
        return;
      }
      if (path === "/sitemap.xml") {
        res.setHeader("Content-Type", "application/xml");
        res.end(
          `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${options.origin}/</loc></url></urlset>`,
        );
        return;
      }
      const file = resolve(
        staticRoot,
        "." + decodeURIComponent(path === "/" ? "/index.html" : path),
      );
      if (
        !file.startsWith(staticRoot + sep) ||
        !existsSync(file) ||
        ![
          ".html",
          ".js",
          ".css",
          ".png",
          ".webp",
          ".svg",
          ".webmanifest",
        ].includes(extname(file))
      )
        throw new HttpError(404, "Page not found.");
      const types: Record<string, string> = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".webmanifest": "application/manifest+json",
      };
      res.setHeader(
        "Content-Type",
        types[extname(file)] ?? "application/octet-stream",
      );
      if (path.startsWith("/assets/"))
        res.setHeader("Cache-Control", "public,max-age=31536000,immutable");
      const content = readFileSync(file);
      if (path === "/") {
        res.end(
          req.method === "HEAD"
            ? undefined
            : content
                .toString("utf8")
                .replace(
                  "<title>",
                  `<link rel="canonical" href="${options.origin}/"><meta property="og:url" content="${options.origin}/"><title>`,
                ),
        );
      } else res.end(req.method === "HEAD" ? undefined : content);
    } catch (error) {
      const status =
        error instanceof HttpError
          ? error.status
          : error instanceof TypeError ||
              error instanceof RangeError ||
              error instanceof URIError
            ? 400
            : 500;
      // Never log the request, URL, input body, cookies, or thrown error text.
      if (status === 500) process.stderr.write("numera_request_failed\n");
      if (
        !res.headersSent &&
        /^\/s\/[^/]+$/.test(req.url ?? "") &&
        req.headers.accept?.includes("text/html")
      ) {
        const html = readFileSync(
          resolve(staticRoot, "index.html"),
          "utf8",
        ).replace(
          /<body>[\s\S]*<\/body>/,
          '<body><main><section class="panel"><p>PRIME NUMERA</p><h1>This share is unavailable</h1><p>It may be expired, private, or revoked. Private shares require the browser that created them.</p><a href="/">Explore PRIME NUMERA</a></section></main></body>',
        );
        res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
        return;
      }
      if (!res.headersSent)
        send(res, status, {
          error:
            error instanceof HttpError
              ? error.message
              : status === 400
                ? "Invalid request."
                : "Service unavailable. Please try again.",
        });
      else res.end();
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  const timer = setInterval(() => {
    void cleanup().catch(() => process.stderr.write("numera_cleanup_failed\n"));
  }, 60000);
  timer.unref();
  return {
    server,
    cleanup,
    close: async () => {
      clearInterval(timer);
      await new Promise<void>((r) => server.close(() => r()));
      shares.close();
      db.close();
      revoked.close();
    },
  };
}
