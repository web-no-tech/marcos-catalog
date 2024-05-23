import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ColumnTitle(props: PropsWithChildren<ComponentProps<'h3'>>) {
  const { children, className, ...rest } = props

  return (
    <h3
      className={twMerge('text-base font-medium text-neutral-700', className)}
      {...rest}
    >
      {children}
    </h3>
  )
}
