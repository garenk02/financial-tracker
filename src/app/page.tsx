import { MainLayout } from "@/components/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { protectRoute } from "@/utils/auth/protected-route";
import { AddExpenseDialog } from "@/components/transactions/add-expense-dialog";
import { AddIncomeDialog } from "@/components/transactions/add-income-dialog";
import { MobileSummaryCard, SummaryCards } from "@/components/dashboard/summary-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CategoryBudgetList } from "@/components/dashboard/category-budget-list";
import {
  getRecentTransactions,
  getCurrentBalance,
  getMonthlySpendingSummary,
  getExpenseBreakdown,
  getCategoryBudgetsWithSpending
} from "@/utils/dashboard/actions";
import Link from "next/link";

export default async function Home() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  // Fetch dashboard data
  const [
    transactionsResult,
    balanceResult,
    spendingResult,
    expenseBreakdownResult,
    categoryBudgetsResult
  ] = await Promise.all([
    getRecentTransactions(5),
    getCurrentBalance(),
    getMonthlySpendingSummary(),
    getExpenseBreakdown(),
    getCategoryBudgetsWithSpending()
  ]);

  // Handle data or use defaults
  const transactions = transactionsResult.success ? transactionsResult.data : [];
  const balance = balanceResult.success ? balanceResult.balance : 0;
  const budgetData = spendingResult.success
    ? spendingResult.data
    : { spent: 0, budget: 3000, remaining: 3000, percentage: 0 };
  const expenseCategories = expenseBreakdownResult.success ? expenseBreakdownResult.data : [];
  const categoryBudgets = categoryBudgetsResult.success ? categoryBudgetsResult.data : [];

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

        {/* Expense Chart - visible on all devices */}
        <div className="mt-6 mb-6">
          <ExpenseChart categories={expenseCategories} />
        </div>

        {/* Desktop layout - two columns */}
        <div className="hidden md:grid mt-6 gap-6 grid-cols-2">
          {/* Left column */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Recent Transactions</h2>
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="text-xs">View All</Button>
              </Link>
            </div>
            <RecentTransactions transactions={transactions} />
          </div>

          {/* Right column */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Category Budgets</h2>
              <Link href="/budget">
                <Button variant="outline" size="sm" className="text-xs">Manage</Button>
              </Link>
            </div>
            <CategoryBudgetList categoryBudgets={categoryBudgets} />
          </div>
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

          <div className="flex justify-between items-center mt-6 mb-2">
            <h2 className="text-xl font-bold">Category Budgets</h2>
            <Link href="/budget">
              <Button variant="outline" size="sm" className="text-xs">Manage</Button>
            </Link>
          </div>
          <CategoryBudgetList categoryBudgets={categoryBudgets} />

          {/* Quick Actions for Mobile */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <AddExpenseDialog />
              <AddIncomeDialog />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
