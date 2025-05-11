"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Goal as GoalIcon } from "lucide-react"
import { Goal } from "@/types/goals"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { EditGoalDialog } from "./edit-goal-dialog"
import { AddFundsDialog } from "./add-funds-dialog"
import { deleteGoal } from "@/utils/goals/actions"
import { FormattedCurrency } from "@/components/ui/formatted-currency"

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Use pre-calculated percentage if available, otherwise calculate it
  let progressPercentage = 0

  if (goal._percentage !== undefined) {
    // Use pre-calculated percentage from the server
    progressPercentage = goal._percentage
  } else {
    // Ensure values are numbers for calculation
    const currentAmount = typeof goal.current_amount === 'string'
      ? parseFloat(goal.current_amount)
      : goal.current_amount || 0

    const targetAmount = typeof goal.target_amount === 'string'
      ? parseFloat(goal.target_amount)
      : goal.target_amount || 1 // Prevent division by zero

    // Calculate progress percentage
    progressPercentage = Math.min(
      Math.round((currentAmount / targetAmount) * 100),
      100
    )
  }

  // Format target date
  const formattedTargetDate = new Date(goal.target_date)
  const timeToTarget = formatDistanceToNow(formattedTargetDate, { addSuffix: true })

  // Handle delete
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this goal?")) {
      setIsDeleting(true)
      try {
        const result = await deleteGoal(goal.id)
        if (result.success) {
          toast.success("Goal deleted successfully")
          onUpdate()
        } else if (result.error) {
          toast.error(result.error)
        }
      } catch {
        toast.error("Failed to delete goal")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <GoalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="line-clamp-1">{goal.name}</span>
            </CardTitle>
            <CardDescription>
              Target: {timeToTarget}
            </CardDescription>
          </div>
          {goal.is_completed && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
              Completed
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-6">
        <div className="flex justify-between mb-2">
          <span className="text-xs sm:text-sm font-medium">
            <FormattedCurrency
              amount={typeof goal.current_amount === 'string'
                ? parseFloat(goal.current_amount)
                : goal.current_amount || 0}
            />
          </span>
          <span className="text-xs sm:text-sm font-medium">
            <FormattedCurrency
              amount={typeof goal.target_amount === 'string'
                ? parseFloat(goal.target_amount)
                : goal.target_amount || 0}
            />
          </span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2"
          indicatorClassName={goal.is_completed ? "bg-green-500" : undefined}
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          {progressPercentage}% complete
        </p>

        <div className="mt-4 space-y-1">
          <p className="text-xs sm:text-sm">
            Target date: {new Date(goal.target_date).toLocaleDateString()}
          </p>
          {goal.monthly_contribution && (
            <p className="text-xs sm:text-sm font-medium">
              <FormattedCurrency amount={goal.monthly_contribution} /> monthly contribution
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between pt-2">
        <div className="flex gap-2">
          <EditGoalDialog goal={goal} onSuccess={onUpdate} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs sm:text-sm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
        <AddFundsDialog goalId={goal.id} goalName={goal.name} onSuccess={onUpdate} />
      </CardFooter>
    </Card>
  )
}
