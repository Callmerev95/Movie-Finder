import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { imageUrl } from '@/lib/tmdb'
import { sortWatchlist, type SortKey } from '@/lib/watchlist'
import { useWatchlist } from '@/lib/useWatchlist'
import { Stars } from '@/components/Stars'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'added', label: 'Terbaru ditambah' },
  { key: 'rating', label: 'Rating tertinggi' },
  { key: 'title', label: 'Judul A-Z' },
]

export default function WatchlistPage() {
  const { entries, rate, remove } = useWatchlist()
  const [sort, setSort] = useState<SortKey>('added')
  const sorted = useMemo(() => sortWatchlist(entries, sort), [entries, sort])

  if (entries.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <Bookmark className="size-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Belum ada film disimpan. Cari judul untuk mulai.</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Cari film
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-medium tracking-tight">Watchlist</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Urutkan watchlist">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            aria-pressed={sort === s.key}
            className={
              'cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ' +
              (sort === s.key
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-muted text-muted-foreground hover:text-foreground')
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {sorted.map((e) => (
          <li key={`${e.type}-${e.tmdbId}`} className="flex gap-3 rounded-lg border border-border p-3">
            <Link
              to={`/detail/${e.type}/${e.tmdbId}`}
              className="w-12 shrink-0 cursor-pointer overflow-hidden rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {e.posterPath ? (
                <img
                  src={imageUrl(e.posterPath, 'w185') ?? ''}
                  alt={`Poster ${e.title}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-2/3 w-full object-cover"
                />
              ) : (
                <div className="aspect-2/3 w-full bg-muted" />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/detail/${e.type}/${e.tmdbId}`}
                className="cursor-pointer truncate text-sm font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:rounded-sm focus-visible:ring-ring/50"
              >
                {e.title}
              </Link>
              <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{e.type === 'movie' ? 'Film' : 'Serial'}</Badge>
                {e.year && <span className="tabular-nums">{e.year}</span>}
                <span className="hidden sm:inline tabular-nums">
                  Ditambah {new Date(e.addedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </p>
              <div className="mt-2">
                <Stars
                  value={e.rating}
                  onChange={(v: number | null) => rate({ type: e.type, tmdbId: e.tmdbId }, v)}
                  label={`Rating ${e.title}`}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Hapus ${e.title} dari watchlist`}
              className="self-start text-destructive hover:bg-destructive/10"
              onClick={() => remove({ type: e.type, tmdbId: e.tmdbId })}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
