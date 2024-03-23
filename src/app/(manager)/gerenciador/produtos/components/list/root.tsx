import { PropsWithChildren } from 'react'

export function ListRoot(props: PropsWithChildren) {
  const { children } = props

  return <ul className="flex w-full flex-col gap-2">{children}</ul>
}
