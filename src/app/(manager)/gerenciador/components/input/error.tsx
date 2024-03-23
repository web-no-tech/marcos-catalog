import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function Error(props: PropsWithChildren<ComponentProps<'span'>>) {
  const { className, children, ...rest } = props

  return (
    <span
      className={twMerge('text-xs font-medium text-red-600', className)}
      {...rest}
    >
      {children}
    </span>
  )
}
