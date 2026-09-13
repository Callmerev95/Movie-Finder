# PRD — Movie Finder

## 1. Executive Summary

- **Problem Statement**: Tidak ada tempat tunggal untuk mencari film/serial yang layak ditonton, melacak watchlist, dan memberi rating pribadi — pencarian tersebar, dan tracking tontonan tidak terdokumentasi.
- **Proposed Solution**: SPA ringan (Vite + React + TypeScript, Tailwind + shadcn/ui) yang mencari film & serial via TMDb API — filter genre/tahun, halaman detail dengan poster + trailer — dengan watchlist & rating 1–5 tersimpan di localStorage. Nol DB, nol auth, deploy static Vercel.
- **Success Criteria**:
  - Hasil search tampil <= 1.5s sejak submit.
  - Watchlist + rating 100% persisten setelah refresh / tutup browser (localStorage).
  - Lighthouse Performance >= 90, Accessibility >= 95.
  - Nol error console pada happy path: search → detail → add watchlist → rating.

## 2. User Experience & Functionality

**Persona**: Penonton kasual — 1 browser, tanpa akun, tanpa login.

### User Stories & Acceptance Criteria

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| US-1 | Sebagai pengguna, saya ingin mencari film/serial by judul agar cepat menemukan kandidat tontonan. | Debounce 300ms; hasil pertama < 1.5s; hasil `person` dibuang; tampil poster, judul, tahun, Skor TMDb, badge type (Film/Serial); load-more pagination 20/halaman. Mode Search via `/search/multi`. |
| US-2 | Sebagai pengguna, saya ingin filter genre & tahun agar mempersempit hasil. | Filter genre multi-select + rentang tahun (Dari/Sampai); Mode Discover via `/discover/movie|tv`, default type Film dengan toggle Serial; genre list per-type, pilihan reset saat ganti type (genre ID beda per type); filter provider streaming single-select (region ID) + toggle Konten Indonesia (movie: bahasa asli id; tv: negara produksi ID); submit teks saat filter aktif → switch Search mode + clear filter + toast; state filter tersimpan di URL (shareable, back button berfungsi). Lihat ADR 0001. |
| US-3 | Sebagai pengguna, saya ingin melihat detail item agar memutuskan menonton. | Halaman detail: poster besar, sinopsis, genre, durasi (film) / jumlah season (serial), rating, cast utama, embed trailer YouTube (jika ada), tempat menonton per region Indonesia (Langganan/Sewa/Beli; sembunyikan bila tidak ada — ADR 0002). Endpoint dispatch by type: `/movie/{id}` vs `/tv/{id}` dengan `append_to_response=videos,credits,watch/providers`. |
| US-4 | Sebagai pengguna, saya ingin menyimpan item ke watchlist agar tidak lupa. | Tombol add/remove dari hasil & detail; watchlist bertahan setelah refresh; badge jumlah item di navigasi. |
| US-5 | Sebagai pengguna, saya ingin memberi rating 1–5 agar mencatat opini pribadi. | Rating di halaman detail otomatis add item ke watchlist + set rating (satu langkah); di watchlist bisa edit/clear rating; tersimpan persisten. |
| US-6 | Sebagai pengguna, saya ingin mengelola watchlist agar rapi. | Hapus item; sort by tanggal ditambah (default) / rating / judul; empty state jelas saat list kosong. |
| US-7 | Sebagai pengguna, saya ingin menandai item di watchlist yang sudah saya tonton agar tidak lupa. | Chip "Tandai ditonton" per item di WatchlistPage + saat item sudah tersimpan di DetailPage; default belum ditonton, persist di localStorage bersama metadata watchlist. |

### Model item watchlist

```ts
{
  type: 'movie' | 'tv',
  tmdbId: number,
  title: string,
  posterPath: string | null,
  addedAt: string,      // ISO date
  rating?: 1 | 2 | 3 | 4 | 5,
  voteAverage: number
}
```

### Non-Goals

- Tidak ada akun/login (MVP localStorage only).
- Tidak ada rekomendasi berbasis selera/mood.
- Tidak ada review panjang — rating 1–5 saja.
- Tidak ada sinkronisasi multi-device (v2.0).

## 3. AI System Requirements

N/A — tidak ada fitur AI.

## 4. Technical Specifications

### Stack

- Vite + React + TypeScript
- TailwindCSS + shadcn/ui
- react-router-dom (route `/` search, `/movie/:type/:id` detail, `/watchlist`)

