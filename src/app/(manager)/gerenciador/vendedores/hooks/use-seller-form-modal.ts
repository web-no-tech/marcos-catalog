import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Seller } from '../../domain/Seller'

interface SellerFormModalData {
  sellerFormModalRef: MutableRefObject<HTMLDialogElement | null>
  openSellerFormModal: () => void
  closeSellerFormModal: () => void
  toUpdateSeller: {
    data: Seller | null
    set: Dispatch<SetStateAction<Seller | null>>
  }
}

export function useSellerFormModal(): SellerFormModalData {
  const sellerFormModalRef = useRef<HTMLDialogElement>(null)

  const [toUpdateSellerData, setToUpdateSellerData] = useState<Seller | null>(
    null,
  )

  const openSellerFormModal = () => {
    return sellerFormModalRef.current?.showModal()
  }

  const closeSellerFormModal = () => {
    return sellerFormModalRef.current?.close()
  }

  const toUpdateSeller = {
    data: toUpdateSellerData,
    set: setToUpdateSellerData,
  }

  return {
    sellerFormModalRef,
    openSellerFormModal,
    closeSellerFormModal,
    toUpdateSeller,
  }
}
