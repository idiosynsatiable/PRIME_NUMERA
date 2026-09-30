import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createApplication } from "./app.ts";
const production = process.env.NODE_ENV === "production";
if (production && (!process.env.APP_ORIGIN || !process.env.DATA_DIRECTORY))
  throw new Error(
    "Production requires APP_ORIGIN and DATA_DIRECTORY on a persistent private volume.",
  );
const dataDirectory = resolve(process.env.DATA_DIRECTORY ?? ".numera-data");
mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
const app = createApplication({
  dataDirectory,
  staticDirectory: resolve("apps/web/dist"),
  origin: process.env.APP_ORIGIN ?? "http://127.0.0.1:4173",
});
await app.cleanup();
app.server.listen(Number(process.env.PORT ?? 4173), "0.0.0.0");
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
