import { describe, expect, it } from 'vitest'
import { watchlistStats } from './stats'
import type { WatchlistEntry } from './watchlist'

const base: WatchlistEntry = {
  type: 'movie',
  tmdbId: 1,
  title: 'A',
  posterPath: null,
  year: 2020,
  score: 7,
  addedAt: '2026-09-01T00:00:00.000Z',
  rating: null,
  watched: false,
}

const entry = (over: Partial<WatchlistEntry>): WatchlistEntry => ({ ...base, ...over })

describe('watchlistStats', () => {
  it('kosong → semua nol, rata-rata null, bucket bulan tetap ada', () => {
    const s = watchlistStats([], 3, new Date('2026-09-13'))
    expect(s.total).toBe(0)
    expect(s.avgRating).toBeNull()
    expect(s.avgScore).toBeNull()
    expect(s.topRated).toEqual([])
    expect(s.byMonth.map((b) => b.month)).toEqual(['2026-07', '2026-08', '2026-09'])
    expect(s.distribution.every((d) => d.count === 0)).toBe(true)
  })

  it('hitung watched, type split, unrated, rata-rata', () => {
    const s = watchlistStats(
      [
        entry({ tmdbId: 1, rating: 5, watched: true, score: 8 }),
        entry({ tmdbId: 2, rating: 3, watched: false, score: 6, type: 'tv' }),
        entry({ tmdbId: 3, rating: null, watched: false, score: null }),
      ],
      6,
      new Date('2026-09-13'),
    )
    expect(s.total).toBe(3)
    expect(s.watched).toBe(1)
    expect(s.unwatched).toBe(2)
    expect(s.movies).toBe(2)
    expect(s.series).toBe(1)
    expect(s.unrated).toBe(1)
    expect(s.avgRating).toBe(4)
    expect(s.avgScore).toBe(7)
    expect(s.distribution.find((d) => d.rating === 5)?.count).toBe(1)
    expect(s.distribution.find((d) => d.rating === 3)?.count).toBe(1)
  })

  it('addedAt di luar jendela bulan tidak dihitung; tanggal rusak aman', () => {
    const s = watchlistStats(
      [
        entry({ tmdbId: 1, addedAt: '2020-01-01T00:00:00.000Z' }),
        entry({ tmdbId: 2, addedAt: 'bukan-tanggal' }),
        entry({ tmdbId: 3, addedAt: '2026-09-05T00:00:00.000Z' }),
      ],
      2,
      new Date('2026-09-13'),
    )
    expect(s.byMonth.map((b) => b.count)).toEqual([0, 1])
  })

  it('topRated: rating dulu lalu skor TMDb, cap 5', () => {
    const s = watchlistStats(
      [
        entry({ tmdbId: 1, rating: 4, score: 9 }),
        entry({ tmdbId: 2, rating: 5, score: 5 }),
        entry({ tmdbId: 3, rating: 5, score: 8 }),
        entry({ tmdbId: 4, rating: null, score: 10 }),
      ],
      6,
      new Date('2026-09-13'),
    )
    expect(s.topRated.map((e) => e.tmdbId)).toEqual([3, 2, 1])
  })
})
