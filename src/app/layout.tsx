import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CurrencyProvider } from "@/contexts/currency-context";
import { ThemeContextProvider } from "@/contexts/theme-context";
import { CurrencyInitializer } from "@/components/currency-initializer";
import { getInitialCurrency } from "@/utils/auth/get-initial-currency";
import { getInitialTheme } from "@/utils/auth/get-initial-theme";
import { Analytics } from '@vercel/analytics/next';
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { PWAInit } from "@/components/pwa/pwa-init";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Tracker",
  description: "A Progressive Web App for personal tracking finances and goals",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.png" }
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Financial Tracker",
  },
  applicationName: "FinTrack",
  keywords: ["finance", "budget", "tracker", "goals", "expenses", "income", "pwa"],
  authors: [{ name: "FinTrack Team" }],
  creator: "FinTrack",
  publisher: "FinTrack",
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the user's preferences from the server using server actions
  const initialCurrency = await getInitialCurrency();
  const initialTheme = await getInitialTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme || "dark"}
          enableSystem
          disableTransitionOnChange
        >
          <ThemeContextProvider initialTheme={initialTheme as "light" | "dark" | "system"}>
            <CurrencyProvider initialCurrencyCode={initialCurrency}>
              <CurrencyInitializer initialCurrency={initialCurrency} />
              <PWAProvider>
                <PWAInit />
                {children}
                <Analytics />
                <Toaster />
              </PWAProvider>
            </CurrencyProvider>
          </ThemeContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
