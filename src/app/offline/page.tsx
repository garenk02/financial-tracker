import { WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="flex flex-col items-center max-w-md mx-auto space-y-6">
        <div className="p-6 bg-card rounded-lg shadow-lg">
          <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold">You&apos;re offline</h1>
          <p className="mt-2 text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Some features may be unavailable until you&apos;re back online.
          </p>
          <div className="mt-6">
            <Button asChild variant="default">
              <Link href="/">Go to Dashboard</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            You can still access previously viewed pages and your saved data.
          </p>
        </div>
      </div>
    </div>
  );
}
