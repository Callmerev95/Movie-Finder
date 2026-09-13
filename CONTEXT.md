# Movie Finder

Aplikasi pencarian film & serial via TMDb dengan watchlist dan rating pribadi
yang tersimpan lokal di browser.

## Language

**Watchlist**:
Daftar item yang disimpan pengguna untuk ditonton nanti, berisi metadata item
dan rating opsional.
_Avoid_: Bookmark, favorit, daftar simpanan

**Rating**:
Nilai 1-5 bintang yang diberikan pengguna pada item di watchlist-nya.
_Avoid_: Skor, ulasan, review

**Skor TMDb**:
Nilai rata-rata publik 0-10 dari TMDb (vote_average), ditampilkan apa adanya;
bukan Rating pengguna.
_Avoid_: Rating TMDb

**Item**:
Satu unit konten yang bisa dicari/disimpan — Film atau Serial. Selalu punya type
dan tmdbId.

**Film**:
Item konten sinema dengan durasi runtime. Type `movie`.

**Serial**:
Item konten episodik dengan jumlah season. Type `tv`.
_Avoid_: Series, acara

**Mode Pencarian**:
Status aktif grid hasil: Search (berdasar teks) atau Discover (berdasar filter
genre/tahun). Satu mode aktif pada satu waktu.

**Search**:
Mode pencarian teks bebas via endpoint multi TMDb.
_Avoid_: Pencarian judul

**Discover**:
Mode pencarian berdasar filter genre & rentang tahun via endpoint per-type TMDb.
_Avoid_: Jelajah

**Filter**:
Kondisi Discover: genre (multi), rentang tahun, type toggle, toggle adult.
_Avoid_: Sorting

**Type**:
Kategori konten item/fetch: Film atau Serial. Menentukan endpoint genre & discover.

**Tahun**:
Rentang From-To berapa konten dirilis. Input bebas, kosong berarti tanpa batas.
