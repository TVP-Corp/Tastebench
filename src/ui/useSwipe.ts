import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

const SLOP = 10
const THRESHOLD = 60

export function useSwipe({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const [offset, setOffset] = useState(0)

  const end = () => {
    start.current = null
    dragging.current = false
    setOffset(0)
  }

  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY }
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
        if (dx <= -THRESHOLD) onNext()
        else if (dx >= THRESHOLD) onPrev()
      }
      end()
    },
    onPointerCancel: end,
  }

  return { handlers, offset }
}
