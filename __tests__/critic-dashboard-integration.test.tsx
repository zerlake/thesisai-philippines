import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { Toaster } from 'sonner';
import { BrandedLoader } from '@/components/branded-loader';
import { CriticDashboard } from '@/components/critic-dashboard';

// Mock the auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the branded loader
vi.mock('@/components/branded-loader', () => ({
  BrandedLoader: () => <div>Loading...</div>,
}));

// Mock the navigation component
vi.mock('@/components/navigation', () => ({
  Navigation: () => <div>Navigation Component</div>,
}));

// Mock the dashboard cards
vi.mock('@/components/dashboard-cards', () => ({
  DashboardCards: () => <div>Dashboard Cards</div>,
}));

// Mock the critic student list
vi.mock('@/components/critic-student-list', () => ({
  CriticStudentList: () => <div>Critic Student List</div>,
}));

// Mock the dashboard header
vi.mock('@/components/dashboard-header', () => ({
  DashboardHeader: () => <div>Dashboard Header</div>,
}));

// Mock the dashboard sidebar
vi.mock('@/components/dashboard-sidebar', () => ({
  DashboardSidebar: () => <div>Dashboard Sidebar</div>,
}));

// Mock the dashboard layout
vi.mock('@/components/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the enhanced critic dashboard
vi.mock('@/components/critic/enhanced-critic-dashboard', () => ({
  EnhancedCriticDashboard: () => <div>Enhanced Critic Dashboard</div>,
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
      onAuthStateChange: vi.fn(() => ({ subscription: { unsubscribe: vi.fn() } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
  },
}));

// Create a test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Critic Dashboard Integration Tests', () => {
  const mockProfile = {
    id: 'test-user-id',
    role: 'critic',
    email: 'critic@example.com',
    first_name: 'Test',
    last_name: 'Critic',
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({
      session: { user: { id: 'test-user-id' } },
      profile: mockProfile,
      isLoading: false,
    });
  });

  it('renders the critic dashboard with all components', async () => {
    render(
      <TestWrapper>
        <CriticDashboard />
      </TestWrapper>
    );

    // Wait for the dashboard to render
    await waitFor(() => {
      expect(screen.getByText('Enhanced Critic Dashboard')).toBeInTheDocument();
    });
  });

  it('handles loading state properly', () => {
    (useAuth as vi.Mock).mockReturnValue({
      session: null,
      profile: null,
      isLoading: true,
    });

    render(
      <TestWrapper>
        <CriticDashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects non-critic users', () => {
    const nonCriticProfile = { ...mockProfile, role: 'user' };
    (useAuth as vi.Mock).mockReturnValue({
      session: { user: { id: 'test-user-id' } },
      profile: nonCriticProfile,
      isLoading: false,
    });

    render(
      <TestWrapper>
        <CriticDashboard />
      </TestWrapper>
    );

    // This test would need to mock the redirect behavior
    // For now, we'll just verify that the component renders appropriately
    expect(screen.queryByText('Enhanced Critic Dashboard')).not.toBeInTheDocument();
  });
});