import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Customer } from '../../domain/Customer'

interface CustomerFormModalData {
  customerFormModalRef: MutableRefObject<HTMLDialogElement | null>
  openCustomerFormModal: () => void
  closeCustomerFormModal: () => void
  toUpdateCustomer: {
    data: Customer | null
    set: Dispatch<SetStateAction<Customer | null>>
  }
}

export function useCustomerFormModal(): CustomerFormModalData {
  const customerFormModalRef = useRef<HTMLDialogElement>(null)

  const [toUpdateCustomerData, setToUpdateCustomerData] =
    useState<Customer | null>(null)

  const openCustomerFormModal = () => {
    return customerFormModalRef.current?.showModal()
  }

  const closeCustomerFormModal = () => {
    return customerFormModalRef.current?.close()
  }

  const toUpdateCustomer = {
    data: toUpdateCustomerData,
    set: setToUpdateCustomerData,
  }

  return {
    customerFormModalRef,
    openCustomerFormModal,
    closeCustomerFormModal,
    toUpdateCustomer,
  }
}
