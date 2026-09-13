const BASE = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined

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
  if (!API_KEY) throw new TmdbError('API key TMDb belum diatur (VITE_TMDB_API_KEY).')
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'id-ID')
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
  }
  const key = url.toString()
  if (cache.has(key)) return cache.get(key) as T
  const res = await fetch(key)
  if (!res.ok) throw new TmdbError(`TMDb merespons ${res.status}.`, res.status)
  const data = (await res.json()) as T
  cache.set(key, data)
  return data
}

// ponytail: session Map cache, cukup untuk app client tunggal; TTL/invalidasi bila data TMDb berubah penting
export function clearTmdbCache() {
  cache.clear()
}
