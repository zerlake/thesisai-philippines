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

  // Demo user accounts with actual UUIDs in the database:
  // Student: 6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7
  // Critic:  14a7ff7d-c6d2-4b27-ace1-32237ac28e02
  // Advisor: ff79d401-5614-4de8-9f17-bc920f360dcf
  // Admin:   7f22dff0-b8a9-4e08-835f-2a79dba9e6f7
  const demoAccounts = [
    {
      name: "Student",
      email: "demo-student@thesis.ai",
      password: "demo123456",
      icon: BookOpen,
      description: "View student dashboard & features",
    },
    {
      name: "Advisor",
      email: "demo-advisor@thesis.ai",
      password: "demo123456",
      icon: Users,
      description: "Manage students & guidance",
    },
    {
      name: "Critic",
      email: "demo-critic@thesis.ai",
      password: "demo123456",
      icon: CheckCircle2,
      description: "Review & provide feedback",
    },
    {
      name: "Admin",
      email: "demo-admin@thesis.ai",
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
      // Log response info for debugging
      console.log("Demo login response:", {
        status: response.status,
        statusText: response.statusText,
        hasBody: !!responseText,
        bodyLength: responseText?.length || 0,
        body: responseText.substring(0, 500) // Log first 500 chars of body
      });

      if (!response.ok) {
        // Handle error case
        let errorMessage = `Demo login failed (HTTP ${response.status})`;

        console.error("Demo login failed with status:", response.status);
        console.error("Response text:", responseText);

        if (responseText && responseText.trim() !== '') {
          try {
            const errorData = JSON.parse(responseText);
            console.error("Parsed error data:", errorData);
            
            // Check if errorData is empty object {} or doesn't have error fields
            if (errorData && typeof errorData === 'object') {
              if (Object.keys(errorData).length === 0) {
                console.error("Demo login API returned empty error object");
                errorMessage = `Demo login server error with empty response (HTTP ${response.status}). Please check server logs.`;
              } else {
                // Extract error message from various possible fields
                errorMessage = errorData.error || errorData.message || errorData.details || `Server error (HTTP ${response.status})`;
                console.error("Demo login API error:", errorData);
              }
            } else {
              console.error("Demo login API error response is not an object:", errorData);
              errorMessage = `Server returned unexpected response (HTTP ${response.status})`;
            }
          } catch (parseError) {
            // If JSON parsing fails, use the raw text
            console.error("Failed to parse response as JSON:", parseError);
            errorMessage = responseText.substring(0, 200) || `Failed to parse error response (HTTP ${response.status})`;
            console.error("Demo login error (raw):", responseText);
          }
        } else {
          console.error("Demo login failed with empty response body");
          errorMessage = `Demo login server error with no response (HTTP ${response.status}). Please check server logs.`;
        }

        throw new Error(errorMessage);
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
      
      console.log("Session set successfully, letting AuthProvider handle role-based routing...");
      // Let the AuthProvider handle the redirect based on user role
      // The AuthProvider will redirect to /admin for admin users, /advisor for advisors, etc.
    } catch (err) {
      console.error("Demo login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Demo functionality may not be properly configured.");
      setLoading(null);
    }
  };

  // Show message if Supabase is not configured
  if (isDemoAvailable === false) {
    return (
      <div className="border-t pt-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Demo login disabled:</strong> Requires Supabase configuration in .env.local
          </p>
        </div>
      </div>
    );
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
