import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, TransitionEvent } from 'react'

const SLOP = 10
const THRESHOLD = 60
const MAX_TILT = 8

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export function useSwipe({
  onNext,
  onPrev,
  canNext,
  canPrev,
}: {
  onNext: () => void
  onPrev: () => void
  canNext: boolean
  canPrev: boolean
}) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const pending = useRef<(() => void) | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [offset, setOffset] = useState(0)
  // -1 flies out left, 1 flies out right.
  const [exit, setExit] = useState(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const end = () => {
    start.current = null
    dragging.current = false
    setOffset(0)
  }

  const finish = () => {
    const step = pending.current
    if (!step) return
    pending.current = null
    clearTimeout(timer.current)
    setExit(0)
    end()
    step()
  }

  const fly = (dir: number, step: () => void) => {
    if (reducedMotion()) {
      end()
      return step()
    }
    pending.current = step
    setExit(dir)
    // transitionend may not fire, for example when the tab is hidden.
    timer.current = setTimeout(finish, 250)
  }

  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (!pending.current) start.current = { x: e.clientX, y: e.clientY }
    },
    onPointerMove: (e: PointerEvent) => {
      if (!start.current) return
      const dx = e.clientX - start.current.x
      const dy = e.clientY - start.current.y
      // Capture only after the slop so a tap still reaches the score buttons.
      if (!dragging.current && Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) {
        dragging.current = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
      if (dragging.current) setOffset(dx)
    },
    onPointerUp: (e: PointerEvent) => {
      if (dragging.current && start.current) {
        const dx = e.clientX - start.current.x
        if (dx <= -THRESHOLD && canNext) return fly(-1, onNext)
        if (dx >= THRESHOLD && canPrev) return fly(1, onPrev)
      }
      end()
    },
    onPointerCancel: end,
    onTransitionEnd: (e: TransitionEvent) => {
      // Ignore transitions that bubble up from the score buttons.
      if (e.target === e.currentTarget) finish()
    },
  }

  const tilt = reducedMotion() ? 0 : Math.max(-MAX_TILT, Math.min(MAX_TILT, offset / 20))
  const style: CSSProperties = exit
    ? {
        transform: `translateX(${exit * 120}%) rotate(${exit * MAX_TILT}deg)`,
        opacity: 0,
        transition: 'transform 200ms ease-in, opacity 200ms ease-in',
      }
    : { transform: `translateX(${offset}px) rotate(${tilt}deg)` }

  return { handlers, offset, style }
}
