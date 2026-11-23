import { useEffect } from 'react'

export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `Tastebench | ${page}` : 'Tastebench'
  }, [page])
}
