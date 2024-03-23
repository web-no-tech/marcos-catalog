import type { Metadata } from 'next'

import { ProductsContent } from './content'

export const metadata: Metadata = {
  title: 'Produtos',
}

export default function ProductsPage() {
  return (
    <>
      <header>
        <h2 className="text-2xl font-semibold text-neutral-700">
          Lista de Produtos
        </h2>
      </header>

      <ProductsContent />
    </>
  )
}
