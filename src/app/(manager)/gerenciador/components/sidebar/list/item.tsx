'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps, ReactElement, cloneElement } from 'react'
import { twMerge } from 'tailwind-merge'

interface ListItemProps extends ComponentProps<'li'> {
  to: string
  label: string
  icon: ReactElement
}

export function ListItem(props: ListItemProps) {
  const { to, label, icon, className, ...rest } = props

  const pathname = usePathname()

  const isActiveLink = pathname === to

  return (
    <Link href={to}>
      <li
        data-active={isActiveLink}
        className={twMerge(
          'flex gap-2 items-center w-full p-3 rounded-md cursor-pointer text-neutral-700 hover:bg-neutral-200 data-[active=true]:bg-neutral-700 data-[active=true]:text-neutral-50',
          className,
        )}
        {...rest}
      >
        {cloneElement(icon, {
          className: twMerge('text-xl', icon.props.className),
        })}
        {label}
      </li>
    </Link>
  )
}
