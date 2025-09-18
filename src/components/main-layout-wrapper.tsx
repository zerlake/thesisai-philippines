"use client";

import { useFocusMode } from "@/contexts/focus-mode-context";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { Breadcrumb } from "./breadcrumb";
import { AppFooter } from "./app-footer";
import { cn } from "@/lib/utils";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isFocusMode } = useFocusMode();

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <div className={cn(isFocusMode && "hidden")}>
        <Header />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className={cn(isFocusMode && "hidden")}>
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black animate-pan-bg">
          <main id="main-content" tabIndex={-1} className={cn("flex-1 overflow-y-auto bg-transparent", isFocusMode ? "p-0" : "p-4 md:p-6")}>
            <div className={cn("mb-6", isFocusMode && "hidden")}>
              <Breadcrumb />
            </div>
            {children}
          </main>
          <div className={cn(isFocusMode && "hidden")}>
            <AppFooter />
          </div>
        </div>
      </div>
    </div>
  );
}