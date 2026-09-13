import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/SearchBar'
import { Filters } from '@/components/Filters'
import { ResultCard } from '@/components/ResultCard'
import { Button } from '@/components/ui/button'
import { Clapperboard, RotateCcw } from 'lucide-react'
import { discover, searchByTitle, TmdbError } from '@/lib/tmdb'
import { parseUrlState, serializeUrlState } from '@/lib/url-state'
import { toastInfo } from '@/lib/toast'
import type { Item, MediaType } from '@/lib/types'

export default function SearchPage() {
  const [, setParams] = useSearchParams()
  const { search } = useLocation()
  // state di-memo key string URL: parseUrlState bikin objek baru tiap panggil,
  // tanpa memo filters selalu referensi baru → fetchFirst recreate → useEffect
  // fire ulang tiap render (infinite fetch loop, halaman stuck)
  const state = useMemo(() => parseUrlState(new URLSearchParams(search)), [search])

  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pagesLoaded = useRef(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const mode = state.mode
  const query = state.query
  const type = state.type
  const filters = state.filters

  const fetchFirst = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true)
      setError(null)
      setItems([])
      pagesLoaded.current = 0
      try {
        const r = mode === 'search' ? await searchByTitle(query, 1) : await discover(filters, type, 1)
        if (signal.aborted) return
        setItems(r.items)
        setTotal(r.total)
        pagesLoaded.current = 1
      } catch (e) {
        if (signal.aborted) return
        setError(e instanceof TmdbError ? e.message : 'Terjadi kesalahan tak terduga.')
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    },
    [mode, query, type, filters],
  )

  useEffect(() => {
    if (mode === 'search' && !query) return
    const ctrl = new AbortController()
    void fetchFirst(ctrl.signal)
    return () => ctrl.abort()
  }, [mode, query, fetchFirst])

  const loadMore = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    try {
      const next = pagesLoaded.current + 1
      const r = mode === 'search' ? await searchByTitle(query, next) : await discover(filters, type, next)
      setItems((prev) => [...prev, ...r.items])
      pagesLoaded.current = next
    } catch (e) {
      setError(e instanceof TmdbError ? e.message : 'Gagal memuat halaman berikutnya.')
    } finally {
      setLoadingMore(false)
    }
  }

  const update = (next: { type?: MediaType; filters: typeof filters }) => {
    const s = serializeUrlState({
      mode: 'discover',
      query,
      type: next.type ?? type,
      filters: next.filters,
    })
    setParams(new URLSearchParams(s))
  }

  const submitSearch = (q: string) => {
    // Q7a: submit teks saat filter aktif → switch Search mode, filter clear
    const hadFilters =
      filters.genres.length > 0 || filters.from !== null || filters.to !== null || filters.adult
    setParams(new URLSearchParams(q ? `?mode=search&q=${encodeURIComponent(q)}` : ''))
    return hadFilters && q
  }

  return (
    <div className="pt-4">
      <SearchBar
        initial={query}
        onSubmit={(q) => {
          const cleared = submitSearch(q)
          if (cleared) {
            toastInfo('Filter dihapus', 'Pencarian judul tidak mendukung genre/tahun.')
          }
        }}
      />

      <div className="mt-4">
        <Filters type={type} filters={filters} onChange={update} />
      </div>

      {error && (
        <div role="alert" className="mt-8 flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => void fetchFirst(new AbortController().signal)}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i}>
              <div className="aspect-2/3 rounded-lg bg-muted" />
              <div className="mt-2 h-3.5 w-3/4 rounded bg-muted" />
              <div className="mt-1.5 h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && mode === 'search' && !query && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Clapperboard className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Cari judul film atau serial, atau pakai filter genre di atas untuk menjelajah.
          </p>
        </div>
      )}

      {!loading && !error && ((mode === 'search' && query) || mode === 'discover') && items.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Clapperboard className="size-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Tidak ada hasil{query ? ` untuk "${query}"` : ''}. Coba judul lain atau hapus filter.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="mt-6 text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {total.toLocaleString('id-ID')} hasil
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item, i) => (
              <div
                key={`${item.type}-${item.tmdbId}`}
                className="animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out motion-reduce:animate-none"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              >
                <ResultCard item={item} />
              </div>
            ))}
          </div>
          {items.length < total && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? 'Memuat…' : 'Muat lebih banyak'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
