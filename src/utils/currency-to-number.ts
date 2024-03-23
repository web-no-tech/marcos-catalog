export function currencyToNumber(value: string) {
  return parseFloat(value.replace(',', '.'))
}
