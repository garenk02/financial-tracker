"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // This is where you would normally call your logout API
      // For example: await fetch('/api/auth/logout', { method: 'POST' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to sign-in page
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogout}
      disabled={isLoading}
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
