import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function ColumnContent(props: PropsWithChildren<ComponentProps<'p'>>) {
  const { children, className, ...rest } = props

  return (
    <p
      className={twMerge(
        'text-sm font-normal text-neutral-600 line-clamp-3',
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  )
}
