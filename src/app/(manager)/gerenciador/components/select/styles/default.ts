import { GroupBase, StylesConfig } from 'react-select'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultStyle: StylesConfig<any, boolean, GroupBase<any>> = {
  control: (base, state) => ({
    ...base,
    height: '3rem',
    boxShadow: 'none',
    borderRadius: '0.5rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: state.isDisabled ? '#D4D4D4' : '#A3A3A3',
    backgroundColor: state.isDisabled ? '#F1F1F1' : 'transparent',
    ':hover': {
      borderColor: '#A3A3A3',
      cursor: 'pointer',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#a3a3a3',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#404040',
  }),
  menu: (base) => ({
    ...base,
    border: '1px solid #A3A3A3',
    borderRadius: '0.5rem',
    boxShadow: 'none',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '10rem',
  }),
  option: (base) => ({
    ...base,
    backgroundColor: 'transparent',
    color: '#616161',
    ':hover': {
      color: '#404040',
      backgroundColor: 'transparent',
      cursor: 'pointer',
    },
  }),
}
