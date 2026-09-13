# DESIGN.md — Movie Finder

Sumber keputusan: `frontend-design` (arah estetika, disiplin tipografi, anti-default) + `ui-ux-pro-max` (design system query "movie discovery watchlist entertainment", UX search rules) + PRD.md (scope) + token nyata hasil `shadcn init` di `src/index.css`.

## 1. Arah Estetika — "Cinema Quiet"

Identitas: **gelap sinematik, senyap, konten adalah bintangnya**. Poster film berwarna-warni jadi satu-satunya elemen hidup di atas kanvas hampir hitam — palet UI menahan diri agar poster bersinar. Satu momen berani: **splash poster backdrop** di halaman detail (backdrop TMDb di-grade gelap, tipografi besar di atasnya). Semua yang lain pendiam: permukaan flat, garis halus, nol glow, nol gradient dekoratif.

- Dark-only: `.dark` permanen di `<html>`, blok fallback light dihapus. Tidak ada mode light, tidak ada toggle tema.
- Motion hanya menjawab aksi user (hover card, buka detail, konfirmasi add). Nol entrance animation tiap section.
- Ikon: SVG Lucide (sudah terpasang), nol emoji sebagai ikon.

## 2. Tipografi

**Satu keluarga: Geist Variable** (sudah terpasang `@fontsource-variable/geist`). Sans geometris yang disiplin, netral cukup untuk UI, tak terlalu umum. Tidak pakai display font terpisah — judul film sendiri sudah visual; typeface UI tidak boleh berebut perhatian.

| Peran | Token/Class | Spesifikasi |
|---|---|---|
| Body | `text-sm` (14px) base | line-height 1.5, panjang baris < 80 karakter |
| Judul halaman | `text-2xl font-medium tracking-tight` | sentence case, bukan ALL CAPS |
| Judul film di card | `text-sm font-medium` | 1 baris + truncate (lihat §5 Truncation) |
| Rating/vote TMDb | `text-xs tabular-nums` | angka stabil tak bergoyang |
| Meta (tahun, tipe) | `text-muted-foreground text-xs` | tanpa eyebrow label, tanpa middle-dot meta string |

Larangan (anti-tell): no italic/kata-tunggal-berwarna di headline, no ALL-CAPS label, no `→` di link, no monospace utk label data.

## 3. Warna — Cinema Dark

Konsolidasi query design-system ("Cinema dark + play red") ke token base-nova existing. Prinsip: UI hampir tanpa kromatik; satu aksen merah khusus CTA/rating aktif.

