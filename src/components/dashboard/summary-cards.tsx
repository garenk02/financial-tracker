"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FormattedCurrency } from "@/components/ui/formatted-currency"

interface BalanceCardProps {
  balance: number
  isLoading?: boolean
}

export function BalanceCard({ balance, isLoading = false }: BalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>Your total available funds</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading balance...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Balance</CardTitle>
        <CardDescription>Your total available funds</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${balance < 0 ? "text-red-500" : ""}`}>
          <FormattedCurrency amount={balance} />
        </p>
        <p className="text-sm text-muted-foreground mt-2">Last updated: Today</p>
      </CardContent>
    </Card>
  )
}

interface BudgetCardProps {
  spent: number
  budget: number
  percentage: number
  isLoading?: boolean
}

export function BudgetCard({ spent, budget, percentage, isLoading = false }: BudgetCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget</CardTitle>
          <CardDescription>Your spending this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading budget data...</p>
        </CardContent>
      </Card>
    )
  }

  const remaining = budget - spent
  const remainingPercentage = 100 - percentage

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
        <CardDescription>Your spending this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            <FormattedCurrency amount={spent} /> spent
          </span>
          <span className="text-sm font-medium">
            <FormattedCurrency amount={budget} /> budget
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {remainingPercentage}% remaining (<FormattedCurrency amount={remaining} />)
        </p>
      </CardContent>
    </Card>
  )
}

interface SummaryCardsProps {
  balance: number
  budgetData: {
    spent: number
    budget: number
    percentage: number
  }
  isLoading?: boolean
}

export function SummaryCards({ balance, budgetData, isLoading = false }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BalanceCard balance={balance} isLoading={isLoading} />
      <BudgetCard
        spent={budgetData.spent}
        budget={budgetData.budget}
        percentage={budgetData.percentage}
        isLoading={isLoading}
      />
    </div>
  )
}

// Mobile summary card component
export function MobileSummaryCard({ balance, budgetData, isLoading = false }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <Card className="mt-4 mb-4 md:hidden">
        <CardHeader className="pb-2">
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading summary data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-4 mb-4 md:hidden">
      <CardHeader className="pb-2">
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium">Monthly Budget</p>
              <p className="text-sm">
                <FormattedCurrency amount={budgetData.spent} /> / <FormattedCurrency amount={budgetData.budget} />
              </p>
            </div>
            <Progress value={budgetData.percentage} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Current Balance</p>
              <p className={`text-lg font-bold ${balance < 0 ? "text-red-500" : ""}`}>
                <FormattedCurrency amount={balance} />
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
