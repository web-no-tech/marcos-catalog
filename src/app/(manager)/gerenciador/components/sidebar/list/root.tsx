import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ListRoot(props: PropsWithChildren<ComponentProps<'ul'>>) {
  const { children, className, ...rest } = props

  return (
    <ul className={twMerge('flex flex-col gap-1', className)} {...rest}>
      {children}
    </ul>
  )
}
