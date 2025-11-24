"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BookText, Mail, CheckCircle, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function EmailConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (secondsLeft === 0) {
      setCanResend(true);
    }
  }, [secondsLeft]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        toast.error("Failed to resend confirmation email. Please try again.");
      } else {
        toast.success("Confirmation email sent! Check your inbox.");
        setSecondsLeft(60);
        setCanResend(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    router.push("/register");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent a confirmation link to verify your account
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Email Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-900">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{email}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Account created</p>
                  <p className="text-xs text-muted-foreground">Your account is ready to use</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-medium text-sm">Confirmation email sent</p>
                  <p className="text-xs text-muted-foreground">Check your inbox (spam folder too!)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-600">Email confirmed</p>
                  <p className="text-xs text-muted-foreground">You'll be able to access your dashboard</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium">Link expires in 24 hours</p>
                  <p className="text-xs mt-1">Usually arrives in 1-2 minutes. Check your spam folder if you don't see it.</p>
                </div>
              </div>
            </div>

            {/* Resend Section */}
            <div className="space-y-2 pt-2">
              {canResend ? (
                <Button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              ) : (
                <Button 
                  disabled
                  variant="outline"
                  className="w-full"
                >
                  Resend in {secondsLeft}s
                </Button>
              )}
              
              <Button 
                onClick={handleChangeEmail}
                variant="ghost"
                className="w-full"
              >
                Use Different Email
              </Button>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">What happens next?</p>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">1.</span>
                  <span>Click the confirmation link in the email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">2.</span>
                  <span>Your email will be verified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold flex-shrink-0">3.</span>
                  <span>Sign in and start writing your thesis!</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <a href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
