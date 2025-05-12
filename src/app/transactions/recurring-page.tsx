import { Suspense } from "react";
import { RecurringTransactionList } from "@/components/transactions/recurring-transaction-list";
import { AddRecurringTransactionDialog } from "@/components/transactions/add-recurring-transaction-dialog";
import { ProcessRecurringTransactions } from "@/components/transactions/process-recurring-transactions";
import { getRecurringTransactions } from "@/utils/recurring-transactions/actions";
import { Skeleton } from "@/components/ui/skeleton";

export default async function RecurringTransactionsPage() {
  // Fetch recurring transactions
  const recurringTransactionsResult = await getRecurringTransactions();

  const recurringTransactions = recurringTransactionsResult.success
    ? recurringTransactionsResult.data || []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        {/* <h2 className="text-xl font-bold">Recurring Transactions</h2> */}
        <div className="flex gap-2 w-full sm:w-auto">
          <ProcessRecurringTransactions />
          {/* <AddRecurringTransactionDialog /> */}
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
        <RecurringTransactionList recurringTransactions={recurringTransactions} />
      </Suspense>
    </div>
  );
}
