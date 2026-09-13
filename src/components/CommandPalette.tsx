import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clapperboard, CornerDownLeft, Loader2, Search, Bookmark } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { imageUrl, searchByTitle } from '@/lib/tmdb'
import type { Item } from '@/lib/types'

const DEBOUNCE_MS = 300

interface Action {
  id: string
  label: string
  hint: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounce = useRef<ReturnType<typeof setTimeout>>(null)

  // Cmd/Ctrl+K toggle — pasang sekali di window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // debounce search — reuse searchByTitle, buang person di normalize
  useEffect(() => {
    const q = text.trim()
    if (!open || q.length < 2) {
      setItems([])
      setLoading(false)
      setActive(0)
      return
    }
    setLoading(true)
    debounce.current = setTimeout(() => {
      searchByTitle(q)
        .then((r) => {
          setItems(r.items.slice(0, 7))
          setActive(0)
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounce.current!)
  }, [text, open])

  const close = () => {
    setOpen(false)
    setText('')
    setItems([])
  }

  const navActions: Action[] = [
    {
      id: 'home',
      label: 'Beranda',
      hint: 'Trending minggu ini',
      icon: <Clapperboard className="size-4" aria-hidden="true" />,
      run: () => {
        close()
        navigate('/')
      },
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      hint: 'Daftar tontonan tersimpan',
      icon: <Bookmark className="size-4" aria-hidden="true" />,
      run: () => {
        close()
        navigate('/watchlist')
      },
    },
  ]

  // gabung: aksi nav (tanpa query) + hasil (ada query) — active index lintas keduanya
  const showNav = text.trim().length < 2
  const rows: { kind: 'action' | 'item'; data: Action | Item }[] = showNav
    ? navActions.map((a) => ({ kind: 'action' as const, data: a }))
    : items.map((i) => ({ kind: 'item' as const, data: i }))
  const total = rows.length

  const goSearch = () => {
    const q = text.trim()
    if (!q) return
    close()
    navigate(`/?q=${encodeURIComponent(q)}`)
  }

  const select = (i: number) => {
    const row = rows[i]
    if (!row) return
    if (row.kind === 'action') (row.data as Action).run()
    else {
      const item = row.data as Item
      close()
      navigate(`/detail/${item.type}/${item.tmdbId}`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (total ? (a + 1) % total : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (total ? (a - 1 + total) % total : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showNav && text.trim()) goSearch()
      else select(active)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Buka perintah cepat"
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Cari</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] md:inline">⌘K</kbd>
      </Button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent
        showCloseButton={false}
        className="top-[15%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cari judul, atau pilih halaman…"
            aria-label="Perintah cepat — cari judul atau navigasi"
            className="h-11 border-0 bg-transparent ps-0 focus-visible:ring-0"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div role="listbox" aria-label="Hasil perintah cepat" className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Mencari…
            </div>
          )}

          {!loading && showNav && (
            <p className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Navigasi
            </p>
          )}
          {!loading &&
            rows
              .filter((r) => r.kind === 'action')
              .map((r, i) => {
                const a = r.data as Action
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => a.run()}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start outline-none ${
                      active === i ? 'bg-muted' : ''
                    }`}
                  >
                    <span className="text-muted-foreground">{a.icon}</span>
                    <span className="flex-1 text-sm">{a.label}</span>
                    <span className="text-xs text-muted-foreground">{a.hint}</span>
                  </button>
                )
              })}

          {!loading && !showNav && items.length === 0 && (
            <p className="px-2 py-6 text-sm text-muted-foreground">
              Tidak ada hasil untuk “{text.trim()}”.
            </p>
          )}
          {!loading &&
            rows
              .filter((r) => r.kind === 'item')
              .map((r, i) => {
                const item = r.data as Item
                const idx = i + (showNav ? navActions.length : 0)
                const poster = imageUrl(item.posterPath, 'w92')
                return (
                  <button
                    key={`${item.type}-${item.tmdbId}`}
                    type="button"
                    role="option"
                    aria-selected={active === idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => select(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start outline-none ${
                      active === idx ? 'bg-muted' : ''
                    }`}
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt=""
                        width={24}
                        height={36}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-6 shrink-0 rounded-sm object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-6 shrink-0 items-center justify-center rounded-sm bg-muted">
                        <Clapperboard className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{item.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.type === 'movie' ? 'Film' : 'Serial'}
                        {item.year ? ` · ${item.year}` : ''}
                        {item.score ? ` · Skor TMDb ${item.score.toFixed(1)}` : ''}
                      </span>
                    </span>
                    {active === idx && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                  </button>
                )
              })}
        </div>

        <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="size-3" aria-hidden="true" /> buka
          </span>
          <span className="mx-2">·</span>
          ↑↓ navigasi
          <span className="mx-2">·</span>
          Enter dengan teks → cari semua
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
