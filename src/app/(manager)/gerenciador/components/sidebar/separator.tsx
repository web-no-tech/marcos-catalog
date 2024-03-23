import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export function SidebarSeparator(props: ComponentProps<'hr'>) {
  const { className, ...rest } = props

  return <hr className={twMerge('border-neutral-200', className)} {...rest} />
}
