'use client'

import { ComponentProps, PropsWithChildren } from 'react'

import { twMerge } from 'tailwind-merge'

export function ItemRoot(props: PropsWithChildren<ComponentProps<'li'>>) {
  const { children, className, ...rest } = props

  return (
    <li
      className={twMerge(
        'p-4 rounded-lg border border-neutral-200 flex flex-col gap-6 items-center',
        className,
      )}
      {...rest}
    >
      {children}
    </li>
  )
}
