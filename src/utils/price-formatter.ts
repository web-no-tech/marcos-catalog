export function priceFormatter(options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    ...options,
  })
}
