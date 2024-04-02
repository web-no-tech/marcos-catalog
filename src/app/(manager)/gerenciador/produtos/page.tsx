import type { Metadata } from 'next'

import { ProductsContent } from './content'

export const metadata: Metadata = {
  title: 'Produtos',
}

export default function ProductsPage() {
  return <ProductsContent />
}
