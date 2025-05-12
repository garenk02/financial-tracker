"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Redirect to sign-in page
      // We don't set isLoading to false here to keep the loading state
      // until the redirect is complete
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
    // Removed the finally block to keep isLoading true during redirect
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Signing out...
        </span>
      ) : (
        <span className="flex items-center gap-1">
          <LogOut className="h-4 w-4" />
          Sign Out
        </span>
      )}
    </Button>
  );
}