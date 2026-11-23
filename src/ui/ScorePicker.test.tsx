import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScorePicker } from './ScorePicker'

const btn = (n: string) => screen.getByRole('radio', { name: n })

describe('ScorePicker', () => {
  it('labels the rows Score and Fine-tune', () => {
    render(<ScorePicker label="Taste" value={undefined} onChange={() => {}} />)
    expect(screen.getByText('Score')).toBeInTheDocument()
    expect(screen.getByText('Fine-tune')).toBeInTheDocument()
  })
  it('shows - and disables decimals when empty', () => {
    render(<ScorePicker label="Taste" value={undefined} onChange={() => {}} />)
    expect(screen.getByTestId('score-value')).toHaveTextContent('-')
    for (let d = 0; d <= 9; d++) expect(btn(`.${d}`)).toBeDisabled()
  })
  it('picks whole and decimal', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ScorePicker label="Taste" value={undefined} onChange={onChange} />)
    await userEvent.click(btn('7'))
    expect(onChange).toHaveBeenLastCalledWith(70)
    rerender(<ScorePicker label="Taste" value={70} onChange={onChange} />)
    await userEvent.click(btn('.3'))
    expect(onChange).toHaveBeenLastCalledWith(73)
  })
  it('does not clear on clicking selected whole', async () => {
    const onChange = vi.fn()
    render(<ScorePicker label="Taste" value={70} onChange={onChange} />)
    await userEvent.click(btn('7'))
    expect(onChange).not.toHaveBeenCalled()
  })
  it('10 keeps only .0', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ScorePicker label="Taste" value={75} onChange={onChange} />)
    await userEvent.click(btn('10'))
    expect(onChange).toHaveBeenLastCalledWith(100)
    rerender(<ScorePicker label="Taste" value={100} onChange={onChange} />)
    expect(btn('.1')).toBeDisabled()
    expect(btn('.9')).toBeDisabled()
    expect(btn('.0')).toBeEnabled()
    expect(screen.queryByRole('radio', { name: '11' })).toBeNull()
  })
  it('does not re-emit on same decimal or skip', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ScorePicker label="Taste" value={73} onChange={onChange} />)
    await userEvent.click(btn('.3'))
    rerender(<ScorePicker label="Taste" value="skip" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onChange).not.toHaveBeenCalled()
  })
  it('skip', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ScorePicker label="Taste" value={undefined} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(onChange).toHaveBeenLastCalledWith('skip')
    rerender(<ScorePicker label="Taste" value="skip" onChange={onChange} />)
    expect(screen.getByTestId('score-value')).toHaveTextContent('Skipped')
    expect(screen.queryAllByRole('radio', { checked: true })).toHaveLength(0)
  })
  it('selected score chips use the violet accent', () => {
    render(<ScorePicker label="Taste" value={70} onChange={() => {}} />)
    expect(btn('7')).toHaveClass('data-[selected]:bg-violet-600', 'data-[selected]:text-white')
    expect(btn('7')).not.toHaveClass('data-[selected]:bg-neutral-900')
  })
  it('skip is a white chip that turns light violet when selected', () => {
    render(<ScorePicker label="Taste" value="skip" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Skip' })).toHaveClass(
      'bg-white',
      'border-neutral-300',
      'text-neutral-600',
      'data-[selected]:bg-violet-100',
      'data-[selected]:border-violet-600',
      'data-[selected]:text-violet-800',
    )
  })
})
