import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Seller } from '../../domain/Seller'

interface DeleteSellerModalData {
  deleteSellerModalRef: MutableRefObject<HTMLDialogElement | null>
  openDeleteSellerModal: () => void
  closeDeleteSellerModal: () => void
  toDeleteSeller: {
    data: Seller | null
    set: Dispatch<SetStateAction<Seller | null>>
  }
}

export function useDeleteSellerModal(): DeleteSellerModalData {
  const deleteSellerModalRef = useRef<HTMLDialogElement>(null)

  const [toDeleteSellerData, setToDeleteSellerData] = useState<Seller | null>(
    null,
  )

  const openDeleteSellerModal = () => {
    return deleteSellerModalRef.current?.showModal()
  }

  const closeDeleteSellerModal = () => {
    return deleteSellerModalRef.current?.close()
  }

  const toDeleteSeller = {
    data: toDeleteSellerData,
    set: setToDeleteSellerData,
  }

  return {
    deleteSellerModalRef,
    openDeleteSellerModal,
    closeDeleteSellerModal,
    toDeleteSeller,
  }
}
