import type { Metadata } from 'next'

import { SellersContent } from './content'

export const metadata: Metadata = {
  title: 'Clientes',
}

export default function SellersPage() {
  return <SellersContent />
}
