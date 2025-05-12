"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { processDueRecurringTransactions } from "@/utils/recurring-transactions/actions"

interface ProcessRecurringTransactionsProps {
  onProcessed?: () => void
}

export function ProcessRecurringTransactions({ onProcessed }: ProcessRecurringTransactionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    setIsProcessing(true)

    try {
      const result = await processDueRecurringTransactions()

      if (result.success) {
        if (result.data && result.data.length > 0) {
          toast.success(`Processed ${result.data.length} recurring transactions`)
        } else {
          toast.info("No recurring transactions were due for processing")
        }

        if (onProcessed) onProcessed()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="default"
      onClick={handleProcess}
      disabled={isProcessing}
      className="flex items-center justify-center gap-2 flex-2 sm:flex-none"
    >
      <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
      <span className="sm:inline">{isProcessing ? "Processing..." : "Process"}</span>
    </Button>
  )
}
