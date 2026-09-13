# ADR 0001 — Dual-Mode Search

## Status
Accepted

## Context
PRD menuntut pencarian teks bebas DAN filter genre/rentang tahun dalam satu grid
hasil. Fakta TMDb API: `/search/multi` hanya menerima `query, page, include_adult`
— genre dan tahun tidak bisa dipakai bersama pencarian teks. Filter hanya
didukung `/discover/movie` dan `/discover/tv` (endpoint per-type). Genre ID juga
berbeda antara type (movie Action = 28, tv Action = 10759).

Alternatif:
1. Mode ganda: teks → `/search/multi`; filter aktif → `/discover/{type}`.
2. Tab Film/Serial terpisah dengan search+filter per-type.
3. Buang filter dari MVP.

## Decision
Dual-mode dengan satu grid:
- Tanpa filter: Search mode, teks → `/search/multi` (hasil `person` dibuang).
- Filter genre/tahun aktif: Discover mode → `/discover/{type}` dengan
  `with_genres`, `primary_release_date.gte/.lte`, `include_adult`.
- Discover default type Film, toggle Serial tersedia; genre list di-fetch
  per-type dan pilihan genre di-reset saat ganti type (ID tidak kompatibel).
- Submit teks saat filter aktif → pindah Search mode, filter di-clear + toast.
  Satu mode aktif dalam satu waktu.
- URL params eksplisit: `?q&type&genres&from&to&adult&provider&indonesia&mode`. `page`
  tidak di URL — load-more pakai counter state, shareable URL selalu page 1.
  `provider` = ID provider streaming (region watch ID), `indonesia` = konten
  produksi Indonesia (movie: `with_original_language=id`; tv:
  `with_origin_country=ID` — dispatch per-type, pattern sama tahun).
- API key `VITE_TMDB_API_KEY` client-side by design (key TMDb gratis &
  replaceable; upgrade path: proxy Vercel function bila disalahgunakan).

## Consequences
- Dua jalur fetch + dispatch mode di satu layer `lib/tmdb.ts`; komponen grid
  tidak tahu bedanya.
- Hasil discover tidak bisa dikombinasi dengan teks — batas domain TMDb,
  dijelaskan lewat toast saat switch mode.
- Kontrak URL jadi API publik informal; perubahan param butuh pertimbangan.
