import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Item } from './types'
import {
  addEntry,
  addWithRating,
  parseWatchlist,
  removeEntry,
  serializeWatchlist,
  setRating,
  WATCHLIST_STORAGE_KEY,
  type WatchlistEntry,
} from './watchlist'

interface WatchlistApi {
  entries: WatchlistEntry[]
  has: (key: Pick<Item, 'type' | 'tmdbId'>) => boolean
  add: (item: Item) => void
  addRated: (item: Item, rating: number | null) => void
  remove: (key: Pick<Item, 'type' | 'tmdbId'>) => void
  rate: (key: Pick<Item, 'type' | 'tmdbId'>, rating: number | null) => void
}

const WatchlistContext = createContext<WatchlistApi | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WatchlistEntry[]>(() => parseWatchlist(localStorage.getItem(WATCHLIST_STORAGE_KEY)))

  useEffect(() => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, serializeWatchlist(entries))
  }, [entries])

  const api = useMemo<WatchlistApi>(
    () => ({
      entries,
      has: (key) => entries.some((e) => e.type === key.type && e.tmdbId === key.tmdbId),
      add: (item) => setEntries((l) => addEntry(l, item)),
      addRated: (item, rating) => setEntries((l) => addWithRating(l, item, rating)),
      remove: (key) => setEntries((l) => removeEntry(l, key)),
      rate: (key, rating) => setEntries((l) => setRating(l, key, rating)),
    }),
    [entries],
  )

  return <WatchlistContext.Provider value={api}>{children}</WatchlistContext.Provider>
}

export function useWatchlist(): WatchlistApi {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist harus dipakai di dalam WatchlistProvider')
  return ctx
}
