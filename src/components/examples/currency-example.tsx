"use client"

import { FormattedCurrency, CurrencySymbol } from "@/components/ui/formatted-currency"
import { useCurrency } from "@/contexts/currency-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CurrencyExample() {
  const { currency } = useCurrency()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p>Current currency: {currency.name} ({currency.code.toUpperCase()})</p>
          <p>Symbol: <CurrencySymbol /></p>
        </div>
        
        <div className="space-y-2">
          <p>Examples:</p>
          <ul className="space-y-1">
            <li>1000: <FormattedCurrency amount={1000} /></li>
            <li>1234.56: <FormattedCurrency amount={1234.56} /></li>
            <li>1000000: <FormattedCurrency amount={1000000} /></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
