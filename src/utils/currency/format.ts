import { CURRENCIES, type CurrencyCode } from "@/contexts/currency-context"

// Function to format currency for server components
export function formatCurrency(amount: number, currencyCode: CurrencyCode = "usd"): string {
  const normalizedCode = currencyCode.toLowerCase() as CurrencyCode
  const currency = CURRENCIES[normalizedCode] || CURRENCIES.usd
  return currency.format(amount)
}

// Function to get currency symbol
export function getCurrencySymbol(currencyCode: CurrencyCode = "usd"): string {
  const normalizedCode = currencyCode.toLowerCase() as CurrencyCode
  const currency = CURRENCIES[normalizedCode] || CURRENCIES.usd
  return currency.symbol
}

// Function to get currency info
export function getCurrencyInfo(currencyCode: CurrencyCode = "usd") {
  const normalizedCode = currencyCode.toLowerCase() as CurrencyCode
  return CURRENCIES[normalizedCode] || CURRENCIES.usd
}
