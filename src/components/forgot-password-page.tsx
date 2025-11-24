"use client";

import { useState } from "react";
import { BookText, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSubmitted(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <BookText className="w-10 h-10 mb-4" />
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ll help you regain access to your account
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Link href="/login">
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-center mb-3">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Check Your Email</h3>
                  <p className="text-sm text-green-800 mb-2">
                    We&apos;ve sent a password reset link to:
                  </p>
                  <p className="font-medium text-green-900 mb-4 break-all">{email}</p>
                  <p className="text-xs text-green-800">
                    The link will expire in 24 hours. Check your spam folder if you don&apos;t see it.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-sm font-medium">Next steps:</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Check your email for the reset link</li>
                    <li>Click the link to create a new password</li>
                    <li>Sign in with your new password</li>
                  </ol>
                </div>

                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Email
                </Button>

                <Link href="/login">
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
