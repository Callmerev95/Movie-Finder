import type { Filters, MediaType, SearchMode } from './types'

export interface UrlState {
  mode: SearchMode
  query: string
  type: MediaType
  filters: Filters
}

export function parseUrlState(params: URLSearchParams): UrlState {
  const genres = (params.get('genres') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
  const from = yearParam(params.get('from'))
  const to = yearParam(params.get('to'))
  const q = params.get('q') ?? ''
  const type = params.get('type') === 'tv' ? 'tv' : 'movie'
  const hasFilters = genres.length > 0 || from !== null || to !== null
  const modeParam = params.get('mode')
  const mode: SearchMode =
    modeParam === 'discover' || modeParam === 'search' ? modeParam : q ? 'search' : hasFilters ? 'discover' : 'search'
  return {
    mode,
    query: q,
    type,
    filters: { genres, from, to, adult: params.get('adult') === '1' },
  }
}

function yearParam(v: string | null): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : null
}

export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  const f = state.filters
  params.set('mode', state.mode)
  if (state.mode === 'search' && state.query) params.set('q', state.query)
  if (state.mode === 'discover') {
    params.set('type', state.type)
    if (f.genres.length > 0) params.set('genres', f.genres.join(','))
    if (f.from !== null) params.set('from', String(f.from))
    if (f.to !== null) params.set('to', String(f.to))
    if (f.adult) params.set('adult', '1')
  }
  const s = params.toString().replace(/%2C/g, ',')
  return s ? `?${s}` : ''
}
