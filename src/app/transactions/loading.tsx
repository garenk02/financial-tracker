import { MainLayout } from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionsLoading() {
  return (
    <MainLayout>
      <div className="container py-4 md:py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2 self-stretch md:self-auto">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" disabled>All</TabsTrigger>
            <TabsTrigger value="income" disabled>Income</TabsTrigger>
            <TabsTrigger value="expenses" disabled>Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
