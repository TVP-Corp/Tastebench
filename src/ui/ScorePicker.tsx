import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import type { Key } from 'react-aria-components'
import type { Score } from '../domain/types'
import { MAX_WHOLE, formatTenths, pickDecimal, pickWhole, splitTenths } from '../domain/score'

interface Props {
  label: string
  value: Score | undefined
  onChange: (s: Score) => void
}

const base =
  'flex min-h-11 min-w-11 items-center justify-center rounded-xl border text-base font-medium outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-black '
const cls =
  base +
  'border-neutral-200 bg-white text-neutral-900 not-data-[selected]:data-[hovered]:bg-neutral-100 data-[selected]:border-neutral-900 data-[selected]:bg-neutral-900 data-[selected]:text-white data-[disabled]:opacity-35'

const skipCls =
  base +
  'px-4 border-red-200 bg-red-50 text-red-700 not-data-[selected]:data-[hovered]:border-red-300 data-[selected]:border-red-300 data-[selected]:bg-red-100 data-[selected]:text-red-800'

const WHOLES = Array.from({ length: MAX_WHOLE + 1 }, (_, i) => i)
const DECIMALS = Array.from({ length: 10 }, (_, i) => i)

export function ScorePicker({ label, value, onChange }: Props) {
  const num = typeof value === 'number' ? value : undefined
  const parts = num === undefined ? undefined : splitTenths(num)
  const display = value === 'skip' ? 'Skipped' : num === undefined ? '-' : formatTenths(num)

  const onWhole = (keys: Set<Key>) => {
    const [k] = [...keys]
    if (k === undefined) return // ignore deselect
    const next = pickWhole(value, Number(k))
    if (next !== value) onChange(next)
  }
  const onDecimal = (keys: Set<Key>) => {
    const [k] = [...keys]
    if (k === undefined) return
    const next = pickDecimal(value, Number(k))
    if (next !== null && next !== value) onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-medium">{label}</span>
        <span data-testid="score-value" className="text-4xl font-bold">
          {display}
        </span>
      </div>
      <div className="text-sm text-neutral-600">Score</div>
      <ToggleButtonGroup
        aria-label={`${label} whole number`}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={parts ? [String(parts.whole)] : []}
        onSelectionChange={(k) => onWhole(k as Set<Key>)}
        className="grid grid-cols-6 gap-2"
      >
        {WHOLES.map((n) => (
          <ToggleButton key={n} id={String(n)} aria-label={String(n)} className={cls}>
            {n}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <div className="text-sm text-neutral-600">Fine-tune</div>
      <ToggleButtonGroup
        aria-label={`${label} decimal`}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={parts ? [String(parts.decimal)] : []}
        onSelectionChange={(k) => onDecimal(k as Set<Key>)}
        isDisabled={!parts}
        className="grid grid-cols-5 gap-2"
      >
        {DECIMALS.map((d) => (
          <ToggleButton
            key={d}
            id={String(d)}
            aria-label={`.${d}`}
            isDisabled={!parts || (parts.whole >= MAX_WHOLE && d !== 0)}
            className={cls}
          >
            .{d}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <ToggleButton
        aria-label="Skip"
        isSelected={value === 'skip'}
        onChange={() => value !== 'skip' && onChange('skip')}
        className={skipCls}
      >
        Skip
      </ToggleButton>
    </div>
  )
}
