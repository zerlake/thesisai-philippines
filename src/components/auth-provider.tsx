"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
              email: user.email || undefined,
              plan: "free"
            });
          
          if (createError) {
            console.error("Failed to create profile:", createError);
            toast.error("Could not create user profile.");
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
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (session: Session | null) => {
      if (!mounted) return;

      setIsLoading(true);
      setSession(session);
      if (session?.user) {
        try {
          // Add a timeout to prevent indefinite loading
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
              console.log(`[Auth] Profile load timeout for user: ${session.user?.id}, proceeding with minimal profile`);
              // Instead of rejecting, resolve with minimal profile data to unblock the user
              resolve({
                id: session.user?.id,
                email: session.user?.email,
                role: "user", // default role
                created_at: null,
                updated_at: null,
                last_login_at: new Date().toISOString(),
                // Add other minimal required fields to prevent crashes
                first_name: '',
                last_name: '',
                institution: '',
                department: '',
                is_onboarded: false,
                preferences: {},
                avatar_url: null,
                full_name: session.user?.email?.split('@')[0] || 'User'
              });
            }, 10000); // Reduced to 10 seconds to provide faster fallback
          });

          const fetchPromise = fetchProfile(session.user);

          // Race the fetchProfile call with a timeout
          // If timeout occurs, the timeoutPromise will resolve with minimal profile
          const profileResult = await Promise.race([fetchPromise, timeoutPromise]);

          // Only set profile if it's a valid profile (not an error)
          if (profileResult && profileResult.id) {
            setProfile(profileResult);
            localStorage.setItem("lastProfileLoad", new Date().toISOString());
          } else {
            // If result is an error, set minimal profile to unblock user
            setProfile({
              id: session.user?.id,
              email: session.user?.email,
              role: "user",
              created_at: null,
              updated_at: null,
              last_login_at: new Date().toISOString(),
              first_name: '',
              last_name: '',
              institution: '',
              department: '',
              is_onboarded: false,
              preferences: {},
              avatar_url: null,
              full_name: session.user?.email?.split('@')[0] || 'User'
            });
          }
        } catch (error) {
          console.error("[Auth] Error loading profile:", error);
          // Set a minimal profile to avoid blocking the user
          setProfile({
            id: session.user?.id,
            email: session.user?.email,
            role: "user",
            created_at: null,
            updated_at: null,
            last_login_at: new Date().toISOString(),
            first_name: '',
            last_name: '',
            institution: '',
            department: '',
            is_onboarded: false,
            preferences: {},
            avatar_url: null,
            full_name: session.user?.email?.split('@')[0] || 'User'
          });
        } finally {
          // Always clear the loading state, even on error
          if (mounted) {
            setIsLoading(false);
          }
        }
      } else {
        setProfile(null);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
        if (_event === 'SIGNED_OUT') {
          // Clear session and profile if signed out or token refresh failed
          await handleAuthChange(null);

          // Redirect to login page
          if (!isPublicPage(pathname) && pathname !== "/login") {
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

    // Initialize with a timeout to prevent hanging
    const initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('[Auth] Initialization timeout, stopping loading state');
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout for initialization

    initializeAuth();

    return () => {
      clearTimeout(initTimeout);
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);  // Remove router from dependencies to prevent potential loops

  // Effect to handle redirects after auth state is loaded
  // Track both auth state and pathname changes separately to prevent infinite loops
  const prevAuthState = useRef({
    session: null as any,
    profile: null as any,
    pathname: ""
  });

  useEffect(() => {
    if (isLoading) return;

    const authStatus = session && profile ? 'authenticated' : 'unauthenticated';
    const isPublic = isPublicPage(pathname);

    // Handle unauthenticated users on non-public pages
    if (authStatus === 'unauthenticated' && !isPublic && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // If authenticated and has profile
    if (authStatus === 'authenticated' && profile) {
      const roleHomePages: { [key: string]: string } = {
        admin: '/admin',
        advisor: '/advisor',
        critic: '/critic',
        user: '/dashboard'
      };
      const userHomePage = roleHomePages[profile.role] || '/dashboard';

      // Redirect from auth pages when authenticated
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        router.replace(userHomePage);
        return;
      }

      // Role-based access control
      if (((pathname.startsWith("/admin") && profile.role !== "admin") ||
          (pathname.startsWith("/advisor") && profile.role !== "advisor") ||
          (pathname.startsWith("/critic") && profile.role !== "critic")) &&
          pathname !== userHomePage) {
        router.replace(userHomePage);
        return;
      }

      // Role-based dashboard access
      if (pathname.startsWith("/dashboard") && profile.role !== "user" && pathname !== userHomePage) {
        router.replace(userHomePage);
        return;
      }
    }
  }, [isLoading, session, profile, pathname]);

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
  }, [session, fetchProfile]);  // Remove router from dependencies to prevent potential loops

  // Show loader only for public pages if needed; for private pages, let content render to avoid infinite loading
  if (isLoading && isPublicPage(pathname)) {
    return <BrandedLoader />;
  }
  // For private pages, we render the content regardless of loading state to prevent infinite loading
  // The individual components will handle their own loading states

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