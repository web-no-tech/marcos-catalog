import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ColumnRoot(props: PropsWithChildren<ComponentProps<'div'>>) {
  const { children, className, ...rest } = props

  return (
    <div className={twMerge('flex flex-col', className)} {...rest}>
      {children}
    </div>
  )
}
