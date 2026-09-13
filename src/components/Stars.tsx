import { Star } from 'lucide-react'

export function Stars({
  value,
  onChange,
  label,
}: {
  value: number | null
  onChange: (v: number | null) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          className="cursor-pointer p-0.5 outline-none focus-visible:ring-3 focus-visible:rounded-sm focus-visible:ring-ring/50"
          onClick={() => onChange(value === n ? null : n)}
        >
          <Star
            className={
              'size-5 ' + (value !== null && n <= value ? 'fill-primary text-primary' : 'text-muted-foreground')
            }
            aria-hidden="true"
          />
        </button>
      ))}
      <span className="ms-2 self-center text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {value !== null ? `${value}/5` : 'Belum dinilai'}
      </span>
    </div>
  )
}
