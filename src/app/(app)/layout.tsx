"use client";

// Removed FocusModeProvider import
import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
// Removed FocusModeProvider import

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removed FocusModeProvider wrapper
    <MainLayoutWrapper>
      {children}
    </MainLayoutWrapper>
    // Removed FocusModeProvider wrapper
  );
}