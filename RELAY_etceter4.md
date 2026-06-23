# RELAY — etceter4 revival (branch this work here)

**You are a fresh session picking up the etceter4 artist thread in an isolated worktree.**
Read this whole file first. It carries the full context and the hard-won guardrails so you
don't repeat the mistake that created it.

- **Worktree:** `/Users/4jp/Workspace/organvm/etceter4-revival`
- **Branch:** `etceter4-revival` (off `organvm/a-mavs-olevm` `master` @ f622f27 — a CLEAN base, deliberately NOT the abandoned `feat/visual-home`)
- **Owner:** Anthony Padavano (`padavano.anthony@gmail.com`, GitHub `4444J99`, org `organvm`)
- **Full session record this came from:** `organvm/personal/docs/ledgers/SESSION_CLOSEOUT_2026-06-23.md`

---

## 0. The mission, in his exact words (2026-06-23)

> "we need the 2011 original to be origin and i want to make that version work — i wanna
> make the new version work as well — and then a third thing needs to exist — but this
> session was most about education academia."

So: **three things**, and they are **subordinate to his education/academia work** (the spine).
This is the artist thread. Do it well, but it is not the center of gravity — don't let it
sprawl, and don't pull the education work into it.

1. **C1 — the 2011 origin → make it work.** `github.com/unnamedplay-r/etceter4` (public; "The home of etceter4.com"; last pushed 2026-03-09). His *first* website, 2011, with collaborator `unnamedplay-r`. Recover it, get it running, treat it as the canonical **origin**.
2. **C2 — the current temple → make it work / fortify what's there.** This repo, `organvm/a-mavs-olevm` — a 9.5-year hand-built art temple, live. Fortify the EXISTING chambers; do **not** replace them.
3. **C3 — a third thing must exist.** Undefined synthesis of origin + temple → the *current* him (academic + artist as one). Define it WITH him before building; don't invent it solo.

---

## 1. HARD GUARDRAILS (these exist because the last attempt violated them)

The previous session built a generic data-driven gallery (`#visual-home`), **made it the
default home — burying the original ETCETER4 landing and its nine chambers** — ran a perf
pass, and pushed it toward go-live as **PR #100**. He rejected it: *"i dont like how it
looks and etceter4 aint it… was not what we shouldve built."* It also opened Claude Chrome,
which he has banned. Learn from it:

- **DO NOT replace or bury the original.** The temple's home is `#landing` (four stacked
  "ETCETER4" wordmarks + the generative "Living Pantheon"). `js/main.js` must keep booting
  `#landing` as default. Never repoint the default home to a generic grid.
- **PR #100 is PARKED, unmerged.** Do not merge it. You *may* salvage its 227 WebP
  thumbnails (`img/thumbs/`) into the EXISTING chambers if useful — but as enrichment of
  the real chambers, never as a new front-door.
- **Fortify = fill what exists, not rebuild.** The chambers are real; they're just under-populated.
- **No Claude Chrome / browser automation.** He has said "why the fuck are you opening claude chrome" three times. Don't.
- **No go-live, no deploy, no merge to master without his explicit gate.** Publishing public content is his call. Stage on this branch only.
- **Never auto-delete, never auto-send.** Archive/copy/draft/stage are fine. Delete/send/wipe/large-spend are his levers.
- **No domain purchases.** (He no longer owns `etceter4.com` the domain — separate from owning the repo/work.)
- **Decisions by logic, not by handing him choices.** Derive reversible defaults yourself; reserve questions for genuinely-his (irreversible/taste) calls — and C3's definition is one of those.

---

## 2. Ground truth — what actually exists (don't re-discover from scratch)

