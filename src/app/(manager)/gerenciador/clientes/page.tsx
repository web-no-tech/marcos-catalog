import type { Metadata } from 'next'

import { CustomersContent } from './content'

export const metadata: Metadata = {
  title: 'Clientes',
}

export default function CustomersPage() {
  return <CustomersContent />
}
