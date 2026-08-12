# AGENTS.md

**Kike's Archive** (`@kikewtf/archive`) is a personal "time machine" / media archive for
Kike Fontán: a Netflix-style dark site that compiles his media appearances (talks,
press, podcasts, projects). Every item is a *reference* with a cover, tags, a source
link and usually an archived copy.

The design is Netflix-inspired: billboard hero carousel, sticky
nav, media rows with chevrons, hover cards and a details modal.

## Stack

- **Astro 7** — `output: 'static'`, deployed at `https://kike.wtf/archive/` (`base: '/archive'`, `site: 'https://kike.wtf'`).
- **TypeScript** (strict), `.astro` components. No UI framework: interactivity is **vanilla TS** in `src/scripts/`.
- **bun** — package manager + runner (via the Nix flake devshell). Lockfile: `bun.lock`.
- **Nix** — `flake.nix` provides a devshell with `bun`. Use **ephemeral `nix shell`** (never install to the system) for tools like `yt-dlp`/`ffmpeg`.
- **CSS** — single `global.css`, processed by **lightningcss** (Vite `css.transformer: 'lightningcss'` with modern `targets`). Netflix Sans Variable font is hotlinked from Netflix's CDN with graceful fallback.
- **CI** — GitHub Actions `bundle.yml`: `bun install && bun run build`, packages `www/` as an artifact.

## Commands

Run everything under the direnv/nix environment (`direnv allow` first, or prefix with `direnv exec .`):

```sh
bun install            # install deps
bun run dev            # astro dev server
bun run build          # astro build -> outDir ./www
bun run preview        # serve the built ./www
bun run check          # astro check (types) — MUST be clean before committing
```

`bun` is only available through the flake devshell; outside it, use
`direnv exec . <cmd>`.

## Project structure

```
astro.config.mjs        # base '/archive', outDir './www', lightningcss config
src/
  pages/index.astro     # home: billboard + category rows + modals
  pages/tags.astro      # tag cloud page -> /archive/tags/ (filters via ?tag=)
  pages/feed.xml.ts     # RSS feed -> /archive/feed.xml (JSON is the source)
  pages/api.ts          # API endpoint -> /archive/api (serves the JSON with charset)
  layouts/BaseLayout.astro  # <head>/SEO/meta, Header, footer, loads both scripts
  components/Header.astro   # fixed nav + billboard hero carousel (slides)
  components/ReferenceCard.astro  # clickable card (data-card, data-tags)
  components/Showcase.astro      # details modal (data-showcase)
  data/api.json         # THE content source (schema below); served as the JSON API
  lib/references.ts     # types + derived data (groups, featured, tagCloud, ...)
  lib/assets.ts         # assetUrl()/resolveAsset() for BASE_URL handling
  scripts/showcase.ts   # modal open/close, nav, row chevrons, tag filter
  scripts/billboard.ts  # carousel rotation, dots, title font-fitting
  styles/global.css     # full design system (Netflix dark theme)
  img/logo.png          # imported/fingerprinted by Vite
public/                 # served at root (BASE_URL-prefixed)
  covers/*              # reference cover images (referenced by filename)
  archive/*             # LOCAL press files only (pdfs/jpg) — see Media hosting
  background.jpg, preview.png, favicon.ico
```

## Data model (`src/data/api.json`)

Array of references:

```ts
interface Reference {
  id: string;            // NOT in JSON — derived in lib/references.ts from the cover
                         // filename (basename without extension), e.g. rootedcon-2026-sepa
  date: string;          // 'YYYY-MM-DD' — always a full, valid date (no bare YYYY-MM)
  category: string;      // 'video' | 'press' | 'media' | 'podcast'
  name: string;
  description: string | string[];  // string[] renders as separate paragraphs
  url?: string;          // source link (original)
  image: string;         // filename inside public/covers/ (kebab-case id + extension)
  tags?: string[];
  archive?: string;      // archived copy URL (see Media hosting)
}
```

**Content rules** (user-enforced):
- Descriptions must be in **English** and **≤ 500 characters**.
- `date` must be a full, valid `YYYY-MM-DD` (never `YYYY-MM`, never an invalid day
  like `02-31`) — the RSS feed parses it into RFC 822 `pubDate`.
- Cover files are named after the reference id (`<id>.<ext>`), unique per reference;
  reusing a cover for two references means duplicating the file.

Derived data in `src/lib/references.ts`:
- `allReferences` — JSON + `id` derived from the cover basename (stable slugs, not
  array indexes, so reordering the JSON does not change ids).
- `groupsByCategory` — grouped + each group sorted by date desc; groups sorted by category name desc.
- `featuredSlides` — the 4 most recent references (drives the billboard carousel).
- `tagCloud` / `allTags` — unique tags with counts; `categoryLabel()` pretty-prints category names.

## RSS feed (`src/pages/feed.xml.ts`)

`/archive/feed.xml` is generated at build time from `api.json` (no `@astrojs/rss`
dependency — hand-written XML for full control). Per item it emits:
`<title>`, `<link>` (from `url`), `<guid isPermaLink="false">` (the stable id/slug),
`<pubDate>` (RFC 822 via `toUTCString()`), `<description>`, `<category>` (label + each
tag), `<media:thumbnail>` (absolute cover URL), and `<enclosure>` for `archive` with
MIME type by extension and byte length for local files (0 for remote). The
`xmlns:media` and `xmlns:atom` namespaces are declared on the root `<rss>` element.

