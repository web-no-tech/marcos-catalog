export interface BaseProduct {
  id: string
  amount: number
  costPrice: number
  finalPrice: number
  images: string[]
  category: { name: string; id: string }
  name: string
}
