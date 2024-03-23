import { PropsWithChildren } from 'react'

import { inter } from '@/styles/fonts'
import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: 'Catálogo | %s',
    default: 'Catálogo',
  },
}

export default function RootLayout(props: PropsWithChildren) {
  const { children } = props

  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
