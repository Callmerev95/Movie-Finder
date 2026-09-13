import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { imageUrl } from '@/lib/tmdb'
import type { Item } from '@/lib/types'
import { useWatchlist } from '@/lib/useWatchlist'
import { useLanguage } from '@/lib/useLanguage'
import { toastSuccess, toastWithUndo } from '@/lib/toast'

export function ResultCard({ item }: { item: Item }) {
  const { t } = useLanguage()
  const { has, add, remove, restore, entries } = useWatchlist()
  const saved = has(item)
  const poster = imageUrl(item.posterPath, 'w342')

  const toggle = () => {
    if (saved) {
      const entry = entries.find((e) => e.type === item.type && e.tmdbId === item.tmdbId)
      remove(item)
      toastWithUndo(t('common.toastRemoved'), item.title, () => {
        if (entry) restore(entry)
      })
    } else {
      add(item)
      toastSuccess(t('common.toastAdded'), item.title)
    }
  }

  return (
    <article className="group/card relative">
      <Link
        to={`/detail/${item.type}/${item.tmdbId}`}
        className="block cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="aspect-2/3 overflow-hidden rounded-lg bg-muted">
          {poster ? (
            <img
              src={poster}
              alt={t('common.poster', { title: item.title }) + (item.year ? ` (${item.year})` : '')}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-200 ease-out group-hover/card:scale-102 group-hover/card:brightness-110 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100 motion-reduce:group-hover/card:brightness-100"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              {t('common.noPoster')}
            </div>
          )}
        </div>
        <h3 className="mt-2 truncate text-sm font-medium" title={item.title}>
          {item.title}
        </h3>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.year && <span className="tabular-nums">{item.year}</span>}
          {item.score !== null && (
            <span>
              <span className="text-primary" aria-hidden="true">★</span>{' '}
              <span className="tabular-nums">{item.score.toFixed(1)}</span>
            </span>
          )}
        </p>
      </Link>
      <div className="absolute top-2 end-2">
        <Button
          size="icon-xs"
          variant={saved ? 'secondary' : 'default'}
          aria-label={saved ? t('common.removeItem', { title: item.title }) : t('common.saveItem', { title: item.title })}
          onClick={toggle}
        >
          {saved ? <Check className="size-3" aria-hidden="true" /> : <Plus className="size-3" aria-hidden="true" />}
        </Button>
      </div>
      <Badge variant="outline" className="absolute top-2 start-2 border-border/60 bg-background/80 text-muted-foreground backdrop-blur">
        {item.type === 'movie' ? t('common.movie') : t('common.tv')}
      </Badge>
    </article>
  )
}
