"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SimpleDatePickerProps {
  date: string
  setDate: (date: string) => void
  className?: string
  placeholder?: string
  label?: string
}

export function SimpleDatePicker({
  date,
  setDate,
  className,
  placeholder = "YYYY-MM-DD",
  label
}: SimpleDatePickerProps) {
  // Handle date change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  // Set today's date
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={date || ""}
            onChange={handleChange}
            className="pl-10"
            placeholder={placeholder}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={setToday}
          title="Set to today"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
