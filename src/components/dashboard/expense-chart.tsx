"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// This is a placeholder component that will be replaced with a Recharts implementation
// once the library is installed. For now, we'll use a simple representation.

interface CategoryData {
  id: string
  name: string
  amount: number
  color?: string
}

interface ExpenseChartProps {
  categories: CategoryData[]
  isLoading?: boolean
}

export function ExpenseChart({ categories, isLoading = false }: ExpenseChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>This month's spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading expense data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>This month's spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate total for percentages
  const total = categories.reduce((sum, category) => sum + category.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>This month's spending by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          {categories.map((category) => {
            const percentage = Math.round((category.amount / total) * 100)
            return (
              <div key={category.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm">${category.amount.toFixed(2)} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: category.color || '#3b82f6'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total: ${total.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Note: Once Recharts is installed, this component can be updated to use:
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
// 
// The implementation would then use:
// <ResponsiveContainer width="100%" height={300}>
//   <PieChart>
//     <Pie
//       data={categories}
//       cx="50%"
//       cy="50%"
//       labelLine={false}
//       outerRadius={80}
//       fill="#8884d8"
//       dataKey="amount"
//       nameKey="name"
//     >
//       {categories.map((entry, index) => (
//         <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
//       ))}
//     </Pie>
//     <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
//     <Legend />
//   </PieChart>
// </ResponsiveContainer>
