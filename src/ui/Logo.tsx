export function Logo({ size = 32, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 32 32">
        <rect width="32" height="32" rx="10" fill="#fbcfe8" />
        <circle cx="16" cy="16" r="9" fill="#bae6fd" />
        <path d="M16 10.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill="#7c3aed" />
      </svg>
      {wordmark && <span className="font-bold tracking-tight">Tastebench</span>}
    </span>
  )
}
