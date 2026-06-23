# C2 — The temple's under-filled chambers: gap-map + fortification plan

**Status:** map complete (verified on disk), fortification plan staged for your review.
**Date:** 2026-06-23 · **Repo:** `a-mavs-olevm` · **Branch:** `etceter4-revival` (no merge/deploy)

C2 = *fortify what exists, don't rebuild.* The chambers are real and the home boots correctly to
`#landing` (four wordmarks + Living Pantheon — confirmed in `js/main.js`, `hash || '#landing'`).
The work is **content**: the rooms are built but nearly empty. Below is exactly how empty, and
the order to fill them. **Nothing here replaces or buries the original front door.**

---

## The headline numbers (verified against disk, not estimated)

- **Stills captions: 6 of 83.** `js/images.js` `stillsData` has only 6 non-empty captions
  (media 3, faster 1, slip 1, live 1) across 83 images. ~93% blank.
- **A live bug (corrected after reading the files):** the broken images are NOT a simple count
  error. `js/config.js:51` `media: 44` is the **highest index, not a count** — the media archive is
  **sparse**: real files are `1,3,4,7,8,12-23,32,33,40-44` (24 files). `Carousel.loadImages` builds
  contiguous paths `media4…media44.jpg`, so every gap (media5,6,9,10,11,24-31,34-39) 404s. Diary is
  worse: index-loaded `diary1..125` but files use `a`-suffixes (`diary10`, `diary10a`) the index loader
  never requests. So the fix is "load only files that exist," not "change 44 to 24" (which would drop
  real files media32-44). Captions are mis-indexed too (`stillsData.media[2]` has a caption but
  `media2.jpg` doesn't exist). Real counts: media 24 · faster 28 · slip 6 · live 5 = **83**.
- **~320 archival photos carry zero metadata:** `diary` 123 · `random` 99 · `artwork` 59
  · `glitchpr0n` 41 — none captioned, dated, or wired into a chamber.
- **No `img/thumbs/`.** PR #100 generated 227 WebP thumbnails but they live **only** on
  `feat/visual-home` (parked). Salvageable into the *real* chambers as enrichment (see below).

## Per-chamber fill state

| Wing | Chamber | State | The gap |
|---|---|---|---|
| East · Scholarship | **Akademia** | wireframe | 11 config items, all `coming-soon`, **no body text** |
| | **Bibliotheke** | empty | poetry/prose/lyrics mounts render blank; all `coming-soon` |
| | **Pinakotheke** | generative-only | 5 p5 sketches; **no real photography surfaced** |
| West · Discourse | **Agora** | partial | 3 manifesto cards inline; config lists more, not rendered |
| | **Symposion** | empty | speaker legend only, **no dialogue** |
| | **Oikos** | empty | 3 journal prompts, **no entries** |
| South · Performance | **Odeion** | partial | 4 album cards, **no tracklists/lyrics** (OGOD = 29 tracks) |
| | **Theatron** | partial | 4 performance cards, **no embedded video** |
| North · Process | **Ergasterion** | partial | 5 project blurbs, no code samples / live widgets |
| | **Khronos** | partial | era/milestone cards, empty timeline mount |
| support | **Stills** | 7% | 6/83 captioned; carousel over-counts to 44 (bug above) |
| | **Diary** | ~2% | 123 images, 3 shared captions; indicator says `1/83` (wrong) |
| | **Discovery** | empty | search UI ready, no content index behind it |
| | **Video** | ✅ full | 5 YouTube embeds, all captioned — the model to match |

**Where content is authored:** `js/images.js` (`stillsData`) and per-chamber `*/config.js`
(`akademia/config.js`, `bibliotheke/config.js`, `agora/config.js`, `odeion/config.js`, …) feed
renderers into the `fragment.html` mount points. Fortifying = writing those data files, not new UI.

## Fortification plan — staged, ordered by impact ÷ effort

Every step is additive enrichment of an **existing** chamber. None touches the `#landing` default.
Each is its own small commit on `etceter4-revival`, shown to you before any merge/deploy.

1. **Kill the broken gallery images + wire the stills gallery to real files** — DONE on this branch.
   - `scripts/gen-image-manifest.mjs` → `js/imageManifest.js` derives the real inventory from disk
     (media 24 / faster 28 / slip 6 / live 5 / diary 123). Re-run after adding photos.
   - The **stills** carousel now loads from the manifest, not a contiguous 1..N range: `images.js`
     builds explicit id lists, `Carousel.appendImagesTo` takes those ids, and `total` is the real
     count. Fixed the fragment's broken `media2` preload → `media1, media3, media4` (all real).
     **Verified by simulation against disk:** all 63 real stills load exactly once, zero broken
     refs, indicator denominator = 63 (was an over-counted 83). Captions key on filename id, so the
     5 real captions (media1, media3, faster1, slip1, live1) now attach to their frames.
   - An `onerror` net stays as belt-and-suspenders, and still covers the **diary** gallery, whose
     bespoke split-view loader I did **not** rewire (its captions are ~all empty; deeper diary
     manifest-wiring + the `1/83` indicator remain a gated follow-up — lower value, higher risk).
   - ⚠️ **One orphaned caption for you:** `stillsData.media["2"]` = *"Culture, rocks, freedom. / Eat
     me, hide me."* was written for `media2.jpg`, which doesn't exist. I left your words in place
     (never auto-deleted) but they show on no image — **tell me which photo they belong to** and I'll
     re-key them.
   - Not run: `vitest`/`eslint` (node_modules not installed); `node --check` passes on all files.
2. **Salvage the 227 thumbnails** — DONE on this branch (`img/thumbs/` checked out from
   `feat/visual-home`, **asset-only — no grid front-door**). Wiring them into Stills/Pinakotheke is
   content work (step 3 below). *(staged, gated)*
3. **Caption the 83 stills** — author real captions into `stillsData` (your voice; the 6 that exist
   set the tone: *"Fires, fury, absolution…"*). Highest-visibility fill — **your words, gated.**
4. **Surface real photography in Pinakotheke** — wire a curated slice of `artwork/` (59) and the
   strongest `diary`/`glitchpr0n` work into the gallery alongside the generative sketches.
5. **Akademia** — drop in 2–4 real essays/papers (your academic voice; the explicit artist↔academia
   bridge, ties to AMP LAB MEDIA / objectlessons.film).
6. **Odeion tracklists** — OGOD (29), Progression of Digression (12), RMXS (6), Etc (5) from `js/config.js`.
7. **Bibliotheke / Oikos / Symposion** — seed real text (poems, reflections, one dialogue) so the
   empty mounts render. Small amounts beat `coming-soon`.
8. **Discovery** — once chambers carry content, register items so search returns results.

Items 1–3 are mechanical/low-risk and I can stage them now on your word. Items 4–8 need **your
words and your taste** — I'll scaffold the structure and draft where I can, but the art is yours.

## Guardrails honored

- `#landing` stays the default home; the Living Pantheon and nine chambers are untouched.
- PR #100 stays **parked**; only its thumbnails are candidate-salvage, never its front-door grid.
- No merge, deploy, go-live, delete, or send. Everything stages on `etceter4-revival` for your gate.
- No browser automation used anywhere in this work.
