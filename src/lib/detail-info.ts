import type { DetailData } from './types'
import { formatCount, formatUsd } from './format'
import type { StringKey } from './i18n/id'

export type InfoRow = [label: string, value: string]

type T = (key: StringKey) => string

export function detailInfoRows(d: DetailData, t: T, locale = 'id-ID'): InfoRow[] {
  const rows: [string, string | null][] =
    d.type === 'movie'
      ? [
          [t('info.director'), d.directors.join(', ') || null],
          [t('info.budget'), formatUsd(d.budget, locale)],
          [t('info.revenue'), formatUsd(d.revenue, locale)],
          [t('info.status'), d.status],
          [t('info.votes'), formatCount(d.voteCount, locale)],
          [t('info.originalTitle'), d.originalTitle],
          [t('info.originalLanguage'), d.originalLanguage],
          [t('info.companies'), d.productionCompanies.join(', ') || null],
          [t('info.countries'), d.countries.join(', ') || null],
        ]
      : [
          [t('info.creators'), d.creators.join(', ') || null],
          [t('info.networks'), d.networks.join(', ') || null],
          [t('info.episodes'), d.episodes !== null ? formatCount(d.episodes, locale) : null],
          [t('info.lastAir'), d.lastAirDate],
          [t('info.status'), d.status],
          [t('info.votes'), formatCount(d.voteCount, locale)],
          [t('info.originalTitle'), d.originalTitle],
          [t('info.originalLanguage'), d.originalLanguage],
          [t('info.companies'), d.productionCompanies.join(', ') || null],
          [t('info.countries'), d.countries.join(', ') || null],
        ]
  return rows.filter((r): r is [string, string] => r[1] !== null)
}
