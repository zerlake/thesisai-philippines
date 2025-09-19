"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Session, SupabaseClient, AuthChangeEvent, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandedLoader } from "./branded-loader";

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
      handleAuthChange(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  useEffect(() => {
    if (isLoading) return;

    const authStatus = session && profile ? 'authenticated' : 'unauthenticated';

    const publicPaths = ["/", "/login", "/register", "/explore", "/features", "/for-advisors", "/pricing", "/faq", "/university-guides", "/user-guide", "/atr-style-guide"];
    const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith("/share/");
    const isAdminPage = pathname.startsWith("/admin");
    const isAdvisorPage = pathname.startsWith("/advisor");
    const isAppPage = !isPublicPage && !isAdminPage && !isAdvisorPage;

    if (authStatus === 'unauthenticated' && !isPublicPage) {
      router.push("/login");
    } else if (authStatus === 'authenticated' && profile) {
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        if (profile.role === "admin") router.push("/admin");
        else if (profile.role === "advisor") router.push("/advisor");
        else router.push("/dashboard");
      } else if (isAdminPage && profile.role !== "admin") {
        router.push("/dashboard");
      } else if (isAdvisorPage && profile.role !== "advisor") {
        router.push("/dashboard");
      } else if (isAppPage && (profile.role === "admin" || profile.role === "advisor")) {
        router.push(profile.role === "admin" ? "/admin" : "/advisor");
      }
    }
  }, [isLoading, session, profile, pathname, router]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  const publicPaths = ["/", "/login", "/register", "/explore", "/features", "/for-advisors", "/pricing", "/faq", "/university-guides", "/user-guide", "/atr-style-guide"];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith("/share/");

  if (isLoading && !isPublicPage) {
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