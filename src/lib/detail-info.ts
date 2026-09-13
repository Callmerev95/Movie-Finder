import type { DetailData } from './types'
import { formatCount, formatUsd } from './format'

export type InfoRow = [label: string, value: string]

export function detailInfoRows(d: DetailData): InfoRow[] {
  const rows: [string, string | null][] =
    d.type === 'movie'
      ? [
          ['Sutradara', d.directors.join(', ') || null],
          ['Anggaran', formatUsd(d.budget)],
          ['Pendapatan', formatUsd(d.revenue)],
          ['Status', d.status],
          ['Jumlah vote', formatCount(d.voteCount)],
          ['Judul asli', d.originalTitle],
          ['Bahasa asli', d.originalLanguage],
          ['Rumah produksi', d.productionCompanies.join(', ') || null],
          ['Negara produksi', d.countries.join(', ') || null],
        ]
      : [
          ['Dibuat oleh', d.creators.join(', ') || null],
          ['Jaringan', d.networks.join(', ') || null],
          ['Jumlah episode', d.episodes !== null ? formatCount(d.episodes) : null],
          ['Episode terakhir', d.lastAirDate],
          ['Status', d.status],
          ['Jumlah vote', formatCount(d.voteCount)],
          ['Judul asli', d.originalTitle],
          ['Bahasa asli', d.originalLanguage],
          ['Rumah produksi', d.productionCompanies.join(', ') || null],
          ['Negara produksi', d.countries.join(', ') || null],
        ]
  return rows.filter((r): r is [string, string] => r[1] !== null)
}
