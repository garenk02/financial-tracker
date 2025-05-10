import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { protectRoute } from "@/utils/auth/protected-route";

export default async function GoalsPage() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <Button>Create New Goal</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Vacation Fund</CardTitle>
              <CardDescription>Trip to Hawaii</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">$500 saved</span>
                <span className="text-sm font-medium">$2,000 goal</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">25% complete</p>
              <p className="text-sm mt-4">Target date: December 2023</p>
              <p className="text-sm font-medium mt-1">$250 monthly contribution needed</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Edit</Button>
              <Button>Add funds</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Fund</CardTitle>
              <CardDescription>3 months of expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">$3,000 saved</span>
                <span className="text-sm font-medium">$9,000 goal</span>
              </div>
              <Progress value={33} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">33% complete</p>
              <p className="text-sm mt-4">Target date: June 2024</p>
              <p className="text-sm font-medium mt-1">$500 monthly contribution needed</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Edit</Button>
              <Button>Add funds</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Laptop</CardTitle>
              <CardDescription>For work and personal use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">$800 saved</span>
                <span className="text-sm font-medium">$1,500 goal</span>
              </div>
              <Progress value={53} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">53% complete</p>
              <p className="text-sm mt-4">Target date: March 2024</p>
              <p className="text-sm font-medium mt-1">$175 monthly contribution needed</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Edit</Button>
              <Button>Add funds</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
