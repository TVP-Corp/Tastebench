import type { ReactNode } from 'react'
import { Button } from 'react-aria-components'
import type { RankedEntry } from '../domain/types'
import { formatAverage } from '../domain/score'

interface Props {
  rows: RankedEntry[]
  onOpen: (entryId: string) => void
  renderAction?: (row: RankedEntry) => ReactNode
}

export function RankingList({ rows, onOpen, renderAction }: Props) {
  return (
    <ol className="flex flex-col gap-2">
      {rows.map((r) => (
        <li
          key={r.entryId}
          data-testid="ranking-row"
          className="flex items-center rounded-2xl bg-surface shadow-card ring-1 ring-line-strong"
        >
          <Button
            onPress={() => onOpen(r.entryId)}
            className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl px-4 text-left outline-none transition-colors data-[hovered]:bg-ink/5 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ink"
          >
            <span className="w-6 text-center font-semibold text-ink-muted">{r.rank ?? '-'}</span>
            <span className="flex-1 font-medium">{r.title}</span>
            <span className="font-semibold tabular-nums">{formatAverage(r.average)}</span>
          </Button>
          {renderAction?.(r)}
        </li>
      ))}
    </ol>
  )
}
