import { useEffect, useRef, useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { genreList } from '@/lib/tmdb'
import type { Filters, Genre, MediaType } from '@/lib/types'

interface Props {
  type: MediaType
  filters: Filters
  onChange: (next: { type?: MediaType; filters: Filters }) => void
}

export function Filters({ type, filters, onChange }: Props) {
  const [genres, setGenres] = useState<Genre[]>([])
  const [open, setOpen] = useState(true)

  useEffect(() => {
    // Q8a: genre ID beda per type — fetch per type, cache di tmdb-fetch
    let active = true
    genreList(type).then((g) => {
      if (active) setGenres(g)
    }).catch(() => {
      if (active) setGenres([])
    })
    return () => {
      active = false
    }
  }, [type])

  const toggleGenre = (id: number) => {
    const next = filters.genres.includes(id) ? filters.genres.filter((g) => g !== id) : [...filters.genres, id]
    onChange({ filters: { ...filters, genres: next } })
  }

  const setActive = (t: MediaType) => {
    if (t === type) return
    // Q8a: ganti type = reset pilihan genre (ID tidak kompatibel)
    onChange({ type: t, filters: { ...filters, genres: [] } })
  }

  return (
    <section aria-label="Filter" className="flex flex-wrap items-center gap-x-3 gap-y-3">
      <Button
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls="genre-chips"
        onClick={() => setOpen((o) => !o)}
      >
        <Filter className="size-3.5" aria-hidden="true" />
        Genre
        {filters.genres.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {filters.genres.length}
          </Badge>
        )}
      </Button>

      {open && (
        <div id="genre-chips" className="flex flex-wrap gap-1.5" role="group" aria-label="Pilih genre">
        {genres.map((g) => {
          const on = filters.genres.includes(g.id)
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              aria-pressed={on}
              className={
                'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ' +
                (on
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground hover:text-foreground')
              }
            >
              {g.name}
            </button>
          )
        })}
        {genres.length === 0 && <span className="text-xs text-muted-foreground">Memuat genre…</span>}
        </div>
      )}

      <div className="flex items-center gap-1.5" role="group" aria-label="Tahun rilis">
        <YearInput
          value={filters.from}
          onCommit={(from) => onChange({ filters: { ...filters, from } })}
          label="Tahun dari"
          placeholder="Dari"
        />
        <span className="text-xs text-muted-foreground" aria-hidden="true">—</span>
        <YearInput
          value={filters.to}
          onCommit={(to) => onChange({ filters: { ...filters, to } })}
          label="Tahun sampai"
          placeholder="Sampai"
        />
      </div>

      <div className="flex overflow-hidden rounded-lg border border-border" role="group" aria-label="Tipe konten">
        {(['movie', 'tv'] as MediaType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive(t)}
            aria-pressed={type === t}
            className={
              'cursor-pointer px-3 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ' +
              (type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')
            }
          >
            {t === 'movie' ? 'Film' : 'Serial'}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.adult}
          onChange={(e) => onChange({ filters: { ...filters, adult: e.target.checked } })}
          className="size-3.5 cursor-pointer accent-[var(--primary)]"
        />
        Konten dewasa (18+)
      </label>

      {(filters.genres.length > 0 || filters.from !== null || filters.to !== null || filters.adult) && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onChange({ filters: { genres: [], from: null, to: null, adult: false } })}
        >
          <X className="size-3" aria-hidden="true" />
          Hapus filter
        </Button>
      )}
    </section>
  )
}

function numYear(v: string): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : null
}

// Teks lokal bebas diketik ("19", "199") — commit angka valid-or-null ke filter.
// Tanpa ini controlled input value={filters.from} menelan tiap ketikan parsial
// karena numYear() selalu null untuk digit tak lengkap.
function YearInput({
  value,
  onCommit,
  label,
  placeholder,
}: {
  value: number | null
  onCommit: (v: number | null) => void
  label: string
  placeholder: string
}) {
  const [text, setText] = useState(value?.toString() ?? '')
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return
    prevValue.current = value
    // sync dari luar (Hapus filter, URL, ganti type) HANYA bila teks lokal tak
    // konsisten dengan nilai baru — hapus digit "1990"→"199" commit null tapi
    // teks "199" sudah konsisten dengan null, jangan timpa jadi ""
    if (numYear(text) !== value) setText(value?.toString() ?? '')
  }, [value, text])

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={1900}
      max={2100}
      placeholder={placeholder}
      aria-label={label}
      className="h-7 w-20 text-xs tabular-nums"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onCommit(numYear(e.target.value))
      }}
    />
  )
}
