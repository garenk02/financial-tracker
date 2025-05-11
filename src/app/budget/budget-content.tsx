'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { PiggyBank } from "lucide-react"
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog"
import { AddCategoryBudgetDialog } from "@/components/budget/add-category-budget-dialog"
import { CategoryBudgetCard } from "@/components/budget/category-budget-card"
import { BudgetSummaryCard } from "@/components/budget/budget-summary-card"
import { getCurrentMonthlyBudget } from "@/utils/budget/actions"
import { getMonthlySpendingSummary, getCategoryBudgetsWithSpending } from "@/utils/dashboard/actions"
import { Budget, CategoryBudget, SpendingData } from "@/types/budget"

// Skeleton loader for category budget cards
function CategoryBudgetCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function BudgetContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([])
  const [spendingData, setSpendingData] = useState<SpendingData>({
    spent: 0,
    budget: 0,
    remaining: 0,
    percentage: 0
  })

  // Calculate the current month and year
  const now = new Date()
  // const currentMonth = now.getMonth() + 1 // 1-12 (unused)
  const currentYear = now.getFullYear()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const monthName = monthNames[now.getMonth()]

  // Function to load budget data
  const loadBudgetData = async () => {
    setIsLoading(true)
    try {
      // Get the current monthly budget
      const budgetResult = await getCurrentMonthlyBudget()

      if (budgetResult.error) {
        toast.error(budgetResult.error)
        setIsLoading(false)
        return
      }

      // If budget exists, get category allocations with spending data
      if (budgetResult.success && budgetResult.data) {
        setBudget(budgetResult.data)

        // Get category budgets with spending data
        const categoryBudgetsResult = await getCategoryBudgetsWithSpending()

        if (categoryBudgetsResult.error) {
          toast.error(categoryBudgetsResult.error)
        } else if (categoryBudgetsResult.success) {
          setCategoryBudgets(categoryBudgetsResult.data as CategoryBudget[] || [])
        }
      } else {
        setBudget(null)
        setCategoryBudgets([])
      }

      // Get spending data
      const spendingResult = await getMonthlySpendingSummary()
      if (spendingResult.success) {
        setSpendingData(spendingResult.data)
      }
    } catch (error) {
      console.error("Error loading budget data:", error)
      toast.error("Failed to load budget data")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadBudgetData()
  }, [])

  // Calculate total allocated amount
  const totalAllocated = categoryBudgets.reduce(
    (sum, item) => sum + item.allocated_amount,
    0
  )

  // The categoryBudgets from getCategoryBudgetsWithSpending already include spending data

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Budget for {monthName} {currentYear}
        </h1>
        <div className="flex gap-2 self-stretch md:self-auto">
          {budget ? (
            <AddBudgetDialog
              onSuccess={loadBudgetData}
              existingBudget={{
                id: budget.id,
                total_budget: budget.total_budget,
                month: budget.month,
                year: budget.year
              }}
            />
          ) : (
            <AddBudgetDialog onSuccess={loadBudgetData} />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-3">
            <Skeleton className="h-[200px] w-full" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <CategoryBudgetCardSkeleton key={index} />
          ))}
        </div>
      ) : !budget ? (
        <EmptyState
          icon={<PiggyBank className="h-12 w-12 text-muted-foreground" />}
          title="No budget set"
          description="Set a monthly budget to start tracking your spending by category."
          action={<AddBudgetDialog onSuccess={loadBudgetData} />}
        />
      ) : (
        <>
          <div className="mb-6">
            <BudgetSummaryCard
              totalBudget={budget.total_budget}
              allocatedAmount={totalAllocated}
              spentAmount={spendingData.spent}
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Category Budgets</h2>
            {budget && (
              <AddCategoryBudgetDialog
                budgetId={budget.id}
                onSuccess={loadBudgetData}
              />
            )}
          </div>

          {categoryBudgets.length === 0 ? (
            <EmptyState
              icon={<PiggyBank className="h-12 w-12 text-muted-foreground" />}
              title="No category budgets"
              description="Allocate your budget to specific categories to track spending more effectively."
              action={
                budget && (
                  <AddCategoryBudgetDialog
                    budgetId={budget.id}
                    onSuccess={loadBudgetData}
                  />
                )
              }
            />
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {categoryBudgets.map((categoryBudget) => (
                <CategoryBudgetCard
                  key={categoryBudget.id}
                  categoryBudget={categoryBudget}
                  budgetId={budget.id}
                  onUpdate={loadBudgetData}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
