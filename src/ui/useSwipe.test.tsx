import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useSwipe } from './useSwipe'

function Card({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { handlers } = useSwipe({ onNext, onPrev })
  return <div data-testid="card" {...handlers} />
}

function drag(dx: number) {
  const onNext = vi.fn()
  const onPrev = vi.fn()
  render(<Card onNext={onNext} onPrev={onPrev} />)
  const card = screen.getByTestId('card')
  fireEvent.pointerDown(card, { pointerId: 1, clientX: 200, clientY: 100 })
  fireEvent.pointerMove(card, { pointerId: 1, clientX: 200 + dx, clientY: 105 })
  fireEvent.pointerUp(card, { pointerId: 1, clientX: 200 + dx, clientY: 105 })
  return { onNext, onPrev }
}

it('a swipe left past the threshold calls onNext', () => {
  const { onNext, onPrev } = drag(-80)
  expect(onNext).toHaveBeenCalledTimes(1)
  expect(onPrev).not.toHaveBeenCalled()
})

it('a swipe right past the threshold calls onPrev', () => {
  const { onNext, onPrev } = drag(80)
  expect(onPrev).toHaveBeenCalledTimes(1)
  expect(onNext).not.toHaveBeenCalled()
})

it('a short drag calls neither', () => {
  const { onNext, onPrev } = drag(-30)
  expect(onNext).not.toHaveBeenCalled()
  expect(onPrev).not.toHaveBeenCalled()
})
