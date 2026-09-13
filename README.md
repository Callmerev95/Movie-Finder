# Movie Finder

Cari film & serial via TMDb, simpan watchlist, beri rating — semuanya lokal di browser.

## Setup

```bash
npm install
cp .env.example .env.local   # isi VITE_TMDB_API_KEY (gratis: themoviedb.org)
npm run dev
```

## Perintah

- `npm run dev` — dev server
- `npm run typecheck` — tsc --noEmit
- `npm run build` — build produksi
- `npm test` — vitest (pure functions di `src/lib/`)

## Dokumen

- `PRD.md` — kebutuhan & acceptance criteria
- `DESIGN.md` — arah visual "Cinema Quiet", token, states
- `CONTEXT.md` — glossary istilah
- `docs/adr/0001-dual-mode-search.md` — dual-mode search/discover

## Catatan

- Watchlist tersimpan di `localStorage` browser (key `movie-finder:watchlist`) —
  tidak sinkron antar perangkat; hapus data browser = hilang.
- API key client-side by design (lihat ADR 0001).
- Deploy: Vercel static; set env `VITE_TMDB_API_KEY`.
