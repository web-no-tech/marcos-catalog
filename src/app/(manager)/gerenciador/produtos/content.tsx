'use client'

import { ReactElement, useEffect, useState } from 'react'

import { Button } from '@/app/components/button'

import {
  LuFileEdit,
  LuPlusCircle,
  LuTrash,
  LuUpload,
  LuXCircle,
} from 'react-icons/lu'
import { z } from 'zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useDeleteProductModal } from './hooks/use-delete-product-modal'
import { useProductFormModal } from './hooks/use-product-form-modal'
import { Select } from '../components/select'
import * as Input from '../components/input'
import { PodForm } from './components/form/pod'

import { podSchema } from './components/form/pod/schema'
import { Category } from '@/constants/Category'
import { firebaseDb, firebaseStorage } from '@/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { currencyToNumber } from '@/utils/currency-to-number'
import { BaseProduct } from '../domain/BaseProduct'
import List from './components/list'
import { priceFormatter } from '@/utils/price-formatter'

const productSchema = z.object({
  amount: z
    .string({ required_error: 'Insira a quantidade do produto' })
    .min(1, 'Insira a quantidade do produto'),
  costPrice: z
    .string({ required_error: 'Insira o valor de custo do produto' })
    .min(1, 'Insira o valor de custo do produto'),
  finalPrice: z
    .string({ required_error: 'Insira o valor de venda do produto' })
    .min(1, 'Insira o valor de venda do produto'),
  images: z.array(z.custom<File>()).min(1, 'Adicione imagens do produto'),
  category: z.object(
    {
      label: z.string(),
      value: z.nativeEnum(Category),
    },
    { required_error: 'Selecione a categoria do produto' },
  ),
  ...podSchema,
})

export type ProductForm = z.infer<typeof productSchema>

type CreatePodData = {
  flavor: { name: string; id: string }
  manufacturer: { name: string; id: string }
  model: { name: string; id: string }
  puffs: string
}

interface CreateProductData extends Partial<CreatePodData> {
  amount: number
  costPrice: number
  finalPrice: number
  category: { name: string; id: string }
  images: string[]
  name: string
}

async function uploadProductImage(image: File) {
  const uploadedFile = await uploadBytes(
    ref(firebaseStorage, `product/${Date.now()}-${image.name}`),
    image,
  )
  return uploadedFile.metadata
}

function createProductRequest(data: CreateProductData) {
  return addDoc(collection(firebaseDb, 'products'), data)
}

function updateProductRequest(id: string, data: CreateProductData) {
  const product = doc(firebaseDb, 'products', id)
  return setDoc(product, data)
}

function deleteProductRequest(productId: string) {
  return deleteDoc(doc(firebaseDb, 'products/' + productId))
}

async function getProductsRequest() {
  const snapshot = await getDocs(collection(firebaseDb, 'products'))

  const productsWithImages = []

  for (const doc of snapshot.docs) {
    const baseProduct = {
      ...(doc.data() as BaseProduct),
      id: doc.id,
    }

    const images = await Promise.all(
      doc.get('images').map(async (image: string) => {
        const storageRef = ref(firebaseStorage, image)
        return getDownloadURL(storageRef)
      }),
    )

    productsWithImages.push({
      ...baseProduct,
      images,
    })
  }

  return productsWithImages
}

