"use client"

import { useEffect } from "react"
import { useCurrency, CurrencyCode } from "@/contexts/currency-context"

export function CurrencyInitializer({ 
  initialCurrency 
}: { 
  initialCurrency?: string 
}) {
  const { setCurrencyCode } = useCurrency()

  // Set the initial currency from server-side props
  useEffect(() => {
    if (initialCurrency) {
      console.log("Setting initial currency from server props:", initialCurrency)
      setCurrencyCode(initialCurrency.toLowerCase() as CurrencyCode)
    }
  }, [initialCurrency, setCurrencyCode])

  return null
}
