"use client";

import { usePathname } from "next/navigation";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { isPublicPage } from "@/lib/public-paths";
import { MainLayoutWrapper } from "@/components/main-layout-wrapper";
import { FocusModeProvider } from "@/contexts/focus-mode-context";
import { PuterProvider } from "@/contexts/puter-context";
import { MCPProvider } from "@/components/mcp/MCPProvider";
import { Context7Provider } from "@/contexts/context7-provider";
import { useState, useEffect } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { CommandPaletteHint } from '@/components/CommandPalette/CommandPaletteHint';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicPage = isPublicPage(pathname);
  const [commandOpen, setCommandOpen] = useState(false);
  
  // Check if it's the user's first visit or if they're a new user (determined by localStorage)
  const [isNewUser, setIsNewUser] = useState(false);
  
  useEffect(() => {
    // Check if this is a first-time visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsNewUser(true);
      // Set a flag after first visit to avoid showing it again
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  // Open command palette with Ctrl+K or Cmd+K
  useKeyboardShortcut('k', () => setCommandOpen(true), { 
    ctrl: true, 
    meta: true // Cmd on Mac, Ctrl on Windows
  });

  // Close command palette with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  if (publicPage) {
    return (
      <Context7Provider>
        <MCPProvider>
          <PuterProvider>
            <LandingHeader />
            {children}
            <LandingFooter />
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
            <CommandPaletteHint isVisible={isNewUser} />
          </PuterProvider>
        </MCPProvider>
      </Context7Provider>
    );
  }

  return (
    <Context7Provider>
      <MCPProvider>
        <PuterProvider>
          <FocusModeProvider>
            <>
              <MainLayoutWrapper>
                {children}
              </MainLayoutWrapper>
              <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
              <CommandPaletteHint isVisible={isNewUser} />
            </>
          </FocusModeProvider>
        </PuterProvider>
      </MCPProvider>
    </Context7Provider>
  );
}