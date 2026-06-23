/**
 * @file backfill-thumbs.mjs
 * @description One-shot performance backfill for the #visual-home works grid.
 *
 *   The grid in worksGallery.js renders every work into a 250px, 1:1
 *   `object-fit: cover` box but lazy-loads the *full-resolution* original as
 *   the thumbnail (avg ~1.3 MB). That is the single biggest drag on the
 *   front-door Lighthouse performance score. This script generates one small
 *   WebP thumbnail per work (512px wide — covers the 250px box at 2× retina),
 *   records its path + the original's intrinsic dimensions on each work entry,
 *   and rewrites data/works.json. Originals are never modified and remain the
 *   source for the full-screen lightbox.
 *
 *   Idempotent: skips a thumbnail that already exists and is newer than its
 *   source. Pass --force to regenerate everything, --dry-run to preview.
 *
 *   Usage:
 *     node scripts/backfill-thumbs.mjs [--force] [--dry-run]
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const WORKS_JSON = path.join(REPO_ROOT, 'data', 'works.json');
const THUMB_DIR_REL = path.join('img', 'thumbs');
const THUMB_DIR = path.join(REPO_ROOT, THUMB_DIR_REL);

// 512px covers the 250px grid box at 2× retina without over-sending bytes.
const THUMB_WIDTH = 512;
const THUMB_QUALITY = 80;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');

async function loadSharp() {
  try {
    const { default: sharp } = await import('sharp');
    return sharp;
  } catch {
    console.error('[error] sharp is required (devDependency) — run `npm install`');
    process.exit(1);
  }
}

/** Flat, filesystem-safe thumbnail name derived from the (unique) work id. */
function thumbName(id) {
  return `${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}.webp`;
}

function isStale(srcAbs, thumbAbs) {
  if (FORCE || !fs.existsSync(thumbAbs)) {
    return true;
  }
  return fs.statSync(srcAbs).mtimeMs > fs.statSync(thumbAbs).mtimeMs;
}

async function main() {
  const sharp = await loadSharp();
  const manifest = JSON.parse(fs.readFileSync(WORKS_JSON, 'utf8'));
  const works = Array.isArray(manifest.works) ? manifest.works : [];

  if (!DRY_RUN && !fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const work of works) {
    const src = work.src;
    if (!src) {
      continue;
    }
    const srcAbs = path.join(REPO_ROOT, src);
    if (!fs.existsSync(srcAbs)) {
      console.warn(`[warn] missing original, skipping: ${src}`);
      failed++;
      continue;
    }

    const name = thumbName(work.id);
    const thumbRel = path.join(THUMB_DIR_REL, name);
    const thumbAbs = path.join(THUMB_DIR, name);

    // Record intrinsic dimensions + thumb path on the entry regardless of
    // whether we re-encode this run, so the manifest is always complete.
    try {
      const meta = await sharp(srcAbs).metadata();
      work.w = meta.width ?? work.w ?? null;
      work.h = meta.height ?? work.h ?? null;
    } catch (err) {
      console.warn(`[warn] metadata failed for ${src}: ${err.message}`);
    }
    work.thumb = thumbRel;

    if (!isStale(srcAbs, thumbAbs)) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] would write ${thumbRel}`);
      generated++;
      continue;
    }

    try {
      await sharp(srcAbs)
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toFile(thumbAbs);
      generated++;
    } catch (err) {
      console.error(`[error] thumb failed for ${src}: ${err.message}`);
      failed++;
    }
  }

  if (!DRY_RUN) {
    fs.writeFileSync(WORKS_JSON, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(
    `\nthumbs: ${generated} generated, ${skipped} up-to-date, ${failed} failed (of ${works.length} works)`
  );
  console.log(DRY_RUN ? '(dry-run — nothing written)' : `wrote ${path.relative(REPO_ROOT, WORKS_JSON)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
