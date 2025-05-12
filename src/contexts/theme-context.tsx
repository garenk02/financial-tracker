"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useTheme as useNextTheme } from "next-themes"

// Define theme types
export type ThemeType = "light" | "dark" | "system"

// Create the context
interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  resolvedTheme: string | undefined
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: undefined
})

// Create a provider component
interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeType
}

export function ThemeContextProvider({
  children,
  initialTheme = "dark"
}: ThemeProviderProps) {
  const pathname = usePathname()
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [theme, setThemeState] = useState<ThemeType>(initialTheme)

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

  // Set theme function
  const setTheme = useCallback((newTheme: ThemeType) => {
    // logger.log("Setting theme to:", newTheme)

    // Validate the theme
    if (!['light', 'dark', 'system'].includes(newTheme)) {
      logger.error("Invalid theme:", newTheme)
      return
    }

    setThemeState(newTheme)
    setNextTheme(newTheme)

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', newTheme)
      // logger.log("Saved theme to localStorage:", newTheme)
    }
  }, [setNextTheme, logger])

  // Function to load user's theme preference
  const loadUserTheme = useCallback(async () => {
    try {
      // Skip API call if we're on an auth-related route
      if (pathname && pathname.startsWith('/auth')) {
        // logger.log("Skipping profile API call on auth route:", pathname)
        setTheme(initialTheme as ThemeType)
        return
      }

      logger.log("Loading user theme preference...")
      // Use the API endpoint instead of the server action
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // If unauthorized or other error, use default theme
        if (response.status === 401) {
          logger.log("User not authenticated, using default theme")
          setTheme(initialTheme as ThemeType)
          return
        }

        logger.error("Error loading user profile:", response.statusText)
        setTheme(initialTheme as ThemeType) // Use default theme on error
        return
      }

      const result = await response.json()

      if (result.error) {
        logger.error("Error in profile response:", result.error)
        setTheme(initialTheme as ThemeType) // Use default theme on error
        return
      }

      const profile = result.data

      if (profile?.theme_preference) {
        const themePreference = profile.theme_preference as ThemeType
        // logger.log("Loaded theme from profile:", themePreference)

        // Check if the theme is valid
        if (["light", "dark", "system"].includes(themePreference)) {
          setTheme(themePreference)
        } else {
          logger.log("Invalid theme in profile:", themePreference)
          setTheme(initialTheme as ThemeType)
        }
      } else {
        logger.log("No theme preference found in profile, using default:", initialTheme)
        setTheme(initialTheme as ThemeType)
      }
    } catch (error) {
      logger.error("Failed to load user theme preference:", error)
      setTheme(initialTheme as ThemeType)
    }
  }, [initialTheme, setTheme, logger, pathname])

  // Load theme preference when component mounts
  useEffect(() => {
    // First check if there's a theme in localStorage (highest priority)
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme-preference') as ThemeType | null
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        // logger.log("Setting theme from localStorage:", storedTheme)
        setTheme(storedTheme)
      } else {
        // If no localStorage theme, load from API
        loadUserTheme()
      }
    }
  }, [loadUserTheme, setTheme, logger])

  // Listen for auth state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a function to handle storage events
      const handleStorageChange = (event: StorageEvent) => {
        // Check if the storage event is related to auth
        if (event.key?.includes('supabase.auth') || event.key === null) {
          logger.log("Auth state changed, reloading theme preference")
          // Add a small delay to ensure the auth state is fully updated
          setTimeout(() => {
            loadUserTheme()
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
            // logger.log("Skipping auth check on auth route:", pathname)
            return
          }

          // Check if we have a Supabase client available
          const { createClient } = await import('@/utils/supabase/client')
          const supabase = createClient()
          const { data } = await supabase.auth.getUser()

          if (data?.user) {
            // logger.log("User is authenticated on initial load, loading theme preference")
            loadUserTheme()
          } else {
            logger.log("No authenticated user found on initial load")
          }
        } catch (error) {
          logger.error("Error checking initial auth state:", error)
        }
      }

      checkInitialAuth()

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [loadUserTheme, logger, pathname])

  // Sync with next-themes when it changes
  useEffect(() => {
    if (nextTheme && nextTheme !== theme) {
      // logger.log("Syncing with next-themes:", nextTheme)
      setThemeState(nextTheme as ThemeType)
    }
  }, [nextTheme, theme, logger])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Create a hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider")
  }
  return context
}
