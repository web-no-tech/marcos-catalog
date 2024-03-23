import { Controller, useFormContext } from 'react-hook-form'

import * as Input from '@/app/(manager)/gerenciador/components/input'
import { ProductForm } from '../../../content'
import { CreatableSelect } from '@/app/(manager)/gerenciador/components/select/creatable'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import { Option } from '@/app/(manager)/gerenciador/shared/types'

const getNormalizedFlavorsRequest = async () => {
  const snapshot = await getDocs(collection(firebaseDb, 'flavors'))
  return snapshot.docs.map((doc) => ({ label: doc.get('name'), value: doc.id }))
}

const getNormalizedManufacturersRequest = async () => {
  const snapshot = await getDocs(collection(firebaseDb, 'manufacturers'))
  return snapshot.docs.map((doc) => ({ label: doc.get('name'), value: doc.id }))
}

const getNormalizedModelsRequest = async (manufacturer: string) => {
  const snapshot = await getDocs(
    query(
      collection(firebaseDb, 'models'),
      where('manufacturer', '==', manufacturer),
    ),
  )
  return snapshot.docs.map((doc) => ({ label: doc.get('name'), value: doc.id }))
}

const createFlavor = async (name: string) => {
  const createdFlavor = await addDoc(collection(firebaseDb, 'flavors'), {
    name,
  })
  return createdFlavor
}

const createManufacturer = async (name: string) => {
  const createdManufacturer = await addDoc(
    collection(firebaseDb, 'manufacturers'),
    { name },
  )
  return createdManufacturer
}

const createModel = async (name: string, manufacturer: string) => {
  const createdModel = await addDoc(collection(firebaseDb, 'models'), {
    name,
    manufacturer,
  })
  return createdModel
}

export function PodForm() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProductForm>()

  const { puffsError } = {
    puffsError: errors.puffs?.message,
  }

  const { manufacturer: selectedManufacturer } = watch()

  const [flavors, setFlavors] = useState<Option[]>([])
  const [manufacturers, setManufacturers] = useState<Option[]>([])
  const [models, setModels] = useState<Option[]>([])

  const updateFlavors = (flavor: Option) => {
    setFlavors((current) => [...current, flavor])
  }
  const updateModels = (model: Option) => {
    setModels((current) => [...current, model])
  }
  const updateManufacturers = (manufacturer: Option) => {
    setManufacturers((current) => [...current, manufacturer])
  }

  const handleGetFlavors = async () => {
    const loadedFlavors = await getNormalizedFlavorsRequest()
    return setFlavors(loadedFlavors)
  }
  const handleGetManufacturers = async () => {
    const loadedManufacturers = await getNormalizedManufacturersRequest()
    return setManufacturers(loadedManufacturers)
  }
  const handleGetModels = async () => {
    const loadedModels = await getNormalizedModelsRequest(
      selectedManufacturer.label,
    )
    return setModels(loadedModels)
  }

  useEffect(() => {
    selectedManufacturer?.label && handleGetModels()
  }, [selectedManufacturer])

  useEffect(() => {
    handleGetFlavors()
    handleGetManufacturers()
  }, [])

  return (
    <>
      <Controller
        name="manufacturer"
        control={control}
        render={({ field: { disabled, ...field }, fieldState: { error } }) => {
          return (
            <Input.Label>
              Marca*
              <CreatableSelect
                placeholder="Selecione a marca"
                noOptionsMessage={() => 'Nenhuma opção'}
                onCreateOption={async (name) => {
                  const createdManufacturer = await createManufacturer(name)
                  updateManufacturers({
                    label: name,
                    value: createdManufacturer.id,
                  })
                }}
                options={manufacturers}
                isDisabled={disabled}
                {...field}
              />
              {!!error?.message && <Input.Error>{error.message}</Input.Error>}
            </Input.Label>
          )
        }}
      />

      <Controller
        name="model"
        control={control}
        disabled={!selectedManufacturer}
        render={({
          field: { disabled, ...restField },
          fieldState: { error },
        }) => {
          return (
            <Input.Label>
              Modelo
              <CreatableSelect
                placeholder="Selecione o modelo"
                noOptionsMessage={() => 'Nenhuma opção'}
                onCreateOption={async (name) => {
                  const createdModel = await createModel(
                    name,
                    selectedManufacturer.label,
                  )
                  updateModels({
                    label: name,
                    value: createdModel.id,
                  })
                }}
                options={models}
                isDisabled={disabled}
                key={JSON.stringify(selectedManufacturer)}
                {...restField}
              />
              {!!error?.message && <Input.Error>{error.message}</Input.Error>}
            </Input.Label>
          )
        }}
      />

      <Input.Label>
        Puffs*
        <Input.Border>
          <Input.Text
            placeholder="Insira os puffs"
            type="number"
            min={0}
            {...register('puffs')}
          />
        </Input.Border>
        {!!puffsError && (
          <Input.Error className="text-xs font-medium text-red-600">
            {puffsError}
          </Input.Error>
        )}
      </Input.Label>

      <Controller
        name="flavor"
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <Input.Label>
              Sabor*
              <CreatableSelect
                placeholder="Selecione o sabor"
                noOptionsMessage={() => 'Nenhuma opção'}
                onCreateOption={async (name) => {
                  const createdFlavor = await createFlavor(name)
                  updateFlavors({
                    label: name,
                    value: createdFlavor.id,
                  })
                }}
                options={flavors}
                {...field}
              />
              {!!error?.message && <Input.Error>{error.message}</Input.Error>}
            </Input.Label>
          )
        }}
      />
    </>
  )
}
