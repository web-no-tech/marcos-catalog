import { ComponentProps, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import { VariantProps, tv } from 'tailwind-variants'

const button = tv({
  base: 'flex items-center justify-center gap-2 rounded-lg',
  variants: {
    colors: {
      primary: 'bg-neutral-700 text-neutral-50 hover:bg-neutral-800',
      danger: 'bg-red-600 text-neutral-50 hover:bg-red-800',
    },
    sizes: {
      md: 'min-w-56 px-6 py-[0.75rem]',
    },
    layout: {
      fill: 'flex-1',
    },
  },
})

type ButtonVariant = VariantProps<typeof button>

interface Props extends PropsWithChildren<ComponentProps<'button'>> {
  variant: ButtonVariant
}

export function Button(props: Props) {
  const { children, className, variant, type = 'button', ...rest } = props

  return (
    <button
      type={type}
      className={twMerge(button(variant), className)}
      {...rest}
    >
      {children}
    </button>
  )
}
