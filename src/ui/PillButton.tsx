import { Button, type ButtonProps } from 'react-aria-components'

const VARIANTS = {
  primary: 'bg-emerald-700 text-white not-data-[pressed]:data-[hovered]:bg-emerald-800 data-[pressed]:bg-emerald-900',
  secondary:
    'border border-neutral-300 bg-white text-neutral-900 not-data-[pressed]:data-[hovered]:bg-neutral-50 data-[pressed]:bg-neutral-100',
  tertiary:
    'bg-transparent text-neutral-700 not-data-[pressed]:data-[hovered]:bg-neutral-900/5 data-[pressed]:bg-neutral-900/10',
  warning:
    'border border-amber-400 bg-white text-amber-800 not-data-[pressed]:data-[hovered]:bg-amber-50 data-[pressed]:bg-amber-100',
  danger:
    'border border-red-300 bg-white text-red-700 not-data-[pressed]:data-[hovered]:bg-red-50 data-[pressed]:bg-red-100',
}

export type PillVariant = keyof typeof VARIANTS

export function PillButton({ className, variant = 'primary', ...props }: ButtonProps & { variant?: PillVariant }) {
  const extra = typeof className === 'string' ? className : ''
  return (
    <Button
      {...props}
      className={`min-h-12 w-full rounded-full px-6 text-base font-semibold outline-none transition-colors data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black data-[focus-visible]:ring-offset-2 ${VARIANTS[variant]} ${extra}`}
    />
  )
}
