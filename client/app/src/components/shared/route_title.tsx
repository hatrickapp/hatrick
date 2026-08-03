import type { ReactNode } from 'react'

import { useDocumentTitle } from '@/hooks/use_document_title'

export function RouteTitle({ title, children }: { title: string; children: ReactNode }) {
  useDocumentTitle(title)
  return children
}
