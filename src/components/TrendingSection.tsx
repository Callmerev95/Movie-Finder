import { useEffect, useState } from 'react'
import { ResultCard } from '@/components/ResultCard'
import { trending, TmdbError } from '@/lib/tmdb'
import type { Item } from '@/lib/types'

export function TrendingSection({ adult }: { adult: boolean }) {
  const [items, setItems] = useState<Item[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    trending(adult)
      .then((r) => {
        if (active) setItems(r.items)
      })
      .catch((e) => {
        if (active && e instanceof TmdbError) setError(true)
      })
    return () => {
      active = false
    }
  }, [adult])

  if (error) return null
  if (!items) return null

  return (
    <section className="mt-10" aria-label="Trending Minggu Ini">
      <h2 className="text-sm font-medium">Trending Minggu Ini</h2>
      <p className="mt-1 text-xs text-muted-foreground">Film dan serial paling ramai sepanjang minggu.</p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.slice(0, 20).map((item) => (
          <ResultCard key={`${item.type}-${item.tmdbId}`} item={item} />
        ))}
      </div>
    </section>
  )
}
