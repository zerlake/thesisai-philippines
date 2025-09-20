"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandedLoader } from "./branded-loader";
import { isPublicPage } from "@/lib/public-paths";

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
          console.error("CRITICAL: User has session but no profile. Signing out.");
          toast.error("Your user profile could not be found. Please sign in again.");
          await supabase.auth.signOut();
          return;
        }
        throw profileError;
      }

      if (profileData) {
        // Step 2: Fetch user preferences separately
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // It's okay if preferences don't exist, so we only throw for other errors
        if (preferencesError && preferencesError.code !== 'PGRST116') {
          throw preferencesError;
        }
        
        // Step 3: Combine the data
        // @ts-ignore
        // @ts-ignore
        profileData.user_preferences = preferencesData || null;
        setProfile(profileData);
      }
    } catch (e: any) {
      toast.error("Could not fetch user profile.");
      console.error("Error fetching profile:", e.message);
      setProfile(null);
      await supabase.auth.signOut();
    }
  }, [supabase]);

  useEffect(() => {
    const handleAuthChange = async (session: Session | null) => {
      setIsLoading(true);
      setSession(session);
      await fetchProfile(session?.user);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        handleAuthChange(session);
      } catch (error) {
        console.error("Error in onAuthStateChange handler:", error);
        handleAuthChange(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    }).catch((error) => {
      console.error("Error getting session:", error);
      handleAuthChange(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

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
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  if (isLoading && !isPublicPage(pathname)) {
    return <BrandedLoader />;
  }

  return (
    <AuthContext.Provider value={{ supabase, session, profile, refreshProfile }}>
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