'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EditCategoryBudgetDialog } from "./edit-category-budget-dialog"

interface Category {
  id: string
  name: string
  type: string
  color: string
  icon: string
}

interface CategoryBudget {
  id: string
  allocated_amount: number
  categories: Category
  spent?: number
}

interface CategoryBudgetCardProps {
  categoryBudget: CategoryBudget
  budgetId: string
  onUpdate: () => void
}

export function CategoryBudgetCard({ categoryBudget, budgetId, onUpdate }: CategoryBudgetCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Calculate percentage spent
  const spent = categoryBudget.spent || 0
  const allocated = categoryBudget.allocated_amount
  const percentage = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0
  const remaining = Math.max(allocated - spent, 0)

  // Get category color or use a default
  const categoryColor = categoryBudget.categories.color || "#94a3b8"
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-medium">
              {categoryBudget.categories.name}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2 text-sm">
            <span>${spent.toFixed(2)} spent</span>
            <span>${allocated.toFixed(2)} allocated</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2" 
            indicatorClassName={percentage >= 100 ? "bg-destructive" : undefined}
            style={{ 
              "--progress-background": categoryColor 
            } as React.CSSProperties} 
          />
          <p className="text-sm text-muted-foreground mt-2">
            {percentage >= 100 
              ? "Budget exceeded" 
              : `${remaining.toFixed(2)} remaining (${100 - percentage}%)`}
          </p>
        </CardContent>
      </Card>

      {showEditDialog && (
        <EditCategoryBudgetDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          budgetId={budgetId}
          categoryId={categoryBudget.categories.id}
          initialAmount={categoryBudget.allocated_amount}
          categoryName={categoryBudget.categories.name}
          onSuccess={onUpdate}
        />
      )}
    </>
  )
}
