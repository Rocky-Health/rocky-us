#!/usr/bin/env node
/**
 * One-time / occasional batch optimizer for /public raster images.
 *
 * Why: next/image resizes at request time, but oversized SOURCE files still
 * (a) cost Vercel optimizer compute on cold cache, (b) ship full-size when used
 * as CSS backgrounds or plain <img>, and (c) bloat the repo. This caps source
 * dimensions and re-encodes — keeping the SAME filename and format so nothing
 * that references these paths breaks.
 *
 * Safe by design:
 *   - dry-run by default; pass --apply to write
 *   - only touches files above --min-bytes and/or larger than --max-dim
 *   - never enlarges (withoutEnlargement)
 *   - only replaces a file if the re-encode is actually smaller
 *   - bakes EXIF orientation before resize so nothing rotates
 *   - idempotent: a second run finds nothing smaller to do
 *
 * Usage:
 *   node tools/optimize-public-images.mjs              # dry run, default settings
 *   node tools/optimize-public-images.mjs --apply      # actually rewrite
 *   node tools/optimize-public-images.mjs --max-dim 2000 --jpeg-quality 78 --apply
 *   node tools/optimize-public-images.mjs --png-lossy --apply   # lossy PNG (palette)
 */
import { readdir, stat, readFile, writeFile, rename } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const next = args[i + 1];
  return next && !next.startsWith("--") ? next : true;
};

const ROOT = String(flag("root", "public"));
const MAX_DIM = Number(flag("max-dim", 2560)); // cap on the longest side
const MIN_BYTES = Number(flag("min-bytes", 300 * 1024)); // ignore files smaller than this
const JPEG_QUALITY = Number(flag("jpeg-quality", 80));
const PNG_LOSSY = Boolean(flag("png-lossy", false)); // palette quantization for PNG
const PNG_QUALITY = Number(flag("png-quality", 80));
const APPLY = Boolean(flag("apply", false));

const EXTS = new Set([".jpg", ".jpeg", ".png"]);
const fmt = (b) => `${(b / 1048576).toFixed(2)}MB`;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(entry.name).toLowerCase())) yield p;
  }
}

async function reencode(path, ext, input) {
  let img = sharp(input, { failOn: "none" }).rotate(); // bake EXIF orientation
  const meta = await img.metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);
  if (longest > MAX_DIM) {
    img = img.resize({
      width: meta.width >= meta.height ? MAX_DIM : null,
      height: meta.height > meta.width ? MAX_DIM : null,
      withoutEnlargement: true,
      fit: "inside",
    });
  }
  if (ext === ".png") {
    img = img.png(
      PNG_LOSSY
        ? { quality: PNG_QUALITY, palette: true, compressionLevel: 9, effort: 8 }
        : { compressionLevel: 9, effort: 8, adaptiveFiltering: true }
    );
  } else {
    img = img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }
  return { buffer: await img.toBuffer(), longest };
}

async function main() {
  let scanned = 0;
  let changed = 0;
  let before = 0;
  let after = 0;

  for await (const path of walk(ROOT)) {
    const { size } = await stat(path);
    const ext = extname(path).toLowerCase();
    const input = await readFile(path);
    const meta = await sharp(input, { failOn: "none" }).metadata().catch(() => null);
    if (!meta) {
      console.warn(`skip (unreadable): ${path}`);
      continue;
    }
    const longest = Math.max(meta.width || 0, meta.height || 0);
    const oversized = longest > MAX_DIM;
    const heavy = size > MIN_BYTES;
    if (!oversized && !heavy) continue; // small + correctly-sized: leave it

    scanned++;
    let out;
    try {
      out = await reencode(path, ext, input);
    } catch (e) {
      console.warn(`skip (encode error): ${path} — ${e.message}`);
      continue;
    }

    if (out.buffer.length >= size) continue; // never make a file bigger

    before += size;
    after += out.buffer.length;
    changed++;
    const pct = (100 * (1 - out.buffer.length / size)).toFixed(0);
    console.log(
      `${APPLY ? "WROTE" : "would"} ${path}  ${fmt(size)} -> ${fmt(out.buffer.length)} (-${pct}%, ${longest}px${oversized ? `->${MAX_DIM}px` : ""})`
    );

    if (APPLY) {
      const tmp = `${path}.tmp-opt`;
      await writeFile(tmp, out.buffer);
      await rename(tmp, path);
    }
  }

  console.log("\n────────────────────────────────────────");
  console.log(`${APPLY ? "Optimized" : "Would optimize"} ${changed} of ${scanned} candidate files`);
  console.log(`Total: ${fmt(before)} -> ${fmt(after)}  (saved ${fmt(before - after)})`);
  if (!APPLY) console.log("Dry run only. Re-run with --apply to write changes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
