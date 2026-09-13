export function formatUsd(n: number | null, locale = 'id-ID'): string | null {
  if (n === null) return null
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatCount(n: number | null, locale = 'id-ID'): string | null {
  if (n === null) return null
  return new Intl.NumberFormat(locale).format(n)
}
