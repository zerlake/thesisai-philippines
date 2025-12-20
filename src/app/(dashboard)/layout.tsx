"use client";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The MainLayoutWrapper is now provided by RootLayoutClient for all non-public pages.
    // This layout simply renders its children, which will be the actual page content.
    <>
      {children}
    </>
  );
}