**The current temple (`a-mavs-olevm` on `master`):**
- Home: `index.html` `#landing` — four "ETCETER4" wordmarks → enter → menu. Generative "Living Pantheon" (`js/living-pantheon/` — glitch, morph, ambient, breathing, drift, tunnel transitions; runtime).
- **Nine chambers** (`chambers/*/fragment.html`, lazy-loaded, color-coded), across four wings:
  - East (Scholarship): **Akademia** (essays/research/theory — his academic voice), **Bibliotheke** (poetry/prose/lyrics/criticism), **Pinakotheke** (photography / digital art / glitch / generative).
  - West (Discourse): **Agora** (manifestos/critique), **Symposion** (dialogues/interviews), **Oikos** (personal reflections/dreams).
  - South (Performance): **Odeion** (albums/singles/demos), **Theatron** (performance recordings).
  - North (Process): **Ergasterion** (code experiments/prototypes), **Khronos** (historical archive/evolution).
  - Plus `discovery` (search/filter) and `OGOD` (3D first-person environment for the 29-track album).
- **Photo archive:** `img/photos/` — ~444 files / 444 MB across `media/ faster/ slip/ live/ artwork/ diary/ glitchpr0n/ random/`. **stills** chamber surfaces 83 (media 44 / faster 28 / slip 6 / live 5).
- **THE UNDER-FILL (the actual work):** captions/metadata live in `js/images.js` (`stillsData`) and `js/config.js` — **only ~3 of 83 stills are captioned**, and several chambers render with little/no content backfilled. Fortification = author this content.
- **Discography** (`js/config.js` `media.albums`): OGOD (2015, 29 tracks), ET CETER4 RMXS (2020, 6), The Progression of Digression (2012, 12), Etc (2011, 5).
- Tests: Playwright e2e (`tests/e2e/`) + vitest unit (`tests/unit/`). Lighthouse config `.config/lighthouserc.cjs` (perf is a non-blocking warn ≥0.7; a11y is a blocking error ≥0.9). Bundled Playwright chromium is NOT installed in this environment — if you must run e2e, use system Chrome via `channel:'chrome'` (`/Applications/Google Chrome.app/...`).

**Sister identities (his MANIFEST ledger) — the connective tissue:**
- **ET4L** — production house / art collective (et4l.com); discography `ET4l001–008`.
- **AMP LAB MEDIA** — academic media company (video essays / podcasts / educational) — the explicit *bridge* between the artist thread and the academia pillar. Also runs the LIVE product `objectlessons.film`.
- **LOCREANCE** — South Florida hip-hop group.

---

## 3. Suggested first moves (read-only / reversible — no builds until scoped)

1. **C1 recover (read-only):** `gh repo clone unnamedplay-r/etceter4 /Users/4jp/Workspace/organvm/etceter4-2011 -- --depth 1` (sibling, NOT inside this worktree). Inspect: stack, build/run, what "make it work" requires (deps, dead links, deploy target). Report condition + the minimal path to running it. If it needs his GitHub access or anything irreversible, surface it — don't force it.
2. **C2 inventory:** read `js/images.js`, `js/config.js`, and each `chambers/*/fragment.html`; produce a precise gap map — which chambers are empty, which images lack captions, where his real recent photography (IG ~3,600 profile views/mo; Apple Photos; the 444-file archive) should slot. Propose a fortification plan (captions, real work into Pinakotheke/Akademia, academic↔artist linkage) — staged on this branch, gated for his review.
3. **C3 scope:** draft 2–3 concrete options for "the third thing" (synthesis of origin + temple → present-day academic-artist), and ask him to choose. Do not build it unprompted.

Keep everything on `etceter4-revival`. Stage and show; let him gate any deploy/merge.

---

## 4. How this worktree was created (for reference / teardown)

```
git -C /Users/4jp/Workspace/organvm/a-mavs-olevm worktree add \
    /Users/4jp/Workspace/organvm/etceter4-revival -b etceter4-revival master
# teardown when done (after merge or abandon):
#   git -C /Users/4jp/Workspace/organvm/a-mavs-olevm worktree remove etceter4-revival
```

To run this thread: open a new session with working dir `/Users/4jp/Workspace/organvm/etceter4-revival`
and start from this file. The main (education) session stays untouched.
