"use client";

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRouter, usePathname } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/features', 
    '/for-advisors', 
    '/pricing', 
    '/faq', 
    '/user-guide', 
    '/university-guides', 
    '/explore'
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/share/');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      } else if (!session && !isPublicRoute) {
        router.push('/login');
      }
    });

    // Check initial session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isPublicRoute) {
        router.push('/login');
      } else if (session && (pathname === '/login' || pathname === '/register')) {
        router.push('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname, isPublicRoute]);

  return <>{children}</>;
}