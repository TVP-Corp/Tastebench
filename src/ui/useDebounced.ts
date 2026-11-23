import { useEffect, useRef } from 'react'

/** Returns a stable function that calls `fn` after `ms` of quiet. `.flush()` runs a pending call now. */
export function useDebounced<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  const fnRef = useRef(fn)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<A | null>(null)
  useEffect(() => {
    fnRef.current = fn
  })
  const flush = useRef(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const args = pending.current
    pending.current = null
    if (args) fnRef.current(...args)
  })
  const call = useRef(Object.assign(
    (...args: A) => {
      pending.current = args
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(flush.current, ms)
    },
    { flush: () => flush.current() },
  ))
  useEffect(() => {
    const f = flush.current
    return () => f()
  }, [])
  return call.current
}
