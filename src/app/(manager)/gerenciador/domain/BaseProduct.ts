import { Category } from '@/constants/Category'
import { Option } from '../shared/types'
import { File } from './File'

export interface BaseProduct {
  id: string
  amount: number
  costPrice: number
  finalPrice: number
  images: File[]
  category: Option<Category>
}
