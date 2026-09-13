import { describe, expect, it } from 'vitest'
import { formatCount, formatUsd } from './format'

describe('formatUsd', () => {
  it('format USD gaya id-ID', () => {
    expect(formatUsd(160000000)).toBe('US$160.000.000')
  })

  it('angka kecil tanpa desimal', () => {
    expect(formatUsd(500)).toBe('US$500')
  })

  it('null tetap null (baris disembunyikan)', () => {
    expect(formatUsd(null)).toBeNull()
  })
})

describe('formatCount', () => {
  it('format ribuan dengan pemisah id-ID', () => {
    expect(formatCount(40158)).toBe('40.158')
  })

  it('null tetap null', () => {
    expect(formatCount(null)).toBeNull()
  })
})
