export function formatUsd(n: number | null): string | null {
  if (n === null) return null
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatCount(n: number | null): string | null {
  if (n === null) return null
  return new Intl.NumberFormat('id-ID').format(n)
}
