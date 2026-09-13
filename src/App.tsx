import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Clapperboard, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/toast'
import SearchPage from './pages/SearchPage'
import DetailPage from './pages/DetailPage'
import WatchlistPage from './pages/WatchlistPage'
import { WatchlistProvider, useWatchlist } from '@/lib/useWatchlist'

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
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/detail/:type/:id" element={<DetailPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </main>
      <Toaster />
    </WatchlistProvider>
  )
}