export function ProductsContent() {
  const [products, setProducts] = useState<BaseProduct[]>([])

  const {
    deleteProductModalRef,
    closeDeleteProductModal,
    toDeleteProduct,
    openDeleteProductModal,
  } = useDeleteProductModal()

  const {
    productFormModalRef,
    openProductFormModal,
    closeProductFormModal,
    toUpdateProduct,
  } = useProductFormModal()

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
    watch,
    setValue,
    reset,
  } = productForm

  const { amountError } = {
    amountError: errors.amount?.message,
  }

  const { productCategory, productImages } = {
    productCategory: watch('category')?.label,
    productImages: watch('images'),
  }

  const onSubmitProductForm = async (data: ProductForm) => {
    const uploadProductImagePromises = data.images.map((image) => {
      if (typeof image === 'string') {
        return Promise.resolve(image)
      }
      return uploadProductImage(image)
    })

    const uploadedProductImages = await Promise.all(uploadProductImagePromises)

    const toUpdateProductId = toUpdateProduct.data?.id
    const normalizedProduct: CreateProductData = {
      costPrice: currencyToNumber(data.costPrice),
      finalPrice: currencyToNumber(data.finalPrice),
      amount: parseInt(data.amount),
      puffs: data.puffs,
      name: `${data.manufacturer.label} ${data.model.label} ${data.puffs} puffs - ${data.flavor.label}`,
      images: uploadedProductImages.map((image) =>
        typeof image === 'string' ? image : image.fullPath,
      ),
      category: {
        name: data.category.label,
        id: data.category.value,
      },
      flavor: {
        name: data.flavor.label,
        id: data.flavor.value,
      },
      manufacturer: {
        name: data.manufacturer.label,
        id: data.manufacturer.value,
      },
      model: {
        name: data.model.label,
        id: data.model.value,
      },
    }

    if (toUpdateProductId) {
      await updateProductRequest(toUpdateProductId, normalizedProduct)
    }
    if (!toUpdateProductId) {
      await createProductRequest(normalizedProduct)
    }
    handleGetProducts()
    closeProductFormModal()
  }

  const onCloseProductFormModal = () => {
    toUpdateProduct.set(null)
  }

  const handleOpenProductFormModal = () => {
    return openProductFormModal()
  }

  const handleOpenDeleteProductFormModal = (product: BaseProduct) => {
    toDeleteProduct.set(product)
    return openDeleteProductModal()
  }

  const handleOpenUpdateProductFormModal = (product: BaseProduct) => {
    toUpdateProduct.set(product)
    return openProductFormModal()
  }

  const handleDeleteProduct = () => {
    const toDeleteProductId = toDeleteProduct.data?.id
    if (toDeleteProductId) {
      deleteProductRequest(toDeleteProductId)
      handleGetProducts()
    }
    return closeDeleteProductModal()
  }

  const handleGetProducts = async () => {
    const loadedProducts = await getProductsRequest()
    return setProducts(loadedProducts)
  }

  const renderCategoryForm = () => {
    if (!productCategory) return

    const categoryForm: Record<string, ReactElement> = {
      Pod: <PodForm />,
    }

    return categoryForm[productCategory]
  }

  useEffect(() => {
    handleGetProducts()
  }, [])

  useEffect(() => {
    reset({
      amount: toUpdateProduct.data?.amount.toString() ?? null,
      costPrice: toUpdateProduct.data?.costPrice.toString(),
      finalPrice: toUpdateProduct.data?.finalPrice.toString(),
      puffs: toUpdateProduct.data?.puffs,
      images: toUpdateProduct.data?.images,
      model: toUpdateProduct.data?.model && {
        label: toUpdateProduct.data?.model.name,
        value: toUpdateProduct.data?.model.id,
      },
      manufacturer: toUpdateProduct.data?.manufacturer && {
        label: toUpdateProduct.data?.manufacturer.name,
        value: toUpdateProduct.data?.manufacturer.id,
      },
      category: toUpdateProduct.data?.category && {
        label: toUpdateProduct.data?.category.name,
        value: toUpdateProduct.data?.category.id,
      },
      flavor: toUpdateProduct.data?.flavor && {
        label: toUpdateProduct.data?.flavor.name,
        value: toUpdateProduct.data?.flavor.id,
      },
    })
  }, [toUpdateProduct.data])

  return (
    <>
      <section className="flex flex-col gap-6">
        <nav className="flex items-center justify-between mobile:flex-col mobile:items-start mobile:gap-6">
          <h2 className="text-2xl font-semibold text-neutral-700">
            Lista de Produtos
          </h2>
          <Button
            variant={{ colors: 'primary', sizes: 'md' }}
            onClick={() => handleOpenProductFormModal()}
            className="mobile:w-full"
          >
            <LuPlusCircle className="text-lg" />
            Novo produto
          </Button>
        </nav>

        <List.Root>
          {products.map((product) => (
            <List.Item.Root key={product.id}>
              <List.Item.Slider
                images={product.images.map((image) => ({
                  url: image,
                }))}
              />

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Nome</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {product.name}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Valor</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {priceFormatter().format(product.finalPrice)}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>

                <List.Item.Column.Root>
                  <List.Item.Column.Title>Estoque</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {product.amount}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>
              </List.Item.Columns>

              <div className="flex w-full flex-col gap-2">
                <Button
                  variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenUpdateProductFormModal(product)}
                >
                  <LuFileEdit className="text-lg" />
                  Editar
                </Button>
                <Button
                  variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
                  onClick={() => handleOpenDeleteProductFormModal(product)}
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
        ref={productFormModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 overflow-auto rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
        onSubmit={handleSubmit(onSubmitProductForm)}
        onClose={onCloseProductFormModal}
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Produto</h3>
          <button type="button" onClick={closeProductFormModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <FormProvider {...productForm}>
          <form
            id="product-form"
            className="grid flex-1 grid-cols-2 gap-3 mobile:grid-cols-1"
          >
            <Controller
              name="costPrice"
              control={control}
              render={({
                field: { onChange, ...fieldProps },
                fieldState: { error },
              }) => (
                <Input.Label>
                  Valor de custo*
                  <Input.Border>
                    <Input.Currency
                      placeholder="Insira o valor de custo"
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
              name="finalPrice"
              control={control}
              render={({
                field: { onChange, ...fieldProps },
                fieldState: { error },
              }) => (
                <Input.Label>
                  Valor de venda*
                  <Input.Border>
                    <Input.Currency
                      placeholder="Insira o valor de venda"
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
              Quantidade*
              <Input.Border>
                <Input.Text
                  placeholder="Insira a quantidade"
                  type="number"
                  min={0}
                  {...register('amount')}
                />
              </Input.Border>
              {!!amountError && (
                <Input.Error className="text-xs font-medium text-red-600">
                  {amountError}
                </Input.Error>
              )}
            </Input.Label>

            <Controller
              name="category"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <Input.Label>
                    Categoria*
                    <Select
                      placeholder="Selecione a categoria"
                      noOptionsMessage={() => 'Nenhuma opção'}
                      options={[{ label: 'Pod', value: 'pod' }]}
                      {...field}
                    />
                    {!!error?.message && (
                      <Input.Error>{error.message}</Input.Error>
                    )}
                  </Input.Label>
                )
              }}
            />

            {renderCategoryForm()}

            <Controller
              name="images"
              control={control}
              render={({
                field: { onChange, ...field },
                fieldState: { error },
              }) => {
                return (
                  <Input.Label className="col-span-2 mobile:col-span-1">
                    <Input.Border className="justify-center hover:cursor-pointer">
                      <LuUpload />
                      Adicionar imagens
                      <input
                        {...field}
                        value=""
                        hidden
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => {
                          const files = event.target.files

                          if (!files) return

                          const hasProductImages = !!productImages?.length

                          if (hasProductImages) {
                            return onChange([
                              ...productImages,
                              ...Array.from(files),
                            ])
                          }

                          return onChange(Array.from(files))
                        }}
                      />
                    </Input.Border>
                    {!!error && <Input.Error>{error.message}</Input.Error>}
                  </Input.Label>
                )
              }}
            />

            {productImages && (
              <div className="personalized-scrollbar col-span-2 flex gap-1 overflow-x-auto">
                {productImages.map((image) => {
                  const key = crypto.randomUUID()
                  return (
                    <div
                      key={key}
                      className="relative max-h-28 min-h-28 min-w-28 max-w-28 rounded border border-neutral-200 bg-neutral-100"
                    >
                      <button
                        type="button"
                        className="absolute right-1 top-1 z-50 text-base text-neutral-700 hover:text-neutral-900"
                        title="Remover imagem"
                        onClick={() => {
                          const restImages = productImages.filter(
                            (_image) => _image !== image,
                          )
                          return setValue('images', restImages)
                        }}
                      >
                        <LuXCircle />
                      </button>

                      <Image
                        fill
                        alt="Imagem do produto"
                        src={
                          typeof image === 'string'
                            ? image
                            : URL.createObjectURL(image)
                        }
                        className="object-contain"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </form>
        </FormProvider>

        <footer className="flex gap-2 mobile:flex-col">
          <Button
            variant={{ colors: 'danger', sizes: 'md', layout: 'fill' }}
            onClick={closeProductFormModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={{ colors: 'primary', sizes: 'md', layout: 'fill' }}
            form="product-form"
          >
            Confirmar
          </Button>
        </footer>
      </dialog>

      <dialog
        ref={deleteProductModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Produto</h3>
          <button type="button" onClick={closeDeleteProductModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <div className="min-h-28 flex-1">
          <p>Tem certeza que deseja remover este produto?</p>
        </div>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'primary' }}
            className="h-10 flex-1"
            onClick={closeDeleteProductModal}
          >
            Cancelar
          </Button>
          <Button
            variant={{ colors: 'danger' }}
            className="h-10 flex-1"
            onClick={handleDeleteProduct}
          >
            Remover
          </Button>
        </footer>
      </dialog>
    </>
  )
}
