import { describe, expect, it } from 'vitest'
import { buildDiscoverParams, buildSearchParams, normalizeItem } from './tmdb'

const raw = {
  id: 27205,
  media_type: 'movie',
  title: 'Inception',
  release_date: '2010-07-15',
  poster_path: '/9gk7adHYeDvHkCSEqAvQ5VnvoA5.jpg',
  vote_average: 8.4,
}

describe('normalizeItem', () => {
  it('mem pertahankan item movie valid', () => {
    const item = normalizeItem(raw)
    expect(item).toEqual({
      type: 'movie',
      tmdbId: 27205,
      title: 'Inception',
      posterPath: '/9gk7adHYeDvHkCSEqAvQ5VnvoA5.jpg',
      year: 2010,
      score: 8.4,
    })
  })

  it('buang hasil person', () => {
    expect(normalizeItem({ id: 1, media_type: 'person', name: 'X' } as never)).toBeNull()
  })

  it('buang media_type yang hilang (discover pakai forcedType)', () => {
    const { media_type: _drop, ...noType } = raw
    expect(normalizeItem(noType, 'movie')).not.toBeNull()
    expect(normalizeItem(noType)).toBeNull()
  })

  it('tv pakai name + first_air_date', () => {
    const item = normalizeItem({
      id: 1399,
      media_type: 'tv',
      name: 'Breaking Bad',
      first_air_date: '2008-01-20',
      vote_average: 8.9,
    })
    expect(item?.title).toBe('Breaking Bad')
    expect(item?.year).toBe(2008)
  })

  it('score 0 jadi null', () => {
    const item = normalizeItem({ ...raw, vote_average: 0 })
    expect(item?.score).toBeNull()
  })
})

describe('buildSearchParams', () => {
  it('search multi: query, page, include_adult=false', () => {
    expect(buildSearchParams('batman', 2)).toEqual({ query: 'batman', page: 2, include_adult: false })
  })
})

describe('buildDiscoverParams', () => {
  it('movie: primary_release_date + genres + adult', () => {
    expect(
      buildDiscoverParams({ genres: [28, 35], from: 1990, to: 2000, adult: false }, 'movie', 1),
    ).toEqual({
      page: 1,
      include_adult: false,
      with_genres: '28,35',
      'primary_release_date.gte': '1990-01-01',
      'primary_release_date.lte': '2000-12-31',
    })
  })

  it('tv: pakai first_air_date', () => {
    expect(buildDiscoverParams({ genres: [], from: 2020, to: null, adult: true }, 'tv', 3)).toEqual({
      page: 3,
      include_adult: true,
      'first_air_date.gte': '2020-01-01',
    })
  })

  it('tanpa filter = hanya page + adult', () => {
    expect(buildDiscoverParams({ genres: [], from: null, to: null, adult: false }, 'movie', 1)).toEqual({
      page: 1,
      include_adult: false,
    })
  })
})
