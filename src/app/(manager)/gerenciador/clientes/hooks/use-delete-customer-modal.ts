import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Customer } from '../../domain/Customer'

interface DeleteCustomerModalData {
  deleteCustomerModalRef: MutableRefObject<HTMLDialogElement | null>
  openDeleteCustomerModal: () => void
  closeDeleteCustomerModal: () => void
  toDeleteCustomer: {
    data: Customer | null
    set: Dispatch<SetStateAction<Customer | null>>
  }
}

export function useDeleteCustomerModal(): DeleteCustomerModalData {
  const deleteCustomerModalRef = useRef<HTMLDialogElement>(null)

  const [toDeleteCustomerData, setToDeleteCustomerData] =
    useState<Customer | null>(null)

  const openDeleteCustomerModal = () => {
    return deleteCustomerModalRef.current?.showModal()
  }

  const closeDeleteCustomerModal = () => {
    return deleteCustomerModalRef.current?.close()
  }

  const toDeleteCustomer = {
    data: toDeleteCustomerData,
    set: setToDeleteCustomerData,
  }

  return {
    deleteCustomerModalRef,
    openDeleteCustomerModal,
    closeDeleteCustomerModal,
    toDeleteCustomer,
  }
}
