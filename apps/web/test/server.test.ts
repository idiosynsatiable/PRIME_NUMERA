import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApplication } from "../server/app";
import {
  calculatePythagoreanProfile,
  createPublicSharePayload,
} from "@prime-numera/numerology-core";
const ORIGIN = "http://127.0.0.1:4173";
const payload = createPublicSharePayload(
  calculatePythagoreanProfile({
    birthName: { firstNames: "Ada Lovelace" },
    birthDate: { year: 1815, month: 12, day: 10 },
    vowelPolicy: { y: "always-consonant" },
  }),
  { calculations: ["life-path", "expression"], aspectRatio: "1:1" },
);
const instances: ReturnType<typeof createApplication>[] = [];
const directories: string[] = [];
afterEach(async () => {
  for (const app of instances.splice(0)) await app.close();
  for (const dir of directories.splice(0))
    rmSync(dir, { recursive: true, force: true });
});
async function start(dir?: string, now?: () => number) {
  const directory = dir ?? mkdtempSync(join(tmpdir(), "numera-http-"));
  if (!dir) {
    directories.push(directory);
    writeFileSync(
      join(directory, "index.html"),
      "<html><title>NUMERA</title></html>",
    );
  }
  const app = createApplication({
    dataDirectory: directory,
    staticDirectory: directory,
    origin: ORIGIN,
    now,
  });
  instances.push(app);
  await new Promise<void>((r) => app.server.listen(0, "127.0.0.1", r));
  const address = app.server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  return {
    app,
    directory,
    request: (path: string, init?: RequestInit) => fetch(base + path, init),
  };
}
async function owner(
  request: (p: string, i?: RequestInit) => Promise<Response>,
) {
  const response = await request("/api/session", {
    method: "POST",
    headers: { Origin: ORIGIN },
  });
  const value = await response.json();
  expect(response.headers.get("set-cookie")).toContain(
    "HttpOnly; SameSite=Strict",
  );
  return {
    Origin: ORIGIN,
    Cookie: response.headers.get("set-cookie")!.split(";")[0]!,
    "X-CSRF-Token": value.csrf as string,
    "Content-Type": "application/json",
  };
}
describe("HTTP privacy and ownership", () => {
  it("creates, resolves anonymously, survives restart, revokes, and refuses guessed/malformed IDs", async () => {
    let context = await start();
    const headers = await owner(context.request);
    const created = await context.request("/api/shares", {
      method: "POST",
      headers,
      body: JSON.stringify({ payload, visibility: "public" }),
    });
    expect(created.status).toBe(201);
    const { id } = await created.json();
    expect(id).toMatch(/^sh_[a-f0-9]{48}$/);
    const png = await context.request(`/s/${id}/card.png`);
    expect(png.status).toBe(200);
    expect(png.headers.get("content-type")).toBe("image/png");
    expect(
      Buffer.from(await png.arrayBuffer())
        .subarray(0, 8)
        .toString("hex"),
    ).toBe("89504e470d0a1a0a");
    const read = await context.request(`/api/shares/${id}`);
    expect(await read.json()).toEqual(payload);
    expect(read.headers.get("cache-control")).toBe("no-store");
    await context.app.close();
    instances.splice(instances.indexOf(context.app), 1);
    context = await start(context.directory);
    expect((await context.request(`/api/shares/${id}`)).status).toBe(200);
    expect((await context.request(`/s/${id}`)).status).toBe(200);
    expect(
      (await context.request(`/s/${id}/card.svg`)).headers.get("content-type"),
    ).toBe("image/svg+xml");
    expect(
      (
        await context.request(`/api/shares/${id}`, {
          method: "DELETE",
          headers,
        })
      ).status,
    ).toBe(204);
    expect((await context.request(`/s/${id}`)).status).toBe(404);
    expect((await context.request(`/api/shares/${id}`)).status).toBe(404);
    expect(
      (await context.request("/api/shares/sh_" + "a".repeat(48))).status,
    ).toBe(404);
    expect((await context.request("/api/shares/malformed")).status).toBe(404);
  });
  it("keeps revoked links dead after restoring an older share database", async () => {
    let ctx = await start();
    const headers = await owner(ctx.request);
    const { id } = await (
      await ctx.request("/api/shares", {
        method: "POST",
        headers,
        body: JSON.stringify({ payload, visibility: "public" }),
      })
    ).json();
    copyFileSync(
      join(ctx.directory, "shares.sqlite"),
      join(ctx.directory, "old.sqlite"),
    );
    expect(
      (await ctx.request(`/api/shares/${id}`, { method: "DELETE", headers }))
        .status,
    ).toBe(204);
    await ctx.app.close();
    instances.splice(instances.indexOf(ctx.app), 1);
    copyFileSync(
      join(ctx.directory, "old.sqlite"),
      join(ctx.directory, "shares.sqlite"),
    );
    ctx = await start(ctx.directory);
    expect((await ctx.request(`/api/shares/${id}`)).status).toBe(404);
    expect((await ctx.request(`/s/${id}/card.png`)).status).toBe(404);
  });
  it("protects private shares and rejects cross-user deletion, missing CSRF, foreign origins, and spoofed owners", async () => {
    const { request } = await start();
    const a = await owner(request),
      b = await owner(request);
    const res = await request("/api/shares", {
      method: "POST",
      headers: a,
      body: JSON.stringify({ payload, visibility: "private" }),
    });
    const { id } = await res.json();
    expect((await request(`/api/shares/${id}`)).status).toBe(404);
    expect((await request(`/api/shares/${id}`, { headers: b })).status).toBe(
      404,
    );
    expect((await request(`/api/shares/${id}`, { headers: a })).status).toBe(
      200,
    );
    expect(
      (await request(`/api/shares/${id}`, { method: "DELETE", headers: b }))
        .status,
    ).toBe(404);
    expect(
      (
        await request(`/api/shares/${id}`, {
          method: "DELETE",
          headers: { ...a, "X-CSRF-Token": "" },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request("/api/shares", {
          method: "POST",
          headers: { ...a, Origin: "https://evil.example" },
          body: JSON.stringify({ payload, visibility: "public" }),
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await request("/api/shares", {
          method: "POST",
          headers: a,
          body: JSON.stringify({
            payload,
            visibility: "public",
            ownerId: "spoof",
          }),
        })
      ).status,
    ).toBe(400);
    expect((await request("/api/shares", { headers: b })).status).toBe(200);
    expect(
      (await (await request("/api/shares", { headers: b })).json()).shares,
    ).toEqual([]);
  });
  it("rejects PII injection, labels, query strings, oversized and malformed payloads", async () => {
    const { request } = await start();
    const headers = await owner(request);
    for (const unsafe of [
      { ...payload, birthDate: "1815-12-10" },
      { ...payload, name: "Ada" },
      { ...payload, displayLabel: "Ada Lovelace" },
      { ...payload, privacy: { ...payload.privacy, containsBirthName: true } },
    ]) {
      expect(
        (
          await request("/api/shares", {
            method: "POST",
            headers,
            body: JSON.stringify({ payload: unsafe, visibility: "public" }),
          })
        ).status,
      ).toBe(400);
    }
    expect((await request("/api/shares?name=private")).status).toBe(400);
    expect(
      (await request("/api/shares", { method: "POST", headers, body: "{" }))
        .status,
    ).toBe(400);
    expect(
      (
        await request("/api/shares", {
          method: "POST",
          headers,
          body: JSON.stringify({ x: "x".repeat(10000) }),
        })
      ).status,
    ).toBe(413);
  });
  it("expires and purges shares, and persists request limits", async () => {
    let timestamp = Date.UTC(2026, 8, 29);
    const { app, request } = await start(undefined, () => timestamp);
    const headers = await owner(request);
    const { id } = await (
      await request("/api/shares", {
        method: "POST",
        headers,
        body: JSON.stringify({ payload, visibility: "public" }),
      })
    ).json();
    timestamp += 31 * 86400000;
    await app.cleanup();
    expect((await request(`/api/shares/${id}`)).status).toBe(404);
    expect(
      (await (await request("/api/shares", { headers })).json()).shares,
    ).toEqual([]);
    let response: Response | undefined;
    for (let i = 0; i < 181; i++)
      response = await request("/api/shares/invalid");
    expect(response!.status).toBe(429);
  });
  it("serves security headers and refuses non-HTTPS production origins", async () => {
    const { request, directory } = await start();
    const res = await request("/");
    expect(res.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(res.headers.get("referrer-policy")).toBe("no-referrer");
    expect((await request("/sessions.sqlite")).status).not.toBe(200);
    expect(() =>
      createApplication({
        dataDirectory: directory,
        staticDirectory: directory,
        origin: "http://example.com",
      }),
    ).toThrow();
  });
});
