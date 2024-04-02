'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/app/components/button'

import { LuFileEdit, LuPlusCircle, LuTrash, LuXCircle } from 'react-icons/lu'
import { z } from 'zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDeleteCustomerModal } from './hooks/use-delete-customer-modal'
import { useCustomerFormModal } from './hooks/use-customer-form-modal'
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
import { Customer } from '../domain/Customer'

const customerSchema = z.object({
  name: z.string().min(1, 'Insira o nome do cliente'),
  phone: z.string().min(1, 'Insira o número de telefone do cliente'),
  federalUnit: z.string().min(1, 'Insira o estado do cliente'),
  city: z.string().min(1, 'Insira a cidade do cliente'),
  neighborhood: z.string().optional(),
  addressNumber: z.string().optional(),
  addressReference: z.string().optional(),
  carModel: z.string().optional(),
  carIdentifier: z.string().optional(),
  document: z.string().optional(),
  street: z.string().optional(),
})

export type CustomerForm = z.infer<typeof customerSchema>

interface CreateCustomerData {
  name: string
  phone: string
  federalUnit: string
  city: string
  neighborhood: string | undefined
  street: string | undefined
  addressNumber: string | undefined
  addressReference: string | undefined
  carModel: string | undefined
  carIdentifier: string | undefined
  document: string | undefined
}

function createCustomerRequest(data: CreateCustomerData) {
  return addDoc(collection(firebaseDb, 'customers'), data)
}

function updateCustomerRequest(id: string, data: CreateCustomerData) {
  const customer = doc(firebaseDb, 'customers', id)
  return setDoc(customer, data)
}

function deleteCustomerRequest(customerId: string) {
  return deleteDoc(doc(firebaseDb, 'customers/' + customerId))
}

async function getCustomersRequest() {
  const snapshot = await getDocs(collection(firebaseDb, 'customers'))

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Customer),
    id: doc.id,
  }))
}

