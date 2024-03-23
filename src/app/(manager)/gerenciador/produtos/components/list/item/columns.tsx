import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ItemColumns(props: PropsWithChildren<ComponentProps<'div'>>) {
  const { children, className, ...rest } = props

  return (
    <div
      className={twMerge('flex-1 grid grid-cols-4 gap-8', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
