"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  is_income: boolean
  categories: {
    id: string
    name: string
    color?: string
    icon?: string
  } | null
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">No transactions found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4">
              <div>
                <p className="font-medium text-sm md:text-base">{transaction.description}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {formatDate(transaction.date)} • {transaction.categories?.name || "Uncategorized"}
                </p>
              </div>
              <p className={`font-medium text-sm md:text-base ${transaction.is_income ? "text-green-600" : ""}`}>
                {transaction.is_income ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()

  // Today
  if (date.toDateString() === now.toDateString()) {
    return "Today"
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  // Within the last week
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  if (date > oneWeekAgo) {
    return `${date.getDate() - now.getDate()} days ago`
  }

  // Default format
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
