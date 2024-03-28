import { PropsWithChildren } from 'react'

export function ListRoot(props: PropsWithChildren) {
  const { children } = props

  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-2">
      {children}
    </ul>
  )
}
