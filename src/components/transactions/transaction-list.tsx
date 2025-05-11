"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons"

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  is_income: boolean
  tags?: string[]
  created_at?: string
  categories: {
    id: string
    name: string
    color?: string
    icon?: string
  } | null
}

// Export the Transaction type for reuse
export type { Transaction }

interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  hasMore?: boolean
  searchQuery?: string
}

export function TransactionList({
  transactions,
  isLoading = false,
  hasMore = false,
  searchQuery = "",
}: TransactionListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchQuery)

  // Format date to relative time (e.g., "2 days ago")
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)

      // Manual implementation of formatDistanceToNow to avoid date-fns issues
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

      // Calculate days difference
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 7) {
        return `${diffDays} days ago`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
      } else {
        const years = Math.floor(diffDays / 365)
        return `${years} ${years === 1 ? 'year' : 'years'} ago`
      }
    } catch (error) {
      return dateString
    }
  }

  // Create a new URLSearchParams object to manipulate
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }

    // Reset page when searching
    if (name === "search") {
      params.set("page", "1")
    }

    return params.toString()
  }

  // Handle search input
  const handleSearch = () => {
    router.push(`/transactions?${createQueryString("search", searchValue)}`)
  }

  // Handle clear search
  const handleClearSearch = () => {
    setSearchValue("")
    router.push(`/transactions?${createQueryString("search", "")}`)
  }

  // Handle load more
  const handleLoadMore = () => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10)
    const nextPage = currentPage + 1

    const params = new URLSearchParams(searchParams.toString())
    params.set("page", nextPage.toString())

    router.push(`/transactions?${params.toString()}`)
  }

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search transactions..."
          className="pr-16"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mr-1"
              onClick={handleClearSearch}
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSearch}
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!transactions || transactions.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">No transactions found</p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm md:text-base">{transaction.description}</p>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs md:text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span>{transaction.categories?.name || "Uncategorized"}</span>
                      {transaction.tags && transaction.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="max-w-[150px] truncate">
                            {transaction.tags.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p
                    className={`font-medium text-sm md:text-base ${
                      transaction.is_income ? "text-green-600" : ""
                    }`}
                  >
                    {transaction.is_income ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
