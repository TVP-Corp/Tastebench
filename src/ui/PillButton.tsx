import { Button, type ButtonProps } from 'react-aria-components'

const VARIANTS = {
  primary:
    'bg-accent text-on-accent not-data-[pressed]:data-[hovered]:bg-accent-hover data-[pressed]:bg-accent-pressed',
  secondary:
    'border border-line-strong bg-surface text-ink not-data-[pressed]:data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10',
  tertiary: 'bg-transparent text-ink-muted not-data-[pressed]:data-[hovered]:bg-ink/5 data-[pressed]:bg-ink/10',
  warning:
    'border border-warning-line bg-surface text-warning not-data-[pressed]:data-[hovered]:bg-warning-50 data-[pressed]:bg-warning-100',
  danger:
    'border border-danger-line bg-surface text-danger not-data-[pressed]:data-[hovered]:bg-danger-50 data-[pressed]:bg-danger-100',
}

export type PillVariant = keyof typeof VARIANTS

export function PillButton({ className, variant = 'primary', ...props }: ButtonProps & { variant?: PillVariant }) {
  const extra = typeof className === 'string' ? className : ''
  return (
    <Button
      {...props}
      className={`min-h-12 w-full rounded-full px-6 text-base font-semibold outline-none transition-colors data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink data-[focus-visible]:ring-offset-2 ${VARIANTS[variant]} ${extra}`}
    />
  )
}
