import { BaseProduct } from './BaseProduct'

export interface Pod extends BaseProduct {
  flavor: { name: string; id: string }
  manufacturer: { name: string; id: string }
  model: { name: string; id: string }
  puffs: string
}
