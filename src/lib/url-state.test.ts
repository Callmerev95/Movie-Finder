import { describe, expect, it } from 'vitest'
import { parseUrlState, serializeUrlState } from './url-state'

describe('parseUrlState', () => {
  it('mode search implisit dari q', () => {
    const s = parseUrlState(new URLSearchParams('?q=inception'))
    expect(s.mode).toBe('search')
    expect(s.query).toBe('inception')
  })

  it('filter aktif → mode discover', () => {
    const s = parseUrlState(new URLSearchParams('?genres=28,35&from=1990&to=2000'))
    expect(s.mode).toBe('discover')
    expect(s.filters).toEqual({ genres: [28, 35], from: 1990, to: 2000, adult: false, provider: null, indonesia: false })
  })

  it('mode discover param eksplisit + type tv + adult', () => {
    const s = parseUrlState(new URLSearchParams('?mode=discover&type=tv&adult=1'))
    expect(s.mode).toBe('discover')
    expect(s.type).toBe('tv')
    expect(s.filters.adult).toBe(true)
  })

  it('q + filter bersamaan → search menang (filter tak berlaku di search)', () => {
    const s = parseUrlState(new URLSearchParams('?q=x&genres=28'))
    expect(s.mode).toBe('search')
  })

  it('genre non-numerik dibuang, tahun di luar 1900-2100 dibuang', () => {
    const s = parseUrlState(new URLSearchParams('?genres=abc,28&from=1700&to=2200'))
    expect(s.filters.genres).toEqual([28])
    expect(s.filters.from).toBeNull()
    expect(s.filters.to).toBeNull()
  })

  it('type selain tv → movie (default)', () => {
    expect(parseUrlState(new URLSearchParams('?type=film')).type).toBe('movie')
  })
})

describe('serializeUrlState', () => {
  it('search: hanya mode + q', () => {
    const s = serializeUrlState({
      mode: 'search',
      query: 'batman',
      type: 'movie',
      filters: { genres: [28], from: null, to: null, adult: false, provider: null, indonesia: false },
    })
    expect(s).toBe('?mode=search&q=batman')
  })

  it('discover: type + genres + rentang + adult', () => {
    const s = serializeUrlState({
      mode: 'discover',
      query: '',
      type: 'tv',
      filters: { genres: [16, 10759], from: 2020, to: 2024, adult: true, provider: null, indonesia: false },
    })
    expect(s).toBe('?mode=discover&type=tv&genres=16,10759&from=2020&to=2024&adult=1')
  })

  it('discover kosong tanpa param filter', () => {
    const s = serializeUrlState({
      mode: 'discover',
      query: '',
      type: 'movie',
      filters: { genres: [], from: null, to: null, adult: false, provider: null, indonesia: false },
    })
    expect(s).toBe('?mode=discover&type=movie')
  })

  it('roundtrip parse(serialize(s)) == s', () => {
    const state = {
      mode: 'discover' as const,
      query: '',
      type: 'tv' as const,
      filters: { genres: [10759], from: 2015, to: null, adult: false, provider: 8, indonesia: true },
    }
    expect(parseUrlState(new URLSearchParams(serializeUrlState(state)))).toEqual({
      mode: 'discover',
      query: '',
      type: 'tv',
      filters: { genres: [10759], from: 2015, to: null, adult: false, provider: 8, indonesia: true },
    })
  })
})
