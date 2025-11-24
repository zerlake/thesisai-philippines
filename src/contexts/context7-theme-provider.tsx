import * as React from "react";
import { cn } from "@/lib/utils";

interface Context7ThemeProviderProps {
  children: React.ReactNode;
  className?: string;
}

const Context7ThemeContext = React.createContext<{}>({});

export function Context7ThemeProvider({ children, className }: Context7ThemeProviderProps) {
  return (
    <Context7ThemeContext.Provider value={{}}>
      <div className={cn("context7-theme", className)}>{children}</div>
    </Context7ThemeContext.Provider>
  );
}

export const useContext7Theme = () => {
  const context = React.useContext(Context7ThemeContext);
  if (!context) {
    throw new Error("useContext7Theme must be used within a Context7ThemeProvider");
  }
  return context;
};