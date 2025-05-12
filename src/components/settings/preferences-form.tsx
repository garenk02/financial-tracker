"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserPreferences } from "@/utils/profile/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useCurrency, CurrencyCode, CURRENCIES } from "@/contexts/currency-context"

interface PreferencesFormProps {
  defaultCurrency?: string
  defaultTheme?: string
  className?: string
  isMobile?: boolean
}

export function PreferencesForm({
  defaultCurrency = "usd",
  className = "",
  isMobile = false
}: PreferencesFormProps) {
  // toast is imported directly from sonner
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with the default currency from props
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("usd")

  // Track the selected theme locally to avoid immediate UI changes
  const [selectedTheme, setSelectedTheme] = useState<string>("dark")

  // Use our theme context
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Get the currency context to update when preferences change
  const { setCurrencyCode } = useCurrency()

  // Set the currency and theme when the component mounts
  useEffect(() => {
    // Set currency from props
    console.log("Setting currency from props:", defaultCurrency)
    if (defaultCurrency) {
      const normalizedCurrency = defaultCurrency.toLowerCase()
      if (Object.keys(CURRENCIES).includes(normalizedCurrency)) {
        console.log("Setting currency to:", normalizedCurrency)
        setSelectedCurrency(normalizedCurrency as CurrencyCode)
      } else {
        console.log("Invalid currency, using USD as default")
        setSelectedCurrency("usd")
      }
    } else {
      console.log("No currency provided, using USD as default")
      setSelectedCurrency("usd")
    }

    // Set selected theme from current theme
    setSelectedTheme(theme)
    console.log("Initialized selected theme to:", theme)
  }, [defaultCurrency, theme])

  const handleSubmit = async () => {
    setIsLoading(true)

    console.log("Submitting preferences:", { currency: selectedCurrency, theme: selectedTheme })

    try {
      // Make sure currency is lowercase
      const currencyToSave = selectedCurrency.toLowerCase() as CurrencyCode

      // Apply the selected theme immediately before saving to database
      // This ensures the theme is applied before the page reloads
      setTheme(selectedTheme as "light" | "dark" | "system")

      // Store in localStorage to ensure it persists across reloads
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-preference', selectedTheme)
      }

      const result = await updateUserPreferences({
        preferred_currency: currencyToSave,
        theme_preference: selectedTheme
      })

      if (result.error) {
        console.error("Error updating preferences:", result.error)
        toast.error("Error: " + result.error)
      } else {
        console.log("Preferences updated successfully:", result)

        // Show success message
        toast.success("Your preferences have been updated")

        // Update the currency context after successful save
        setCurrencyCode(currencyToSave)

        // Fetch the updated profile to ensure the preferences are properly loaded
        try {
          const response = await fetch('/api/profile', {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
          })
          if (response.ok) {
            console.log("Successfully refreshed profile data")
          }
        } catch (refreshError) {
          console.error("Error refreshing profile:", refreshError)
        }

        // Force a page reload to ensure all components use the new settings
        setTimeout(() => {
          window.location.reload()
        }, 1000) // Wait 1 second to show the toast
      }
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const idPrefix = isMobile ? "mobile-" : ""

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}currency`}>Currency</Label>
        <Select
          value={selectedCurrency}
          onValueChange={(value) => setSelectedCurrency(value as CurrencyCode)}
        >
          <SelectTrigger id={`${idPrefix}currency`} className={isMobile ? "w-full" : ""}>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CURRENCIES).map((currencyInfo) => (
              <SelectItem key={currencyInfo.code} value={currencyInfo.code}>
                {currencyInfo.name} ({currencyInfo.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}theme`}>Theme</Label>
        <Select
          value={selectedTheme}
          onValueChange={(value) => {
            console.log("Selected theme:", value)
            setSelectedTheme(value)
            // Don't set the actual theme yet - wait until save
          }}
        >
          <SelectTrigger id={`${idPrefix}theme`} className={isMobile ? "w-full" : ""}>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          {theme === 'system' ? ' (system)' : ''}
        </p>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className={isMobile ? "w-full" : ""}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  )
}
