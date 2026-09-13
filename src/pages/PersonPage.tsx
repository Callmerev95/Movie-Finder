import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResultCard } from '@/components/ResultCard'
import { Section } from '@/components/Section'
import { person, TmdbError } from '@/lib/tmdb'
import { useLanguage } from '@/lib/useLanguage'
import type { PersonDetail } from '@/lib/types'

function formatYears(p: PersonDetail, present: string): string | null {
  if (!p.birthday) return null
  const from = new Date(p.birthday).getFullYear()
  const to = p.deathday ? new Date(p.deathday).getFullYear() : null
  return to ? `${from}–${to}` : `${from}–${present}`
}

export default function PersonPage() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [data, setData] = useState<PersonDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const n = Number(id)
    if (!Number.isInteger(n)) return
    setLoading(true)
    setError(null)
    person(n)
      .then(setData)
      .catch((e) => setError(e instanceof TmdbError ? e.message : t('person.error')))
      .finally(() => setLoading(false))
  }, [id, t])

  if (loading) {
    return (
      <div className="pt-6" aria-busy="true" aria-label={t('person.loading')}>
        <div className="h-40 w-32 rounded-lg bg-muted" />
        <div className="mt-4 h-8 w-2/3 rounded bg-muted" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div role="alert" className="mt-16 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">{error ?? t('person.notFound')}</p>
        <Button variant="outline" size="sm" render={<Link to="/" />}>
          {t('person.backToSearch')}
        </Button>
      </div>
    )
  }

  const profile = data.profilePath ? `https://image.tmdb.org/t/p/w342${data.profilePath}` : null
  const years = formatYears(data, t('person.present'))

  return (
    <div>
      <Button variant="ghost" size="sm" className="-ms-2" render={<Link to="/" />}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('person.back')}
      </Button>

      <div className="mt-4 flex animate-in fade-in slide-in-from-bottom-2 flex-col gap-6 duration-300 ease-out motion-reduce:animate-none sm:flex-row">
        <div className="w-32 shrink-0 sm:w-40">
          {profile ? (
            <img
              src={profile}
              alt={t('person.photoAlt', { name: data.name })}
              className="w-full rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="flex aspect-3/4 w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
              {t('person.noPhoto')}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">{data.name}</h1>
          {data.knownFor && (
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>{data.knownFor}</span>
              {years && (
                <span className="flex items-center gap-1 tabular-nums">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {years}
                </span>
              )}
              {data.placeOfBirth && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {data.placeOfBirth}
                </span>
              )}
            </p>
          )}

          {data.biography && (
            <Section title={t('person.biography')} className="mt-6">
              <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-card-foreground/90">
                {data.biography}
              </p>
            </Section>
          )}

          {data.credits.length > 0 && (
            <Section title={t('person.credits')} description={t('person.creditsDesc')} className="mt-6">
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {data.credits.map((item) => (
                  <li key={`${item.type}-${item.tmdbId}`}>
                    <ResultCard item={item} />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
