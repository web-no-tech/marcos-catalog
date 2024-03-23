import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function Border(props: PropsWithChildren<ComponentProps<'div'>>) {
  const { className, children, ...rest } = props

  return (
    <div
      className={twMerge(
        'flex h-12 items-center gap-1 rounded-lg border border-neutral-400 px-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
