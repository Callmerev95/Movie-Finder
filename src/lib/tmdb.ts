import { get, TmdbError } from './tmdb-fetch'
import type { DetailData, Genre, Item, Paged, Filters, MediaType, PersonDetail, Provider, ProviderSections } from './types'

interface RawMultiResult {
  id: number
  media_type?: string
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
  poster_path?: string | null
  vote_average?: number
}

interface RawPaged {
  page: number
  total_pages: number
  total_results: number
  results: RawMultiResult[]
}

interface RawGenreList {
  genres: { id: number; name: string }[]
}

interface RawDetail {
  id: number
  title?: string
  name?: string
  tagline?: string
  status?: string
  overview?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  vote_count?: number
  genres?: { id: number; name: string }[]
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  last_air_date?: string
  budget?: number
  revenue?: number
  original_title?: string
  original_name?: string
  original_language?: string
  imdb_id?: string
  homepage?: string
  production_companies?: { id: number; name: string }[]
  production_countries?: { iso_3166_1: string; name: string }[]
  created_by?: { id: number; name: string }[]
  networks?: { id: number; name: string }[]
  credits?: { cast?: RawCast[]; crew?: RawCrew[] }
  videos?: { results?: RawVideo[] }
  'watch/providers'?: RawProviders
}

interface RawCast {
  id: number
  name: string
  character?: string
  profile_path?: string | null
}

interface RawCrew {
  id: number
  name: string
  job?: string
}

interface RawVideo {
  key: string
  site: string
  type: string
  official?: boolean
}

interface RawProvider {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

interface RawProviders {
  id: number
  results?: { ID?: { flatrate?: RawProvider[]; rent?: RawProvider[]; buy?: RawProvider[] } }
}

interface RawProviderList {
  results: RawProvider[]
}

function year(date?: string): number | null {
  if (!date) return null
  const y = Number(date.slice(0, 4))
  return Number.isFinite(y) && y > 0 ? y : null
}

function itemTitle(raw: RawMultiResult): string {
  return raw.title ?? raw.name ?? 'Tanpa judul'
}

export function normalizeItem(raw: RawMultiResult, forcedType?: MediaType): Item | null {
  const type = (forcedType ?? raw.media_type) as MediaType | undefined
  if (type !== 'movie' && type !== 'tv') return null
  return {
    type,
    tmdbId: raw.id,
    title: itemTitle(raw),
    posterPath: raw.poster_path ?? null,
    year: year(raw.release_date ?? raw.first_air_date),
    score: typeof raw.vote_average === 'number' && raw.vote_average > 0 ? raw.vote_average : null,
  }
}

export function buildSearchParams(query: string, page: number): Record<string, string | number | boolean> {
  return { query, page, include_adult: false }
}

export function buildDiscoverParams(
  filters: Filters,
  type: MediaType,
  page: number,
  today = new Date().toISOString().slice(0, 10),
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = { page, include_adult: filters.adult }
  if (filters.genres.length > 0) params.with_genres = filters.genres.join(',')
  if (filters.from !== null) params['primary_release_date.gte'] = `${filters.from}-01-01`
  if (filters.to !== null) params['primary_release_date.lte'] = `${filters.to}-12-31`
  if (filters.provider !== null) {
    params.watch_region = 'ID'
    params.with_watch_providers = filters.provider
  }
  if (filters.indonesia) {
    // movie: bahasa asli id; tv: negara produksi ID (param bahasa tak ada di tv)
    if (type === 'movie') params.with_original_language = 'id'
    else params.with_origin_country = 'ID'
    // konten Indonesia = terbaru dulu; cap hari ini cegah film belum tayang
    // (cap tahun user `to` menang bila eksplisit)
    params.sort_by = type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc'
    if (filters.to === null) params['primary_release_date.lte'] = today
  }
  if (type === 'tv') {
    // primary_release_date = first_air_date di discover tv
    params['first_air_date.gte'] = params['primary_release_date.gte']
    params['first_air_date.lte'] = params['primary_release_date.lte']
    delete params['primary_release_date.gte']
    delete params['primary_release_date.lte']
  }
  return params
}

function pagedOf(raw: RawPaged, forcedType?: MediaType): Paged<Item> {
  return {
    items: raw.results.map((r) => normalizeItem(r, forcedType)).filter((i): i is Item => i !== null),
    total: raw.total_results,
    page: raw.page,
    totalPages: Math.min(raw.total_pages, 500),
  }
}

export function searchByTitle(query: string, page = 1): Promise<Paged<Item>> {
  return get<RawPaged>('/search/multi', buildSearchParams(query, page)).then((r) => pagedOf(r))
}

export function discover(filters: Filters, type: MediaType, page = 1): Promise<Paged<Item>> {
  return get<RawPaged>(`/discover/${type}`, buildDiscoverParams(filters, type, page)).then((r) => pagedOf(r, type))
}

export function providerList(type: MediaType): Promise<Provider[]> {
  return get<RawProviderList>(`/watch/providers/${type}`, { watch_region: 'ID' }).then((r) =>
    r.results
      .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? null }))
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID')),
  )
}

