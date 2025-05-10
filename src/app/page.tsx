import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Financial Dashboard</h1>

        {/* Summary Card for Mobile */}
        <Card className="mb-4 md:hidden">
          <CardHeader className="pb-2">
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Current Balance</p>
                  <p className="text-lg font-bold">$2,500.00</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Monthly Budget</p>
                  <p className="text-sm">$1,200 / $3,000</p>
                </div>
                <Progress value={40} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Savings Goal</p>
                  <p className="text-sm">$500 / $2,000</p>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Cards */}
        <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Current Balance</CardTitle>
              <CardDescription>Your total available funds</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$2,500.00</p>
              <p className="text-sm text-muted-foreground mt-2">Last updated: Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget</CardTitle>
              <CardDescription>Your spending this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">$1,200 spent</span>
                <span className="text-sm font-medium">$3,000 budget</span>
              </div>
              <Progress value={40} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">60% remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Savings Goal</CardTitle>
              <CardDescription>Vacation fund</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">$500 saved</span>
                <span className="text-sm font-medium">$2,000 goal</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">25% complete</p>
              <Button className="w-full mt-4">Add to savings</Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-6 md:mt-10 mb-2 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold">Recent Transactions</h2>
          <Button variant="outline" size="sm" className="text-xs md:text-sm">View All</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { id: 1, name: "Grocery Store", amount: -78.52, date: "Today", category: "Food" },
                { id: 2, name: "Salary Deposit", amount: 2500.00, date: "Yesterday", category: "Income" },
                { id: 3, name: "Electric Bill", amount: -94.20, date: "2 days ago", category: "Utilities" },
              ].map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4">
                  <div>
                    <p className="font-medium text-sm md:text-base">{transaction.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                  </div>
                  <p className={`font-medium text-sm md:text-base ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions for Mobile */}
        <div className="mt-6 md:hidden">
          <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button className="w-full">Add Expense</Button>
            <Button className="w-full" variant="outline">Add Income</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
