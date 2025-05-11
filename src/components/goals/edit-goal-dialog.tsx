"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PencilIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { Switch } from "@/components/ui/switch"

import { updateGoal } from "@/utils/goals/actions"
import { GoalFormValues, goalSchema } from "@/utils/goals/schemas"

interface EditGoalDialogProps {
  goal: {
    id: string
    name: string
    target_amount: number
    current_amount: number
    start_date: string
    target_date: string
    is_completed: boolean
    auto_allocate: boolean
    monthly_contribution: number | null
  }
  onSuccess: () => void
}

export function EditGoalDialog({ goal, onSuccess }: EditGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize the form
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      start_date: goal.start_date,
      target_date: goal.target_date,
      auto_allocate: goal.auto_allocate,
      monthly_contribution: goal.monthly_contribution || undefined,
    },
  })

  // Handle form submission
  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true)

    try {
      const result = await updateGoal(goal.id, data)

      if (result.success) {
        toast.success("Goal updated successfully")
        setOpen(false)
        onSuccess()
      } else if (result.error) {
        toast.error(result.error)
      } else {
        toast.error("Unknown error occurred")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update goal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PencilIcon className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update your financial goal details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <SimpleDatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="YYYY-MM-DD"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <SimpleDatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="YYYY-MM-DD"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="auto_allocate"
              render={({ field }) => (
                <FormItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5 mb-2 sm:mb-0">
                    <FormLabel className="text-sm">Auto Calculate Monthly Contribution</FormLabel>
                    <FormDescription className="text-xs">
                      Automatically calculate how much you need to save monthly
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch("auto_allocate") && (
              <FormField
                control={form.control}
                name="monthly_contribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Contribution (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      How much you plan to save each month
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
