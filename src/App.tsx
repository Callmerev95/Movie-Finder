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

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Nav() {
  const { entries } = useWatchlist()
  const { pathname } = useLocation()
  const onWatchlist = pathname === '/watchlist'
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 text-foreground" aria-label="Movie Finder — beranda">
          <Clapperboard className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium tracking-tight">Movie Finder</span>
        </Link>
        <div className="flex-1" />
        <CommandPalette />
        <Button
          variant={onWatchlist ? 'secondary' : 'ghost'}
          size="sm"
          render={<Link to="/watchlist" aria-label={`Watchlist, ${entries.length} item`} />}
        >
          <Bookmark className="size-4" aria-hidden="true" />
          Watchlist
          <Badge variant="secondary" className="tabular-nums">
            {entries.length}
          </Badge>
        </Button>
      </div>
    </header>
  )
}

export default function App() {
  return (
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
          <a
            href="https://www.themoviedb.org/"
            className="inline-flex items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="The Movie Database (TMDb)"
          >
            <img src={tmdbLogo} alt="" width={91} height={7} className="h-6 w-auto" />
          </a>
        </div>
      </footer>
      <Toaster />
    </WatchlistProvider>
  )
}
