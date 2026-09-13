# ADR 0002 — Where-to-Watch di Halaman Detail

## Status
Accepted

## Context
PRD MVP menetapkan where-to-watch (provider streaming) sebagai Non-Goal.
Saatnya dipertimbangkan: TMDb menyediakan data provider per-item gratis,
dan pertanyaan "nonton di mana" adalah langkah alami setelah memutuskan
menonton. Persona penonton kasual di Indonesia.

Fakta TMDb API:
- `watch/providers` tersedia via `append_to_response` — nol request
  tambahan di halaman detail.
- Data per-region (`results.ID`); region lain tidak relevan untuk
  pengguna Indonesia dan menambah noise (provider tak tersedia di sini).
- Bukan penawaran where-to-watch berbasis lokasi user — region ID
  hardcoded.

Alternatif:
1. Tetap Non-Goal (status quo).
2. Provider region ID di detail page via `append_to_response`.
3. Where-to-watch berbasis geolokasi / multi-region.

## Decision
Balik Non-Goal: tampilkan provider streaming di halaman detail.
- Endpoint `append_to_response=videos,credits,watch/providers`, region
  `ID` saja.
- Tiga section: Langganan (flatrate), Sewa (rent), Beli (buy) — chip logo
  + nama provider.
- Item tanpa provider di region ID → section disembunyikan utuh (bukan
  tampil "tidak tersedia") — konsisten prinsip Cinema Quiet.
- Grid hasil tidak menampilkan provider — halaman detail saja.

## Consequences
- Non-Goal PRD diamendemen; catatan ini jadi rujukan perubahan.
- Data provider bisa berubah/hilang sewaktu-waktu dari TMDb (lisensi) —
  section muncul-hilang mengikuti data, tidak error.
- Region hardcoded ID; bila butuh region lain nanti, angkat ke setting
  user + param region (perubahan kecil, terisolasi di `normalizeProviders`).
