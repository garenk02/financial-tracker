"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function useThemeSync(defaultTheme: string, onThemeChange?: (theme: string) => void) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [initialThemeSet, setInitialThemeSet] = useState(false)

  // Set the theme from database when component mounts
  useEffect(() => {
    if (defaultTheme && !initialThemeSet) {
      console.log("Setting theme from database:", defaultTheme)
      setTheme(defaultTheme)
      setInitialThemeSet(true)
    }
  }, [defaultTheme, setTheme, initialThemeSet])

  // Update when theme changes
  useEffect(() => {
    if (theme && initialThemeSet) {
      console.log("Theme changed:", theme)

      // Call the callback if provided
      if (onThemeChange) {
        onThemeChange(theme)
      }
    }
  }, [theme, onThemeChange, initialThemeSet])

  // This ensures we return the actual theme value, not undefined
  const currentTheme = theme || defaultTheme || "system"

  return {
    theme: currentTheme,
    setTheme,
    resolvedTheme
  }
}
