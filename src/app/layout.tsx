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
    icon: "/logo.png",
    apple: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Financial Tracker",
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
              {children}
              <Analytics />
              <Toaster />
            </CurrencyProvider>
          </ThemeContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
