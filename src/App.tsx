import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Clapperboard, Bookmark } from 'lucide-react'
import tmdbLogo from './assets/tmdb-logo.svg'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/toast'
import SearchPage from './pages/SearchPage'
import DetailPage from './pages/DetailPage'
import PersonPage from './pages/PersonPage'
import WatchlistPage from './pages/WatchlistPage'
import StatsPage from './pages/StatsPage'
import { WatchlistProvider, useWatchlist } from '@/lib/useWatchlist'
import { CommandPalette } from '@/components/CommandPalette'
import { LanguageProvider, useLanguage } from '@/lib/useLanguage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Nav() {
  const { entries } = useWatchlist()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const onWatchlist = pathname === '/watchlist'
  const count = entries.length
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 text-foreground" aria-label={t('nav.home')}>
          <Clapperboard className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium tracking-tight">Movie Finder</span>
        </Link>
        <div className="flex-1" />
        <CommandPalette />
        <Button
          variant={onWatchlist ? 'secondary' : 'ghost'}
          size="sm"
          render={
            <Link
              to="/watchlist"
              aria-label={count === 1 ? t('nav.watchlistOne') : t('nav.watchlistMany', { n: count })}
            />
          }
        >
          <Bookmark className="size-4" aria-hidden="true" />
          {t('nav.watchlist')}
          <Badge variant="secondary" className="tabular-nums">
            {count}
          </Badge>
        </Button>
      </div>
    </header>
  )
}

function LangToggle() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label={t('footer.language')}>
      {(['id', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={
            'cursor-pointer rounded px-1.5 py-0.5 uppercase outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ' +
            (lang === l ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
          }
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <WatchlistProvider>
        <ScrollToTop />
        <Nav />
        <main className="mx-auto max-w-6xl px-4 pb-10">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/detail/:type/:id" element={<DetailPage />} />
            <Route path="/person/:id" element={<PersonPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6">
            <p className="text-xs text-muted-foreground">© 2026 Movie Finder</p>
            <div className="flex items-center gap-3">
              <LangToggle />
              <a
                href="https://www.themoviedb.org/"
                className="inline-flex items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="The Movie Database (TMDb)"
              >
                <img src={tmdbLogo} alt="" width={91} height={7} className="h-6 w-auto" />
              </a>
            </div>
          </div>
        </footer>
        <Toaster />
      </WatchlistProvider>
    </LanguageProvider>
  )
}
