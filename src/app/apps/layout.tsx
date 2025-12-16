// src/app/apps/layout.tsx

import { ReactNode } from 'react';

export default function AppsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Thesis AI Apps</h1>
          <p className="text-muted-foreground">Tools and utilities to enhance your thesis writing process</p>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}