import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    // Redirect to login with error
    const errorUrl = new URL("/login", request.url);
    errorUrl.searchParams.set("error", error);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Error exchanging code for session:", error);
        const errorUrl = new URL("/login", request.url);
        errorUrl.searchParams.set("error", error.message);
        return NextResponse.redirect(errorUrl);
      }

      // Successfully authenticated, redirect to role-specific dashboard
      // For now, redirect to dashboard and let the auth provider handle the final redirect based on role
      // In a more sophisticated implementation, we would fetch the user profile here to determine the exact redirect
      // For now, we'll redirect to the generic dashboard and let the auth provider handle role-based routing
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (err) {
      console.error("Unexpected error during OAuth callback:", err);
      const errorUrl = new URL("/login", request.url);
      errorUrl.searchParams.set("error", "Authentication failed");
      return NextResponse.redirect(errorUrl);
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}