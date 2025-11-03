"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/google-icon";
import { supabase } from "@/integrations/supabase/client-with-error-handling";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  label: string;
}

export function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <GoogleIcon className="mr-2 h-5 w-5" />
      {label}
    </Button>
  );
}