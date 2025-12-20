/**
 * Admin Layout
 * Phase 5: Real-time Monitoring & Analytics
 */

import React from 'react';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Note: The sidebar is provided by MainLayoutWrapper via RootLayoutClient
  // This layout only handles admin-specific navigation elements if needed
  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col w-full flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;