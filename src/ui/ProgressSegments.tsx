import { Button } from 'react-aria-components'

interface Props {
  states: ('complete' | 'started' | 'empty')[]
  current: number
  onSelect: (i: number) => void
  label?: string
}

const fill = { complete: 'bg-brand-600', started: 'bg-brand-300', empty: 'bg-brand-200' }

export function ProgressSegments({ states, current, onSelect, label = 'Entry' }: Props) {
  return (
    <div className="flex gap-1">
      {states.map((s, i) => (
        <Button
          key={i}
          aria-label={`${label} ${i + 1}, ${s}`}
          aria-current={i === current ? 'step' : undefined}
          onPress={() => onSelect(i)}
          className="flex min-h-11 flex-1 items-center rounded-full outline-none transition-colors data-[hovered]:bg-ink/5 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink"
        >
          <span className={`block w-full rounded-full ${fill[s]} ${i === current ? 'h-2.5' : 'h-1.5'}`} />
        </Button>
      ))}
    </div>
  )
}
