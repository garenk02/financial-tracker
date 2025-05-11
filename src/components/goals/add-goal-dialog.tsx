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
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { SimpleDatePicker } from "@/components/ui/simple-date-picker"
import { Switch } from "@/components/ui/switch"

import { addGoal } from "@/utils/goals/actions"
import { GoalFormValues, goalSchema } from "@/utils/goals/schemas"

interface AddGoalDialogProps {
  onSuccess: () => void
}

export function AddGoalDialog({ onSuccess }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize the form
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      target_amount: 0,
      current_amount: 0,
      start_date: new Date().toISOString().split('T')[0], // Today
      target_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0], // 3 months from now
      auto_allocate: false,
      monthly_contribution: undefined,
    },
  })

  // Handle form submission
  const onSubmit = async (data: GoalFormValues) => {
    setIsLoading(true)

    try {
      const result = await addGoal(data)

      if (result.success) {
        toast.success("Goal added successfully")
        form.reset()
        setOpen(false)
        onSuccess()
      } else if (result.error) {
        toast.error(result.error)
      } else {
        toast.error("Unknown error occurred")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add goal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Create New Goal</span>
          <span className="sm:hidden">New Goal</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new financial goal to track your progress.
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
                    <Input placeholder="Vacation Fund" {...field} />
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

            <FormField
              control={form.control}
              name="current_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount (Optional)</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      allowZero={true}
                    />
                  </FormControl>
                  <FormDescription>
                    If you've already saved some money towards this goal
                  </FormDescription>
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
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                        allowZero={true}
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
                {isLoading ? "Creating..." : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
