# Movie Finder

Cari film & serial via TMDb, simpan watchlist, beri rating — semuanya lokal di
browser. Tanpa akun, tanpa database, tanpa backend.

![Stack](https://img.shields.io/badge/Vite-8-646CFF) ![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8) ![Vitest](https://img.shields.io/badge/Vitest-53%2F53-6E9F18)

- **Dua mode pencarian** — ketik judul (Search) atau pakai filter genre, tahun,
  provider streaming, dan Konten Indonesia (Discover). State pencarian tersimpan
  di URL: bisa dibagikan, tombol back bekerja.
- **Command palette `⌘K`** — power-user shortcut: cari judul & lompat ke halaman
  dari mana saja; full-keyboard, hasil mini dengan poster langsung ke detail.
- **Detail lengkap** — poster, backdrop, sinopsis, trailer YouTube, pemeran,
  rekomendasi serupa, tempat menonton di Indonesia (klik provider → katalog
  JustWatch), link IMDb.
- **Watchlist pribadi** — tambah/hapus (dengan undo), rating 1–5, tandai
  ditonton, sort, ekspor/impor JSON sebagai cadangan. Semuanya di
  `localStorage`.
- **Halaman Orang** — klik pemeran untuk lihat biografi + filmografi.
- **Trending** — grid mingguan sebagai landing saat belum mencari.

UI dark-only "Cinema Quiet" — senyap, poster jadi bintangnya. Spesifikasi
desain di [`DESIGN.md`](DESIGN.md).

## Mulai

```bash
npm install
cp .env.example .env.local   # isi VITE_TMDB_API_KEY
npm run dev
```

API key TMDb gratis — daftar di [themoviedb.org](https://www.themoviedb.org/)
(Settings → API). Tanpa key aplikasi tetap jalan, tapi semua fetch menampilkan
error "API key TMDb belum diatur".

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server |
| `npm run typecheck` | `tsc --noEmit` — wajib hijau |
| `npm test` | Vitest — 53 test pure functions di `src/lib/` |
| `npm run build` | Build produksi |
| `npm run preview` | Preview hasil build |

## Stack

| Lapisan | Teknologi |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript 7 (strict) |
| Style | Tailwind CSS v4 + shadcn/ui (`base-nova`, Base UI primitives) |
| Routing | react-router-dom v7 |
| Ikon / font | lucide-react / Geist Variable |
| Test | Vitest |
| Data | TMDb API v3 — watchlist di `localStorage` |

## Struktur

```
src/
├─ components/          SearchBar, Filters, ResultCard, Stars, Section,
│  │                    TrendingSection, CommandPalette (Cmd+K)
│  └─ ui/               komponen shadcn — regenerate via CLI, jangan edit manual
├─ lib/                 pure functions: tmdb, watchlist, url-state, format,
│  └─ *.test.ts         toast, useWatchlist (Context + localStorage)
├─ pages/               SearchPage, DetailPage, PersonPage, WatchlistPage
├─ App.tsx              router + nav + footer
└─ index.css            token cinema dark (dark-only)
```

Seluruh logika fetch/parse/serialisasi hidup di `src/lib/` sebagai pure
functions — komponen hanya render + memanggil hook. Detail arsitektur di
[`PRD.md`](PRD.md).

## Deploy (Vercel)

Repo ini siap deploy static di Vercel — SPA rewrite sudah dikonfigurasi
(`vercel.json`).

1. Import repo di Vercel, framework terdeteksi otomatis (Vite).
2. Set environment variable `VITE_TMDB_API_KEY`.
3. Deploy.

## Dokumen

| Dokumen | Isi |
|---|---|
| [`PRD.md`](PRD.md) | Kebutuhan, user stories, arsitektur, roadmap |
| [`DESIGN.md`](DESIGN.md) | Arah visual "Cinema Quiet", token, states, a11y |
| [`CONTEXT.md`](CONTEXT.md) | Glossary istilah kanonik |
| `docs/adr/` | Keputusan arsitektur (0001 dual-mode search, 0002 where-to-watch) |

## Catatan

- Watchlist tersimpan di `localStorage` (key `movie-finder:watchlist`) — tidak
  sinkron antar perangkat; hapus data browser = hilang. Pakai ekspor/impor JSON
  untuk cadangan atau pindah perangkat.
- API key client-side by design — key TMDb gratis & replaceable (ADR 0001).
- Data & logo TMDb © masing-masing pemilik — atribusi di footer aplikasi.

## Lisensi

MIT.
