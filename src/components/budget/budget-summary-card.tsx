'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FormattedCurrency } from "@/components/ui/formatted-currency"

interface BudgetSummaryCardProps {
  totalBudget: number
  allocatedAmount: number
  spentAmount: number
}

export function BudgetSummaryCard({
  totalBudget,
  allocatedAmount,
  spentAmount
}: BudgetSummaryCardProps) {
  // Calculate percentages
  const allocationPercentage = totalBudget > 0
    ? Math.min(Math.round((allocatedAmount / totalBudget) * 100), 100)
    : 0

  const spendingPercentage = allocatedAmount > 0
    ? Math.min(Math.round((spentAmount / allocatedAmount) * 100), 100)
    : 0

  const unallocatedAmount = Math.max(totalBudget - allocatedAmount, 0)
  const remainingAmount = Math.max(allocatedAmount - spentAmount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Summary</CardTitle>
        <CardDescription>Your monthly budget overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Total Budget</span>
            <span className="text-sm font-medium">
              <FormattedCurrency amount={totalBudget} />
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Allocated to Categories</span>
            <span className="text-sm">
              <FormattedCurrency amount={allocatedAmount} />
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm">Unallocated</span>
            <span className="text-sm">
              <FormattedCurrency amount={unallocatedAmount} />
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Budget Allocation</span>
            <span className="text-sm font-medium">{allocationPercentage}%</span>
          </div>
          <Progress value={allocationPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {unallocatedAmount > 0
              ? `$${unallocatedAmount.toFixed(2)} unallocated`
              : "All budget allocated"}
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Spending Progress</span>
            <span className="text-sm font-medium">{spendingPercentage}%</span>
          </div>
          <Progress
            value={spendingPercentage}
            className="h-2"
            indicatorClassName={spendingPercentage >= 100 ? "bg-destructive" : undefined}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {spendingPercentage >= 100
              ? "Budget exceeded"
              : <>
                  <FormattedCurrency amount={remainingAmount} /> remaining
                </>
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
