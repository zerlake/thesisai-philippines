"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Users, CheckCircle2, Shield } from "lucide-react";

export function DemoAccountsSection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Demo login failed");
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(null);
    }
  };

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
