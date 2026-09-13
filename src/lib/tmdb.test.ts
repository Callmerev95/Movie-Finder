import { describe, expect, it, vi } from 'vitest'

const trendingCalls: { path: string; params: Record<string, unknown> }[] = []
vi.mock('./tmdb-fetch', () => ({
  get: (path: string, params: Record<string, unknown>) => {
    trendingCalls.push({ path, params })
    return Promise.resolve({ page: 1, total_pages: 1, total_results: 1, results: [] })
  },
  TmdbError: class extends Error {},
}))

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

describe('trending', () => {
  it('endpoint /trending/all/week dengan include_adult', async () => {
    const { trending } = await import('./tmdb')
    await trending(true)
    expect(trendingCalls).toEqual([{ path: '/trending/all/week', params: { include_adult: true } }])
  })
})

describe('normalizeProviders', () => {
  it('map ID sections, buang section kosong via null bila semua kosong', async () => {
    const { normalizeProviders } = await import('./tmdb')
    const r = normalizeProviders({
      ID: {
        flatrate: [{ provider_id: 1, provider_name: 'Netflix', logo_path: '/n.png' }],
        rent: [{ provider_id: 2, provider_name: 'Apple TV', logo_path: null }],
        buy: [],
      },
    })
    expect(r).toEqual({
      flatrate: [{ id: 1, name: 'Netflix', logoPath: '/n.png' }],
      rent: [{ id: 2, name: 'Apple TV', logoPath: null }],
      buy: [],
    })
    expect(normalizeProviders({ ID: { flatrate: [], rent: [], buy: [] } })).toBeNull()
    expect(normalizeProviders({})).toBeNull()
    expect(normalizeProviders(undefined)).toBeNull()
  })
})
