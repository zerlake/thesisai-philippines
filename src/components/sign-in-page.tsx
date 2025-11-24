"use client";

import { useState } from "react";
import { BookText, User, UserCog, UserCheck, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";
import Link from "next/link";
import { GoogleSignInButton } from "./google-sign-in-button";

export function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleDemoLogin = async (role: 'user' | 'admin' | 'advisor' | 'critic') => {
    setIsSubmitting(true);
    
    const credentials = {
      user: { email: "user@demo.com", firstName: "Regular", lastName: "User" },
      admin: { email: "admin@demo.com", firstName: "Demo", lastName: "Admin" },
      advisor: { email: "advisor@demo.com", firstName: "Demo", lastName: "Advisor" },
      critic: { email: "critic@demo.com", firstName: "Demo", lastName: "Critic" },
    };

    const { email, firstName, lastName } = credentials[role];
    const password = "ThisIsADemoPassword123";

    const { error: ensureError } = await supabase.functions.invoke('ensure-demo-user', {
      body: { email, password, firstName, lastName, role },
    });

    if (ensureError) {
      let detailedMessage = ensureError.message;
      if (ensureError.context && typeof ensureError.context.json === 'function') {
        try {
          const errorBody = await ensureError.context.json();
          if (errorBody.error) detailedMessage = errorBody.error;
        } catch (e) { console.error("Failed to parse JSON from edge function error response", e); }
      }
      toast.error(`Failed to prepare demo account: ${detailedMessage}`);
      setIsSubmitting(false);
      return;
    }
    
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      toast.error(`Login failed: ${signInError.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <BookText className="w-10 h-10 mb-4" />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue your work.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInForm />
            <div className="flex items-center space-x-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            <div className="space-y-2">
              <GoogleSignInButton label="Sign in with Google" />
              
              {/* Demo Accounts Section */}
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="text-sm font-semibold text-blue-900 hover:text-blue-700 w-full text-left flex items-center justify-between"
                >
                  <span>🎯 Try Demo Accounts</span>
                  <span className="text-lg">{showDemoAccounts ? '▼' : '▶'}</span>
                </button>
                
                {showDemoAccounts && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-blue-800 mb-3">Test the platform with different roles:</p>
                    <Button variant="outline" className="w-full text-xs h-9" onClick={() => handleDemoLogin('user')} disabled={isSubmitting}>
                      <User className="w-3 h-3 mr-2" /> {isSubmitting ? 'Logging in...' : 'Demo: Student'}
                    </Button>
                    <Button variant="outline" className="w-full text-xs h-9" onClick={() => handleDemoLogin('advisor')} disabled={isSubmitting}>
                      <UserCheck className="w-3 h-3 mr-2" /> {isSubmitting ? 'Logging in...' : 'Demo: Advisor'}
                    </Button>
                    <Button variant="outline" className="w-full text-xs h-9" onClick={() => handleDemoLogin('critic')} disabled={isSubmitting}>
                      <FileSignature className="w-3 h-3 mr-2" /> {isSubmitting ? 'Logging in...' : 'Demo: Critic'}
                    </Button>
                    <Button variant="outline" className="w-full text-xs h-9" onClick={() => handleDemoLogin('admin')} disabled={isSubmitting}>
                      <UserCog className="w-3 h-3 mr-2" /> {isSubmitting ? 'Logging in...' : 'Demo: Admin'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}