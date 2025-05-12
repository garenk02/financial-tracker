import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { protectRoute } from "@/utils/auth/protected-route";
import { AddExpenseDialog } from "@/components/transactions/add-expense-dialog";
import { AddIncomeDialog } from "@/components/transactions/add-income-dialog";
import { MobileSummaryCard, SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import {
  getRecentTransactions,
  getCurrentBalance,
  getMonthlySpendingSummary,
  getExpenseBreakdown
} from "@/utils/dashboard/actions";
import Link from "next/link";
import { Transaction } from "@/types/transactions";

// Define a type for the raw transaction data structure
type RawTransactionData = Record<string, unknown>;

export default async function Home() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  // Fetch dashboard data
  const [
    transactionsResult,
    balanceResult,
    spendingResult,
    expenseBreakdownResult
  ] = await Promise.all([
    getRecentTransactions(5),
    getCurrentBalance(),
    getMonthlySpendingSummary(),
    getExpenseBreakdown()
  ]);

  // Handle data or use defaults
  // Transform transaction data to match the expected Transaction type
  const transactions: Transaction[] = transactionsResult.success
    ? transactionsResult.data.map((item: RawTransactionData) => {
        const categories = item.categories as { id: string; name: string; color?: string } | null;

        return {
          id: item.id as string,
          amount: item.amount as number,
          description: item.description as string,
          date: item.date as string,
          is_income: item.is_income as boolean,
          category_id: item.category_id as string | undefined,
          tags: item.tags as string[] | undefined,
          created_at: item.created_at as string | undefined,
          // Ensure categories is an object or null, not an array
          categories: categories ? {
            id: categories.id,
            name: categories.name,
            color: categories.color
          } : null
        };
      })
    : [];

  const balance = balanceResult.success ? balanceResult.balance : 0;
  const budgetData = spendingResult.success
    ? spendingResult.data
    : { spent: 0, budget: 3000, remaining: 3000, percentage: 0 };
  const expenseCategories = expenseBreakdownResult.success ? expenseBreakdownResult.data : [];

  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Financial Dashboard</h1>

        {/* Desktop Cards */}
        <SummaryCards
          balance={balance}
          budgetData={budgetData}
        />

        {/* Summary Card for Mobile */}
        <MobileSummaryCard
          balance={balance}
          budgetData={budgetData}
        />

        {/* Expense Chart - visible on all devices */}
        <div className="mt-6 mb-6">
          <ExpenseChart categories={expenseCategories} />
        </div>

        {/* Desktop layout - single column */}
        <div className="hidden md:block mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Recent Transactions</h2>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs">View All</Button>
            </Link>
          </div>
          <RecentTransactions transactions={transactions} />
        </div>

        {/* Mobile layout - stacked */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Link href="/transactions">
              <Button variant="outline" size="sm" className="text-xs">View All</Button>
            </Link>
          </div>
          <RecentTransactions transactions={transactions} />
        </div>

        {/* Quick Actions for Mobile */}
        <div className="md:hidden mt-6">
          <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <AddExpenseDialog />
            <AddIncomeDialog />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
