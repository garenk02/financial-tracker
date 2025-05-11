import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Authentication - Financial Tracker",
  description: "Sign in or sign up to your financial tracker account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Simple header with just logo and theme toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="relative w-9 h-9 md:w-10 md:h-10">
              <Image
                src="/logo.png"
                alt="FinTrack Logo"
                fill
                sizes="(max-width: 768px) 36px, 40px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© {new Date().getFullYear()} Financial Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
