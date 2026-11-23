import { Button, type ButtonProps } from 'react-aria-components';

export function PillButton({ className, ...props }: ButtonProps) {
  const extra = typeof className === 'string' ? className : '';
  return (
    <Button
      {...props}
      className={`min-h-12 w-full rounded-full bg-black px-6 text-base font-semibold text-white outline-none data-[disabled]:opacity-40 data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[pressed]:bg-neutral-700 ${extra}`}
    />
  );
}
