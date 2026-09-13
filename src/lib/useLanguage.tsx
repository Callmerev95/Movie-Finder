import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { localeOf, translate, type Language, type Locale } from './i18n/dict'
import type { StringKey } from './i18n/id'
import { clearTmdbCache, setTmdbLanguage } from './tmdb-fetch'
import { setToastLanguage } from './toast'

const KEY = 'movie-finder:lang'

function load(): Language {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'id' || v === 'en') return v
  } catch {
    /* abaikan — fallback di bawah */
  }
  return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en'
}

interface LanguageApi {
  lang: Language
  locale: Locale
  setLang: (l: Language) => void
  t: (key: StringKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageApi | null>(null)

function applySideEffects(lang: Language) {
  document.documentElement.lang = lang
  // konten TMDb ikut bahasa UI — cache lama beda bahasa harus dibuang
  setTmdbLanguage(localeOf(lang))
  clearTmdbCache()
  setToastLanguage(lang)
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* abaikan */
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(load)

  useEffect(() => {
    applySideEffects(lang)
  }, [lang])

  const setLang = useCallback((l: Language) => setLangState(l), [])
  const t = useCallback((key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])

  return (
    <LanguageContext.Provider value={{ lang, locale: localeOf(lang), setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageApi {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage harus dipakai di dalam <LanguageProvider>')
  return ctx
}

export type { Language, Locale }
