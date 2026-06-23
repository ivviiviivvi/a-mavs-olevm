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
- **A live bug:** `js/config.js:51` declares `media: 44` but only **24** media files exist on disk.
  The stills carousel requests `media-25 … media-44` → 20 broken-image / placeholder fallbacks.
  (Real counts: media 24 · faster 28 · slip 6 · live 5 = **83**.) Fixing the count is a one-line truth-up.
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

1. **Truth-up the stills count + indicator** (one-line bug fix). `media: 44 → 24` in `js/config.js`;
   fix the diary `1/83` indicator to the real total. Kills 20 broken images immediately. *(reversible, safe)*
2. **Caption the 83 stills** — author real captions into `stillsData` (your voice; the 6 that exist
   set the tone: *"Fires, fury, absolution…"*). This is the single highest-visibility fill.
3. **Salvage the 227 thumbnails** from `feat/visual-home` into the real chambers (Stills/Pinakotheke
   performance), **without** importing PR #100's grid front-door. Cherry-pick `img/thumbs/` only.
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
