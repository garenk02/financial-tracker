"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { Switch } from "@/components/ui/switch"
import { RecurringFrequency, formatFrequency } from "@/types/recurring-transactions"

import { addRecurringTransaction } from "@/utils/recurring-transactions/actions"
import { getCategories } from "@/utils/transactions/actions"
import { RecurringTransactionFormValues, recurringTransactionSchema } from "@/utils/recurring-transactions/schemas"
import { Category } from "@/types/budget"

export function AddRecurringTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isIncome, setIsIncome] = useState(false)

  // Initialize the form
  const form = useForm<RecurringTransactionFormValues>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      category_id: "",
      is_income: false,
      frequency: "monthly",
      start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      end_date: null,
    },
  })

  // Update the is_income field when the switch changes
  useEffect(() => {
    form.setValue("is_income", isIncome)
  }, [isIncome, form])

  // Fetch categories when the dialog opens or when isIncome changes
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const result = await getCategories(isIncome ? "income" : "expense")
        if (result.success && result.data) {
          setCategories(result.data)
        } else if (result.error) {
          toast.error(result.error)
        }
      }

      fetchCategories()
    }
  }, [open, isIncome])

  // Handle form submission
  const onSubmit = async (data: RecurringTransactionFormValues) => {
    setIsLoading(true)

    try {
      const result = await addRecurringTransaction(data)

      if (result.success) {
        toast.success("Recurring transaction added successfully")
        form.reset()
        setOpen(false)
      } else if (result.error) {
        toast.error(result.error)
      }
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
        <Button variant="default" className="flex items-center justify-center gap-1 flex-1 sm:flex-none">Add Recurring</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Add Recurring Transaction</DialogTitle>
          <DialogDescription>
            Set up a transaction that repeats on a schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="is_income"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Transaction Type</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={isIncome}
                      onCheckedChange={(checked) => {
                        setIsIncome(checked)
                        form.setValue("category_id", "") // Reset category when type changes
                      }}
                    />
                  </FormControl>
                  <div className="text-sm font-medium">
                    {isIncome ? "Income" : "Expense"}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      min={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] as RecurringFrequency[]).map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {formatFrequency(freq)}
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
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <SimpleDatePicker
                      date={field.value}
                      setDate={(date) => field.onChange(date)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <SimpleDatePicker
                      date={field.value || undefined}
                      setDate={(date) => field.onChange(date)}
                      placeholder="No end date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 sm:mt-8">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Adding..." : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
