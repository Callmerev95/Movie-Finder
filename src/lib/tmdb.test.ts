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
  const base = { from: null, to: null, adult: false, provider: null, indonesia: false }

  it('movie: primary_release_date + genres + adult', () => {
    expect(
      buildDiscoverParams({ ...base, genres: [28, 35], from: 1990, to: 2000 }, 'movie', 1),
    ).toEqual({
      page: 1,
      include_adult: false,
      with_genres: '28,35',
      'primary_release_date.gte': '1990-01-01',
      'primary_release_date.lte': '2000-12-31',
    })
  })

  it('tv: pakai first_air_date', () => {
    expect(buildDiscoverParams({ ...base, genres: [], from: 2020, to: null, adult: true }, 'tv', 3)).toEqual({
      page: 3,
      include_adult: true,
      'first_air_date.gte': '2020-01-01',
    })
  })

  it('provider → watch_region ID + with_watch_providers', () => {
    expect(buildDiscoverParams({ ...base, genres: [], provider: 8 }, 'tv', 1)).toEqual({
      page: 1,
      include_adult: false,
      watch_region: 'ID',
      with_watch_providers: 8,
    })
  })

  it('indonesia: movie pakai with_original_language + sort terbaru + cap hari ini, tv pakai with_origin_country', () => {
    expect(buildDiscoverParams({ ...base, genres: [], indonesia: true }, 'movie', 1, '2026-09-13')).toEqual({
      page: 1,
      include_adult: false,
      with_original_language: 'id',
      sort_by: 'primary_release_date.desc',
      'primary_release_date.lte': '2026-09-13',
    })
    expect(buildDiscoverParams({ ...base, genres: [], indonesia: true }, 'tv', 1, '2026-09-13')).toEqual({
      page: 1,
      include_adult: false,
      with_origin_country: 'ID',
      sort_by: 'first_air_date.desc',
      'first_air_date.lte': '2026-09-13',
    })
  })

  it('indonesia + tahun `to` eksplisit: cap tahun user menang, sort tetap terbaru', () => {
    expect(buildDiscoverParams({ ...base, genres: [], indonesia: true, to: 2020 }, 'movie', 1, '2026-09-13')).toEqual({
      page: 1,
      include_adult: false,
      with_original_language: 'id',
      sort_by: 'primary_release_date.desc',
      'primary_release_date.lte': '2020-12-31',
    })
  })

  it('kombinasi: genre + tahun + provider + indonesia + tv', () => {
    expect(
      buildDiscoverParams({ ...base, genres: [18], from: 2000, provider: 119, indonesia: true }, 'tv', 2, '2026-09-13'),
    ).toEqual({
      page: 2,
      include_adult: false,
      with_genres: '18',
      'first_air_date.gte': '2000-01-01',
      'first_air_date.lte': '2026-09-13',
      sort_by: 'first_air_date.desc',
      watch_region: 'ID',
      with_watch_providers: 119,
      with_origin_country: 'ID',
    })
  })

  it('tanpa filter = hanya page + adult', () => {
    expect(buildDiscoverParams({ ...base, genres: [] }, 'movie', 1)).toEqual({
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

describe('normalizePerson', () => {
  const raw = {
    id: 5292,
    name: 'Leonardo DiCaprio',
    biography: 'Seorang aktor Amerika.',
    profile_path: '/l.jpg',
    known_for_department: 'Acting',
    birthday: '1974-11-11',
    deathday: null,
    place_of_birth: 'Los Angeles, California, USA',
    combined_credits: {
      cast: [
        { id: 27205, media_type: 'movie', title: 'Inception', release_date: '2010-07-15', vote_average: 8.4 },
        { id: 27205, media_type: 'movie', title: 'Inception', release_date: '2010-07-15', vote_average: 8.4 },
        { id: 634649, media_type: 'movie', title: 'Joker', release_date: '2019-10-02', vote_average: 8.2 },
        { id: 1399, media_type: 'tv', name: 'Breaking Bad', first_air_date: '2008-01-20', vote_average: 8.9 },
        { id: 1, media_type: 'person', name: 'X' },
        { id: 615, media_type: 'movie', title: 'Titanic', release_date: '1997-11-01', vote_average: 0 },
      ],
    },
  }

  it('filmografi: skor tinggi dulu, duplikat dibuang, person dibuang, cap 24', async () => {
    const { normalizePerson } = await import('./tmdb')
    const p = normalizePerson(raw)
    expect(p.credits.map((i) => i.title)).toEqual(['Breaking Bad', 'Inception', 'Joker', 'Titanic'])
    expect(p.name).toBe('Leonardo DiCaprio')
    expect(p.knownFor).toBe('Acting')
  })

  it('cap 24 item', async () => {
    const { normalizePerson } = await import('./tmdb')
    const many = {
      ...raw,
      combined_credits: {
        cast: Array.from({ length: 40 }, (_, i) => ({
          id: i,
          media_type: 'movie',
          title: `F${i}`,
          vote_average: 5,
        })),
      },
    }
    expect(normalizePerson(many).credits).toHaveLength(24)
  })

  it('combined_credits kosong → credits kosong, field null aman', async () => {
    const { normalizePerson } = await import('./tmdb')
    const p = normalizePerson({ id: 1, name: 'X' })
    expect(p.credits).toEqual([])
    expect(p.biography).toBe('')
    expect(p.knownFor).toBeNull()
  })
})

describe('person', () => {
  it('endpoint /person/{id} + append combined_credits', async () => {
    const { person } = await import('./tmdb')
    await person(5292)
    expect(trendingCalls.at(-1)).toEqual({ path: '/person/5292', params: { append_to_response: 'combined_credits' } })
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

describe('normalizeDetail enrichment', () => {
  const base = { id: 27205, title: 'Inception', release_date: '2010-07-15', vote_average: 8.4 }

  it('trailer chain: official > trailer > teaser official > teaser', async () => {
    const { normalizeDetail } = await import('./tmdb')
    const videos = (list: [string, boolean?][]) => ({
      results: list.map(([type, official], i) => ({ key: `k${i}`, site: 'YouTube', type, official })),
    })
    expect(
      normalizeDetail(
        { ...base, videos: videos([['Trailer', false], ['Teaser', true]]) },
        'movie',
      ).trailerKey,
    ).toBe('k0')
    expect(
      normalizeDetail({ ...base, videos: videos([['Teaser', false], ['Teaser', true]]) }, 'movie').trailerKey,
    ).toBe('k1')
    expect(normalizeDetail({ ...base, videos: videos([['Clip', true]]) }, 'movie').trailerKey).toBeNull()
    expect(
      normalizeDetail({ ...base, videos: { results: [{ key: 'x', site: 'Vimeo', type: 'Trailer' }] } }, 'movie')
        .trailerKey,
    ).toBeNull()
  })

  it('field movie: sutradara, uang 0 jadi null, imdb', async () => {
    const { normalizeDetail } = await import('./tmdb')
    const d = normalizeDetail(
      {
        ...base,
        tagline: 'Your mind is the scene of the crime.',
        status: 'Released',
        vote_count: 40158,
        budget: 160000000,
        revenue: 0,
        imdb_id: 'tt1375666',
        original_title: 'Inception',
        original_language: 'en',
        production_companies: [{ id: 1, name: 'Warner Bros. Pictures' }],
        production_countries: [{ iso_3166_1: 'US', name: 'United States of America' }],
        credits: { crew: [{ id: 1, name: 'Christopher Nolan', job: 'Director' }, { id: 2, name: 'X', job: 'Editor' }] },
      },
      'movie',
    )
    expect(d.tagline).toBe('Your mind is the scene of the crime.')
    expect(d.status).toBe('Released')
    expect(d.voteCount).toBe(40158)
    expect(d.budget).toBe(160000000)
    expect(d.revenue).toBeNull()
    expect(d.imdbId).toBe('tt1375666')
    expect(d.directors).toEqual(['Christopher Nolan'])
    expect(d.productionCompanies).toEqual(['Warner Bros. Pictures'])
  })

  it('field tv: creator, network, episode', async () => {
    const { normalizeDetail } = await import('./tmdb')
    const d = normalizeDetail(
      {
        id: 1399,
        name: 'Breaking Bad',
        first_air_date: '2008-01-20',
        vote_average: 8.9,
        number_of_seasons: 5,
        number_of_episodes: 62,
        last_air_date: '2013-09-29',
        created_by: [{ id: 1, name: 'Vince Gilligan' }],
        networks: [{ id: 2, name: 'HBO' }],
      },
      'tv',
    )
    expect(d.episodes).toBe(62)
    expect(d.lastAirDate).toBe('2013-09-29')
    expect(d.creators).toEqual(['Vince Gilligan'])
    expect(d.networks).toEqual(['HBO'])
    expect(d.originalTitle).toBeNull()
  })
})
