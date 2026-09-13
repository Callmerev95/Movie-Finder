import { describe, expect, it } from 'vitest'
import { id } from './i18n/id'
import { en } from './i18n/en'
import { translate } from './i18n/dict'

describe('i18n completeness', () => {
  it('key EN persis sama dengan key ID — tak ada string terlewat', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort())
  })

  it('translate: interpolasi {var}, fallback ID, fallback key', () => {
    expect(translate('id', 'palette.noResults', { q: 'x' })).toBe('Tidak ada hasil untuk “x”.')
    expect(translate('en', 'palette.noResults', { q: 'x' })).toBe('No results for “x”.')
    expect(translate('en', 'nav.watchlistMany', { n: 3 })).toBe('Watchlist, 3 items')
  })
})
