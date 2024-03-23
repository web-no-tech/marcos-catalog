import { ComponentProps, PropsWithChildren, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const Text = forwardRef<
  HTMLInputElement,
  PropsWithChildren<ComponentProps<'input'>>
>(function Text(props, ref) {
  const { className, children, ...rest } = props

  return (
    <input
      ref={ref}
      className={twMerge(
        'w-full border-none bg-none text-base text-neutral-700 outline-none',
        className,
      )}
      {...rest}
    >
      {children}
    </input>
  )
})
