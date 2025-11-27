"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Users, CheckCircle2, Shield } from "lucide-react";

export function DemoAccountsSection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoAvailable, setIsDemoAvailable] = useState<boolean | null>(null);

  // Check if demo service is configured by making a test call
  useEffect(() => {
    const checkDemoService = async () => {
      try {
        const response = await fetch("/api/auth/demo-login", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          setIsDemoAvailable(data.demoAvailable);
        } else {
          setIsDemoAvailable(false);
        }
      } catch (err) {
        setIsDemoAvailable(false);
        console.info("Demo login API not available, hiding demo accounts");
      }
    };

    checkDemoService();
  }, []);

  const demoAccounts = [
    {
      name: "Student",
      email: "student@demo.thesisai.local",
      password: "demo123456",
      icon: BookOpen,
      description: "View student dashboard & features",
    },
    {
      name: "Advisor",
      email: "advisor@demo.thesisai.local",
      password: "demo123456",
      icon: Users,
      description: "Manage students & guidance",
    },
    {
      name: "Critic",
      email: "critic@demo.thesisai.local",
      password: "demo123456",
      icon: CheckCircle2,
      description: "Review & provide feedback",
    },
    {
      name: "Admin",
      email: "admin@demo.thesisai.local",
      password: "demo123456",
      icon: Shield,
      description: "Full platform administration",
    },
  ];

  const handleDemoLogin = async (email: string, password: string) => {
    setLoading(email);
    setError(null);

    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Read the response text once and use it for both success and error cases
      const responseText = await response.text();
      // Only log minimal information in production
      console.log("Demo login completed, status:", response.status);

      if (!response.ok) {
        // Handle error case
        try {
          // Try to parse the error response
          let errorData;
          if (responseText && responseText.trim() !== '') {
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              console.error("Could not parse error response as JSON:", parseError);
              // If JSON parsing fails, return the raw text as the error
              errorData = { error: `Server error: ${responseText}`, status: response.status };
            }
          } else {
            errorData = { error: "Empty response from server", status: response.status };
          }

          console.error("Demo login API error:", errorData);
          throw new Error(errorData.error || errorData.message || "Demo login failed. Demo functionality may not be properly configured.");
        } catch (parseError) {
          console.error("Could not process error response:", parseError);
          throw new Error(`Server error (${response.status}), could not process error response`);
        }
      }

      // Success case - parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Could not parse success response:", parseError);
        throw new Error("Invalid response format from demo login API");
      }

      const { session } = data;

      if (!session) {
        throw new Error("No session returned from demo login API");
      }

      console.log("Session received from API, setting session in Supabase client...");
      console.log("Session data:", { 
        hasAccessToken: !!session.access_token, 
        hasRefreshToken: !!session.refresh_token,
        user: session.user?.email 
      });
      
      // CRITICAL: Set the session in Supabase so the client-side auth is aware of it
      const { error: setSessionError } = await supabase.auth.setSession(session);
      
      if (setSessionError) {
        console.error("Error setting session:", setSessionError);
        throw new Error(`Failed to establish session: ${setSessionError.message}`);
      }

      console.log("Session set successfully, waiting for auth state change...");
      
      // Wait a moment for the auth state change to propagate, then redirect
      setTimeout(() => {
        console.log("Redirecting to dashboard...");
        window.location.href = "/dashboard";
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Demo functionality may not be properly configured.");
      setLoading(null);
    }
  };

  // Don't render if demo is not available
  if (isDemoAvailable === false) {
    return null;
  }

  // Show loading indicator while checking if demo is available
  if (isDemoAvailable === null) {
    return null; // Don't render anything while checking
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground text-center mb-3">
          Quick Access Demo Accounts
        </p>
        {error && (
          <p className="text-xs text-red-500 text-center mb-2 px-2 py-1 rounded bg-red-50 dark:bg-red-950">
            {error}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {demoAccounts.map((account) => {
          const Icon = account.icon;
          const isLoading = loading === account.email;

          return (
            <Button
              key={account.email}
              variant="outline"
              size="sm"
              className="h-auto flex flex-col items-center justify-center py-3 px-2"
              onClick={() => handleDemoLogin(account.email, account.password)}
              disabled={loading !== null}
              title={account.description}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mb-1" />
              ) : (
                <Icon className="w-4 h-4 mb-1" />
              )}
              <span className="text-xs font-medium">{account.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">
                Demo
              </span>
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Password: <code className="bg-muted px-1 py-0.5 rounded text-xs">demo123456</code>
      </p>
    </div>
  );
}
