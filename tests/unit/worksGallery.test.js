/**
 * Unit tests for js/worksGallery.js — the data-driven #visual-home gallery.
 * Runs in jsdom. IntersectionObserver is absent in jsdom, so the renderer's
 * fallback (eager loadImage) path is exercised, which is what we want to assert.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../js/worksGallery.js'),
  'utf8'
);

const MANIFEST = {
  version: 1,
  profile: {
    name: 'ETCETER4',
    statement: 'Photography · Video',
    instagram: 'etceter4',
  },
  works: [
    {
      id: 'a',
      src: 'img/a.jpg',
      type: 'photo',
      category: 'Photography',
      title: 'A',
      caption: 'caption a',
      tags: [],
    },
    {
      id: 'b',
      src: 'img/b.jpg',
      type: 'photo',
      category: 'Photography',
      title: 'B',
      caption: '',
      tags: [],
    },
    {
      id: 'c',
      src: 'img/c.mp4',
      poster: 'img/c.jpg',
      type: 'video',
      category: 'Generative',
      title: 'C',
      caption: '',
      tags: [],
    },
  ],
};

function setupDom() {
  document.body.innerHTML = `
    <section id="visual-home">
      <header id="works-hero">
        <h1 data-profile="name">placeholder</h1>
        <p data-profile="statement">placeholder</p>
        <a id="works-ig-link" data-profile="instagram" href="#">Instagram</a>
      </header>
      <div id="works-filters"></div>
      <div id="works-grid"></div>
    </section>`;
}

/** Re-execute the IIFE so module-level state is fresh for each test. */
function loadGallery() {
  // eslint-disable-next-line no-new-func
  new Function(SRC)();
  return window.WorksGallery;
}

function mockFetch(manifest, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: async () => manifest,
    })
  );
}

describe('WorksGallery', () => {
  beforeEach(() => {
    setupDom();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.WorksGallery;
    document.body.className = '';
  });

  it('exposes an init() global', () => {
    const wg = loadGallery();
    expect(wg).toBeTruthy();
    expect(typeof wg.init).toBe('function');
  });

  it('renders one grid item per work', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const items = document.querySelectorAll('#works-grid .gallery-item');
    expect(items.length).toBe(3);
  });

  it('applies the profile to the hero and IG link', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    expect(document.querySelector('[data-profile="name"]').textContent).toBe(
      'ETCETER4'
    );
    expect(document.querySelector('#works-ig-link').getAttribute('href')).toBe(
      'https://www.instagram.com/etceter4/'
    );
  });

  it('builds a filter button per category plus All', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const btns = document.querySelectorAll(
      '#works-filters .gallery-filter-btn'
    );
    // All + Photography + Generative
    expect(btns.length).toBe(3);
  });

  it('filters the grid when a category is chosen', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const genBtn = [
      ...document.querySelectorAll('#works-filters .gallery-filter-btn'),
    ].find(b => b.getAttribute('data-category') === 'Generative');
    genBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const items = document.querySelectorAll('#works-grid .gallery-item');
    expect(items.length).toBe(1);
  });

  it('marks video works with the is-video class', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    expect(
      document.querySelectorAll('#works-grid .gallery-item.is-video').length
    ).toBe(1);
  });

  it('opens the lightbox on item click and shows a counter', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const first = document.querySelector('#works-grid .gallery-item');
    first.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const lb = document.querySelector('#visual-home .lightbox');
    expect(lb.classList.contains('active')).toBe(true);
    expect(document.querySelector('.lightbox-counter').textContent).toBe(
      '1 / 3'
    );
    expect(document.body.classList.contains('lightbox-open')).toBe(true);
  });

  it('advances the lightbox with the ArrowRight key', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const first = document.querySelector('#works-grid .gallery-item');
    first.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowRight' })
    );
    expect(document.querySelector('.lightbox-counter').textContent).toBe(
      '2 / 3'
    );
  });

  it('closes the lightbox on Escape', async () => {
    mockFetch(MANIFEST);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    const first = document.querySelector('#works-grid .gallery-item');
    first.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Escape' })
    );
    const lb = document.querySelector('#visual-home .lightbox');
    expect(lb.classList.contains('active')).toBe(false);
    expect(document.body.classList.contains('lightbox-open')).toBe(false);
  });

  it('degrades gracefully when the manifest fails to load', async () => {
    mockFetch({}, false);
    const wg = loadGallery();
    await wg.init({ root: '#visual-home' });
    expect(document.querySelector('#works-grid .works-empty')).toBeTruthy();
    expect(document.querySelectorAll('#works-grid .gallery-item').length).toBe(
      0
    );
  });
});
