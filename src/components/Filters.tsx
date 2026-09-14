import { useEffect, useRef, useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { genreList, providerList } from '@/lib/tmdb'
import { useLanguage } from '@/lib/useLanguage'
import type { Filters, Genre, MediaType, Provider } from '@/lib/types'

interface Props {
  type: MediaType
  filters: Filters
  onChange: (next: { type?: MediaType; filters: Filters }) => void
}

export function Filters({ type, filters, onChange }: Props) {
  const { t, locale } = useLanguage()
  const [genres, setGenres] = useState<Genre[]>([])
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    // Q8a: genre ID beda per type — fetch per type, cache di tmdb-fetch
    // nama genre ikut bahasa UI — refetch saat locale ganti
    let active = true
    genreList(type).then((g) => {
      if (active) setGenres(g)
    }).catch(() => {
      if (active) setGenres([])
    })
    return () => {
      active = false
    }
  }, [type, locale])

  useEffect(() => {
    // provider ID konsisten lintas type — fetch movie list cukup, tak perlu per-type
    let active = true
    providerList('movie', locale)
      .then((p) => {
        if (active) setProviders(p)
      })
      .catch(() => {
        if (active) setProviders([])
      })
    return () => {
      active = false
    }
  }, [locale])

  const toggleGenre = (id: number) => {
    const next = filters.genres.includes(id) ? filters.genres.filter((g) => g !== id) : [...filters.genres, id]
    onChange({ filters: { ...filters, genres: next } })
  }

  const setActive = (t: MediaType) => {
    if (t === type) return
    // Q8a: ganti type = reset pilihan genre (ID tidak kompatibel)
    onChange({ type: t, filters: { ...filters, genres: [] } })
  }

  const hasFilters =
    filters.genres.length > 0 || filters.from !== null || filters.to !== null || filters.adult || filters.provider !== null || filters.indonesia

  return (
    <section aria-label={t('filters.section')} className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex overflow-hidden rounded-lg border border-border" role="group" aria-label={t('filters.typeGroup')}>
        {(['movie', 'tv'] as MediaType[]).map((tm) => (
          <button
            key={tm}
            type="button"
            onClick={() => setActive(tm)}
            aria-pressed={type === tm}
            className={
              'cursor-pointer h-7 px-3 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 ' +
              (type === tm ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')
            }
          >
            {tm === 'movie' ? t('common.movie') : t('common.tv')}
          </button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" aria-label={t('filters.genre')} />}>
          <Filter className="size-3.5" aria-hidden="true" />
          {t('filters.genre')}
          {filters.genres.length > 0 && (
            <Badge variant="secondary" className="tabular-nums">
              {filters.genres.length}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] flex-row flex-wrap gap-1.5">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('filters.genreGroup')}>
            {genres.map((g) => {
              const on = filters.genres.includes(g.id)
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  aria-pressed={on}
                  className={
                    'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ' +
                    (on
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground')
                  }
                >
                  {g.name}
                </button>
              )
            })}
            {genres.length === 0 && <span className="text-xs text-muted-foreground">{t('filters.genresLoading')}</span>}
          </div>
        </PopoverContent>
      </Popover>

      {filters.genres.map((id) => {
        const g = genres.find((x) => x.id === id)
        if (!g) return null
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleGenre(id)}
            aria-label={g.name}
            className="flex h-7 cursor-pointer items-center gap-1 rounded-full bg-primary px-2.5 text-xs text-primary-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {g.name}
            <X className="size-3" aria-hidden="true" />
          </button>
        )
      })}

      <div className="flex items-center gap-1.5" role="group" aria-label={t('filters.yearGroup')}>
        <YearInput
          value={filters.from}
          onCommit={(from) => onChange({ filters: { ...filters, from } })}
          label={t('filters.yearFrom')}
          placeholder={t('filters.from')}
        />
        <span className="text-xs text-muted-foreground" aria-hidden="true">—</span>
        <YearInput
          value={filters.to}
          onCommit={(to) => onChange({ filters: { ...filters, to } })}
          label={t('filters.yearTo')}
          placeholder={t('filters.to')}
        />
      </div>

      <ProviderSelect
        value={filters.provider}
        providers={providers}
        onChange={(provider) => onChange({ filters: { ...filters, provider } })}
      />

      <label className="flex cursor-pointer items-center gap-2 py-1 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.indonesia}
          onChange={(e) => onChange({ filters: { ...filters, indonesia: e.target.checked } })}
          className="size-4 cursor-pointer accent-[var(--primary)]"
        />
        {t('filters.indonesia')}
      </label>

      <label className="flex cursor-pointer items-center gap-2 py-1 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={filters.adult}
          onChange={(e) => onChange({ filters: { ...filters, adult: e.target.checked } })}
          className="size-4 cursor-pointer accent-[var(--primary)]"
        />
        {t('filters.adult')}
      </label>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ filters: { genres: [], from: null, to: null, adult: false, provider: null, indonesia: false } })}>
          <X className="size-3" aria-hidden="true" />
          {t('filters.clear')}
        </Button>
      )}
    </section>
  )
}

function numYear(v: string): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : null
}

function ProviderSelect({
  value,
  providers,
  onChange,
}: {
  value: number | null
  providers: Provider[]
  onChange: (v: number | null) => void
}) {
  const { t } = useLanguage()

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="sr-only">{t('filters.provider')}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        aria-label={t('filters.provider')}
        className="h-7 cursor-pointer rounded-lg border border-border bg-muted px-2 text-xs text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">{t('filters.providerAll')}</option>
        {providers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  )
}

// Teks lokal bebas diketik ("19", "199") — commit angka valid-or-null ke filter.
// Tanpa ini controlled input value={filters.from} menelan tiap ketikan parsial
// karena numYear() selalu null untuk digit tak lengkap.
function YearInput({
  value,
  onCommit,
  label,
  placeholder,
}: {
  value: number | null
  onCommit: (v: number | null) => void
  label: string
  placeholder: string
}) {
  const [text, setText] = useState(value?.toString() ?? '')
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return
    prevValue.current = value
    // sync dari luar (Hapus filter, URL, ganti type) HANYA bila teks lokal tak
    // konsisten dengan nilai baru — hapus digit "1990"→"199" commit null tapi
    // teks "199" sudah konsisten dengan null, jangan timpa jadi ""
    if (numYear(text) !== value) setText(value?.toString() ?? '')
  }, [value, text])

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={1900}
      max={2100}
      placeholder={placeholder}
      aria-label={label}
      className="h-7 w-20 text-xs tabular-nums"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onCommit(numYear(e.target.value))
      }}
    />
  )
}
