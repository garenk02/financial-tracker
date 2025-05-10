"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState<string>("signin");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSignUpSuccess = () => {
    setShowSuccessMessage(true);
    setActiveTab("signin");

    // Hide the success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      {showSuccessMessage && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>
            Account created successfully! You can now sign in with your credentials.
          </AlertDescription>
        </Alert>
      )}

      <TabsContent value="signin" className="mt-0">
        <SignInForm
          onSuccess={() => {}}
          onSignUpClick={() => setActiveTab("signup")}
        />
      </TabsContent>
      <TabsContent value="signup" className="mt-0">
        <SignUpForm
          onSuccess={handleSignUpSuccess}
          onSignInClick={() => setActiveTab("signin")}
        />
      </TabsContent>
    </Tabs>
  );
}
