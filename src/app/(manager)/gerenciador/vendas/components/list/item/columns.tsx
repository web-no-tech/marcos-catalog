import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ItemColumns(props: PropsWithChildren<ComponentProps<'div'>>) {
  const { children, className, ...rest } = props

  return (
    <div className={twMerge('flex gap-6 w-full', className)} {...rest}>
      {children}
    </div>
  )
}
