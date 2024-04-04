import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Sale } from '../../domain/Sale'

interface DeleteSaleModalData {
  deleteSaleModalRef: MutableRefObject<HTMLDialogElement | null>
  openDeleteSaleModal: () => void
  closeDeleteSaleModal: () => void
  toDeleteSale: {
    data: Sale | null
    set: Dispatch<SetStateAction<Sale | null>>
  }
}

export function useDeleteSaleModal(): DeleteSaleModalData {
  const deleteSaleModalRef = useRef<HTMLDialogElement>(null)

  const [toDeleteSaleData, setToDeleteSaleData] = useState<Sale | null>(null)

  const openDeleteSaleModal = () => {
    return deleteSaleModalRef.current?.showModal()
  }

  const closeDeleteSaleModal = () => {
    return deleteSaleModalRef.current?.close()
  }

  const toDeleteSale = {
    data: toDeleteSaleData,
    set: setToDeleteSaleData,
  }

  return {
    deleteSaleModalRef,
    openDeleteSaleModal,
    closeDeleteSaleModal,
    toDeleteSale,
  }
}
