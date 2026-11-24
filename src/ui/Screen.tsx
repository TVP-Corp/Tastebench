import type { ReactNode } from 'react'
import { Button } from 'react-aria-components'
import { Logo } from './Logo'

interface Props {
  title?: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export function Screen({ title, subtitle, onBack, backLabel = 'Back', actions, footer, children }: Props) {
  return (
    <div className="min-h-dvh bg-page font-sans text-ink">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pb-6 pt-4">
        <header className="flex min-h-11 items-center justify-between">
          {onBack ? (
            <Button
              aria-label={backLabel}
              onPress={onBack}
              className="flex size-11 items-center justify-center rounded-full text-2xl outline-none transition-colors data-[hovered]:bg-ink/5 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink"
            >
              ←
            </Button>
          ) : (
            <span className="size-11" />
          )}
          <Logo size={24} />
          <div className="flex min-w-11 items-center justify-end gap-1">{actions}</div>
        </header>
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
          </div>
        )}
        <main className="flex-1 motion-safe:animate-fade-in">{children}</main>
        {footer && <footer className="pt-4">{footer}</footer>}
      </div>
    </div>
  )
}
