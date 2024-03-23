'use client'

import { ComponentProps, PropsWithChildren } from 'react'

import { twMerge } from 'tailwind-merge'

export function ItemRoot(props: PropsWithChildren<ComponentProps<'li'>>) {
  const { children, className, ...rest } = props

  return (
    <li
      className={twMerge(
        'w-full p-4 rounded-lg border border-neutral-200 flex gap-6',
        className,
      )}
      {...rest}
    >
      {children}
    </li>
  )
}
