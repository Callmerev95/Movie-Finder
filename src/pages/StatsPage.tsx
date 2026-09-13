import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Clapperboard, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/Section'
import { imageUrl } from '@/lib/tmdb'
import { useWatchlist } from '@/lib/useWatchlist'
import { useLanguage } from '@/lib/useLanguage'
import { watchlistStats } from '@/lib/stats'

// donut SVG murni: dua segmen via stroke-dasharray, tanpa library chart
function Donut({
  parts,
  label,
}: {
  parts: { value: number; color: string; name: string }[]
  label: string
}) {
  const total = parts.reduce((a, p) => a + p.value, 0)
  const R = 15.9155 // r sehingga keliling = 100
  let offset = 25
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 42 42" className="size-24 shrink-0" role="img" aria-label={label}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--muted)" strokeWidth="6" />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.value / total) * 100
            const el = (
              <circle
                key={p.name}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth="6"
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={offset}
              />
            )
            offset -= len
            return el
          })}
      </svg>
      <ul className="flex flex-col gap-1.5">
        {parts.map((p) => (
          <li key={p.name} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
            <span className="text-card-foreground/90 tabular-nums">{p.value}</span>
            <span className="text-muted-foreground">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted" role="presentation">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 shrink-0 text-right text-xs tabular-nums">{count}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-2xl font-medium tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export default function StatsPage() {
  const { t, locale } = useLanguage()
  const { entries } = useWatchlist()
  const s = useMemo(() => watchlistStats(entries, 6, new Date(), locale), [entries, locale])

  if (entries.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <BarChart3 className="size-10 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{t('stats.empty')}</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          {t('stats.searchCta')}
        </Button>
      </div>
    )
  }

  const distMax = Math.max(1, ...s.distribution.map((d) => d.count))
  const monthMax = Math.max(1, ...s.byMonth.map((b) => b.count))

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-medium tracking-tight">{t('stats.title')}</h1>
      <p className="mt-1 text-xs text-muted-foreground">{t('stats.desc')}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t('stats.total')} value={String(s.total)} />
        <StatCard label={t('stats.watched')} value={String(s.watched)} />
        <StatCard label={t('stats.unwatched')} value={String(s.unwatched)} />
        <StatCard label={t('stats.avgRating')} value={s.avgRating !== null ? s.avgRating.toFixed(1) : '—'} />
      </div>

      <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
        <Section title={t('stats.typeTitle')} divider className="mt-10">
          <Donut
            label={`${s.movies} ${t('common.movie')}, ${s.series} ${t('common.tv')}`}
            parts={[
              { value: s.movies, color: 'var(--primary)', name: t('common.movie') },
              { value: s.series, color: 'var(--muted-foreground)', name: t('common.tv') },
            ]}
          />
        </Section>
        <Section title={t('stats.statusTitle')} divider className="mt-10">
          <Donut
            label={`${s.watched} ${t('common.watched')}, ${s.unwatched} ${t('stats.notYet')}`}
            parts={[
              { value: s.watched, color: 'var(--primary)', name: t('common.watched') },
              { value: s.unwatched, color: 'var(--muted-foreground)', name: t('stats.notYet') },
            ]}
          />
        </Section>
      </div>

      <Section
        title={t('stats.distTitle')}
        description={s.unrated > 0 ? t('stats.distSomeUnrated', { n: s.unrated }) : t('stats.distAllRated')}
        divider
        className="mt-10"
      >
        <div className="flex max-w-md flex-col gap-2" role="img" aria-label={`${t('stats.distTitle')}: ${s.distribution.map((d) => `${d.rating}: ${d.count}`).join(', ')}`}>
          {[...s.distribution].reverse().map((d) => (
            <Bar key={d.rating} label={`${d.rating}★`} count={d.count} max={distMax} />
          ))}
        </div>
      </Section>

      <Section title={t('stats.monthTitle')} description={t('stats.monthDesc')} divider className="mt-10">
        <div className="flex max-w-md flex-col gap-2" role="img" aria-label={`${t('stats.monthTitle')}: ${s.byMonth.map((b) => `${b.label} ${b.count}`).join(', ')}`}>
          {s.byMonth.map((b) => (
            <Bar key={b.month} label={b.label} count={b.count} max={monthMax} />
          ))}
        </div>
      </Section>

      <Section
        title={t('stats.topTitle')}
        description={s.avgScore !== null ? t('stats.topAvg', { v: s.avgScore.toFixed(1) }) : undefined}
        divider
        className="mt-10"
      >
        {s.topRated.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {s.topRated.map((e, i) => (
              <li key={`${e.type}-${e.tmdbId}`} className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-sm text-muted-foreground tabular-nums">{i + 1}</span>
                <Link
                  to={`/detail/${e.type}/${e.tmdbId}`}
                  className="w-10 shrink-0 cursor-pointer overflow-hidden rounded outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {e.posterPath ? (
                    <img
                      src={imageUrl(e.posterPath, 'w92') ?? ''}
                      alt={t('common.poster', { title: e.title })}
                      loading="lazy"
                      decoding="async"
                      className="aspect-2/3 w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-2/3 w-full items-center justify-center bg-muted">
                      <Clapperboard className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/detail/${e.type}/${e.tmdbId}`}
                    className="block truncate text-sm font-medium outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {e.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <Star className="size-3 fill-primary text-primary" aria-hidden="true" />
                    {t('stats.personal', { r: e.rating ?? 0 })}
                    {e.score !== null ? ` · ${t('stats.tmdbScore', { v: e.score.toFixed(1) })}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t('stats.topEmpty')}</p>
        )}
      </Section>
    </div>
  )
}
