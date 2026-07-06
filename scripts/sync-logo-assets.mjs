#!/usr/bin/env node
/**
 * Sync canonical logo assets from packages/ui to app public folders.
 * Run: pnpm logo:sync
 */
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync, unlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const uiLogoDir = join(root, "packages/ui/src/logo");
const uiAssetsDir = join(root, "packages/ui/assets");

const tileSvg = join(uiLogoDir, "logo.svg");
const markSvg = join(uiLogoDir, "logo-mark.svg");
const masterPng = join(uiAssetsDir, "logo.png");

const appPublicDirs = [
  "apps/marketing/public",
  "apps/dapp/public",
  "apps/storybook/public",
  "apps/docs/public",
];

for (const rel of appPublicDirs) {
  const dir = join(root, rel);
  mkdirSync(dir, { recursive: true });
  copyFileSync(tileSvg, join(dir, "favicon.svg"));
}

copyFileSync(markSvg, join(root, "apps/docs/public/logo.svg"));

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require(join(root, "apps/docs/node_modules/sharp"));
} catch {
  process.stderr.write("sharp not found — run pnpm install in apps/docs first\n");
  process.exit(1);
}

await Promise.all(
  appPublicDirs.map((rel) =>
    sharp(masterPng)
      .resize(32, 32)
      .png()
      .toFile(join(root, rel, "favicon.png")),
  ),
);

const icoPath = join(root, "apps/marketing/public/favicon.ico");
const tmpPng = join(root, "apps/marketing/public/.favicon-32.png");
await sharp(masterPng).resize(32, 32).png().toFile(tmpPng);

try {
  execSync(`magick "${tmpPng}" "${icoPath}"`, { stdio: "inherit" });
} catch {
  copyFileSync(tmpPng, icoPath);
}

try {
  unlinkSync(tmpPng);
} catch {
  // temp file may already be removed
}

for (const rel of appPublicDirs) {
  copyFileSync(icoPath, join(root, rel, "favicon.ico"));
}
