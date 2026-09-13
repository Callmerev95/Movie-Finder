import type { Item } from './types'

export interface WatchlistEntry extends Item {
  addedAt: string
  rating: number | null
  watched: boolean
}

export type SortKey = 'added' | 'rating' | 'title'

const KEY = 'movie-finder:watchlist'

export function sameItem(a: Pick<Item, 'type' | 'tmdbId'>, b: Pick<Item, 'type' | 'tmdbId'>): boolean {
  return a.type === b.type && a.tmdbId === b.tmdbId
}

export function parseWatchlist(json: string | null): WatchlistEntry[] {
  if (!json) return []
  try {
    const raw = JSON.parse(json) as WatchlistEntry[]
    if (!Array.isArray(raw)) return []
    return raw.filter(
      (e) =>
        e && typeof e === 'object' && (e.type === 'movie' || e.type === 'tv') && typeof e.tmdbId === 'number',
    ).map((e) => ({ ...e, watched: e.watched === true }))
  } catch {
    return []
  }
}

export function serializeWatchlist(list: WatchlistEntry[]): string {
  return JSON.stringify(list)
}

export function addEntry(list: WatchlistEntry[], item: Item): WatchlistEntry[] {
  if (list.some((e) => sameItem(e, item))) return list
  return [{ ...item, rating: null, watched: false, addedAt: new Date().toISOString() }, ...list]
}

// undo remove: kembalikan snapshot persis (rating + addedAt asli), bukan add() baru
export function restoreEntry(list: WatchlistEntry[], entry: WatchlistEntry): WatchlistEntry[] {
  if (list.some((e) => sameItem(e, entry))) return list
  return [entry, ...list]
}

export function removeEntry(list: WatchlistEntry[], key: Pick<Item, 'type' | 'tmdbId'>): WatchlistEntry[] {
  return list.filter((e) => !sameItem(e, key))
}

export function setRating(
  list: WatchlistEntry[],
  key: Pick<Item, 'type' | 'tmdbId'>,
  rating: number | null,
): WatchlistEntry[] {
  return list.map((e) =>
    sameItem(e, key) ? { ...e, rating: rating !== null && rating >= 1 && rating <= 5 ? rating : null } : e,
  )
}

// auto-add (Q4b): add + rate dalam satu operasi, data item penuh
export function addWithRating(list: WatchlistEntry[], item: Item, rating: number | null): WatchlistEntry[] {
  return setRating(addEntry(list, item), item, rating)
}

export function setWatched(
  list: WatchlistEntry[],
  key: Pick<Item, 'type' | 'tmdbId'>,
  watched: boolean,
): WatchlistEntry[] {
  return list.map((e) => (sameItem(e, key) ? { ...e, watched } : e))
}

// import: gabung, item existing menang persis (rating + addedAt tak ditimpa)
export function mergeImport(current: WatchlistEntry[], incoming: WatchlistEntry[]): WatchlistEntry[] {
  return [...current, ...incoming.filter((e) => !current.some((c) => sameItem(c, e)))]
}

export function sortWatchlist(list: WatchlistEntry[], sort: SortKey, locale = 'id'): WatchlistEntry[] {
  const copy = [...list]
  switch (sort) {
    case 'added':
      return copy.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    case 'rating':
      return copy.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.addedAt.localeCompare(a.addedAt))
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, locale))
  }
}

export { KEY as WATCHLIST_STORAGE_KEY }
