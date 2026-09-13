import type { WatchlistEntry } from './watchlist'

export interface RatingBucket {
  rating: number
  count: number
}

export interface MonthBucket {
  month: string // YYYY-MM
  label: string // "Sep 26"
  count: number
}

export interface WatchlistStats {
  total: number
  watched: number
  unwatched: number
  movies: number
  series: number
  unrated: number
  avgRating: number | null
  avgScore: number | null
  distribution: RatingBucket[]
  byMonth: MonthBucket[]
  topRated: WatchlistEntry[]
}

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d: Date): string {
  return `${MONTHS_ID[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
}

function mean(ns: (number | null | undefined)[]): number | null {
  const vals = ns.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (vals.length === 0) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

// agregasi murni dari entri lokal — nol fetch, hasil untuk StatsPage
export function watchlistStats(entries: WatchlistEntry[], monthsBack = 6, now = new Date()): WatchlistStats {
  const distribution: RatingBucket[] = [1, 2, 3, 4, 5].map((rating) => ({
    rating,
    count: entries.filter((e) => e.rating === rating).length,
  }))

  // bucket bulan: monthsBack bulan terakhir mundur dari `now`
  const buckets = new Map<string, MonthBucket>()
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    buckets.set(key, { month: key, label: monthLabel(d), count: 0 })
  }
  for (const e of entries) {
    const d = new Date(e.addedAt)
    if (Number.isNaN(d.getTime())) continue
    const b = buckets.get(monthKey(d))
    if (b) b.count += 1
  }

  const rated = entries.filter((e) => e.rating !== null)

  return {
    total: entries.length,
    watched: entries.filter((e) => e.watched).length,
    unwatched: entries.filter((e) => !e.watched).length,
    movies: entries.filter((e) => e.type === 'movie').length,
    series: entries.filter((e) => e.type === 'tv').length,
    unrated: entries.filter((e) => e.rating === null).length,
    avgRating: mean(rated.map((e) => e.rating)),
    avgScore: mean(entries.map((e) => e.score)),
    distribution,
    byMonth: [...buckets.values()],
    topRated: [...rated]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5),
  }
}
