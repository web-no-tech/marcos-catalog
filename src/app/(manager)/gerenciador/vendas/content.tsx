'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/app/components/button'

import {
  LuDownloadCloud,
  LuPlusCircle,
  LuTrash,
  LuXCircle,
} from 'react-icons/lu'
import { z } from 'zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDeleteSaleModal } from './hooks/use-delete-sale-modal'
import { useSaleFormModal } from './hooks/use-sale-form-modal'
import * as Input from '../components/input'
import { firebaseDb } from '@/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import List from './components/list'
import { Sale } from '../domain/Sale'
import { priceFormatter } from '@/utils/price-formatter'
import { Select } from '../components/select'
import { Pod } from '../domain/Pod'
import { currencyToNumber } from '@/utils/currency-to-number'
import { BasicDocument } from './components/pdf'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CreateProductData } from '../produtos/content'

const saleSchema = z.object({
  discount: z.string().optional(),
  additional: z.string().optional(),
  paymentMethod: z.string().min(1, { message: 'Insira a forma de pagamento' }),
  date: z.string().min(1, { message: 'Insira a data da venda' }),
  customer: z.object(
    { name: z.string(), id: z.string() },
    { required_error: 'Selecione o cliente' },
  ),
  seller: z.object(
    { name: z.string(), id: z.string() },
    { required_error: 'Selecione o vendedor' },
  ),
  products: z.array(z.custom<Pod & { purchaseAmount: number }>(), {
    required_error: 'Selecione pelo menos um produto',
  }),
})

const filterSchema = z.object({
  seller: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
  product: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
  customer: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
})

export type SaleForm = z.infer<typeof saleSchema>

export type FilterForm = z.infer<typeof filterSchema>

interface ProductPreview {
  name: string
  id: string
  amount: number
  costPrice: number
  finalPrice: number
}

interface CreateSaleData {
  price: number
  profit: number
  discount?: number
  additional?: number
  paymentMethod: string
  products: Array<ProductPreview>
  customer: { name: string; id: string }
  seller: { name: string; id: string }
  date: string
}

interface SaleFilter {
  seller: string | undefined
  product: string | undefined
  customer: string | undefined
}

function createSaleRequest(data: CreateSaleData) {
  return addDoc(collection(firebaseDb, 'sales'), data)
}

function deleteSaleRequest(saleId: string) {
  return deleteDoc(doc(firebaseDb, 'sales/' + saleId))
}

async function getSalesRequest({ seller, product, customer }: SaleFilter) {
  const and = []

  if (seller) {
    and.push(where('seller.id', '==', seller))
  }

  if (product) {
    and.push(where('product.id', '==', product))
  }

  if (customer) {
    and.push(where('customer.id', '==', customer))
  }

  const snapshot = await getDocs(query(collection(firebaseDb, 'sales'), ...and))

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Sale),
    id: doc.id,
  }))
}

const getNormalizedCustomersRequest = async () => {
  const snapshot = await getDocs(collection(firebaseDb, 'customers'))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    value: doc.id,
    name: doc.get('name'),
    label: doc.get('name'),
  }))
}

const getNormalizedSellersRequest = async () => {
  const snapshot = await getDocs(collection(firebaseDb, 'sellers'))
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    value: doc.id,
    name: doc.get('name'),
    label: doc.get('name'),
  }))
}

const getProductsRequest = async () => {
  const snapshot = await getDocs(collection(firebaseDb, 'products'))
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Pod),
    id: doc.id,
    label: doc.get('name'),
    value: doc.id,
  }))
}

function updateProductRequest(id: string, data: CreateProductData) {
  const product = doc(firebaseDb, 'products', id)
  return setDoc(product, data)
}

