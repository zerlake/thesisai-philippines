"use client";

import { AuthProvider } from "@/components/auth-provider";
import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
import { FocusModeProvider } from "@/contexts/focus-mode-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <FocusModeProvider>
        <MainLayoutWrapper>
          {children}
        </MainLayoutWrapper>
      </FocusModeProvider>
    </AuthProvider>
  );
}