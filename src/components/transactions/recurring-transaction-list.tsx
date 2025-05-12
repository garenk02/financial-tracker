"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FormattedCurrency } from "@/components/ui/formatted-currency"
import { RecurringTransaction, formatFrequency } from "@/types/recurring-transactions"
import { deleteRecurringTransaction } from "@/utils/recurring-transactions/actions"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface RecurringTransactionListProps {
  recurringTransactions: RecurringTransaction[]
  isLoading?: boolean
  onUpdate?: () => void
}

export function RecurringTransactionList({
  recurringTransactions,
  isLoading = false,
  onUpdate
}: RecurringTransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    try {
      const result = await deleteRecurringTransaction({ id })

      if (result.success) {
        toast.success("Recurring transaction deleted successfully")
        if (onUpdate) onUpdate()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-lg">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
                <div className="flex-1 mb-2 sm:mb-0">
                  <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                    <Skeleton className="h-5 w-[150px]" />
                    <Skeleton className="h-5 w-[80px] sm:hidden" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <Skeleton className="h-5 w-[80px] hidden sm:block" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recurringTransactions || recurringTransactions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-lg">Recurring Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">No recurring transactions found</p>
            <p className="text-xs text-muted-foreground">Create a recurring transaction to automatically generate transactions on a schedule</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-lg">Recurring Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recurringTransactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 mb-2 sm:mb-0">
                <div className="flex items-center justify-between sm:justify-start gap-2 mb-1">
                  <p className="font-medium text-base">{transaction.description}</p>
                  <p
                    className={`font-medium text-base sm:hidden ${
                      transaction.is_income ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.is_income ? "+" : "-"}
                    <FormattedCurrency amount={transaction.amount} />
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: transaction.categories?.color ? `${transaction.categories.color}30` : undefined,
                      color: transaction.categories?.color || undefined
                    }}
                  >
                    {transaction.categories?.name || "Uncategorized"}
                  </span>
                  <span>•</span>
                  <span>{formatFrequency(transaction.frequency)}</span>
                  <span>•</span>
                  <span>Next: {format(new Date(transaction.start_date), "MMM d, yyyy")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                <p
                  className={`font-medium text-base hidden sm:block ${
                    transaction.is_income ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.is_income ? "+" : "-"}
                  <FormattedCurrency amount={transaction.amount} />
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this recurring transaction?
                        This will stop future transactions from being created, but won&apos;t
                        delete any existing transactions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                      <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {deletingId === transaction.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