| Token | Dark (satu-satunya) | Peran |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Kanvas hampir hitam, senyap |
| `--foreground` | `oklch(0.985 0 0)` | Teks putih bersih |
| `--card` | `oklch(0.205 0 0)` | Permukaan kartu/hasil |
| `--primary` | `oklch(0.553 0.226 15.28)` (#E11D48 red) | CTA utama, rating aktif — "play red" |
| `--primary-foreground` | `oklch(0.985 0 0)` | Di atas merah |
| `--muted-foreground` | `oklch(0.708 0 0)` | Meta, placeholder |
| `--border` | `oklch(1 0 0 / 10%)` | Garis 10% putih, halus |
| `--destructive` | default shadcn | Hapus watchlist item |

Aturan:
- Aksen merah **hanya** untuk: primary CTA, state rating aktif, link aktif. Bukan dekorasi, bukan border, bukan chip genre.
- Genre chip = `bg-muted text-muted-foreground` — neutral, bukan berwarna per-genre.
- Kontras: body text 4.5:1 minimum, muted-foreground harus lolos 4.5:1 pada bg-background (verifikasi §8).
- Rating bintang aktif = merah primary; bintang non-aktif = muted. State bukan warna-saja: ada angka rating di sebelah.

## 4. Layout & Spacing

Grid poster 2:3 aspek film — universal, dihormati.

```
┌────────────────────────────────────────────┐
│ Cari…                    Watchlist (n)     │  ← nav: search input flex-1 + badge count
├────────────────────────────────────────────┤
│ [genre ▾] [Dari] [Sampai] [Film|Serial] [18+] │  ← bar filter (mode Discover), sticky saat scroll;
│                                              │     toggle Film/Serial default Film (ganti type =
│                                              │     reset genre); adult toggle default OFF
├────────────────────────────────────────────┤
│ ▢▢   ▢▢   ▢▢   ▢▢   ▢▢   ▢▢              │  ← grid poster: 2col @375px, 3 @640, 4 @768,
│ ▢▢   ▢▢   ▢▢   ▢▢   ▢▢   ▢▢              │     5 @1024, 6 @1280 (gap 16px)
│ ▢▢   ▢▢   ▢▢   ▢▢   ▢▢   ▢▢              │  ← load-more button di bawah, bukan infinite
├────────────────────────────────────────────┤
│              [ Muat lebih banyak ]         │
└────────────────────────────────────────────┘

Detail page:
┌────────────────────────────────────────────┐
│ ▓▓▓▓ backdrop TMDb (grayscale→dark grade) ▓▓│  ← poster besar overlap bottom-left,
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │     splash dominan viewport atas
│ ┌────┐ Judul (text-3xl)  [Film badge]      │
│ │pos │ meta: tahun · durasi · rating       │
│ └────┘ [Simpan ke Watchlist] [★ rating]    │
│          sinopsis | cast | trailer         │  ← tab/section scroll, bukan dropdown
└────────────────────────────────────────────┘
```

- Max-width konten 1280px, padding halaman 16px mobile / 24px desktop.
- Nav mobile: search input full-width baris 1, badge watchlist baris 2 — atau search flex-1 + watchlist icon-button dengan angka badge.
- Alignment: kiri. Tidak ada center-aligned body.
- Alignment poster grid: pertahankan rasio 2:3, `object-fit: cover`, width penuh kolom.

## 5. States & Interaksi

| State | Perlakuan |
|---|---|
| Loading search | Skeleton card grid (blok `bg-muted` rasio 2:3 + bar judul) — bukan spinner tengah. Nol CLS: slot tinggi tetap. |
| Loading detail | Skeleton poster + skeleton text block |
| Empty search (nol hasil) | "Tidak ada hasil untuk 'X'. Coba judul lain atau hapus filter." — ajakan, bukan dead end (ux rule: no-results = suggestions) |
| Error TMDb | "Pencarian gagal. [Coba lagi]" — sebut apa yang salah + cara pulih |
| Watchlist kosong | "Belum ada film disimpan. Cari judul untuk mulai." + ilustrasi/ikon Lucide `Clapperboard` besar muted |
| Hover poster card | scale 1.02 + poster sedikit terang (brightness 1.1), 200ms ease-out; **ada** outline ring untuk keyboard focus |
| Rating | Klik bintang → langsung set; klik bintang sama lagi → clear. Feedback: bintang terisi + angka |
| Add/remove watchlist | Toast kecil "Ditambahkan ke watchlist" / "Dihapus dari watchlist" dengan undo |
| Truncation judul | 1 baris truncate + `title` attr + halaman detail memuat judul penuh — full value selalu terjangkau |

## 6. Motion

- Durasi 150–250ms, ease-out. Satu kurva untuk semua.
- Entrance: hanya detail reveal sekali saat data ready. Grid hasil tanpa
  entrance — konten langsung tampil, karena frekuensi tinggi (search, filter,
  load-more berulang) dan stagger per-item kasar tanpa fill-mode (flash–hilang–muncul).
- `prefers-reduced-motion: reduce` → entrance dinonaktifkan penuh (konten
  langsung tampil); nol scale/brightness hover; toast muncul tanpa transisi.

## 7. Aksesibilitas floor

- Semua kontrol keyboard-reachable; focus ring `outline-ring/50` base-nova default dipertahankan (jangan override jadi invisible).
- Poster card = link ke detail (bukan div onClick).
- Icon-only button wajib `aria-label` (cth. tombol remove di watchlist).
- Rating bintang: `role="radiogroup"` + arrow-key nav, atau pakai `<select>` — pilih yang paling murah saat build.
- Badge count watchlist: `aria-label="Watchlist, N item"`.
- Alt poster: `"Poster {judul} ({tahun})"`; backdrop = `alt=""` dekoratif.

## 8. Pre-Delivery Checklist

- [ ] Nol emoji sebagai ikon (SVG Lucide saja)
- [ ] `cursor-pointer` semua elemen klik
- [ ] Hover transition 150–300ms
- [ ] Kontras body text >= 4.5:1 (light fallback + dark)
- [ ] Focus state terlihat keyboard nav
- [ ] `prefers-reduced-motion` dihormati
- [ ] Responsive 375 / 768 / 1024 / 1440
- [ ] `loading="lazy"` + `decoding="async"` semua poster di bawah fold
- [ ] Slot tinggi tetap utk poster (nol CLS)
- [ ] Empty/error state memakai copy §5
- [ ] Lighthouse: Perf >= 90, A11y >= 95 (PRD success criteria)
