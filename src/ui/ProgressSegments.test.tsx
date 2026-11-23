import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ProgressSegments } from './ProgressSegments'

it('selects a segment with accessible name', async () => {
  const onSelect = vi.fn()
  render(<ProgressSegments states={['complete', 'started', 'complete', 'empty']} current={1} onSelect={onSelect} />)
  await userEvent.click(screen.getByRole('button', { name: 'Entry 3, complete' }))
  expect(onSelect).toHaveBeenCalledWith(2)
  expect(screen.getByRole('button', { name: 'Entry 4, empty' })).toBeInTheDocument()
})

it('fills progress in brand on a light brand track', () => {
  render(<ProgressSegments states={['complete', 'empty']} current={0} onSelect={() => {}} />)
  const bar = (name: string) => screen.getByRole('button', { name }).firstElementChild
  expect(bar('Entry 1, complete')).toHaveClass('bg-brand-600')
  expect(bar('Entry 2, empty')).toHaveClass('bg-brand-200')
})
