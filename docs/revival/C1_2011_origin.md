# C1 — The 2011 origin: recovered & runnable

**Status:** ✅ recovered read-only, ✅ runs locally, zero blockers.
**Date:** 2026-06-23 · **Branch:** `etceter4-revival` (staged, not merged)

His words: *"we need the 2011 original to be origin and i want to make that version work."*
C1 = recover that origin and get it running. Done — with one important nuance below.

---

## What was recovered

- **Source:** `github.com/unnamedplay-r/etceter4` (public, "The home of etceter4.com").
- **Clone (read-only sibling, reversible):**
  `/Users/4jp/Workspace/organvm/etceter4-2011` — `gh repo clone unnamedplay-r/etceter4 … -- --depth 1`.
- **Size:** ~2.0 GB (depth-1; carries all binary media). **HEAD:** `e525fa1` (merge of a dependabot PR).
- Repo `repository.url` / homepage point at `github.com/4-b100m/etceter4` (an alias of the same project).

## ⚠️ The nuance that matters for "make the 2011 original the origin"

**This repo's current HEAD is NOT the raw 2011 code — it is a late-2025 modernized rebuild.**
Evidence in the working tree: `akademia/`, `ogod/`, `labyrinth/`, `PANTHEON_ARCHITECTURE.md`,
`LIVING_PANTHEON_GENERATIVE.md`, `SESSION_SUMMARY_2025-11-03.md`, ESLint 9 / Prettier 3 tooling.
Structurally it is a **near-twin of the current temple** (`a-mavs-olevm`) — four "ETCETER4"
wordmarks, a Living Pantheon, the same chamber vocabulary. The index even still carries scratch
copy ("made some funny changes", "hello hello hello 4g4in").

So "the 2011 origin" as a *running site* = this rebuild, and it runs fine. But **the genuine
2011 source** (the actual first-website code) lives in this repo's **git history**, not at HEAD.
The clone is **shallow (depth 1, 1 commit)** — that history is not present locally yet.

**To reach the literal 2011 origin (reversible, his call):**
```bash
git -C /Users/4jp/Workspace/organvm/etceter4-2011 fetch --unshallow
git -C … log --reverse --oneline | head        # earliest commits = the true origin
git -C … log --diff-filter=A --reverse -- 'index.html'   # when the front door was born
```
Then we can check out / tag the earliest runnable commit as the canonical **origin** and run *that*.
Flagged rather than done because un-shallowing pulls the full history of a 2 GB repo — cheap but
worth a yes from you on which "origin" you mean: **the site as it runs today**, or **the literal
first-commit 2011 code**.

## Tech stack (HEAD)

- Pure **static** single-page site. Hash routing (`#landing → menu → words → …`) in `js/`.
- **Zero runtime npm dependencies** (`"dependencies": {}`); dev-only tooling: browser-sync, eslint, prettier.
- Runtime libs via CDN: **jQuery 3.7.1** (code.jquery.com), **Velocity 2.0.6** (cdnjs).
- Embeds: **Bandcamp** (`etceter4.bandcamp.com`), **YouTube** (5 video IDs).
- Deploy configs present: `.htaccess`, `vercel.json`, GitHub Pages workflow. (No DB, no secrets, no auth.)

## Verified running (no browser automation used — curl only)

```bash
cd /Users/4jp/Workspace/organvm/etceter4-2011
python3 -m http.server 8791      # or: npm install && npm run dev  (browser-sync :3000)
```
- `GET /` → **200**, `<title>ET CETER4</title>` ✅
- `js/main.js`, `js/page.js`, `css/styles.css` → **200** ✅

## Condition & breakage risks (all minor, none blocking)

| Item | Risk | Notes |
|---|---|---|
| jQuery / Velocity CDN | low | stable hosts; site shell still loads if down, interactivity degrades |
| Bandcamp / YouTube embeds | low | need internet + accounts live; both currently resolve |
| `music.etceter4.com`, Tumblr links | medium | external subdomain/blogs may 404 (he no longer owns the domain) |
| Lazy-loaded images | low | `data-src` swap; broken paths fall back to `placeholder.jpg` |

## Minimal path to "running origin" — summary

1. It already runs as a static site (above). **Nothing required from you to view it locally.**
2. Decide which "origin" is canonical (running rebuild vs. literal 2011 first-commit). If the latter:
   `git fetch --unshallow` and tag the earliest runnable commit — I'll stage that, gated to you.
3. Deploy/domain = your gate (you no longer own `etceter4.com`). Not touched.
