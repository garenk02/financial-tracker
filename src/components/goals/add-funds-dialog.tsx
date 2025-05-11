"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CurrencyInput } from "@/components/ui/currency-input"

import { addFundsToGoal } from "@/utils/goals/actions"
import { AddFundsFormValues, addFundsSchema } from "@/utils/goals/schemas"

interface AddFundsDialogProps {
  goalId: string
  goalName: string
  onSuccess: () => void
}

export function AddFundsDialog({ goalId, goalName, onSuccess }: AddFundsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize the form
  const form = useForm<AddFundsFormValues>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: {
      goal_id: goalId,
      amount: 0,
    },
  })

  // Handle form submission
  const onSubmit = async (data: AddFundsFormValues) => {
    setIsLoading(true)

    try {
      const result = await addFundsToGoal(data)

      if (result.success) {
        toast.success("Funds added successfully")
        form.reset({ goal_id: goalId, amount: 0 })
        setOpen(false)

        // Force an immediate refresh to update the UI with the latest data
        onSuccess()

        // Force another refresh after a delay to ensure any database triggers have completed
        setTimeout(() => {
          onSuccess()
        }, 500)
      } else if (result.error) {
        toast.error(result.error)
      } else {
        toast.error("Unknown error occurred")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add funds")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="h-3.5 w-3.5 mr-1" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Funds to Goal</DialogTitle>
          <DialogDescription>
            Add funds to your &quot;{goalName}&quot; goal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      min={0.01}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be recorded as a transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Funds"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
