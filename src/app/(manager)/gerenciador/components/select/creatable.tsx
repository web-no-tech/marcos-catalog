import { forwardRef, useId } from 'react'
import type { GroupBase, SelectInstance } from 'react-select'
import type { CreatableProps } from 'react-select/creatable'
import ReactCreatableSelect from 'react-select/creatable'
import { Option } from '../../shared/types'
import { defaultStyle } from './styles/default'

interface CustomProps
  extends CreatableProps<Option, boolean, GroupBase<Option>> {}

export const CreatableSelect = forwardRef<
  SelectInstance<Option, boolean>,
  CustomProps
>(function CreatableSelect(props, ref) {
  const selectId = useId()

  return (
    <ReactCreatableSelect
      instanceId={selectId}
      ref={ref}
      key={JSON.stringify(new Date())}
      styles={defaultStyle}
      formatCreateLabel={(value) => `Criar "${value}"`}
      createOptionPosition="last"
      {...props}
    />
  )
})
