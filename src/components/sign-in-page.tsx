"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/sign-in-form";
import Link from "next/link";
import { GoogleSignInButton } from "./google-sign-in-button";
import { DemoAccountsSection } from "./demo-accounts-section";

export function SignInPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src="/THESIS-AI-LOGO2.png" alt="ThesisAI Logo" width={40} height={40} className="mb-4" />
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
              
              {/* Demo Accounts Section - Always visible, API handles environment validation */}
              <DemoAccountsSection />
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