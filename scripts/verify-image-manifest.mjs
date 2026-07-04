#!/usr/bin/env node
/**
 * Verify js/imageManifest.js against the real image folders.
 *
 * This guards the archive-stem mismatch that made img/photos/glitchpr0n render as an
 * empty manifest even though the folder contains glitch1.png, glitch2.png, ...
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS = join(ROOT, 'img', 'photos');
const MANIFEST = join(ROOT, 'js', 'imageManifest.js');
const naturalSort = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare;
const COLLECTIONS = [
  { name: 'media' },
  { name: 'faster' },
  { name: 'slip' },
  { name: 'live' },
  { name: 'diary' },
  { name: 'glitchpr0n', stem: 'glitch' },
  { name: 'random' },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function expectedIdentifiers({ name, stem = name }) {
  const dir = join(PHOTOS, name);
  if (!existsSync(dir)) return [];
  const re = new RegExp(`^${escapeRegExp(stem)}([\\w-]+)\\.(jpe?g|png|gif)$`, 'i');
  return readdirSync(dir)
    .map((f) => (re.exec(f) || [])[1])
    .filter(Boolean)
    .sort(naturalSort);
}

function readManifest() {
  const text = readFileSync(MANIFEST, 'utf8');
  const match = /const IMAGE_MANIFEST = ([\s\S]*?);\nif /.exec(text);
  if (!match) throw new Error('Cannot parse js/imageManifest.js');
  return JSON.parse(match[1]);
}

const manifest = readManifest();
const failures = [];

for (const collection of COLLECTIONS) {
  const expected = expectedIdentifiers(collection);
  const actual = manifest[collection.name] || [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures.push(
      `${collection.name}: expected ${expected.length} ids [${expected.slice(0, 5).join(', ')}], ` +
        `got ${actual.length} [${actual.slice(0, 5).join(', ')}]`,
    );
  }
}

if (failures.length) {
  console.error('image manifest verification failed');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}

console.log('image manifest verification passed');
