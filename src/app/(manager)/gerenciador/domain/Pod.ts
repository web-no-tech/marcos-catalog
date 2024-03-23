import { BaseProduct } from './BaseProduct'

export interface Pod extends BaseProduct {
  flavor: string
  manufacturer: string
  model: string
  puffs: string
}
