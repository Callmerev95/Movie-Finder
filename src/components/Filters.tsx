import { useEffect, useState } from 'react'
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
    <section aria-label="Filter" className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        aria-expanded={filters.genres.length > 0}
        onClick={() => {
          if (filters.genres.length > 0) onChange({ filters: { ...filters, genres: [] } })
        }}
      >
        <Filter className="size-3.5" aria-hidden="true" />
        Genre
        {filters.genres.length > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {filters.genres.length}
          </Badge>
        )}
      </Button>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pilih genre">
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

      <div className="flex items-center gap-1.5" role="group" aria-label="Tahun rilis">
        <Input
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="Dari"
          aria-label="Tahun dari"
          className="h-7 w-20 text-xs tabular-nums"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ filters: { ...filters, from: numYear(e.target.value) } })}
        />
        <span className="text-xs text-muted-foreground" aria-hidden="true">—</span>
        <Input
          type="number"
          inputMode="numeric"
          min={1900}
          max={2100}
          placeholder="Sampai"
          aria-label="Tahun sampai"
          className="h-7 w-20 text-xs tabular-nums"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ filters: { ...filters, to: numYear(e.target.value) } })}
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
