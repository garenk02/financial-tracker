import { MainLayout } from "@/components/main-layout";
import { Card } from "@/components/ui/card";
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

export default async function Home() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  // Fetch dashboard data
  const [transactionsResult, balanceResult, spendingResult, expenseBreakdownResult] = await Promise.all([
    getRecentTransactions(5),
    getCurrentBalance(),
    getMonthlySpendingSummary(),
    getExpenseBreakdown()
  ]);

  // Handle data or use defaults
  const transactions = transactionsResult.success ? transactionsResult.data : [];
  const balance = balanceResult.success ? balanceResult.balance : 0;
  const budgetData = spendingResult.success
    ? spendingResult.data
    : { spent: 0, budget: 3000, remaining: 3000, percentage: 0 };
  const expenseCategories = expenseBreakdownResult.success ? expenseBreakdownResult.data : [];

  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Financial Dashboard</h1>

        {/* Summary Card for Mobile */}
        <MobileSummaryCard
          balance={balance}
          budgetData={budgetData}
        />

        {/* Desktop Cards */}
        <SummaryCards
          balance={balance}
          budgetData={budgetData}
        />

        {/* Expense Breakdown Chart */}
        <div className="mt-6">
          <ExpenseChart categories={expenseCategories} />
        </div>

        <div className="flex justify-between items-center mt-6 md:mt-10 mb-2 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Recent Transactions</h2>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs md:text-sm">View All</Button>
          </Link>
        </div>

        <RecentTransactions transactions={transactions} />

        {/* Quick Actions for Mobile */}
        <div className="mt-6 md:hidden">
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
