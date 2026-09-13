import { useEffect, useRef, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/useLanguage'

export function SearchBar({ initial, onSubmit }: { initial: string; onSubmit: (q: string) => void }) {
  const { t } = useLanguage()
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
          placeholder={t('searchbar.placeholder')}
          aria-label={t('searchbar.label')}
          className="ps-9 pe-12"
        />
        {!text && (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block"
          >
            ⌘K
          </kbd>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('searchbar.clear')}
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
