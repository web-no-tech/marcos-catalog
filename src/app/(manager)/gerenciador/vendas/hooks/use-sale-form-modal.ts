import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Sale } from '../../domain/Sale'

interface SaleFormModalData {
  saleFormModalRef: MutableRefObject<HTMLDialogElement | null>
  openSaleFormModal: () => void
  closeSaleFormModal: () => void
  toUpdateSale: {
    data: Sale | null
    set: Dispatch<SetStateAction<Sale | null>>
  }
}

export function useSaleFormModal(): SaleFormModalData {
  const saleFormModalRef = useRef<HTMLDialogElement>(null)

  const [toUpdateSaleData, setToUpdateSaleData] = useState<Sale | null>(null)

  const openSaleFormModal = () => {
    return saleFormModalRef.current?.showModal()
  }

  const closeSaleFormModal = () => {
    return saleFormModalRef.current?.close()
  }

  const toUpdateSale = {
    data: toUpdateSaleData,
    set: setToUpdateSaleData,
  }

  return {
    saleFormModalRef,
    openSaleFormModal,
    closeSaleFormModal,
    toUpdateSale,
  }
}
