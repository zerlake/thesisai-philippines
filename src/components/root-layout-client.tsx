"use client";

import { usePathname } from "next/navigation";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/explore",
  "/features",
  "/for-advisors",
  "/pricing",
  "/faq",
  "/university-guides",
  "/user-guide",
  "/atr-style-guide",
];

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = publicPaths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p))) || pathname.startsWith("/share/");

  if (isPublicPage) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    );
  }

  return <>{children}</>;
}