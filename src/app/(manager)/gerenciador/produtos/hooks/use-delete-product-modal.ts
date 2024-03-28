import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useRef,
  useState,
} from 'react'
import { BaseProduct } from '../../domain/BaseProduct'

interface DeleteProductModalData {
  deleteProductModalRef: MutableRefObject<HTMLDialogElement | null>
  openDeleteProductModal: () => void
  closeDeleteProductModal: () => void
  toDeleteProduct: {
    data: BaseProduct | null
    set: Dispatch<SetStateAction<BaseProduct | null>>
  }
}

export function useDeleteProductModal(): DeleteProductModalData {
  const deleteProductModalRef = useRef<HTMLDialogElement>(null)

  const [toDeleteProductData, setToDeleteProductData] =
    useState<BaseProduct | null>(null)

  const openDeleteProductModal = () => {
    return deleteProductModalRef.current?.showModal()
  }

  const closeDeleteProductModal = () => {
    return deleteProductModalRef.current?.close()
  }

  const toDeleteProduct = {
    data: toDeleteProductData,
    set: setToDeleteProductData,
  }

  return {
    deleteProductModalRef,
    openDeleteProductModal,
    closeDeleteProductModal,
    toDeleteProduct,
  }
}
