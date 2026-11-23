import { scrollToTop } from './scrollToTop'

const scrollTo = vi.fn()
const original = { scrollTo: window.scrollTo, matchMedia: window.matchMedia }
beforeEach(() => {
  scrollTo.mockClear()
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo
})
afterEach(() => {
  window.scrollTo = original.scrollTo
  window.matchMedia = original.matchMedia
})

const stubReducedMotion = (matches: boolean) => {
  window.matchMedia = vi.fn(() => ({ matches }) as MediaQueryList)
}

describe('scrollToTop', () => {
  it('scrolls smoothly by default', () => {
    stubReducedMotion(false)
    scrollToTop()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jumps under reduced motion', () => {
    stubReducedMotion(true)
    scrollToTop()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
