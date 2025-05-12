"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import { usePathname } from "next/navigation"

// Define currency types and formats
export type CurrencyCode = "usd" | "eur" | "gbp" | "jpy" | "idr" | string

export interface CurrencyInfo {
  code: CurrencyCode
  symbol: string
  name: string
  format: (amount: number) => string
}

// Define currency information
export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  usd: {
    code: "usd",
    symbol: "$",
    name: "US Dollar",
    format: (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  eur: {
    code: "eur",
    symbol: "€",
    name: "Euro",
    format: (amount) => `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  gbp: {
    code: "gbp",
    symbol: "£",
    name: "British Pound",
    format: (amount) => `£${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  jpy: {
    code: "jpy",
    symbol: "¥",
    name: "Japanese Yen",
    format: (amount) => `¥${amount.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  },
  idr: {
    code: "idr",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    format: (amount) => `Rp. ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
}

// Default to USD if currency not found
const getDefaultCurrency = (code: CurrencyCode): CurrencyInfo => {
  return CURRENCIES[code] || CURRENCIES.usd
}

// Create the context
interface CurrencyContextType {
  currency: CurrencyInfo
  setCurrencyCode: (code: CurrencyCode) => void
  formatCurrency: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.usd,
  setCurrencyCode: () => {},
  formatCurrency: (amount) => CURRENCIES.usd.format(amount)
})

// Create a provider component
interface CurrencyProviderProps {
  children: ReactNode
  initialCurrencyCode?: CurrencyCode
}

export function CurrencyProvider({
  children,
  initialCurrencyCode = "usd"
}: CurrencyProviderProps) {
  const pathname = usePathname()
  const [currency, setCurrency] = useState<CurrencyInfo>(getDefaultCurrency(initialCurrencyCode))

  const setCurrencyCode = useCallback((code: CurrencyCode) => {
    setCurrency(getDefaultCurrency(code))
  }, []);

  // Custom logger that only logs in development or browser environment
  const logger = useMemo(() => ({
    log: (...args: unknown[]) => {
      // Only log in development or when in browser (not during build)
      if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && !process.env.NEXT_PHASE)) {
        console.log(...args)
      }
    },
    error: (...args: unknown[]) => {
      // Always log errors, but can be suppressed during build if needed
      if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && !process.env.NEXT_PHASE)) {
        console.error(...args)
      }
    }
  }), [])

  // Function to load user's currency preference
  const loadUserCurrency = useCallback(async () => {
    try {
      // Skip API call if we're on an auth-related route
      if (pathname && pathname.startsWith('/auth')) {
        // logger.log("Skipping profile API call on auth route:", pathname)
        setCurrencyCode(initialCurrencyCode)
        return
      }

      // logger.log("Loading user currency preference...")
      // Use the API endpoint instead of the server action
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // If unauthorized or other error, use default currency
        if (response.status === 401) {
          logger.log("User not authenticated, using default currency")
          setCurrencyCode(initialCurrencyCode)
          return
        }

        logger.error("Error loading user profile:", response.statusText)
        setCurrencyCode(initialCurrencyCode) // Use default currency on error
        return
      }

      const result = await response.json()

      if (result.error) {
        logger.error("Error in profile response:", result.error)
        setCurrencyCode(initialCurrencyCode) // Use default currency on error
        return
      }

      const profile = result.data

      if (profile?.preferred_currency) {
        const currencyCode = profile.preferred_currency.toLowerCase() as CurrencyCode
        // logger.log("Loaded currency from profile:", currencyCode)

        // Check if the currency is valid
        if (Object.keys(CURRENCIES).includes(currencyCode)) {
          setCurrencyCode(currencyCode)
        } else {
          logger.log("Invalid currency code in profile:", currencyCode)
        }
      } else {
        logger.log("No currency preference found in profile, using default:", initialCurrencyCode)
      }
    } catch (error) {
      logger.error("Failed to load user currency preference:", error)
    }
  }, [initialCurrencyCode, setCurrencyCode, logger, pathname]);

  // Load currency preference when component mounts
  useEffect(() => {
    // Only load currency preference if we're in a browser environment
    if (typeof window !== 'undefined') {
      loadUserCurrency()

      // Set up an interval to refresh the currency preference periodically
      const intervalId = setInterval(() => {
        loadUserCurrency()
      }, 60000) // Refresh every minute

      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId)
    }
  }, [loadUserCurrency])

  // Listen for auth state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a function to handle storage events
      const handleStorageChange = (event: StorageEvent) => {
        // Check if the storage event is related to auth
        if (event.key?.includes('supabase.auth') || event.key === null) {
          logger.log("Auth state changed, reloading currency preference")
          // Add a small delay to ensure the auth state is fully updated
          setTimeout(() => {
            loadUserCurrency()
          }, 500)
        }
      }

      // Add event listener for storage events
      window.addEventListener('storage', handleStorageChange)

      // Also check auth state on initial load
      const checkInitialAuth = async () => {
        try {
          // Skip API calls if we're on an auth-related route
          if (pathname && pathname.startsWith('/auth')) {
            logger.log("Skipping auth check on auth route:", pathname)
            setCurrencyCode(initialCurrencyCode)
            return
          }

          // Check if we have a Supabase client available
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const { data } = await supabase.auth.getUser()

          if (data?.user) {
            logger.log("User is authenticated on initial load, loading currency preference")
            loadUserCurrency()
          } else {
            // logger.log("No authenticated user found on initial load")
            setCurrencyCode(initialCurrencyCode)
          }
        } catch (error) {
          logger.error("Error checking initial auth state:", error)
          setCurrencyCode(initialCurrencyCode)
        }
      }

      checkInitialAuth()

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [loadUserCurrency, initialCurrencyCode, setCurrencyCode, logger, pathname])

  const formatCurrency = (amount: number) => {
    return currency.format(amount)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

// Create a hook to use the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