export function SalesContent() {
  const [sales, setSales] = useState<Sale[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [customers, setCustomers] = useState<CreateSaleData['customer'][]>([])
  const [sellers, setSellers] = useState<CreateSaleData['seller'][]>([])
  const [products, setProducts] = useState<Pod[]>([])

  const {
    deleteSaleModalRef,
    closeDeleteSaleModal,
    toDeleteSale,
    openDeleteSaleModal,
  } = useDeleteSaleModal()

  const {
    saleFormModalRef,
    openSaleFormModal,
    closeSaleFormModal,
    toUpdateSale,
  } = useSaleFormModal()

  const saleForm = useForm<SaleForm>({
    resolver: zodResolver(saleSchema),
  })

  const filterForm = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
    watch,
  } = saleForm

  const {
    seller: sellerFilter,
    product: productFilter,
    customer: customerFilter,
  } = filterForm.watch()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  const handleGetCustomers = async () => {
    const loadedCustomers = await getNormalizedCustomersRequest()
    return setCustomers(loadedCustomers)
  }
  const handleGetSellers = async () => {
    const loadedSellers = await getNormalizedSellersRequest()
    return setSellers(loadedSellers)
  }
  const handleGetProducts = async () => {
    const loadedProducts = await getProductsRequest()
    return setProducts(loadedProducts)
  }

  const { products: selectedProducts } = watch()

  const { paymentMethodError, dateError } = {
    paymentMethodError: errors.paymentMethod?.message,
    dateError: errors.date?.message,
  }

  const onSubmitSaleForm = async (data: SaleForm) => {
    const toUpdateSaleId = toUpdateSale.data?.id

    const saleValue =
      data.products.reduce(
        (accumulator, product) =>
          accumulator + product.purchaseAmount * product.finalPrice,
        0,
      ) +
      currencyToNumber(data.additional ?? '0') -
      currencyToNumber(data.discount ?? '0')

    const normalizedSale: CreateSaleData = {
      price: saleValue,
      additional: currencyToNumber(data.additional ?? '0'),
      discount: currencyToNumber(data.discount ?? '0'),
      paymentMethod: data.paymentMethod,
      customer: data.customer,
      seller: data.seller,
      date: data.date,
      products: data.products.map((product) => ({
        id: product.id,
        name: product.name,
        amount: product.purchaseAmount,
        finalPrice: product.finalPrice,
        costPrice: product.costPrice,
      })),
      profit:
        saleValue -
        data.products.reduce(
          (accumulator, product) =>
            accumulator + product.purchaseAmount * product.costPrice,
          0,
        ),
    }

    const updateProductsPromises = data.products.map((product) =>
      updateProductRequest(product.id, {
        ...product,
        amount: product.amount - product.purchaseAmount,
      }),
    )
    await Promise.all(updateProductsPromises)

    if (!toUpdateSaleId) {
      await createSaleRequest(normalizedSale)
    }
    handleGetSales()
    closeSaleFormModal()
  }

  const onCloseSaleFormModal = () => {
    toUpdateSale.set(null)
  }

  const handleOpenSaleFormModal = () => {
    return openSaleFormModal()
  }

  const handleOpenDeleteSaleModal = (sale: Sale) => {
    toDeleteSale.set(sale)
    return openDeleteSaleModal()
  }

  const handleDeleteSale = async () => {
    const toDeleteSaleId = toDeleteSale.data?.id
    if (toDeleteSaleId) {
      await deleteSaleRequest(toDeleteSaleId)
      await handleGetSales()
    }
    return closeDeleteSaleModal()
  }

  const handleGetSales = async () => {
    try {
      setIsLoading(true)
      const loadedSales = await getSalesRequest({
        seller: sellerFilter?.value,
        product: productFilter?.value,
        customer: customerFilter?.value,
      })
      return setSales(loadedSales)
    } catch (error) {
      alert('Erro ao buscar as vendas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetCustomers()
    handleGetSellers()
    handleGetProducts()
  }, [])

  useEffect(() => {
    handleGetSales()
  }, [sellerFilter, productFilter, customerFilter])

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
            Lista de Vendas
          </h2>
          <Button
            variant={{ colors: 'primary', sizes: 'md' }}
            onClick={() => handleOpenSaleFormModal()}
            className="mobile:w-full"
          >
            <LuPlusCircle className="text-lg" />
            Nova venda
          </Button>
        </nav>

        <div className="flex gap-4 mobile:flex-col">
          <Controller
            name="seller"
            control={filterForm.control}
            render={({ field, fieldState: { error } }) => {
              return (
                <Input.Label className="flex-1">
                  Vendedor
                  <Select
                    placeholder="Selecione um vendedor"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={sellers}
                    isClearable
                    {...field}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />

          <Controller
            name="customer"
            control={filterForm.control}
            render={({ field, fieldState: { error } }) => {
              return (
                <Input.Label className="flex-1">
                  Cliente
                  <Select
                    placeholder="Selecione um cliente"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={customers}
                    isClearable
                    {...field}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />

          <Controller
            name="product"
            control={filterForm.control}
            render={({ field, fieldState: { error } }) => {
              return (
                <Input.Label className="flex-1">
                  Produto
                  <Select
                    placeholder="Selecione um produto"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={products}
                    isClearable
                    {...field}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />
        </div>

        <div className="flex gap-12">
          <div>
            <h2 className="text-base font-medium text-green-800">Total</h2>
            <p className="text-2xl font-medium text-neutral-600">
              {priceFormatter().format(
                sales?.reduce(
                  (accumulator, sale) => accumulator + sale.price,
                  0,
                ) ?? 0,
              )}
            </p>
          </div>

          <div>
            <h2 className="text-base font-medium text-green-800">Lucro</h2>
            <p className="text-2xl font-medium text-neutral-600">
              {priceFormatter().format(
                sales?.reduce(
                  (accumulator, sale) => accumulator + sale.profit,
                  0,
                ) ?? 0,
              )}
            </p>
          </div>
        </div>

        <List.Root>
          {sales.map((sale) => (
            <List.Item.Root key={sale.id}>
              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Vendedor</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {sale.seller.name}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Cliente</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {sale.customer.name}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Data da venda</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {sale.date}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Valor</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {priceFormatter().format(sale.price)}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>

                <List.Item.Column.Root>
                  <List.Item.Column.Title>Lucro</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {priceFormatter().format(sale.profit)}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <div className="flex w-full flex-col gap-2">
                <PDFDownloadLink
                  document={
                    <BasicDocument
                      products={sale.products.map((product) => ({
                        ...product,
                        price: priceFormatter().format(
                          product.finalPrice * product.amount,
                        ),
                      }))}
                      total={priceFormatter().format(sale.price)}
                    />
                  }
                  fileName={`${sale.customer.name}-${sale.date}.pdf`}
                >
                  <Button
                    variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
                  >
                    <LuDownloadCloud className="text-lg" />
                    Download
                  </Button>
                </PDFDownloadLink>

                <Button
                  variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenDeleteSaleModal(sale)}
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
        ref={saleFormModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 overflow-auto rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
        onClose={onCloseSaleFormModal}
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Cliente</h3>
          <button type="button" onClick={closeSaleFormModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <form
          id="sale-form"
          className="grid flex-1 grid-cols-2 gap-3 mobile:grid-cols-1"
          onSubmit={handleSubmit(onSubmitSaleForm)}
        >
          <Controller
            name="additional"
            control={control}
            render={({
              field: { onChange, ...fieldProps },
              fieldState: { error },
            }) => (
              <Input.Label>
                Valor adicional
                <Input.Border>
                  <Input.Currency
                    placeholder="Insira o valor adicional"
                    onValueChange={(value) => onChange(value)}
                    {...fieldProps}
                  />
                </Input.Border>
                {!!error && (
                  <Input.Error className="text-xs font-medium text-red-600">
                    {error.message}
                  </Input.Error>
                )}
              </Input.Label>
            )}
          />

          <Controller
            name="discount"
            control={control}
            render={({
              field: { onChange, ...fieldProps },
              fieldState: { error },
            }) => (
              <Input.Label>
                Desconto
                <Input.Border>
                  <Input.Currency
                    placeholder="Insira o desconto"
                    onValueChange={(value) => onChange(value)}
                    {...fieldProps}
                  />
                </Input.Border>
                {!!error && (
                  <Input.Error className="text-xs font-medium text-red-600">
                    {error.message}
                  </Input.Error>
                )}
              </Input.Label>
            )}
          />

          <Input.Label>
            Forma de pagamento*
            <Input.Border>
              <Input.Text
                placeholder="Insira a forma de pagamento"
                {...register('paymentMethod')}
              />
            </Input.Border>
            {!!paymentMethodError && (
              <Input.Error className="text-xs font-medium text-red-600">
                {paymentMethodError}
              </Input.Error>
            )}
          </Input.Label>

          <Input.Label>
            Data da venda*
            <Input.Border>
              <Input.Text placeholder="Insira a data" {...register('date')} />
            </Input.Border>
            {!!dateError && (
              <Input.Error className="text-xs font-medium text-red-600">
                {dateError}
              </Input.Error>
            )}
          </Input.Label>

          <Controller
            name="customer"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <Input.Label>
                  Cliente*
                  <Select<[]>
                    placeholder="Selecione o cliente"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={customers}
                    {...field}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />

          <Controller
            name="seller"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <Input.Label>
                  Vendedor*
                  <Select<[]>
                    placeholder="Selecione o vendedor"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={sellers}
                    {...field}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />

          <Controller
            name="products"
            control={control}
            render={({ field: { ref, value }, fieldState: { error } }) => {
              return (
                <Input.Label className="col-span-2 mobile:col-span-1">
                  Produtos*
                  <Select
                    placeholder="Selecione os produtos"
                    noOptionsMessage={() => 'Nenhuma opção'}
                    options={(() => {
                      const selectedProducts = watch('products')?.map(
                        (product) => product.id,
                      )

                      return products.filter(
                        (product) => !selectedProducts.includes(product.id),
                      )
                    })()}
                    onChange={(option: Pod) =>
                      append({ ...option, purchaseAmount: 1 })
                    }
                    value={value?.length ? value[value.length - 1] : undefined}
                    ref={ref}
                  />
                  {!!error?.message && (
                    <Input.Error>{error.message}</Input.Error>
                  )}
                </Input.Label>
              )
            }}
          />

          {selectedProducts && (
            <ul className="col-span-2 flex flex-col gap-4 mobile:col-span-1">
              {fields.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-6"
                >
                  <span className="flex items-center gap-2">
                    <button onClick={() => remove(index)}>
                      <LuTrash />
                    </button>
                    {product.name}
                  </span>

                  <Controller
                    key={product.id}
                    name={`products.${index}.purchaseAmount`}
                    control={control}
                    render={({ field: { onChange, ...field } }) => {
                      return (
                        <Input.Border className="w-20">
                          <Input.Text
                            type="number"
                            min={1}
                            max={product.amount}
                            onChange={(event) =>
                              onChange(
                                event.target.value
                                  ? parseInt(event.target.value)
                                  : '',
                              )
                            }
                            {...field}
                          />
                        </Input.Border>
                      )
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </form>

        <footer className="flex gap-2 mobile:flex-col">
          <Button
            variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
            onClick={closeSaleFormModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
            form="sale-form"
          >
            Confirmar
          </Button>
        </footer>
      </dialog>

      <dialog
        ref={deleteSaleModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Venda</h3>
          <button type="button" onClick={closeDeleteSaleModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <div className="min-h-28 flex-1">
          <p>Tem certeza que deseja remover esta venda?</p>
        </div>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'primary' }}
            className="h-10 flex-1"
            onClick={closeDeleteSaleModal}
          >
            Cancelar
          </Button>
          <Button
            variant={{ colors: 'danger' }}
            className="h-10 flex-1"
            onClick={handleDeleteSale}
          >
            Remover
          </Button>
        </footer>
      </dialog>
    </>
  )
}
