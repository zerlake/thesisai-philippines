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
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async (user: User) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      // Add a small delay and retry mechanism to handle potential race conditions on sign-up
      for (let i = 0; i < 3; i++) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*, documents(count), advisor:advisor_student_relationships!student_id(profiles:advisor_id(*)), user_preferences(*)")
          .eq("id", user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // If it's a real error, throw it immediately
          throw error;
        }
        
        if (profileData) {
          setProfile(profileData);
          return profileData;
        }

        // If profile not found, wait and retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // If loop finishes without returning, profile was not found
      throw new Error("Profile not found after multiple attempts.");

    } catch (e: any) {
      toast.error("Could not fetch user profile.");
      console.error("Error fetching profile:", e.message); // Log the actual error for debugging
    }
    setProfile(null);
    return null;
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    const handleAuthChange = (session: Session | null) => {
      setSession(session);
      if (session?.user) {
        setAuthStatus('authenticated');
        fetchProfile(session.user); // Fetch profile in the background
      } else {
        setProfile(null);
        setAuthStatus('unauthenticated');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      handleAuthChange(session);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn("AuthProvider: Error getting initial session:", error.message);
        if (error.message.includes("Invalid Refresh Token")) {
          supabase.auth.signOut();
        }
      }
      handleAuthChange(data?.session || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  useEffect(() => {
    if (authStatus === 'loading') return;

    const publicPaths = ["/", "/login", "/register", "/explore", "/features", "/for-advisors", "/pricing", "/faq", "/university-guides", "/user-guide", "/atr-style-guide"];
    const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith("/share/");
    const isAdminPage = pathname.startsWith("/admin");
    const isAdvisorPage = pathname.startsWith("/advisor");
    const isAppPage = !isPublicPage && !isAdminPage && !isAdvisorPage;

    if (authStatus === 'unauthenticated' && !isPublicPage) {
      router.push("/login");
    } else if (authStatus === 'authenticated') {
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        if (profile?.role === "admin") router.push("/admin");
        else if (profile?.role === "advisor") router.push("/advisor");
        else router.push("/dashboard");
      } else if (isAdminPage && profile?.role !== "admin") {
        router.push("/dashboard");
      } else if (isAdvisorPage && profile?.role !== "advisor") {
        router.push("/dashboard");
      } else if (isAppPage && (profile?.role === "admin" || profile?.role === "advisor")) {
        router.push(profile.role === "admin" ? "/admin" : "/advisor");
      }
    }
  }, [authStatus, profile, pathname, router]);

  const publicPaths = ["/", "/login", "/register", "/explore", "/features", "/for-advisors", "/pricing", "/faq", "/university-guides", "/user-guide", "/atr-style-guide"];
  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname.startsWith("/share/");

  if (authStatus === 'loading' && !isPublicPage) {
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