export function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])

  const {
    deleteCustomerModalRef,
    closeDeleteCustomerModal,
    toDeleteCustomer,
    openDeleteCustomerModal,
  } = useDeleteCustomerModal()

  const {
    customerFormModalRef,
    openCustomerFormModal,
    closeCustomerFormModal,
    toUpdateCustomer,
  } = useCustomerFormModal()

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = customerForm

  const { nameError, phoneError, federalUnitError, cityError } = {
    nameError: errors.name?.message,
    phoneError: errors.phone?.message,
    federalUnitError: errors.federalUnit?.message,
    cityError: errors.city?.message,
  }

  const onSubmitCustomerForm = async (data: CustomerForm) => {
    const toUpdateCustomerId = toUpdateCustomer.data?.id
    const normalizedCustomer: CreateCustomerData = {
      name: data.name,
      phone: data.phone,
      federalUnit: data.federalUnit,
      city: data.city,
      addressNumber: data.addressNumber,
      addressReference: data.addressReference,
      carIdentifier: data.carIdentifier,
      carModel: data.carModel,
      document: data.document,
      neighborhood: data.neighborhood,
      street: data.street,
    }

    if (toUpdateCustomerId) {
      await updateCustomerRequest(toUpdateCustomerId, normalizedCustomer)
    }
    if (!toUpdateCustomerId) {
      await createCustomerRequest(normalizedCustomer)
    }
    handleGetCustomers()
    closeCustomerFormModal()
  }

  const onCloseCustomerFormModal = () => {
    toUpdateCustomer.set(null)
  }

  const handleOpenCustomerFormModal = () => {
    return openCustomerFormModal()
  }

  const handleOpenDeleteCustomerModal = (customer: Customer) => {
    toDeleteCustomer.set(customer)
    return openDeleteCustomerModal()
  }

  const handleOpenUpdateCustomerFormModal = (customer: Customer) => {
    toUpdateCustomer.set(customer)
    return openCustomerFormModal()
  }

  const handleDeleteCustomer = () => {
    const toDeleteCustomerId = toDeleteCustomer.data?.id
    if (toDeleteCustomerId) {
      deleteCustomerRequest(toDeleteCustomerId)
      handleGetCustomers()
    }
    return closeDeleteCustomerModal()
  }

  const handleGetCustomers = async () => {
    const loadedCustomers = await getCustomersRequest()
    return setCustomers(loadedCustomers)
  }

  useEffect(() => {
    handleGetCustomers()
  }, [])

  useEffect(() => {
    reset({
      name: toUpdateCustomer.data?.name,
      phone: toUpdateCustomer.data?.phone,
      federalUnit: toUpdateCustomer.data?.federalUnit,
      city: toUpdateCustomer.data?.city,
      neighborhood: toUpdateCustomer.data?.neighborhood,
      street: toUpdateCustomer.data?.street,
      addressNumber: toUpdateCustomer.data?.addressNumber,
      addressReference: toUpdateCustomer.data?.street,
      carIdentifier: toUpdateCustomer.data?.street,
      carModel: toUpdateCustomer.data?.carModel,
      document: toUpdateCustomer.data?.document,
    })
  }, [toUpdateCustomer.data])

  return (
    <>
      <section className="flex flex-col gap-6">
        <nav className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-700">
            Lista de Clientes
          </h2>
          <Button
            variant={{ colors: 'primary', sizes: 'md' }}
            onClick={() => handleOpenCustomerFormModal()}
          >
            <LuPlusCircle className="text-lg" />
            Novo cliente
          </Button>
        </nav>

        <List.Root>
          {customers.map((customer) => (
            <List.Item.Root key={customer.id}>
              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Nome</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {customer.name}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>

                <List.Item.Column.Root>
                  <List.Item.Column.Title>Telefone</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {customer.phone}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenUpdateCustomerFormModal(customer)}
                >
                  <LuFileEdit className="text-lg" />
                  Editar
                </Button>
                <Button
                  variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenDeleteCustomerModal(customer)}
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
        ref={customerFormModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 overflow-visible rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
        onSubmit={handleSubmit(onSubmitCustomerForm)}
        onClose={onCloseCustomerFormModal}
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Cliente</h3>
          <button type="button" onClick={closeCustomerFormModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <FormProvider {...customerForm}>
          <form id="customer-form" className="grid flex-1 grid-cols-2 gap-3">
            <Input.Label>
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

            <Input.Label>
              Telefone*
              <Input.Border>
                <Input.Text
                  placeholder="Insira o telefone"
                  {...register('phone')}
                />
              </Input.Border>
              {!!phoneError && (
                <Input.Error className="text-xs font-medium text-red-600">
                  {phoneError}
                </Input.Error>
              )}
            </Input.Label>

            <Input.Label>
              CPF
              <Input.Border>
                <Input.Text
                  placeholder="Insira o CPF"
                  {...register('document')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Estado*
              <Input.Border>
                <Input.Text
                  placeholder="Insira o estado"
                  {...register('federalUnit')}
                />
              </Input.Border>
              {!!federalUnitError && (
                <Input.Error className="text-xs font-medium text-red-600">
                  {federalUnitError}
                </Input.Error>
              )}
            </Input.Label>

            <Input.Label>
              Cidade*
              <Input.Border>
                <Input.Text
                  placeholder="Insira o cidade"
                  {...register('city')}
                />
              </Input.Border>
              {!!cityError && (
                <Input.Error className="text-xs font-medium text-red-600">
                  {cityError}
                </Input.Error>
              )}
            </Input.Label>

            <Input.Label>
              Bairro
              <Input.Border>
                <Input.Text
                  placeholder="Insira o bairro"
                  {...register('neighborhood')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Rua
              <Input.Border>
                <Input.Text
                  placeholder="Insira a rua"
                  {...register('street')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Número
              <Input.Border>
                <Input.Text
                  placeholder="Insira o número"
                  {...register('addressNumber')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Referência
              <Input.Border>
                <Input.Text
                  placeholder="Insira a referência"
                  {...register('addressReference')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Modelo do carro
              <Input.Border>
                <Input.Text
                  placeholder="Insira o modelo do carro"
                  {...register('carModel')}
                />
              </Input.Border>
            </Input.Label>

            <Input.Label>
              Placa do carro
              <Input.Border>
                <Input.Text
                  placeholder="Insira a placa do carro"
                  {...register('carIdentifier')}
                />
              </Input.Border>
            </Input.Label>
          </form>
        </FormProvider>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
            onClick={closeCustomerFormModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
            form="customer-form"
          >
            Confirmar
          </Button>
        </footer>
      </dialog>

      <dialog
        ref={deleteCustomerModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Cliente</h3>
          <button type="button" onClick={closeDeleteCustomerModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <div className="min-h-28 flex-1">
          <p>Tem certeza que deseja remover este cliente?</p>
        </div>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'primary' }}
            className="h-10 flex-1"
            onClick={closeDeleteCustomerModal}
          >
            Cancelar
          </Button>
          <Button
            variant={{ colors: 'danger' }}
            className="h-10 flex-1"
            onClick={handleDeleteCustomer}
          >
            Remover
          </Button>
        </footer>
      </dialog>
    </>
  )
}
