import { ForwardedRef, ReactNode, forwardRef, useId } from 'react'
import type { GroupBase, Props, SelectInstance } from 'react-select'
import ReactSelect from 'react-select'
import { defaultStyle } from './styles/default'

type CustomProps<T> = Props<T, boolean, GroupBase<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export const Select: <T>(props: any) => ReactNode = forwardRef(function Select<
  T,
>(props: CustomProps<T>, ref: ForwardedRef<SelectInstance<T, boolean>>) {
  const selectId = useId()

  return (
    <ReactSelect
      instanceId={selectId}
      ref={ref}
      key={JSON.stringify(new Date())}
      styles={defaultStyle}
      {...props}
    />
  )
})
