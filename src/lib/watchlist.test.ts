import { describe, expect, it } from 'vitest'
import {
  addEntry,
  addWithRating,
  mergeImport,
  parseWatchlist,
  removeEntry,
  restoreEntry,
  sameItem,
  serializeWatchlist,
  setRating,
  setWatched,
  sortWatchlist,
} from './watchlist'

const movie = { type: 'movie' as const, tmdbId: 1, title: 'A', posterPath: null, year: 2000, score: 7.5 }
const tv = { type: 'tv' as const, tmdbId: 2, title: 'B', posterPath: null, year: 2010, score: null }

describe('watchlist ops', () => {
  it('add baru di depan, duplikat diabaikan', () => {
    const l1 = addEntry([], movie)
    const l2 = addEntry(l1, tv)
    expect(l2.map((e) => e.title)).toEqual(['B', 'A'])
    expect(addEntry(l2, movie)).toBe(l2)
  })

  it('add dengan rating (auto-add Q4b)', () => {
    const l = addWithRating([], movie, 4)
    expect(l[0].rating).toBe(4)
    const l2 = addWithRating(l, movie, 2)
    expect(l2[0].rating).toBe(2)
    expect(l2).toHaveLength(1)
  })

  it('setRating: set, clear, item tak tersentuh', () => {
    const l1 = addEntry([], movie)
    expect(setRating(l1, movie, 5)[0].rating).toBe(5)
    expect(setRating(l1, movie, null)[0].rating).toBeNull()
  })

  it('rating di luar 1-5 jadi null', () => {
    const l = addEntry([], movie)
    expect(setRating(l, movie, 9)[0].rating).toBeNull()
  })

  it('restoreEntry: kembalikan snapshot persis (undo remove)', () => {
    const rated = { ...movie, addedAt: '2026-01-01T00:00:00.000Z', rating: 4, watched: true }
    const l = restoreEntry(removeEntry([rated], movie), rated)
    expect(l[0]).toEqual(rated)
    expect(restoreEntry([rated], rated)).toEqual([rated])
  })

  it('remove by type+tmdbId', () => {
    const l = addEntry(addEntry([], movie), tv)
    expect(removeEntry(l, movie)).toHaveLength(1)
    expect(removeEntry(l, movie)[0].title).toBe('B')
  })

  it('sameItem beda type = beda item', () => {
    expect(sameItem({ type: 'movie', tmdbId: 1 }, { type: 'tv', tmdbId: 1 })).toBe(false)
  })

  it('parse korup JSON → list kosong, bukan crash', () => {
    expect(parseWatchlist('{oops')).toEqual([])
    expect(parseWatchlist('[{"type":"film"}]')).toEqual([])
    expect(parseWatchlist(null)).toEqual([])
  })

  it('sort: added terbaru, rating desc null terakhir, title id-locale', () => {
    const base = [
      { ...movie, title: 'Bumi', addedAt: '2026-01-01', rating: 3, watched: false },
      { ...tv, title: 'Zeta', addedAt: '2026-02-01', rating: null, watched: false },
      { type: 'movie' as const, tmdbId: 3, title: 'api', posterPath: null, year: 2020, score: 1, addedAt: '2026-03-01', rating: 5, watched: true },
    ]
    expect(sortWatchlist(base, 'added')[0].title).toBe('api')
    expect(sortWatchlist(base, 'rating').map((e) => e.rating)).toEqual([5, 3, null])
    expect(sortWatchlist(base, 'title').map((e) => e.title)).toEqual(['api', 'Bumi', 'Zeta'])
  })

  it('serialize → parse roundtrip', () => {
    const l = addWithRating(addEntry([], movie), tv, 5)
    expect(parseWatchlist(serializeWatchlist(l))).toEqual(l)
  })

  it('mergeImport: duplikat dilewati, existing menang, entri baru di belakang', () => {
    const existing = [{ ...movie, addedAt: '2026-01-01', rating: 4, watched: true }]
    const incoming = [
      { ...movie, addedAt: '2020-05-05', rating: null, watched: false }, // duplikat — existing menang
      { ...tv, addedAt: '2020-06-06', rating: 2, watched: false },
    ]
    const merged = mergeImport(existing, incoming)
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual(existing[0])
    expect(merged[1].addedAt).toBe('2020-06-06')
  })

  it('setWatched: toggle, item tak tersentuh, entri baru default false', () => {
    const l = addEntry([], movie)
    expect(l[0].watched).toBe(false)
    const w = setWatched(l, movie, true)
    expect(w[0].watched).toBe(true)
    expect(setWatched(w, movie, false)[0].watched).toBe(false)
  })

  it('parse: data lama tanpa watched → false, string seen → false (bukan truthy)', () => {
    const legacy = JSON.stringify([{ ...movie, addedAt: '2026-01-01', rating: null }])
    expect(parseWatchlist(legacy)[0].watched).toBe(false)
    const bad = JSON.stringify([{ ...movie, addedAt: '2026-01-01', rating: null, watched: 'yes' }])
    expect(parseWatchlist(bad)[0].watched).toBe(false)
  })
})
