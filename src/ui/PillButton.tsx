import { Button, type ButtonProps } from 'react-aria-components'

const VARIANTS = {
  primary: 'bg-black text-white not-data-[pressed]:data-[hovered]:bg-neutral-800 data-[pressed]:bg-neutral-700',
  secondary:
    'border border-neutral-300 bg-white text-neutral-900 not-data-[pressed]:data-[hovered]:bg-neutral-50 data-[pressed]:bg-neutral-100',
  danger:
    'border border-red-300 bg-white text-red-700 not-data-[pressed]:data-[hovered]:bg-red-50 data-[pressed]:bg-red-100',
}

export function PillButton({
  className,
  variant = 'primary',
  ...props
}: ButtonProps & { variant?: keyof typeof VARIANTS }) {
  const extra = typeof className === 'string' ? className : ''
  return (
    <Button
      {...props}
      className={`min-h-12 w-full rounded-full px-6 text-base font-semibold outline-none transition-colors data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 ${VARIANTS[variant]} ${extra}`}
    />
  )
}
