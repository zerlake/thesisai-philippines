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

    // Check if Supabase is properly configured before making API calls
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured, using minimal profile");
      setProfile({
        id: user.id,
        email: user.email,
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
        full_name: user.email?.split('@')[0] || 'User',
        user_preferences: null
      });
      return;
    }

    try {
      // Step 1: Fetch the main profile data with retry logic for demo accounts
      // Demo accounts may have profile upsert in flight, so retry up to 3 times
      let profileData = null;
      let profileError = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        profileData = result.data;
        profileError = result.error;
        
        // If we got the profile or a different error (not "not found"), break
        if (profileData || (profileError && profileError.code !== 'PGRST116')) {
          break;
        }
        
        // If profile not found and we have retries left, wait and retry
        if (profileError?.code === 'PGRST116' && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (profileError) {
        // Handle network errors gracefully
        if (profileError.message && profileError.message.includes("Failed to fetch")) {
          console.warn("Network error fetching profile, using minimal profile:", profileError.message);
          // Determine role based on email pattern for demo accounts
          // Order matters - check more specific patterns first
          const email = user.email;
          let role = "user"; // default role

          if (email && email.includes('demo-admin')) {
            role = "admin";
          } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
            role = "admin";
          } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
            role = "advisor";
          } else if (email && email.includes('critic')) {
            role = "critic";
          }

          console.log(`[Auth] Network error, setting role based on email pattern: ${role} for ${email}`);

          setProfile({
            id: user.id,
            email: user.email,
            role: role,
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
            full_name: user.email?.split('@')[0] || 'User',
            user_preferences: null
          });
          return;
        }

        if (profileError.code === 'PGRST116') {
          // Determine role based on email pattern for demo accounts when profile doesn't exist
          // Order matters - check more specific patterns first
          const email = user.email;
          let role = "user"; // default role

          if (email && email.includes('demo-admin')) {
            role = "admin";
          } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
            role = "admin";
          } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
            role = "advisor";
          } else if (email && email.includes('critic')) {
            role = "critic";
          }

          console.log(`[Auth] Profile not found, creating with role based on email: ${role} for ${email}`);

          // Create a default profile for the user
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              role: role,
              email: user.email || undefined,
              plan: "free"
            });

          if (createError) {
            console.error("Failed to create profile:", createError);
            // Check if it's a network error
            if (createError.message && createError.message.includes("Failed to fetch")) {
              toast.error("Unable to create user profile. Please check your internet connection.");
            } else {
              toast.error("Could not create user profile.");
            }
            // Set a minimal profile anyway to allow user access
            setProfile({
              id: user.id,
              email: user.email,
              role: role, // Use determined role instead of default
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
              full_name: user.email?.split('@')[0] || 'User',
              user_preferences: null
            });
            return;
          }

          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (newProfile) {
              console.log("[Auth] Created new profile with role:", newProfile.role);
              setProfile(newProfile);
            }
            return;
        }
        // For other errors, log them but continue with minimal profile
         console.error("Profile fetch error:", profileError);

         // Determine role based on email pattern for other errors
         // Order matters - check more specific patterns first
         const email = user.email;
         let role = "user"; // default role

         if (email && email.includes('demo-admin')) {
           role = "admin";
         } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
           role = "admin";
         } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
           role = "advisor";
         } else if (email && email.includes('critic')) {
           role = "critic";
         }

         console.log(`[Auth] Error fetching profile, setting role based on email: ${role} for ${email}`);

         setProfile({
           id: user.id,
           email: user.email,
           role: role, // Use determined role instead of default
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
           full_name: user.email?.split('@')[0] || 'User',
           user_preferences: null
         });
         return;
        }

        if (profileData) {
        console.log("[Auth] Profile fetched successfully with role:", profileData.role);
        setProfile(profileData);
        }
        } catch (e: any) {
        console.error("Error in fetchProfile:", e);
        // Check if it's a network error
        if (e?.message?.includes("Failed to fetch") || e?.message?.includes("NetworkError")) {
          toast.error("Unable to fetch user profile. Please check your internet connection.");
        } else {
          const normalized = normalizeError(e, 'fetchProfile');
          toast.error("Could not fetch user profile.");
        }
        // Set a minimal profile anyway to allow the user to continue using the app
        // Determine role based on email pattern for error cases
        // Order matters - check more specific patterns first
        const email = user.email;
        let role = "user"; // default role

        if (email && email.includes('demo-admin')) {
          role = "admin";
        } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
          role = "admin";
        } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
          role = "advisor";
        } else if (email && email.includes('critic')) {
          role = "critic";
        }

        console.log(`[Auth] Error in fetchProfile, setting role based on email: ${role} for ${email}`);

        setProfile({
          id: user.id,
          email: user.email,
          role: role, // Use determined role instead of default
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
          full_name: user.email?.split('@')[0] || 'User',
          user_preferences: null
        });
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
          // Determine role from email pattern for timeout fallback
          const email = session.user?.email;
          let role = "user"; // default role

          if (email && email.includes('demo-admin')) {
            role = "admin";
          } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
            role = "admin";
          } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
            role = "advisor";
          } else if (email && email.includes('critic')) {
            role = "critic";
          }

          console.log(`[Auth] Pre-timeout: determined role from email: ${role} for ${email}`);

          // Add a timeout to prevent indefinite loading
          const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
              console.log(`[Auth] Profile load timeout for user: ${session.user?.id}, proceeding with minimal profile`);
              // Instead of rejecting, resolve with minimal profile data to unblock the user
              resolve({
                id: session.user?.id,
                email: session.user?.email,
                role: role, // Use determined role from email pattern
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
                full_name: session.user?.email?.split('@')[0] || 'User',
                user_preferences: null
              });
            }, 3000); // 3 second timeout - don't block UI
          });

          const fetchPromise = fetchProfile(session.user);

          // Race the fetchProfile call with a timeout
          // If timeout occurs, the timeoutPromise will resolve with minimal profile
          const profileResult = await Promise.race([fetchPromise, timeoutPromise]);

          // Only set profile if it's a valid profile (not an error)
          if (profileResult && typeof profileResult === 'object' && 'id' in profileResult) {
            setProfile(profileResult as Profile);
            localStorage.setItem("lastProfileLoad", new Date().toISOString());
          } else {
            // If result is an error, set minimal profile to unblock user
            // Determine role based on email pattern
            // Order matters - check more specific patterns first
            const email = session.user?.email;
            let role = "user"; // default role

            if (email && email.includes('demo-admin')) {
              role = "admin";
            } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
              role = "admin";
            } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
              role = "advisor";
            } else if (email && email.includes('critic')) {
              role = "critic";
            }

            console.log(`[Auth] Profile load timeout/result error, setting role based on email: ${role} for ${email}`);

            setProfile({
              id: session.user?.id,
              email: session.user?.email,
              role: role, // Use determined role instead of default
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
              full_name: session.user?.email?.split('@')[0] || 'User',
              user_preferences: null
            });
          }
        } catch (error) {
          console.error("[Auth] Error loading profile:", error);
          // Set a minimal profile to avoid blocking the user
          // Determine role based on email pattern
          // Order matters - check more specific patterns first
          const email = session.user?.email;
          let role = "user"; // default role

          if (email && email.includes('demo-admin')) {
            role = "admin";
          } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
            role = "admin";
          } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
            role = "advisor";
          } else if (email && email.includes('critic')) {
            role = "critic";
          }

          console.log(`[Auth] Error loading profile, setting role based on email: ${role} for ${email}`);

          setProfile({
            id: session.user?.id,
            email: session.user?.email,
            role: role, // Use determined role instead of default
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
            full_name: session.user?.email?.split('@')[0] || 'User',
            user_preferences: null
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

    // Check if Supabase is properly configured before setting up the auth listener
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("Supabase not configured, skipping auth initialization");
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
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
          // Check if it's a network error vs auth error
          if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            console.warn("[Auth] Network error, using minimal session");
            // Set a minimal session to allow the app to load with basic functionality
            await handleAuthChange({
              user: {
                id: 'network-error-id',
                email: 'network@offline.com',
                // Add other minimal user properties as needed
              } as User,
              access_token: '',
              refresh_token: '',
              expires_in: 0,
              token_type: 'bearer',
            } as Session);
          } else if (error.message.includes("Refresh Token") || error.message.includes("Invalid") || error.message.includes("Not Found")) {
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
      } catch (error: any) {
        console.error("[Auth] Error during session retrieval:", error);
        // Check if it's a network error
        if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError")) {
          console.warn("[Auth] Network error during initialization, using minimal session");
          // Set a minimal session to allow the app to load with basic functionality
          await handleAuthChange({
            user: {
              id: 'network-error-id',
              email: 'network@offline.com',
              // Add other minimal user properties as needed
            } as User,
            access_token: '',
            refresh_token: '',
            expires_in: 0,
            token_type: 'bearer',
          } as Session);
        } else if (mounted) {
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
    }, 3000); // 3 second timeout - don't block UI

    initializeAuth();

    return () => {
      clearTimeout(initTimeout);
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);  // Remove router from dependencies to prevent potential loops

  // Effect to handle redirects after auth state is loaded
  // Track previous state to prevent infinite redirect loops
  const hasRedirected = useRef(false);
  const lastRedirectPath = useRef("");

  useEffect(() => {
    if (isLoading) return;

    const authStatus = session && profile ? 'authenticated' : 'unauthenticated';
    const isPublic = isPublicPage(pathname);

    // Prevent redirect loops - if we just redirected to this path, don't redirect again
    if (hasRedirected.current && lastRedirectPath.current === pathname) {
      hasRedirected.current = false;
      return;
    }

    // Handle unauthenticated users on non-public pages
    if (authStatus === 'unauthenticated' && !isPublic && pathname !== "/login") {
      hasRedirected.current = true;
      lastRedirectPath.current = "/login";
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

      // Redirect from auth pages when authenticated (but not from landing page "/")
      if (pathname === "/login" || pathname === "/register") {
        hasRedirected.current = true;
        lastRedirectPath.current = userHomePage;
        router.replace(userHomePage);
        return;
      }

      // Check if user is admin - admins have access to ALL dashboards
      const isAdmin = profile.role === "admin";

      // Role-based access control
      if (!isAdmin) {
        const isAccessingWrongRole =
          (pathname.startsWith("/admin") && profile.role !== "admin") ||
          (pathname.startsWith("/advisor") && profile.role !== "advisor") ||
          (pathname.startsWith("/critic") && profile.role !== "critic");

        if (isAccessingWrongRole) {
          hasRedirected.current = true;
          lastRedirectPath.current = userHomePage;
          router.replace(userHomePage);
          return;
        }
      }
    }
  }, [isLoading, session, profile, pathname, router]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      try {
        await fetchProfile(session.user);
      } catch (error: any) {
        console.error("Error refreshing profile:", error);
        if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError")) {
          toast.error("Unable to refresh profile. Please check your internet connection.");
        } else {
          toast.error("Error refreshing profile. Data may be temporarily unavailable.");
          // NOTE: Not signing out user anymore - just show error message
          // Only sign out for authentication-related errors
          // await supabase.auth.signOut();
        }

        // Update profile with role based on email in case of error
        // Order matters - check more specific patterns first
        const email = session.user.email;
        let role = "user"; // default role

        if (email && email.includes('demo-admin')) {
          role = "admin";
        } else if (email && (email.includes('admin') || email.includes('admin@thesisai'))) {
          role = "admin";
        } else if (email && (email.includes('advisor') || email.includes('demo-advisor'))) {
          role = "advisor";
        } else if (email && email.includes('critic')) {
          role = "critic";
        }

        setProfile({
          id: session.user.id,
          email: session.user.email,
          role: role, // Use determined role instead of default
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
          full_name: session.user.email?.split('@')[0] || 'User',
          user_preferences: null
        });
      }
    }
  }, [session, fetchProfile]);  // Remove router from dependencies to prevent potential loops

  // Don't block rendering - always render children
  // Public pages (login, register, landing) should never be blocked
  // Private pages handle their own loading states
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