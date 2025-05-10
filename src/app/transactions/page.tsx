import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { protectRoute } from "@/utils/auth/protected-route";

export default async function TransactionsPage() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <Button>Add Transaction</Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search transactions..."
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { id: 1, name: "Grocery Store", amount: -78.52, date: "Today", category: "Food" },
                    { id: 2, name: "Salary Deposit", amount: 2500.00, date: "Yesterday", category: "Income" },
                    { id: 3, name: "Electric Bill", amount: -94.20, date: "2 days ago", category: "Utilities" },
                    { id: 4, name: "Restaurant", amount: -45.80, date: "3 days ago", category: "Food" },
                    { id: 5, name: "Gas Station", amount: -38.25, date: "4 days ago", category: "Transport" },
                    { id: 6, name: "Online Shopping", amount: -129.99, date: "5 days ago", category: "Shopping" },
                    { id: 7, name: "Freelance Work", amount: 350.00, date: "1 week ago", category: "Income" },
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                      </div>
                      <p className={`font-medium ${transaction.amount > 0 ? "text-green-600" : ""}`}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { id: 2, name: "Salary Deposit", amount: 2500.00, date: "Yesterday", category: "Income" },
                    { id: 7, name: "Freelance Work", amount: 350.00, date: "1 week ago", category: "Income" },
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                      </div>
                      <p className="font-medium text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {[
                    { id: 1, name: "Grocery Store", amount: -78.52, date: "Today", category: "Food" },
                    { id: 3, name: "Electric Bill", amount: -94.20, date: "2 days ago", category: "Utilities" },
                    { id: 4, name: "Restaurant", amount: -45.80, date: "3 days ago", category: "Food" },
                    { id: 5, name: "Gas Station", amount: -38.25, date: "4 days ago", category: "Transport" },
                    { id: 6, name: "Online Shopping", amount: -129.99, date: "5 days ago", category: "Shopping" },
                  ].map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{transaction.name}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                      </div>
                      <p className="font-medium">
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
