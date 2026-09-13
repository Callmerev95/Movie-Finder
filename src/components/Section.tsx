import type { ReactNode } from 'react'

// Section grammar (DESIGN.md §4): judul + deskripsi muted = "ciri" tiap blok.
// `divider` menandai section besar berikutnya dengan garis hairline tipis.
export function Section({
  title,
  description,
  action,
  divider = false,
  className = 'mt-6',
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  divider?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={`${className}${divider ? ' border-t border-border pt-8' : ''}`}
      aria-label={title}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}
