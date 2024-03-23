'use client'

import { ReactElement } from 'react'

import { Button } from '@/app/components/button'

import { LuPlusCircle, LuSearch, LuUpload, LuXCircle } from 'react-icons/lu'
import { z } from 'zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { currencyToNumber } from '@/utils/currency-to-number'
import { useDeleteProductModal } from './hooks/use-delete-product-modal'
import { useProductFormModal } from './hooks/use-product-form-modal'
import { Select } from '../components/select'
import * as Input from '../components/input'
import { PodForm } from './components/form/pod'

import { podSchema } from './components/form/pod/schema'
import { Category } from '@/constants/Category'
import { firebaseDb, firebaseStorage } from '@/lib/firebase'
import { addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'

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
  images: z
    .array(z.object({ url: z.string(), name: z.string() }))
    .min(1, 'Adicione imagens do produto'),
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
  flavor: string
  manufacturer: string
  model: string
  puffs: string
}

interface CreateProductData extends Partial<CreatePodData> {
  amount: number
  costPrice: number
  finalPrice: number
  category: Category
}

async function uploadProductImage(image: any) {
  const uploadedFile = await uploadBytes(
    ref(firebaseStorage, 'product/' + image.name),
    image.url,
  )

  console.log(uploadedFile)
}

function createProductRequest(data: CreateProductData) {
  return addDoc(collection(firebaseDb, `products`), data)
}

export function ProductsContent() {
  const {
    deleteProductModalRef,
    // openDeleteProductModal,
    closeDeleteProductModal,
    toDeleteProduct,
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
    // reset,
  } = productForm

  const { amountError } = {
    amountError: errors.amount?.message,
  }

  const { productCategory, productImages } = {
    productCategory: watch('category')?.value,
    productImages: watch('images'),
  }

  const onSubmitProductForm = async (event) => {
    event.preventDefault()
    // const toUpdateProductId = toUpdateProduct.data?.id
    // const normalizedProduct: CreateProductData = {
    //   costPrice: currencyToNumber(data.costPrice),
    //   finalPrice: currencyToNumber(data.finalPrice),
    //   amount: parseInt(data.amount),
    //   category: data.category.value,
    //   flavor: data.flavor.label,
    //   manufacturer: data.manufacturer.label,
    //   puffs: data.puffs,
    // }

    await uploadProductImage(productImages[0])

    // if (toUpdateProductId) {
    //   // Update product implementation
    // }
    // if (!toUpdateProductId) {
    //   await createProductRequest(normalizedProduct)
    // }
    // closeProductFormModal()
  }

  const onCloseProductFormModal = () => {
    toUpdateProduct.set(null)
  }

  const handleOpenProductFormModal = () => {
    return openProductFormModal()
  }

  // const handleOpenDeleteProductFormModal = (product: Pod) => {
  //   toDeleteProduct.set(product)
  //   return openDeleteProductModal()
  // }

  const handleDeleteProduct = () => {
    const toDeleteProductId = toDeleteProduct.data?.id
    if (toDeleteProductId) {
      // Delete product implementation
    }
    return closeDeleteProductModal()
  }

  const renderCategoryForm = () => {
    if (!productCategory) return

    const categoryForm: Record<Category, ReactElement> = {
      pod: <PodForm />,
    }

    return categoryForm[productCategory]
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <nav className="flex items-center justify-between">
          <div className="flex h-12 items-center gap-2 rounded-lg border border-neutral-300 px-4">
            <input
              className="border-none bg-none text-base text-neutral-700 outline-none"
              placeholder="Buscar produto"
            />
            <LuSearch className="text-xl text-neutral-500" />
          </div>

          <Button
            variant={{ colors: 'primary', sizes: 'md' }}
            onClick={() => handleOpenProductFormModal()}
          >
            <LuPlusCircle className="text-lg" />
            Novo produto
          </Button>
        </nav>

        {/* <List.Root>
          {products.map((product) => (
            <List.Item.Root key={product.id}>
              <List.Item.Slider images={product.images} />

              <List.Item.Columns>
                <List.Item.Column.Root>
                  <List.Item.Column.Title>Estoque</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {product.amount}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>

                <List.Item.Column.Root>
                  <List.Item.Column.Title>Valor</List.Item.Column.Title>
                  <List.Item.Column.Content>
                    {priceFormatter().format(product.finalPrice)}
                  </List.Item.Column.Content>
                </List.Item.Column.Root>

                <List.Item.Column.Root className="items-end justify-center gap-3">
                  <Button
                    variant={{ colors: 'primary' }}
                    className="w-40"
                    onClick={() => handleOpenProductFormModal(product)}
                  >
                    <LuFileEdit />
                    Editar
                  </Button>
                  <Button
                    variant={{ colors: 'danger' }}
                    className="w-40"
                    onClick={() => handleOpenDeleteProductFormModal(product)}
                  >
                    <LuTrash />
                    Remover
                  </Button>
                </List.Item.Column.Root>
              </List.Item.Columns>
            </List.Item.Root>
          ))}
        </List.Root> */}
      </section>

      <dialog
        ref={productFormModalRef}
        className="personalized-scrollbar display-none w-2/5 min-w-96 max-w-[35rem] flex-col gap-4 overflow-visible rounded-lg p-6 shadow-md outline-none backdrop:bg-neutral-700/40 backdrop:backdrop-blur-sm open:flex open:opacity-100"
        onSubmit={onSubmitProductForm}
        onClose={onCloseProductFormModal}
      >
        <header className="flex items-center justify-between border-b border-b-neutral-200 pb-4">
          <h3 className="text-lg font-medium text-neutral-700">Produto</h3>
          <button type="button" onClick={closeProductFormModal}>
            <LuXCircle className="text-xl text-neutral-700" />
          </button>
        </header>

        <FormProvider {...productForm}>
          <form id="product-form" className="grid flex-1 grid-cols-2 gap-3">
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
                  <Input.Label className="col-span-2">
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

                          const formattedFiles = Array.from(files).map(
                            (file) => ({
                              name: file.name,
                              url: URL.createObjectURL(file),
                            }),
                          )

                          const hasProductImages = !!productImages?.length

                          if (hasProductImages) {
                            return onChange([
                              ...productImages,
                              ...formattedFiles,
                            ])
                          }

                          return onChange(formattedFiles)
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
                  return (
                    <div
                      key={image}
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
                          'https://firebasestorage.googleapis.com/v0/b/marcos-catalog.appspot.com/o/product%2FScreenshot%20from%202024-02-28%2014-22-49.png?alt=media&token=83974ab8-86b8-43e8-9d6f-0bbbac4c6a2c'
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

        <footer className="flex gap-2">
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
          <p>
            Tem certeza que deseja remover o produto{' '}
            <strong>{toDeleteProduct.data?.id}</strong>?
          </p>
        </div>

        <footer className="flex gap-2">
          <Button
            variant={{ colors: 'danger' }}
            className="h-10 flex-1"
            onClick={closeDeleteProductModal}
          >
            Cancelar
          </Button>
          <Button
            variant={{ colors: 'primary' }}
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
