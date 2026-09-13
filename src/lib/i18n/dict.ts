import { id, type StringKey } from './id'
import { en } from './en'

export type Language = 'id' | 'en'
export type Locale = 'id-ID' | 'en-US'

const DICTS = { id, en } as const

export const localeOf = (lang: Language): Locale => (lang === 'id' ? 'id-ID' : 'en-US')
export const langOf = (locale: string): Language => (locale.toLowerCase().startsWith('id') ? 'id' : 'en')

export function translate(lang: Language, key: StringKey, vars?: Record<string, string | number>): string {
  let s: string = DICTS[lang][key] ?? DICTS.id[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
  }
  return s
}
