import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
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
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Toggle between light and dark mode</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifications">Notifications</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="notifications">
                    <SelectValue placeholder="Select notification preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="important">Important only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Settings</CardTitle>
              <CardDescription>Configure your monthly budget</CardDescription>
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
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your financial data</CardDescription>
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
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
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
