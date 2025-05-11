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
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateCategoryBudget } from "@/utils/budget/actions"
import { getCategories } from "@/utils/transactions/actions"
import { CategoryBudgetFormValues, categoryBudgetSchema } from "@/utils/budget/schemas"
import { Category } from "@/types/budget"

interface AddCategoryBudgetDialogProps {
  budgetId: string
  onSuccess: () => void
}

export function AddCategoryBudgetDialog({ budgetId, onSuccess }: AddCategoryBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Initialize the form
  const form = useForm<CategoryBudgetFormValues>({
    resolver: zodResolver(categoryBudgetSchema),
    defaultValues: {
      category_id: "",
      allocated_amount: 0,
    },
  })

  // Fetch categories when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const result = await getCategories("expense")
        if (result.success && result.data) {
          setCategories(result.data)
        } else if (result.error) {
          toast.error(result.error)
        }
      }

      fetchCategories()

      // Reset form when dialog opens
      form.reset({
        category_id: "",
        allocated_amount: 0,
      });
    }
  }, [open, form])

  // Handle form submission
  const onSubmit = async (data: CategoryBudgetFormValues) => {
    setIsLoading(true)

    try {
      const result = await updateCategoryBudget(budgetId, data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Category budget added successfully")
      setOpen(false)
      form.reset()
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
        <Button variant="outline">Add Category Budget</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category Budget</DialogTitle>
          <DialogDescription>
            Allocate budget to a specific expense category.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Add Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
