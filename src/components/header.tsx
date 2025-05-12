"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import {
  HomeIcon,
  FileTextIcon,
  TargetIcon,
  GearIcon,
  PieChartIcon
} from "@radix-ui/react-icons"

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Transactions", href: "/transactions", icon: FileTextIcon },
  { name: "Budget", href: "/budget", icon: PieChartIcon },
  { name: "Goals", href: "/goals", icon: TargetIcon },
  { name: "Settings", href: "/settings", icon: GearIcon },
]

export function Header() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex hidden">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2 pl-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="FinTrack Logo"
                  fill
                  sizes="(max-width: 768px) 32px, 40px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2 pr-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Header - Just Logo and Theme Toggle (not sticky) */}
      <header className="relative z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden flex">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center pl-4">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="FinTrack Logo"
                fill
                sizes="(max-width: 768px) 32px, 40px"
                className="object-contain"
              />
            </div>
          </Link>
          <div className="pr-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t flex items-center justify-around">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
