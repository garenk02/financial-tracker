'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle } from "lucide-react"

interface CategoryBudget {
  id: string
  allocated_amount: number
  spent: number
  categories: {
    id: string
    name: string
    color: string
    icon?: string
  }
}

interface CategoryBudgetListProps {
  categoryBudgets: CategoryBudget[]
  isLoading?: boolean
}

export function CategoryBudgetList({ categoryBudgets, isLoading = false }: CategoryBudgetListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <CategoryBudgetSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (categoryBudgets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              No category budgets set up yet
            </p>
            <Link href="/budget">
              <Button variant="outline" size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Set Up Budget</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort by percentage spent (highest first)
  const sortedBudgets = [...categoryBudgets].sort((a, b) => {
    const percentA = a.allocated_amount > 0 ? (a.spent / a.allocated_amount) : 0
    const percentB = b.allocated_amount > 0 ? (b.spent / b.allocated_amount) : 0
    return percentB - percentA
  })

  // Take top 3
  const topBudgets = sortedBudgets.slice(0, 3)

  return (
    <div className="space-y-4">
      {topBudgets.map((budget) => (
        <CategoryBudgetItem key={budget.id} budget={budget} />
      ))}
      {categoryBudgets.length > 3 && (
        <div className="text-center mt-2">
          <Link href="/budget">
            <Button variant="link" size="sm" className="text-xs">
              View all category budgets
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function CategoryBudgetItem({ budget }: { budget: CategoryBudget }) {
  const percentage = budget.allocated_amount > 0 
    ? Math.min(Math.round((budget.spent / budget.allocated_amount) * 100), 100) 
    : 0
  
  const remaining = Math.max(budget.allocated_amount - budget.spent, 0)
  const isOverBudget = budget.spent > budget.allocated_amount

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-sm">{budget.categories.name}</span>
          <span className="text-xs font-medium">
            {isOverBudget ? "Over budget" : `${percentage}%`}
          </span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2 mb-2" 
          indicatorClassName={isOverBudget ? "bg-destructive" : undefined}
          style={{ 
            "--progress-background": budget.categories.color 
          } as React.CSSProperties} 
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>${budget.spent.toFixed(2)} spent</span>
          <span>${budget.allocated_amount.toFixed(2)} allocated</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryBudgetSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
