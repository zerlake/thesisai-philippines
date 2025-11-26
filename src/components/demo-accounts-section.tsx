"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function DemoAccountsSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      name: "Student Demo",
      email: "student@demo.thesisai.local",
      password: "demo123456",
    },
    {
      name: "Educator Demo",
      email: "educator@demo.thesisai.local",
      password: "demo123456",
    },
  ];

  const handleDemoLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Demo login failed");
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-xs text-muted-foreground text-center">Demo Accounts</p>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      {demoAccounts.map((account) => (
        <Button
          key={account.email}
          variant="outline"
          className="w-full"
          onClick={() => handleDemoLogin(account.email, account.password)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {account.name}
        </Button>
      ))}
    </div>
  );
}
