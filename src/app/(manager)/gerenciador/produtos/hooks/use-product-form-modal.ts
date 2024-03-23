import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { Product } from '../../domain/BaseProduct'

interface ProductFormModalData {
  productFormModalRef: MutableRefObject<HTMLDialogElement | null>
  openProductFormModal: () => void
  closeProductFormModal: () => void
  toUpdateProduct: {
    data: Product | null
    set: Dispatch<SetStateAction<Product | null>>
  }
}

export function useProductFormModal(): ProductFormModalData {
  const productFormModalRef = useRef<HTMLDialogElement>(null)

  const [toUpdateProductData, setToUpdateProductData] =
    useState<Product | null>(null)

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
