"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
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
  min = 100,
  max,
  placeholder = "",
  ...props
}: CurrencyInputProps) {
  // Get the currency context
  const { currency } = useCurrency()

  // State to track if the input is being focused/edited
  const [isFocused, setIsFocused] = useState(false)
  // State to track the raw input value during editing
  const [inputValue, setInputValue] = useState("")

  // Get locale settings based on currency
  const getLocaleSettings = useCallback(() => {
    let locale = 'en-US'

    // Adjust locale based on currency
    if (currency.code === 'jpy') {
      locale = 'ja-JP'
    } else if (currency.code === 'idr') {
      locale = 'id-ID'
    }

    // Always use 0 fraction digits (no decimals)
    const fractionDigits = 0

    return { locale, fractionDigits }
  }, [currency.code])

  // Format the value for display with thousand separators
  const formatValue = useCallback((val: number | undefined): string => {
    if (val === undefined || isNaN(val)) return ""

    const { locale, fractionDigits } = getLocaleSettings()

    // Format with thousand separators
    return val.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })
  }, [getLocaleSettings])

  // Parse the display value back to a number
  const parseValue = useCallback((val: string): number | undefined => {
    if (!val) return undefined

    // Remove all non-numeric characters
    const cleanedValue = val.replace(/[^\d]/g, '')
    const parsedValue = parseInt(cleanedValue, 10)

    if (isNaN(parsedValue)) return undefined

    // Ensure value is not negative
    if (parsedValue < 0) {
      return 0
    }

    // Apply min/max constraints
    if (parsedValue < min) {
      return min
    }

    // Handle zero value based on allowZero setting
    if (!allowZero && parsedValue === 0) {
      return min > 0 ? min : undefined
    }

    if (max !== undefined && parsedValue > max) {
      return max
    }

    return parsedValue
  }, [allowZero, max, min])

  // Initialize the input value
  useEffect(() => {
    setInputValue(formatValue(value))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update the input value when the external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatValue(value))
    }
  }, [value, formatValue, isFocused])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value

    // Check if the input is valid for a number
    // Allow only digits and empty input for clearing
    const isValidInput = newInputValue === '' || /^\d*$/.test(newInputValue);

    if (isValidInput) {
      setInputValue(newInputValue)

      // Only update the actual value if we have a valid number
      const parsedValue = parseValue(newInputValue)

      // Ensure the value is not negative and meets minimum requirements
      if (parsedValue !== undefined) {
        // Apply minimum value constraint
        const finalValue = Math.max(parsedValue, min)
        onChange(finalValue)
      } else if (newInputValue === '') {
        // If the input is empty, set value to undefined
        onChange(undefined)
      }
    }
  }

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    e.target.select()

    // When focusing, show the raw number without formatting for easier editing
    const parsedValue = parseValue(e.target.value)
    if (parsedValue !== undefined) {
      // Use toString to remove formatting but keep decimal places
      setInputValue(parsedValue.toString())
    } else {
      setInputValue("")
    }
  }

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false)

    // When blurring, format the value nicely
    const parsedValue = parseValue(inputValue)
    if (parsedValue !== undefined) {
      // Apply minimum value constraint
      const finalValue = Math.max(parsedValue, min)
      setInputValue(formatValue(finalValue))
      onChange(finalValue)
    } else if (inputValue === '') {
      setInputValue("")
      onChange(undefined)
    }
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  )
}
