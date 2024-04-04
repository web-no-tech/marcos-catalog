'use client'

import { ComponentProps, PropsWithChildren, useState } from 'react'
import { LuMenu, LuXCircle } from 'react-icons/lu'
import { twMerge } from 'tailwind-merge'

export function SidebarRoot(props: PropsWithChildren<ComponentProps<'aside'>>) {
  const { children, className, ...rest } = props

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="m-4 hidden text-2xl mobile:flex"
        onClick={() => setIsOpen(true)}
      >
        <LuMenu />
      </button>
      <aside
        data-open={isOpen}
        className={twMerge(
          'flex flex-col gap-6 p-4 fixed h-screen overflow-auto w-72 border-r border-r-neutral-200 mobile:hidden data-[open=true]:flex mobile:w-full mobile:bg-white mobile:top-0 mobile:z-[9999]',
          className,
        )}
        {...rest}
      >
        <button
          className="m-4 ml-auto hidden text-2xl mobile:flex"
          onClick={() => setIsOpen(false)}
        >
          <LuXCircle />
        </button>

        {children}
      </aside>
    </>
  )
}
