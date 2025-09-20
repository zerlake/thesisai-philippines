"use client";

import { usePathname } from "next/navigation";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { isPublicPage } from "@/lib/public-paths";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (isPublicPage(pathname)) {
    return (
      <div className="flex min-h-dvh flex-col">
        <LandingHeader />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    );
  }

  return <>{children}</>;
}