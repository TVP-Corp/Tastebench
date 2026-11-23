import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useSwipe } from './useSwipe'

function Card(props: { onNext: () => void; onPrev: () => void; canNext?: boolean }) {
  const { handlers, offset, style } = useSwipe({ canNext: true, canPrev: true, ...props })
  return <div data-testid="card" data-offset={offset} style={style} {...handlers} />
}

function drag(dx: number, canNext = true) {
  const onNext = vi.fn()
  const onPrev = vi.fn()
  render(<Card onNext={onNext} onPrev={onPrev} canNext={canNext} />)
  const card = screen.getByTestId('card')
  fireEvent.pointerDown(card, { pointerId: 1, clientX: 200, clientY: 100 })
  fireEvent.pointerMove(card, { pointerId: 1, clientX: 200 + dx, clientY: 105 })
  fireEvent.pointerUp(card, { pointerId: 1, clientX: 200 + dx, clientY: 105 })
  return { onNext, onPrev }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('with reduced motion a swipe left calls onNext at once and resets the drag', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
  const { onNext } = drag(-80)
  expect(onNext).toHaveBeenCalledTimes(1)
  const card = screen.getByTestId('card')
  expect(card).toHaveAttribute('data-offset', '0')
  expect(card.style.transform).toBe('translateX(0px) rotate(0deg)')
})

// jsdom has no TransitionEvent, so React never wires onTransitionEnd here; the timeout fallback ends the exit.
it('a swipe left calls onNext once, after the exit', () => {
  vi.useFakeTimers()
  const { onNext, onPrev } = drag(-80)
  expect(onNext).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1000))
  expect(onNext).toHaveBeenCalledTimes(1)
  expect(onPrev).not.toHaveBeenCalled()
})

it('a swipe right calls onPrev once, after the exit', () => {
  vi.useFakeTimers()
  const { onNext, onPrev } = drag(80)
  expect(onPrev).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1000))
  expect(onPrev).toHaveBeenCalledTimes(1)
  expect(onNext).not.toHaveBeenCalled()
})

it('a short drag calls neither', () => {
  vi.useFakeTimers()
  const { onNext, onPrev } = drag(-30)
  act(() => vi.advanceTimersByTime(300))
  expect(onNext).not.toHaveBeenCalled()
  expect(onPrev).not.toHaveBeenCalled()
})

it('a swipe left without a next card calls nothing', () => {
  vi.useFakeTimers()
  const { onNext, onPrev } = drag(-80, false)
  act(() => vi.advanceTimersByTime(300))
  expect(onNext).not.toHaveBeenCalled()
  expect(onPrev).not.toHaveBeenCalled()
})
