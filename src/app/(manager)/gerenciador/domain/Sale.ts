export interface Sale {
  id: string
  price: number
  profit: number
  discount: number
  additional: number
  paymentMethod: string
  date: string
  products: Array<{ name: string; id: string; amount: number }>
  customer: { name: string; id: string }
}
