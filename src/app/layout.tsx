import type { Metadata } from "next";
import { Outfit, Lora } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import { SkipToContentLink } from "@/components/skip-to-content-link";
import { RootLayoutClient } from "@/components/root-layout-client";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";

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
  title: "ThesisAI Philippines - AI-Powered Academic Writing Assistant",
  description: "Streamline your thesis writing process with our AI-powered platform. Generate outlines, check originality, format citations, and connect with advisors—all in one workspace designed for Philippine universities.",
  keywords: [
    "AI thesis writer",
    "Philippine manuscript review",
    "academic citation checker",
    "thesis writing tool Philippines",
    "AI research assistant",
    "online thesis help",
    "manuscript editing service",
    "academic writing software",
    "student research tools"
  ],
  authors: [{ name: "ThesisAI Philippines", url: "https://thesisai-philippines.vercel.app" }],
  creator: "ThesisAI Philippines",
  publisher: "ThesisAI Philippines",
  openGraph: {
    title: "ThesisAI Philippines - AI-Powered Academic Writing Assistant",
    description: "Streamline your thesis writing process with our AI-powered platform. Generate outlines, check originality, format citations, and connect with advisors—all in one workspace designed for Philippine universities.",
    url: "https://thesisai-philippines.vercel.app",
    siteName: "ThesisAI Philippines",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ThesisAI Philippines - AI-Powered Academic Writing Assistant",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThesisAI Philippines - AI-Powered Academic Writing Assistant",
    description: "Streamline your thesis writing process with our AI-powered platform. Generate outlines, check originality, format citations, and connect with advisors—all in one workspace.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: "https://thesisai-philippines.vercel.app",
  },
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
        <ChunkLoadErrorHandler />
        <SkipToContentLink />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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