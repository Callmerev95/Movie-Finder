import { get, TmdbError } from './tmdb-fetch'
import type { DetailData, Genre, Item, Paged, Filters, MediaType } from './types'

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
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  overview?: string
  genres?: { id: number; name: string }[]
  runtime?: number
  number_of_seasons?: number
  credits?: { cast?: RawCast[] }
  videos?: { results?: RawVideo[] }
}

interface RawCast {
  id: number
  name: string
  character?: string
  profile_path?: string | null
}

interface RawVideo {
  key: string
  site: string
  type: string
  official?: boolean
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

export function buildDiscoverParams(filters: Filters, type: MediaType, page: number): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = { page, include_adult: filters.adult }
  if (filters.genres.length > 0) params.with_genres = filters.genres.join(',')
  if (filters.from !== null) params['primary_release_date.gte'] = `${filters.from}-01-01`
  if (filters.to !== null) params['primary_release_date.lte'] = `${filters.to}-12-31`
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

export function trending(adult = false): Promise<Paged<Item>> {
  return get<RawPaged>('/trending/all/week', { include_adult: adult }).then((r) => pagedOf(r))
}

export function genreList(type: MediaType): Promise<Genre[]> {
  return get<RawGenreList>(`/genre/${type}/list`, {}).then((r) => r.genres)
}

export function normalizeDetail(raw: RawDetail, type: MediaType): DetailData {
  const trailer =
    raw.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    raw.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
  return {
    type,
    tmdbId: raw.id,
    title: raw.title ?? raw.name ?? 'Tanpa judul',
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    year: year(raw.release_date ?? raw.first_air_date),
    score: typeof raw.vote_average === 'number' && raw.vote_average > 0 ? raw.vote_average : null,
    overview: raw.overview ?? '',
    genres: raw.genres ?? [],
    runtime: typeof raw.runtime === 'number' ? raw.runtime : null,
    seasons: typeof raw.number_of_seasons === 'number' ? raw.number_of_seasons : null,
    cast: (raw.credits?.cast ?? []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? '',
      profilePath: c.profile_path ?? null,
    })),
    trailerKey: trailer?.key ?? null,
  }
}

export function detail(type: MediaType, id: number): Promise<DetailData> {
  return get<RawDetail>(`/${type}/${id}`, { append_to_response: 'videos,credits' }).then((r) =>
    normalizeDetail(r, type),
  )
}

export { TmdbError }

export function imageUrl(path: string | null, size = 'w342'): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}
