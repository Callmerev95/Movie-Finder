export type MediaType = 'movie' | 'tv'

export interface Item {
  type: MediaType
  tmdbId: number
  title: string
  posterPath: string | null
  year: number | null
  score: number | null
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

export interface Genre {
  id: number
  name: string
}

export interface Filters {
  genres: number[]
  from: number | null
  to: number | null
  adult: boolean
  provider: number | null
  indonesia: boolean
}

export type SearchMode = 'search' | 'discover'

export interface CastMember {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export interface PersonDetail {
  id: number
  name: string
  biography: string
  profilePath: string | null
  knownFor: string | null
  birthday: string | null
  deathday: string | null
  placeOfBirth: string | null
  credits: Item[]
}

export interface Provider {
  id: number
  name: string
  logoPath: string | null
}

export interface ProviderSections {
  flatrate: Provider[]
  rent: Provider[]
  buy: Provider[]
}

export interface DetailData {
  type: MediaType
  tmdbId: number
  title: string
  tagline: string
  status: string | null
  posterPath: string | null
  backdropPath: string | null
  year: number | null
  score: number | null
  voteCount: number | null
  overview: string
  genres: Genre[]
  runtime: number | null
  seasons: number | null
  episodes: number | null
  lastAirDate: string | null
  budget: number | null
  revenue: number | null
  originalTitle: string | null
  originalLanguage: string | null
  imdbId: string | null
  productionCompanies: string[]
  countries: string[]
  directors: string[]
  creators: string[]
  networks: string[]
  cast: CastMember[]
  trailerKey: string | null
  providers: ProviderSections | null
}
