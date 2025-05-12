import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoutButton } from "@/components/auth/logout-button";
import { protectRoute } from "@/utils/auth/protected-route";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  UserIcon,
  Settings2Icon,
  WalletIcon,
  DatabaseIcon,
  ShieldIcon
} from "lucide-react";
import { getUserProfile } from "@/utils/profile/actions";
import { PreferencesForm } from "@/components/settings/preferences-form";

export default async function SettingsPage() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  // Get user profile data
  const { data: profile, error } = await getUserProfile();

  // console.log("Profile data in settings page:", profile);
  if (error) {
    console.error("Error fetching profile:", error);
  }

  // Default values if profile can't be fetched
  let defaultCurrency = "usd";
  let defaultTheme = "system";

  if (profile) {
    // Make sure we have valid values for currency
    if (profile.preferred_currency) {
      defaultCurrency = profile.preferred_currency.toLowerCase();
      // console.log("Using currency from profile:", defaultCurrency);
    }

    // Make sure we have valid values for theme
    if (profile.theme_preference &&
        ["light", "dark", "system"].includes(profile.theme_preference)) {
      defaultTheme = profile.theme_preference;
      // console.log("Using theme from profile:", defaultTheme);
    } else {
      console.log("Invalid theme value in profile, defaulting to system");
    }
  } else {
    console.log("No profile data found, using defaults");
  }

  // console.log("Using preferences:", {
  //   currency: defaultCurrency,
  //   theme: defaultTheme
  // });
  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Settings</h1>

        {/* Mobile View - Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="profile" className="border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full justify-start">
                  <UserIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-medium text-left">Profile</h3>
                    <p className="text-xs text-muted-foreground text-left">Manage your personal information</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-name">Name</Label>
                    <Input id="mobile-name" placeholder="Your name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-email">Email</Label>
                    <Input id="mobile-email" type="email" placeholder="Your email" defaultValue="john.doe@example.com" />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="preferences" className="border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full justify-start">
                  <Settings2Icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-medium text-left">Preferences</h3>
                    <p className="text-xs text-muted-foreground text-left">Customize your app experience</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <PreferencesForm
                  defaultCurrency={defaultCurrency}
                  defaultTheme={defaultTheme}
                  isMobile={true}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="budget" className="border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full justify-start">
                  <WalletIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-medium text-left">Budget Settings</h3>
                    <p className="text-xs text-muted-foreground text-left">Configure your monthly budget</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile-monthly-income">Monthly Income</Label>
                    <Input id="mobile-monthly-income" type="number" placeholder="0.00" defaultValue="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-monthly-budget">Monthly Budget</Label>
                    <Input id="mobile-monthly-budget" type="number" placeholder="0.00" defaultValue="3000" />
                  </div>
                  <Button className="w-full">Update Budget</Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data" className="border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full justify-start">
                  <DatabaseIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-medium text-left">Data Management</h3>
                    <p className="text-xs text-muted-foreground text-left">Manage your financial data</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">Download your financial data as CSV or JSON</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full">Export as CSV</Button>
                      <Button variant="outline" className="w-full">Export as JSON</Button>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label>Clear Data</Label>
                    <p className="text-sm text-muted-foreground">Delete all your financial data</p>
                    <Button variant="destructive" className="w-full">Clear All Data</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="account" className="border rounded-lg overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full justify-start">
                  <ShieldIcon className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <h3 className="text-base font-medium text-left">Account Management</h3>
                    <p className="text-xs text-muted-foreground text-left">Manage your account settings</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Security</Label>
                    <p className="text-sm text-muted-foreground">Update your password or security settings</p>
                    <Button variant="outline" className="w-full">Change Password</Button>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label>Session</Label>
                    <p className="text-sm text-muted-foreground">Sign out from your current session</p>
                    <LogoutButton className="w-full" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop View - Grid of Cards */}
        <div className="hidden md:grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email" defaultValue="john.doe@example.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2Icon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PreferencesForm
                defaultCurrency={defaultCurrency}
                defaultTheme={defaultTheme}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Budget Settings</CardTitle>
                  <CardDescription>Configure your monthly budget</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income</Label>
                <Input id="monthly-income" type="number" placeholder="0.00" defaultValue="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-budget">Monthly Budget</Label>
                <Input id="monthly-budget" type="number" placeholder="0.00" defaultValue="3000" />
              </div>
              <Button>Update Budget</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Manage your financial data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">Download your financial data as CSV or JSON</p>
                <div className="flex space-x-2">
                  <Button variant="outline">Export as CSV</Button>
                  <Button variant="outline">Export as JSON</Button>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Label>Clear Data</Label>
                <p className="text-sm text-muted-foreground">Delete all your financial data</p>
                <Button variant="destructive">Clear All Data</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Security</Label>
                <p className="text-sm text-muted-foreground">Update your password or security settings</p>
                <Button variant="outline">Change Password</Button>
              </div>
              <div className="space-y-2 pt-4">
                <Label>Session</Label>
                <p className="text-sm text-muted-foreground">Sign out from your current session</p>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
