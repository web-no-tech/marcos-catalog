import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import CurrencyInput, { CurrencyInputProps } from 'react-currency-input-field'

export const Currency = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function Text(props, ref) {
    const { className, onValueChange, ...rest } = props

    return (
      <CurrencyInput
        ref={ref}
        className={twMerge(
          'w-full border-none bg-none text-base text-neutral-700 outline-none',
          className,
        )}
        intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
        onValueChange={(value) => onValueChange?.(value)}
        {...rest}
      />
    )
  },
)
