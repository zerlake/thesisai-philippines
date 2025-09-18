import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { SkipToContentLink } from "@/components/skip-to-content-link";
import { RootLayoutClient } from "@/components/root-layout-client";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ThesisAI",
  description: "Your AI-Powered Academic Co-Pilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontSerif.variable
        )}
        suppressHydrationWarning
      >
        <SkipToContentLink />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RootLayoutClient>{children}</RootLayoutClient>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}