"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandedLoader } from "./branded-loader";
import { isPublicPage } from "@/lib/public-paths";
import { setupErrorSuppression } from "@/utils/supabase-error-handler";
import { normalizeError } from "@/utils/error-utilities";

// Setup error suppression on import
setupErrorSuppression();

type Profile = {
  id: string;
  role: string;
  user_preferences: {
    dashboard_widgets: { [key: string]: boolean };
    notification_preferences: { [key: string]: boolean };
  } | null;
  [key: string]: any;
} | null;

type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  profile: Profile;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async (user: User | undefined) => {
    if (!user) {
      setProfile(null);
      setSession(null);
      return;
    }

    try {
      // Step 1: Fetch the main profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Create a default profile for the user
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              role: "user",
              user_preferences: {
                dashboard_widgets: {},
                notification_preferences: {}
              }
            });
          
          if (createError) {
            console.error("Failed to create profile:", createError);
            toast.error("Could not create user profile.");
            await supabase.auth.signOut();
            return;
          }
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          if (newProfile) {
            setProfile(newProfile);
          }
          return;
        }
        throw profileError;
        }

        if (profileData) {
        setProfile(profileData);
        }
        } catch (e: any) {
        const normalized = normalizeError(e, 'fetchProfile');
        toast.error("Could not fetch user profile.");
        console.error("Error fetching profile:", normalized.message);
      setProfile(null);
      await supabase.auth.signOut();
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (session: Session | null) => {
      if (!mounted) return;
      
      setIsLoading(true);
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
        if (_event === 'SIGNED_OUT') {
          // Clear session and profile if signed out or token refresh failed
          await handleAuthChange(null);
          
          // Redirect to login page
          if (!isPublicPage(pathname)) {
            router.push("/login");
          }
        } else if (_event === 'TOKEN_REFRESHED' && session) {
          await handleAuthChange(session);
        }
      } else if (_event === 'INITIAL_SESSION' || _event === 'USER_UPDATED' || _event === 'SIGNED_IN') {
        try {
          await handleAuthChange(session);
        } catch (error) {
          console.error("[Auth] Error in onAuthStateChange handler:", error);
          if (mounted) {
            await handleAuthChange(null);
          }
        }
      }
    });

    // Get the current session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.warn("[Auth] Error getting session:", error.message);
          // Check if it's a refresh token error
          if (error.message.includes("Refresh Token") || error.message.includes("Invalid") || error.message.includes("Not Found")) {
            console.log("[Auth] Refresh token invalid/missing, signing out gracefully");
            await supabase.auth.signOut().catch(() => {
              // Ignore signout errors
            });
            await handleAuthChange(null);
          } else {
            await handleAuthChange(null);
          }
        } else {
          await handleAuthChange(session);
        }
      } catch (error) {
        console.error("[Auth] Error during session retrieval:", error);
        if (mounted) {
          await handleAuthChange(null);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, router, pathname]);

  useEffect(() => {
    if (isLoading) return;

    const authStatus = session && profile ? 'authenticated' : 'unauthenticated';
    const isPublic = isPublicPage(pathname);

    if (authStatus === 'unauthenticated' && !isPublic) {
      router.push("/login");
    } else if (authStatus === 'authenticated' && profile) {
      const roleHomePages: { [key: string]: string } = {
        admin: '/admin',
        advisor: '/advisor',
        critic: '/critic',
        user: '/dashboard'
      };
      const userHomePage = roleHomePages[profile.role] || '/dashboard';

      // 1. Redirect from public-only pages if logged in
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        router.push(userHomePage);
      }
      // 2. Role-based page protection
      else if (pathname.startsWith("/admin") && profile.role !== "admin") {
        router.push(userHomePage);
      } else if (pathname.startsWith("/advisor") && profile.role !== "advisor") {
        router.push(userHomePage);
      } else if (pathname.startsWith("/critic") && profile.role !== "critic") {
        router.push(userHomePage);
      }
      // 3. Prevent non-students from accessing the student dashboard
      else if (pathname.startsWith("/dashboard") && profile.role !== "user") {
        router.push(userHomePage);
      }
    }
  }, [isLoading, session, profile, pathname, router]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      try {
        await fetchProfile(session.user);
      } catch (error) {
        console.error("Error refreshing profile:", error);
        toast.error("Error refreshing profile. Please try logging in again.");
        await supabase.auth.signOut();
      }
    }
  }, [session, fetchProfile]);

  if (isLoading && !isPublicPage(pathname)) {
    return <BrandedLoader />;
  }

  return (
    <AuthContext.Provider value={{ supabase, session, profile, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};