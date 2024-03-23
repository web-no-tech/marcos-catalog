import { forwardRef, useId } from 'react'
import type { GroupBase, Props, SelectInstance } from 'react-select'
import ReactSelect from 'react-select'
import { Option } from '../../shared/types'
import { defaultStyle } from './styles/default'

interface CustomProps extends Props<Option, boolean, GroupBase<Option>> {}

export const Select = forwardRef<SelectInstance<Option, boolean>, CustomProps>(
  function Select(props, ref) {
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
  },
)
