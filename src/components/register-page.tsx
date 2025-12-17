"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SignUpFormWizard } from "@/components/sign-up-form-wizard";
import Link from "next/link";

export function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src="/THESIS-AI-LOGO2.png" alt="ThesisAI Logo" width={40} height={40} className="mb-4" />
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Join ThesisAI and start your research journey.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <SignUpFormWizard />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}