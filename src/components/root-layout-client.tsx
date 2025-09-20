"use client";

import { usePathname } from "next/navigation";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { isPublicPage } from "@/lib/public-paths";
import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
import { FocusModeProvider } from "@/contexts/focus-mode-context"; // Added FocusModeProvider import

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPage = isPublicPage(pathname);

  if (publicPage) {
    return (
      <>
        <LandingHeader />
        {children}
        <LandingFooter />
      </>
    );
  }

  return (
    <FocusModeProvider> {/* Moved FocusModeProvider here */}
      <MainLayoutWrapper>
        {children}
      </MainLayoutWrapper>
    </FocusModeProvider>
  );
}