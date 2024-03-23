import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function SidebarRoot(props: PropsWithChildren<ComponentProps<'aside'>>) {
  const { children, className, ...rest } = props

  return (
    <aside
      className={twMerge(
        'flex flex-col gap-6 p-4 fixed h-screen overflow-auto w-72 border-r border-r-neutral-200',
        className,
      )}
      {...rest}
    >
      {children}
    </aside>
  )
}