### Architecture / Data Flow

```
SPA (Browser)
 ├─ Search    → TMDb /search/multi (filter hasil movie|tv, buang person) — mode Search
 ├─ Discover  → TMDb /discover/movie|tv + /genre/{type}/list — mode Discover, default Film
 ├─ Detail    → TMDb /movie/{id} | /tv/{id} (append_to_response=videos,credits), dispatch by type
 └─ Watchlist → localStorage key "movie-finder:watchlist" (Context + useLocalStorage hook)
```

- URL params eksplisit: `?q&type&genres&from&to&adult&provider&indonesia&mode`; `page` tidak di URL (load-more state counter). Toggle adult default OFF.

- **API client** (`lib/tmdb.ts`): search multi + detail dispatch + in-session `Map` cache + pagination + error/retry state.
- **Watchlist store** (`lib/useWatchlist.ts`): React Context + localStorage; operasi add/remove/rate/sort.
- **API key**: `VITE_TMDB_API_KEY` env var via `import.meta.env` — client-side by design (TMDb key gratis & replaceable; jangan commit `.env`).

### Integration Points

- TMDb API v3 (gratis, perlu API key dari themoviedb.org).
- Nol DB, nol auth, nol backend.

### Security & Privacy

- Tidak ada data pribadi yang dikirim ke mana pun — watchlist hanya tersimpan di browser pengguna.
- API key terekspos di client bundle (accepted risk; mitigasi upgrade path: proxy Vercel function).

## 5. Risks & Roadmap

### Phased Rollout

- **MVP**: US-1 s/d US-6 + trending landing (`/trending/all/week`) — search film+serial, filter genre/tahun, detail+trailer+tempat menonton, watchlist, rating, sort.
- **v1.1**: Export/import watchlist JSON (backup anti-hilang); dark mode. — **SELESAI (export/import)**: tombol Ekspor/Impor di WatchlistPage; merge anti-duplikat, item existing menang; validasi pakai `parseWatchlist`; dark mode sudah default (dark-only).
- **v2.0**: Migrasi ke Supabase Auth + Postgres untuk persist lintas device — skema `watchlist(user_id, type, tmdb_id, rating, added_at)` + RLS.

### Technical Risks

| Risiko | Dampak | Mitigasi |
|---|---|---|
| API key terekspos di bundle | Key disalahgunakan, quota habis | TMDb key gratis & replaceable; upgrade path: proxy Vercel function |
| localStorage terhapus / ganti device | Watchlist hilang total | Ekspektasi jelas di UI; v1.1 export JSON |
| Rate limit TMDb saat scroll cepat (±50 req/10s) | Search error 429 | Debounce, in-session cache, pagination 20/halaman |
| TMDb down / key invalid | App mati total | Error state + retry sederhana |

## Struktur Repo

```
Movie-Finder/
├─ public/
├─ src/
│  ├─ components/
│  │  ├─ ui/            (shadcn: button, card, input, select, dialog, badge, toast)
│  │  ├─ SearchBar.tsx
│  │  ├─ Filters.tsx
│  │  ├─ ResultCard.tsx
│  │  ├─ Detail.tsx
│  │  ├─ Rating.tsx
│  │  ├─ WatchlistItem.tsx
│  │  └─ EmptyState.tsx
│  ├─ lib/
│  │  ├─ tmdb.ts
│  │  ├─ useWatchlist.ts
│  │  ├─ cache.ts
│  │  └─ types.ts
│  ├─ pages/
│  │  ├─ SearchPage.tsx
│  │  ├─ DetailPage.tsx
│  │  └─ WatchlistPage.tsx
│  ├─ App.tsx (router + layout + nav badge)
│  └─ main.tsx
├─ .env.example        (VITE_TMDB_API_KEY=)
├─ vercel.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Checklist Eksekusi

1. Scaffold Vite + React + TS, install Tailwind, init shadcn/ui, react-router-dom.
2. `lib/types.ts` + `lib/tmdb.ts` (search multi + detail dispatch + cache + abort).
3. `lib/useWatchlist.ts` (Context + localStorage + rating + sort).
4. Pages: SearchPage → DetailPage → WatchlistPage + components + layout nav.
5. CI (typecheck + build + test), `.env.example`, Vercel config, README.
6. Verifikasi: build hijau, Lighthouse, smoke flow via browser.

**Tindakan pengguna**: isi `VITE_TMDB_API_KEY` di `.env.local` (lokal) dan environment variable Vercel.
