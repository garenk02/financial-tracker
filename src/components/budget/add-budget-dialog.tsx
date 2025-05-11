'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createOrUpdateMonthlyBudget } from "@/utils/budget/actions"
import { MonthlyBudgetFormValues, monthlyBudgetSchema } from "@/utils/budget/schemas"

interface AddBudgetDialogProps {
  onSuccess: () => void
  existingBudget?: {
    id: string
    total_budget: number
    month: number
    year: number
  }
}

export function AddBudgetDialog({ onSuccess, existingBudget }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get current month and year
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentYear = now.getFullYear()

  // Initialize the form
  const form = useForm<MonthlyBudgetFormValues>({
    resolver: zodResolver(monthlyBudgetSchema),
    defaultValues: {
      total_budget: existingBudget?.total_budget || 0,
      month: existingBudget?.month || currentMonth,
      year: existingBudget?.year || currentYear,
    },
  })

  // Handle form submission
  const onSubmit = async (data: MonthlyBudgetFormValues) => {
    setIsLoading(true)

    try {
      const result = await createOrUpdateMonthlyBudget(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(existingBudget ? "Budget updated successfully" : "Budget created successfully")
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingBudget ? "outline" : "default"}>
          {existingBudget ? "Edit Budget" : "Set Monthly Budget"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingBudget ? "Edit Budget" : "Set Monthly Budget"}</DialogTitle>
          <DialogDescription>
            {existingBudget 
              ? "Update your monthly budget amount." 
              : "Set your total budget for the current month."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="total_budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : existingBudget ? "Update Budget" : "Set Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
