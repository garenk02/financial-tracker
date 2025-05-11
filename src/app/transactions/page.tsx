import { MainLayout } from "@/components/main-layout";
import { TabsContent } from "@/components/ui/tabs";
import { protectRoute } from "@/utils/auth/protected-route";
import { AddExpenseDialog } from "@/components/transactions/add-expense-dialog";
import { AddIncomeDialog } from "@/components/transactions/add-income-dialog";
import { TransactionList, type Transaction } from "@/components/transactions/transaction-list";
import { TransactionListSkeleton } from "@/components/transactions/transaction-list-skeleton";
import { getTransactions } from "@/utils/transactions/actions";
import { Suspense } from "react";

// Client component for the transactions page tabs
import TransactionsTabsClient from "./tabs-client";

export default async function TransactionsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  // Await the searchParams promise
  const searchParams = await searchParamsPromise;

  // Get query parameters
  const tab = (searchParams.tab as string) || "all";
  const search = (searchParams.search as string) || "";
  const page = parseInt((searchParams.page as string) || "1", 10);

  // Convert tab to type for the API
  const type = tab === "income" ? "income" : tab === "expenses" ? "expense" : "all";

  // Fetch transactions based on filters
  const transactionsResult = await getTransactions({
    type,
    page,
    limit: 20,
    search,
  });

  // Handle data or use defaults
  const transactions: Transaction[] = transactionsResult.success
    ? transactionsResult.data.map(t => ({
        ...t,
        // Ensure categories is properly formatted as expected by the Transaction type
        categories: t.categories && t.categories.length > 0 ? {
          id: t.categories[0].id || '',
          name: t.categories[0].name || 'Uncategorized',
          color: t.categories[0].color,
          icon: t.categories[0].icon
        } : null
      }))
    : [];

  const pagination = transactionsResult.success ? transactionsResult.pagination : {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
          <div className="flex gap-2 self-stretch md:self-auto">
            <AddExpenseDialog />
            <AddIncomeDialog />
          </div>
        </div>

        <Suspense fallback={<TransactionListSkeleton />}>
          <TransactionsTabsClient initialTab={tab}>
            <TabsContent value="all" className="mt-4">
              <TransactionList
                transactions={transactions}
                searchQuery={search}
                hasMore={pagination.page < pagination.totalPages}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-4">
              <TransactionList
                transactions={transactions}
                searchQuery={search}
                hasMore={pagination.page < pagination.totalPages}
              />
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <TransactionList
                transactions={transactions}
                searchQuery={search}
                hasMore={pagination.page < pagination.totalPages}
              />
            </TabsContent>
          </TransactionsTabsClient>
        </Suspense>
      </div>
    </MainLayout>
  );
}
