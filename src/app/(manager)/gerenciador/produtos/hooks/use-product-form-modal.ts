import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Pod } from '../../domain/Pod'

interface ProductFormModalData {
  productFormModalRef: MutableRefObject<HTMLDialogElement | null>
  openProductFormModal: () => void
  closeProductFormModal: () => void
  toUpdateProduct: {
    data: Pod | null
    set: Dispatch<SetStateAction<Pod | null>>
  }
}

export function useProductFormModal(): ProductFormModalData {
  const productFormModalRef = useRef<HTMLDialogElement>(null)

  const [toUpdateProductData, setToUpdateProductData] = useState<Pod | null>(
    null,
  )

  const openProductFormModal = () => {
    return productFormModalRef.current?.showModal()
  }

  const closeProductFormModal = () => {
    return productFormModalRef.current?.close()
  }

  const toUpdateProduct = {
    data: toUpdateProductData,
    set: setToUpdateProductData,
  }

  return {
    productFormModalRef,
    openProductFormModal,
    closeProductFormModal,
    toUpdateProduct,
  }
}
