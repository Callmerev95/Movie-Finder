import { langOf, translate } from './i18n/dict'

const BASE = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined

// bahasa konten ikut bahasa UI — di-set dari LanguageProvider; default id-ID
let tmdbLanguage = 'id-ID'
export function setTmdbLanguage(lang: string) {
  tmdbLanguage = lang
}

const cache = new Map<string, unknown>()

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

export async function get<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const lang = langOf(tmdbLanguage)
  if (!API_KEY) throw new TmdbError(translate(lang, 'api.noKey'))
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', tmdbLanguage)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  const key = url.toString()
  if (cache.has(key)) return cache.get(key) as T
  const res = await fetch(key)
  if (!res.ok) throw new TmdbError(translate(lang, 'api.badStatus', { status: res.status }), res.status)
  const data = (await res.json()) as T
  cache.set(key, data)
  return data
}

// ponytail: session Map cache, cukup untuk app client tunggal; TTL/invalidasi bila data TMDb berubah penting
export function clearTmdbCache() {
  cache.clear()
}
