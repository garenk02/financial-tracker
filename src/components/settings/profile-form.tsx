"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserProfile } from "@/utils/profile/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ProfileFormProps {
  defaultName?: string
  defaultEmail?: string
  className?: string
  isMobile?: boolean
}

export function ProfileForm({
  defaultName = "",
  defaultEmail = "",
  className = "",
  isMobile = false
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(defaultName)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    setIsLoading(true)

    try {
      const result = await updateUserProfile({
        display_name: name
      })

      if (result.error) {
        toast.error("Error: " + result.error)
      } else {
        toast.success("Your profile has been updated")

        // Fetch the updated profile to ensure the profile data is properly refreshed
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
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const idPrefix = isMobile ? "mobile-" : ""

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}name`}>Name</Label>
        <Input
          id={`${idPrefix}name`}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}email`}>Email</Label>
        <Input
          id={`${idPrefix}email`}
          type="email"
          placeholder="Your email"
          value={defaultEmail}
          readOnly
          className="bg-muted/50"
        />
      </div>
      <Button
        className={isMobile ? "w-full" : ""}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  )
}
