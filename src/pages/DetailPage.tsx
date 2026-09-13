import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, ExternalLink, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stars } from '@/components/Stars'
import { detail, imageUrl, TmdbError } from '@/lib/tmdb'
import { detailInfoRows } from '@/lib/detail-info'
import type { DetailData } from '@/lib/types'
import { useWatchlist } from '@/lib/useWatchlist'
import { toastSuccess, toastWithUndo } from '@/lib/toast'

export default function DetailPage() {
  const { type, id } = useParams()
  const [data, setData] = useState<DetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const wl = useWatchlist()

  useEffect(() => {
    if (type !== 'movie' && type !== 'tv') return
    const n = Number(id)
    if (!Number.isInteger(n)) return
    setLoading(true)
    setError(null)
    detail(type, n)
      .then(setData)
      .catch((e) => setError(e instanceof TmdbError ? e.message : 'Gagal memuat detail.'))
      .finally(() => setLoading(false))
  }, [type, id])

  if (loading) {
    return (
      <div className="pt-6" aria-busy="true" aria-label="Memuat detail">
        <div className="h-64 w-full rounded-lg bg-muted" />
        <div className="mt-4 h-8 w-2/3 rounded bg-muted" />
        <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div role="alert" className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{error ?? 'Item tidak ditemukan.'}</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          Kembali ke pencarian
        </Button>
      </div>
    )
  }

  const key = { type: data.type, tmdbId: data.tmdbId }
  const saved = wl.has(key)
  const entry = wl.entries.find((e) => e.type === data.type && e.tmdbId === data.tmdbId)
  const poster = imageUrl(data.posterPath, 'w500')
  const backdrop = imageUrl(data.backdropPath, 'w1280')
  const asItem = { type: data.type, tmdbId: data.tmdbId, title: data.title, posterPath: data.posterPath, year: data.year, score: data.score }

  const toggleSave = () => {
    if (saved) {
      wl.remove(key)
      toastWithUndo('Dihapus dari watchlist', data.title, () => {
        if (entry) wl.restore(entry)
      })
    } else {
      wl.add(asItem)
      toastSuccess('Ditambahkan ke watchlist', data.title)
    }
  }

  const rate = (rating: number | null) => {
    if (saved) {
      wl.rate(key, rating)
    } else {
      // Q4b: auto-add ke watchlist + set rating
      wl.addRated(
        { type: data.type, tmdbId: data.tmdbId, title: data.title, posterPath: data.posterPath, year: data.year, score: data.score },
        rating,
      )
    }
  }

  return (
    <div>
      <div className="relative -mx-4 h-64 overflow-hidden sm:h-80" aria-hidden="true">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="size-full object-cover opacity-60 grayscale"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <Button variant="ghost" size="sm" className="-ms-2" render={<Link to="/" />}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali
      </Button>

      <div className="mt-4 flex animate-in fade-in slide-in-from-bottom-2 flex-col gap-6 duration-300 ease-out motion-reduce:animate-none sm:flex-row">
        <div className="w-36 shrink-0 sm:w-48">
          {poster ? (
            <img
              src={poster}
              alt={`Poster ${data.title}`}
              className="w-full rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-2/3 w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
              Tanpa poster
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.type === 'movie' ? 'Film' : 'Serial'}</Badge>
            {data.genres.slice(0, 3).map((g) => (
              <Badge key={g.id} variant="secondary" className="hidden sm:inline-flex">
                {g.name}
              </Badge>
            ))}
          </div>
          <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{data.title}</h1>
          {data.tagline && (
            <p className="mt-1.5 text-sm italic text-muted-foreground">{data.tagline}</p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {data.year && (
              <span className="flex items-center gap-1 tabular-nums">
                <Calendar className="size-3.5" aria-hidden="true" />
                {data.year}
              </span>
            )}
            {data.type === 'movie' && data.runtime !== null && (
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="size-3.5" aria-hidden="true" />
                {Math.floor(data.runtime / 60)}j {data.runtime % 60}m
              </span>
            )}
            {data.type === 'tv' && data.seasons !== null && (
              <span className="tabular-nums">{data.seasons} season</span>
            )}
            {data.score !== null && (
              <span className="flex items-center gap-1 tabular-nums">
                <Star className="size-3.5 fill-primary text-primary" aria-hidden="true" />
                {data.score.toFixed(1)} Skor TMDb
              </span>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant={saved ? 'secondary' : 'default'} onClick={toggleSave}>
              {saved ? 'Hapus dari watchlist' : 'Simpan ke watchlist'}
            </Button>
            <Stars value={entry?.rating ?? null} onChange={rate} label={`Rating ${data.title}`} />
          </div>

          {data.overview && (
            <section className="mt-6">
              <h2 className="sr-only">Sinopsis</h2>
              <p className="max-w-prose text-sm leading-relaxed text-card-foreground/90">{data.overview}</p>
            </section>
          )}

          {(() => {
            const rows = detailInfoRows(data)
            return rows.length > 0 ? (
              <section className="mt-6">
                <h2 className="text-sm font-medium">Informasi</h2>
                <dl className="mt-3 flex flex-col gap-2">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex flex-wrap gap-x-3">
                      <dt className="w-32 shrink-0 text-xs text-muted-foreground">{label}</dt>
                      <dd className="min-w-0 flex-1 text-xs text-card-foreground/90">{value}</dd>
                    </div>
                  ))}
                </dl>
                {data.imdbId && (
                  <a
                    href={`https://www.imdb.com/title/${data.imdbId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Lihat di IMDb
                    <span className="sr-only">buka di tab baru</span>
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                )}
              </section>
            ) : null
          })()}

          {data.providers && (
            <section className="mt-6">
              <h2 className="text-sm font-medium">Tempat menonton (Indonesia)</h2>
              <dl className="mt-3 flex flex-col gap-3">
                {(
                  [
                    ['Langganan', data.providers.flatrate],
                    ['Sewa', data.providers.rent],
                    ['Beli', data.providers.buy],
                  ] as const
                ).map(
                  ([label, list]) =>
                    list.length > 0 && (
                      <div key={label} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <dt className="w-20 shrink-0 text-xs text-muted-foreground">{label}</dt>
                        <dd className="flex flex-wrap gap-2">
                          {list.map((p) => (
                            <span
                              key={p.id}
                              className="flex items-center gap-2 rounded-md border border-border/60 bg-card/80 py-1 pe-2.5 ps-1.5 text-xs text-card-foreground"
                            >
                              {p.logoPath ? (
                                <img
                                  src={imageUrl(p.logoPath, 'w92') ?? ''}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="h-5 w-auto rounded-sm"
                                />
                              ) : null}
                              {p.name}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ),
                )}
              </dl>
            </section>
          )}

          {data.trailerKey && (
            <section className="mt-6">
              <h2 className="text-sm font-medium">Trailer</h2>
              <div className="mt-2 aspect-video w-full max-w-xl overflow-hidden rounded-lg border border-border">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${data.trailerKey}`}
                  title={`Trailer ${data.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            </section>
          )}

          {data.cast.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium">Pemain utama</h2>
              <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                {data.cast.map((c) => (
                  <li key={c.id} className="text-sm">
                    <Link
                      to={`/person/${c.id}`}
                      className="cursor-pointer text-card-foreground/90 underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:rounded-sm focus-visible:ring-ring/50 outline-none"
                    >
                      {c.name}
                    </Link>
                    {c.character && <span className="text-muted-foreground"> sebagai {c.character}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
