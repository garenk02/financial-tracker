"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallback } from "react"

interface TransactionsTabsClientProps {
  initialTab: string
  children: React.ReactNode
}

export default function TransactionsTabsClient({
  initialTab,
  children,
}: TransactionsTabsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams object to manipulate
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      // Reset page when changing tabs
      if (name === "tab") {
        params.set("page", "1")
      }

      return params.toString()
    },
    [searchParams]
  )

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/transactions?${createQueryString("tab", value)}`)
  }

  return (
    <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="recurring">Recurring</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  )
}
