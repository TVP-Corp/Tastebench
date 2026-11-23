import type { ReactNode } from 'react';
import { Button } from 'react-aria-components';
import { OfflineBanner } from './OfflineBanner';

interface Props {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Screen({ title, subtitle, onBack, actions, footer, children }: Props) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-rose-50 via-sky-50 to-violet-50 font-sans text-neutral-900">
      <OfflineBanner />
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-4 pb-6 pt-4">
        <header className="flex min-h-11 items-center justify-between">
          {onBack ? (
            <Button
              aria-label="Back"
              onPress={onBack}
              className="flex size-11 items-center justify-center rounded-full text-2xl outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
            >
              ←
            </Button>
          ) : (
            <span className="size-11" />
          )}
          <div className="flex items-center gap-1">{actions}</div>
        </header>
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
          </div>
        )}
        <main className="flex-1">{children}</main>
        {footer && <footer className="pt-4">{footer}</footer>}
      </div>
    </div>
  );
}
