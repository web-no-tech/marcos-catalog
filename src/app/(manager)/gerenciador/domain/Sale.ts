export interface Sale {
  id: string
  price: number
  profit: number
  discount: number
  additional: number
  paymentMethod: string
  date: string
  products: Array<{
    name: string
    id: string
    amount: number
    finalPrice: number
  }>
  customer: { name: string; id: string }
  seller: { name: string; id: string; pix: string; bank: string }
}
