# AGENTS.md — Movie Finder

Panduan agen AI untuk repo ini. Bahasa komunikasi: Indonesia. PRD = `PRD.md`,
desain = `DESIGN.md`, glossary = `CONTEXT.md` (istilah wajib konsisten).

## Stack
Vite + React 19 + TypeScript strict + Tailwind CSS v4 + shadcn/ui (style base-nova,
Base UI primitives). Routing react-router-dom. Tanpa backend, tanpa DB — data
TMDb API v3, watchlist di localStorage. Deploy static Vercel.

## Perintah
- `npm run dev` — dev server
- `npm run typecheck` — tsc --noEmit, WAJIB hijau sebelum selesai
- `npm run build` — produksi build, WAJIB hijau
- `npm test` — vitest, test pure functions di `src/lib/`

## Sistem Pengerjaan
- Pekerjaan besar WAJIB dipecah per fitur, dikerjakan berurutan satu per satu —
  JANGAN mengerjakan semuanya sekaligus dalam satu sesi/commit.
- Urutan eksekusi mengikuti checklist PRD (fondasi → TMDb lib → watchlist →
  halaman Search → Detail → Watchlist → polish/verifikasi).
- Tiap fitur selesai = commit terpisah dengan verifikasi hijau sendiri
  (typecheck + test terkait) sebelum lanjut fitur berikutnya.
- Jika satu sesi tak cukup untuk satu fitur, selesaikan fitur aktif dulu,
  baru stop — jangan setengah dua fitur.

## Konvensi kode
- Import alias `@/` → `src/`.
- Komponen shadcn di `src/components/ui/` — jangan edit manual, regenerate via CLI.
- Seluruh logika fetch/parse/serialisasi di `src/lib/` sebagai pure functions;
  komponen hanya render + panggil hook. Nol logika bisnis di komponen.
- TMDb API key dari `import.meta.env.VITE_TMDB_API_KEY` — jangan hardcode, jangan
  commit `.env`. Key client-side by design (ADR 0001).
- Token warna/type/radius dari `src/index.css` — jangan hex/px baru di komponen;
  pakai token Tailwind semantic (`bg-card`, `text-muted-foreground`, dst).
- Dark-only: `.dark` permanen di `<html>`. Tidak ada mode light, jangan buat toggle
  tema.

## Aturan produk (dari PRD + grill)
- Dual-mode pencarian: teks → `/search/multi`; filter genre/tahun aktif →
  `/discover/movie|tv` dengan toggle type default Film. Lihat ADR 0001.
- Rating di detail auto-add ke watchlist + set rating.
- Genre ID beda per type — fetch genre list per type, reset pilihan saat ganti type.
- Toggle adult default OFF, param `adult` di URL.
- URL search: `?q&type&genres&from&to&adult&mode` — `page` tidak di URL.
- Watchlist sort default: terbaru ditambah.

## Testing
Pure functions saja (URL builder, normalizer, watchlist ops, filter parse).
File test berdampingan: `src/lib/*.test.ts`.

## Git
Repo `Callmerev95/Movie-Finder` public. Conventional commits, commit per task,
jangan push tanpa diminta. user.name `rev`, email `rchivas109@gmail.com`.