export function trending(adult = false): Promise<Paged<Item>> {
  return get<RawPaged>('/trending/all/week', { include_adult: adult }).then((r) => pagedOf(r))
}

export function genreList(type: MediaType): Promise<Genre[]> {
  return get<RawGenreList>(`/genre/${type}/list`, {}).then((r) => r.genres)
}

export function normalizeProviders(raw: RawProviders['results']): ProviderSections | null {
  const id = raw?.ID
  if (!id) return null
  const of = (list?: RawProvider[]) => (list ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? null }))
  const flatrate = of(id.flatrate)
  const rent = of(id.rent)
  const buy = of(id.buy)
  if (flatrate.length === 0 && rent.length === 0 && buy.length === 0) return null
  return { flatrate, rent, buy }
}

export function normalizeDetail(raw: RawDetail, type: MediaType): DetailData {
  const yt = raw.videos?.results?.filter((v) => v.site === 'YouTube') ?? []
  const trailer =
    yt.find((v) => v.type === 'Trailer' && v.official) ??
    yt.find((v) => v.type === 'Trailer') ??
    yt.find((v) => v.type === 'Teaser' && v.official) ??
    yt.find((v) => v.type === 'Teaser')
  const money = (n?: number) => (typeof n === 'number' && n > 0 ? n : null)
  const names = (list?: { name: string }[]) => (list ?? []).map((c) => c.name)
  return {
    type,
    tmdbId: raw.id,
    title: raw.title ?? raw.name ?? 'Tanpa judul',
    tagline: raw.tagline ?? '',
    status: raw.status ?? null,
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    year: year(raw.release_date ?? raw.first_air_date),
    score: typeof raw.vote_average === 'number' && raw.vote_average > 0 ? raw.vote_average : null,
    voteCount: typeof raw.vote_count === 'number' && raw.vote_count > 0 ? raw.vote_count : null,
    overview: raw.overview ?? '',
    genres: raw.genres ?? [],
    runtime: typeof raw.runtime === 'number' ? raw.runtime : null,
    seasons: typeof raw.number_of_seasons === 'number' ? raw.number_of_seasons : null,
    episodes: typeof raw.number_of_episodes === 'number' ? raw.number_of_episodes : null,
    lastAirDate: raw.last_air_date ?? null,
    budget: money(raw.budget),
    revenue: money(raw.revenue),
    originalTitle: raw.original_title ?? raw.original_name ?? null,
    originalLanguage: raw.original_language ?? null,
    imdbId: raw.imdb_id ?? null,
    productionCompanies: names(raw.production_companies),
    countries: names(raw.production_countries),
    directors: (raw.credits?.crew ?? []).filter((c) => c.job === 'Director').map((c) => c.name),
    creators: names(raw.created_by),
    networks: names(raw.networks),
    cast: (raw.credits?.cast ?? []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? '',
      profilePath: c.profile_path ?? null,
    })),
    trailerKey: trailer?.key ?? null,
    providers: normalizeProviders(raw['watch/providers']?.results),
  }
}

export function detail(type: MediaType, id: number): Promise<DetailData> {
  return get<RawDetail>(`/${type}/${id}`, {
    append_to_response: 'videos,credits,watch/providers',
    include_video_language: 'id,en,null',
  }).then((r) => normalizeDetail(r, type))
}

interface RawPerson {
  id: number
  name?: string
  biography?: string
  profile_path?: string | null
  known_for_department?: string
  birthday?: string | null
  deathday?: string | null
  place_of_birth?: string | null
  combined_credits?: { cast?: (RawMultiResult & { character?: string })[] }
}

// filmografi: popularitas TMDb tinggi dulu, cap 24, duplikat id+type dibuang
export function normalizePersonCredits(raw: RawPerson): Item[] {
  const items = (raw.combined_credits?.cast ?? [])
    .map((r) => normalizeItem(r))
    .filter((i): i is Item => i !== null)
  const seen = new Set<string>()
  return items
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .filter((i) => {
      const k = `${i.type}-${i.tmdbId}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, 24)
}

export function normalizePerson(raw: RawPerson): PersonDetail {
  return {
    id: raw.id,
    name: raw.name ?? 'Tanpa nama',
    biography: raw.biography ?? '',
    profilePath: raw.profile_path ?? null,
    knownFor: raw.known_for_department ?? null,
    birthday: raw.birthday ?? null,
    deathday: raw.deathday ?? null,
    placeOfBirth: raw.place_of_birth ?? null,
    credits: normalizePersonCredits(raw),
  }
}

export function person(id: number): Promise<PersonDetail> {
  return get<RawPerson>(`/person/${id}`, { append_to_response: 'combined_credits' }).then(normalizePerson)
}

export { TmdbError }

export function imageUrl(path: string | null, size = 'w342'): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
