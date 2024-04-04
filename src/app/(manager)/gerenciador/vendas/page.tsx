import type { Metadata } from 'next'

import { SalesContent } from './content'

export const metadata: Metadata = {
  title: 'Vendas',
}

export default function CustomersPage() {
  return <SalesContent />
}
