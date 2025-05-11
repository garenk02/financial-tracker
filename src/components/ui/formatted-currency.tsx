"use client"

import { useCurrency } from "@/contexts/currency-context"

interface FormattedCurrencyProps {
  amount: number
  className?: string
  showSymbolOnly?: boolean
}

export function FormattedCurrency({
  amount,
  className,
  showSymbolOnly = false
}: FormattedCurrencyProps) {
  const { formatCurrency, currency } = useCurrency()

  if (showSymbolOnly) {
    return (
      <span className={className}>
        {currency.symbol}
      </span>
    )
  }

  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  )
}

// This component can be used to display just the currency symbol
export function CurrencySymbol({ className }: { className?: string }) {
  const { currency } = useCurrency()

  return (
    <span className={className}>
      {currency.symbol}
    </span>
  )
}
