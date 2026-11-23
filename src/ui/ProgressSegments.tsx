import { Button } from 'react-aria-components'

interface Props {
  states: ('complete' | 'started' | 'empty')[]
  current: number
  onSelect: (i: number) => void
}

const fill = { complete: 'bg-neutral-900', started: 'bg-neutral-400', empty: 'bg-neutral-200' }

export function ProgressSegments({ states, current, onSelect }: Props) {
  return (
    <div className="flex gap-1">
      {states.map((s, i) => (
        <Button
          key={i}
          aria-label={`Entry ${i + 1}, ${s}`}
          aria-current={i === current ? 'step' : undefined}
          onPress={() => onSelect(i)}
          className="flex min-h-11 flex-1 items-center outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black"
        >
          <span className={`block w-full rounded-full ${fill[s]} ${i === current ? 'h-2.5' : 'h-1.5'}`} />
        </Button>
      ))}
    </div>
  )
}