## JSON API (`src/pages/api.ts`)

`/archive/api` serves the contents of `src/data/api.json` as
`application/json; charset=utf-8`. The endpoint imports the JSON directly, so the
data file is both the build source and the API. Note: static hosting serves
extensionless files without a MIME type — the data itself is correct UTF-8, but if
a strict `Content-Type` is ever required, point clients at `/archive/api.json` or
configure the host.

## Interactivity (vanilla TS islands)

`BaseLayout` loads both scripts on every page.

**Billboard carousel** (`billboard.ts`): rotates `featuredSlides` every **6s** with a
1.5s crossfade and a Ken Burns zoom (`scale(1) → scale(1.04)`, 6s linear). Dots
navigate + restart the timer; `inert`/`aria-hidden` keep only the active slide
interactive. `fitTitles()` binary-searches the slide title font-size so it never
overflows. Rotation pauses on dot focus and respects `prefers-reduced-motion`.
`SLIDE_MS` and the CSS `slide-zoom` duration are manually kept in sync.

**Home (`index.astro` + `showcase.ts`)**: clicking a card (`data-card`) opens its
details **modal** (`data-showcase`), click the same card/close button/backdrop or
press `Escape` to close; body scroll is locked and focus is restored. Rows scroll
via chevron buttons. The nav is `position: fixed`; on pages with a hero it starts
hidden above the viewport and slides down once scrolled (`nav--hero.is-scrolled`).

**Tag filtering**: the modal's tags are buttons (`data-tag`); clicking one filters the
homepage in place (`?tag=` query param via `history.replaceState`), hiding non-matching
cards and empty sections and showing a count note. Cards carry `data-tags="a b c"`.
The `/tags/` page links to `/?tag=<tag>`. `markLastTagRow()` removes borders on the
last grid row.

**Header** (`Header.astro`): the hero only renders when `featuredSlides` is non-empty;
other pages get just the fixed nav. `watchUrl = archive ?? url ?? '#'`; external
(`http*`) links get `target="_blank" rel="noopener noreferrer"`.

## Media hosting (important)

- **Videos and podcasts** are hosted on **Internet Archive** (archive.org). The
  `archive` field points at `https://archive.org/download/<item>/<file>`, where items
  are named `kikewtf-archive-*` (e.g. `kikewtf-archive-teis-ciberseguridad-2026`).
  Do NOT add local video/audio files.
- **Press files** (PDFs, scanned JPGs) remain local in `public/archive/` and are
  referenced as `./archive/<file>`.
- Some `archive` values are external web archives (`https://archive.is/...`) — leave those.

To download new media to archive.org without installing anything:

```sh
nix shell nixpkgs#yt-dlp nixpkgs#ffmpeg -c yt-dlp \
  -f "bv*[height<=720]+ba/b[height<=720]" --merge-output-format mp4 \
  -o "public/archive/<name>.mp4" "<url>"
```

then upload via the archive.org S3-compatible API (credentials are the account owner's;
use env vars, never commit them):

```sh
curl -X PUT "https://s3.us.archive.org/<item>/<file>" \
  -H "Authorization: LOW ${ARCHIVE_ACCESS}:${ARCHIVE_SECRET}" \
  -H "x-archive-auto-make-bucket: 1" -H "x-archive-queue-derive: 1" \
  -H "x-archive-meta-mediatype: movies|audio" \
  -H "x-archive-meta-collection: opensource_movies|opensource_audio" \
  -H "x-archive-meta-title: <title>" --data-binary @<file>
```

Verify with `curl -H "Range: bytes=0-0" https://archive.org/download/<item>/<file>`
(expect `206`; items take a few minutes to index after upload).

## CSS / build gotchas

- **lightningcss**: if you write BOTH `backdrop-filter` and `-webkit-backdrop-filter`,
  the standard one is dropped in the build. Write only `backdrop-filter`; the
  configured modern `targets` handle prefixing. Modern Chromium ignores the prefixed
  property entirely.
- `base: '/archive'` → `import.meta.env.BASE_URL` is `/archive` **without** a trailing
  slash during SSR. Always build URLs with `assetUrl()` (from `src/lib/assets.ts`).
- Image imports from `src/img/` return an asset object in Vite 7 — use `resolveAsset()`.
- Keep `SLIDE_MS` (TS) and the `slide-zoom` animation duration (CSS) in sync.

## Git / workflow rules

Follow **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** strictly:
- Never work or commit directly on `main`; use branches `type/short-description` (kebab-case).
- Conventional Commits with a **mandatory scope**: `feat(ui): ...`, `fix(archive): ...`, `chore(data): ...`. Imperative mood. Never add `Co-Authored-By`.
- No merge without explicit user consent; merges use `--no-ff`.
- Before any change, run `bun run check` (and `bun run build`) — must be green.
- Current active branch: `feat/astro-migration` (uncommitted WIP is common; leave the
  user's in-flight edits unstaged unless told otherwise).

## Environment notes

- Repo uses a Nix flake + direnv (`.envrc` → `use flake`). The devshell provides `bun` only.
- `.env` files (if present) are sourced by direnv — never commit secrets.
- `.gitignore` covers `node_modules`, `www/`, `dist/`, `.astro/`, `.direnv/`.
