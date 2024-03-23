import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function Label(props: PropsWithChildren<ComponentProps<'label'>>) {
  const { className, children, ...rest } = props

  return (
    <label
      className={twMerge(
        'flex flex-col gap-1 text-base text-neutral-700',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  )
}
