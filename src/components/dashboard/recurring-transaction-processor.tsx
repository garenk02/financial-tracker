"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { processDueRecurringTransactions } from "@/utils/recurring-transactions/actions"

// This component automatically processes recurring transactions when the dashboard loads
// It doesn't render anything visible, it just runs the processing logic
export function RecurringTransactionProcessor() {
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    // Only run once when the component mounts
    if (!hasProcessed) {
      const processRecurringTransactions = async () => {
        try {
          const result = await processDueRecurringTransactions()
          
          if (result.success) {
            if (result.data && result.data.length > 0) {
              toast.success(`Processed ${result.data.length} recurring transactions`)
            }
          } else if (result.error) {
            console.error("Error processing recurring transactions:", result.error)
            // Don't show error toast to user as this happens automatically
          }
        } catch (error) {
          console.error("Failed to process recurring transactions:", error)
        } finally {
          setHasProcessed(true)
        }
      }

      // Process recurring transactions with a slight delay to not block page load
      const timer = setTimeout(() => {
        processRecurringTransactions()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [hasProcessed])

  // This component doesn't render anything
  return null
}
