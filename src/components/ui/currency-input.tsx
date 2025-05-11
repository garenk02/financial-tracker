"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/contexts/currency-context"

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: number | undefined
  onChange: (value: number | undefined) => void
  allowZero?: boolean
  min?: number
  max?: number
  placeholder?: string
}

export function CurrencyInput({
  value,
  onChange,
  allowZero = false,
  min = 0,
  max,
  placeholder = "0.00",
  ...props
}: CurrencyInputProps) {
  // Get the currency context
  const { currency } = useCurrency()

  // Format the value for display with thousand separators
  const formatValue = (val: number | undefined): string => {
    if (val === undefined || isNaN(val)) return ""

    // Get the locale based on the currency
    let locale = 'en-US'
    let fractionDigits = 2

    // Adjust locale and fraction digits based on currency
    if (currency.code === 'jpy') {
      locale = 'ja-JP'
      fractionDigits = 0
    } else if (currency.code === 'idr') {
      locale = 'id-ID'
      fractionDigits = 0
    }

    // Format with thousand separators
    return val.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })
  }

  // Parse the display value back to a number
  const parseValue = (val: string): number | undefined => {
    if (!val) return undefined

    // Remove all non-numeric characters except decimal point
    const cleanedValue = val.replace(/[^\d.-]/g, '')
    const parsedValue = parseFloat(cleanedValue)

    if (isNaN(parsedValue)) return undefined

    // Apply min/max constraints
    if (parsedValue < min || (!allowZero && parsedValue === 0)) {
      return min > 0 ? min : undefined
    }

    if (max !== undefined && parsedValue > max) {
      return max
    }

    return parsedValue
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const parsedValue = parseValue(inputValue)
    onChange(parsedValue)
  }

  // Handle focus to select all text
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={formatValue(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      {...props}
    />
  )
}
