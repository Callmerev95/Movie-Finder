import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SearchBar({ initial, onSubmit }: { initial: string; onSubmit: (q: string) => void }) {
  const [text, setText] = useState(initial)
  const prevInitial = useRef(initial)

  useEffect(() => {
    if (prevInitial.current !== initial) {
      prevInitial.current = initial
      setText(initial)
    }
  }, [initial])

  return (
    <form
      role="search"
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim()) onSubmit(text.trim())
      }}
    >
      <div className="relative flex-1">
        <SearchIcon className="absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cari judul film atau serial…"
          aria-label="Cari judul film atau serial"
          className="ps-9"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Bersihkan pencarian"
        disabled={!text}
        className={!text ? 'invisible' : ''}
        onClick={() => {
          setText('')
          onSubmit('')
        }}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </form>
  )
}
