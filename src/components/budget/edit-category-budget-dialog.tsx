'use client'

import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CurrencyInput } from "@/components/ui/currency-input"
import { updateCategoryBudget } from "@/utils/budget/actions"
import { CategoryBudgetFormValues, categoryBudgetSchema } from "@/utils/budget/schemas"

interface EditCategoryBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetId: string
  categoryId: string
  categoryName: string
  initialAmount: number
  onSuccess: () => void
}

export function EditCategoryBudgetDialog({
  open,
  onOpenChange,
  budgetId,
  categoryId,
  categoryName,
  initialAmount,
  onSuccess,
}: EditCategoryBudgetDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Initialize the form
  const form = useForm<CategoryBudgetFormValues>({
    resolver: zodResolver(categoryBudgetSchema),
    defaultValues: {
      category_id: categoryId,
      allocated_amount: initialAmount,
    },
  })

  // Reset form with initial values when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        category_id: categoryId,
        allocated_amount: initialAmount,
      });
    }
  }, [open, categoryId, initialAmount, form]);

  // Handle form submission
  const onSubmit = async (data: CategoryBudgetFormValues) => {
    setIsLoading(true)

    try {
      const result = await updateCategoryBudget(budgetId, data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Category budget updated successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget for {categoryName}</DialogTitle>
          <DialogDescription>
            Adjust the allocated budget amount for this category.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="allocated_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Amount</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      min={0.01}
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Update Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
