import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle', () => {
  it('uses the app name without a page', () => {
    renderHook(() => useDocumentTitle())
    expect(document.title).toBe('Tastebench')
  })

  it('appends the page name', () => {
    renderHook(() => useDocumentTitle('Rate'))
    expect(document.title).toBe('Tastebench | Rate')
  })
})
