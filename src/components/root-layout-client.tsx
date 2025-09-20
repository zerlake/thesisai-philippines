"use client";

import { usePathname } from "next/navigation";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { isPublicPage } from "@/lib/public-paths";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Temporarily removing conditional rendering to diagnose ChunkLoadError
  // This will force all pages to load the main app layout structure.
  return <>{children}</>;
}