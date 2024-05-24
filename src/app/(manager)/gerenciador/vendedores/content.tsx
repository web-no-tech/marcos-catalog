'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/app/components/button'

import { LuFileEdit, LuPlusCircle, LuTrash, LuXCircle } from 'react-icons/lu'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDeleteSellerModal } from './hooks/use-delete-seller-modal'
import { useSellerFormModal } from './hooks/use-seller-form-modal'
import * as Input from '../components/input'
import { firebaseDb } from '@/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import List from './components/list'
import { Seller } from '../domain/Seller'

const sellerSchema = z.object({
  name: z.string().min(1, 'Insira o nome do vendedor'),
  pix: z.string().min(1, 'Insira a chave pix'),
  bank: z.string().min(1, 'Insira o banco'),
})

export type SellerForm = z.infer<typeof sellerSchema>

interface CreateSellerData {
  name: string
  pix: string
  bank: string
}

function createSellerRequest(data: CreateSellerData) {
  return addDoc(collection(firebaseDb, 'sellers'), data)
}

function updateSellerRequest(id: string, data: CreateSellerData) {
  const seller = doc(firebaseDb, 'sellers', id)
  return setDoc(seller, data)
}

function deleteSellerRequest(sellerId: string) {
  return deleteDoc(doc(firebaseDb, 'sellers/' + sellerId))
}

async function getSellersRequest() {
  const snapshot = await getDocs(collection(firebaseDb, 'sellers'))

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Seller),
    id: doc.id,
  }))
}

export function SellersContent() {
  const [sellers, setSellers] = useState<Seller[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const {
    deleteSellerModalRef,
    closeDeleteSellerModal,
    toDeleteSeller,
    openDeleteSellerModal,
  } = useDeleteSellerModal()

  const {
    sellerFormModalRef,
    openSellerFormModal,
    closeSellerFormModal,
    toUpdateSeller,
  } = useSellerFormModal()

  const sellerForm = useForm<SellerForm>({
    resolver: zodResolver(sellerSchema),
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = sellerForm

  const { nameError, pixError, bankError } = {
    nameError: errors.name?.message,
    pixError: errors.pix?.message,
    bankError: errors.bank?.message,
  }

  const onSubmitSellerForm = async (data: SellerForm) => {
    const toUpdateSellerId = toUpdateSeller.data?.id
    const normalizedSeller: CreateSellerData = {
      name: data.name,
      pix: data.pix,
      bank: data.bank,
    }

    if (toUpdateSellerId) {
      await updateSellerRequest(toUpdateSellerId, normalizedSeller)
    }
    if (!toUpdateSellerId) {
      await createSellerRequest(normalizedSeller)
    }
    handleGetSellers()
    closeSellerFormModal()
  }

  const onCloseSellerFormModal = () => {
    toUpdateSeller.set(null)
  }

  const handleOpenSellerFormModal = () => {
    return openSellerFormModal()
  }

  const handleOpenDeleteSellerModal = (seller: Seller) => {
    toDeleteSeller.set(seller)
    return openDeleteSellerModal()
  }

  const handleOpenUpdateSellerFormModal = (seller: Seller) => {
    toUpdateSeller.set(seller)
    return openSellerFormModal()
  }

  const handleDeleteSeller = async () => {
    const toDeleteSellerId = toDeleteSeller.data?.id
    if (toDeleteSellerId) {
      await deleteSellerRequest(toDeleteSellerId)
      await handleGetSellers()
    }
    return closeDeleteSellerModal()
  }

  const handleGetSellers = async () => {
    try {
      setIsLoading(true)
      const loadedSellers = await getSellersRequest()
      return setSellers(loadedSellers)
    } catch (error) {
      alert('Erro ao buscar os vendedores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetSellers()
  }, [])

  useEffect(() => {
    reset({
      name: toUpdateSeller.data?.name,
      pix: toUpdateSeller.data?.pix,
      bank: toUpdateSeller.data?.bank,
    })
  }, [toUpdateSeller.data])

  if (isLoading) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center">
        <p className="text-lg font-normal text-neutral-600">Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <nav className="flex items-center justify-between mobile:flex-col mobile:items-start mobile:gap-6">
          <h2 className="text-2xl font-semibold text-neutral-700">
            Lista de Vendedores
          </h2>
          <Button
            variant={{ colors: 'primary', sizes: 'md' }}
            onClick={() => handleOpenSellerFormModal()}
            className="mobile:w-full"
          >
            <LuPlusCircle className="text-lg" />
            Novo vendedor
          </Button>
        </nav>

        <List.Root>
          {sellers.map((seller) => (
            <List.Item.Root key={seller.id}>
              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Nome</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {seller.name}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenUpdateSellerFormModal(seller)}
                >
                  <LuFileEdit className="text-lg" />
                  Editar
                </Button>
                <Button
                  variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenDeleteSellerModal(seller)}
                >
                  <LuTrash className="text-lg" />
                  Remover
                </Button>
              </div>
            </List.Item.Root>
          ))}
        </List.Root>
      </section>

      <dialog
        ref={sellerFormModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 overflow-auto rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
        onClose={onCloseSellerFormModal}
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Vendedor</h3>
          <button type="button" onClick={closeSellerFormModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <form
          id="seller-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmitSellerForm)}
        >
          <Input.Label className="flex-1">
            Nome*
            <Input.Border>
              <Input.Text placeholder="Insira o nome" {...register('name')} />
            </Input.Border>
            {!!nameError && (
              <Input.Error className="text-xs font-medium text-red-600">
                {nameError}
              </Input.Error>
            )}
          </Input.Label>

          <Input.Label className="flex-1">
            Chave PIX*
            <Input.Border>
              <Input.Text
                placeholder="Insira a chave PIX"
                {...register('pix')}
              />
            </Input.Border>
            {!!pixError && (
              <Input.Error className="text-xs font-medium text-red-600">
                {pixError}
              </Input.Error>
            )}
          </Input.Label>

          <Input.Label className="flex-1">
            Banco*
            <Input.Border>
              <Input.Text placeholder="Insira o banco" {...register('bank')} />
            </Input.Border>
            {!!bankError && (
              <Input.Error className="text-xs font-medium text-red-600">
                {bankError}
              </Input.Error>
            )}
          </Input.Label>
        </form>

        <footer className="flex gap-2 mobile:flex-col">
          <Button
            variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
            onClick={closeSellerFormModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
            form="seller-form"
          >
            Confirmar
          </Button>
        </footer>
      </dialog>

      <dialog
        ref={deleteSellerModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Vendedor</h3>
          <button type="button" onClick={closeDeleteSellerModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <div className="min-h-28 flex-1">
          <p>Tem certeza que deseja remover este vendedor?</p>
        </div>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'primary' }}
            className="h-10 flex-1"
            onClick={closeDeleteSellerModal}
          >
            Cancelar
          </Button>
          <Button
            variant={{ colors: 'danger' }}
            className="h-10 flex-1"
            onClick={handleDeleteSeller}
          >
            Remover
          </Button>
        </footer>
      </dialog>
    </>
  )
}
