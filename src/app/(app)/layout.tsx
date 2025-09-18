"use client";

import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
import { FocusModeProvider } from "@/contexts/focus-mode-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FocusModeProvider>
      <MainLayoutWrapper>
        {children}
      </MainLayoutWrapper>
    </FocusModeProvider>
  );
}