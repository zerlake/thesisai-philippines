import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import CommonIssuesPage from '@/app/(dashboard)/critic/common-issues/page';

// Mock the auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder }: { value?: string; onChange?: () => void; placeholder?: string }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: () => <div>Progress</div>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: { value?: string; onChange?: () => void; placeholder?: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
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

describe('Common Issues Integration Tests', () => {
  const mockProfile = {
    id: 'test-user-id',
    role: 'critic',
    email: 'critic@example.com',
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({
      session: { user: { id: 'test-user-id' } },
      profile: mockProfile,
      isLoading: false,
    });
  });

  it('renders the common issues page with all components', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
      expect(screen.getByText('Catalog of frequently encountered problems in academic writing')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Issue Catalog')).toBeInTheDocument();
    expect(screen.getByText('Report New Issue')).toBeInTheDocument();
  });

  it('displays common issues in the table', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
    });

    // Check if common issues are displayed in the table
    expect(screen.getByText('Citations')).toBeInTheDocument();
    expect(screen.getByText('Incomplete reference entries')).toBeInTheDocument();
    expect(screen.getByText('Structure')).toBeInTheDocument();
    expect(screen.getByText('Unclear thesis statement')).toBeInTheDocument();
  });

  it('allows filtering by category', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
    });

    // Find and click the category filter
    const categorySelect = screen.getByText('Filter by category');
    fireEvent.click(categorySelect);

    // Select a category
    const citationOption = screen.getByText('Citations');
    fireEvent.click(citationOption);
  });

  it('allows searching issues', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Filter issues...');
    fireEvent.change(searchInput, { target: { value: 'citation' } });
  });

  it('allows reporting a new issue', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
    });

    // Select issue category
    const categorySelect = screen.getByText('Select category');
    fireEvent.click(categorySelect);

    // Fill out the issue form
    const issueInput = screen.getByPlaceholderText('Issue title');
    fireEvent.change(issueInput, { target: { value: 'New Issue' } });

    const descriptionInput = screen.getByPlaceholderText('Issue description');
    fireEvent.change(descriptionInput, { target: { value: 'New issue description' } });

    // Submit the form
    const reportButton = screen.getByText('Report Issue');
    fireEvent.click(reportButton);
  });

  it('displays issue analytics', async () => {
    render(
      <TestWrapper>
        <CommonIssuesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Common Issues Library')).toBeInTheDocument();
    });

    // Check the issue analytics section
    expect(screen.getByText('Issue Analysis')).toBeInTheDocument();
    expect(screen.getByText('Overview of common issues by category and severity')).toBeInTheDocument();
  });
});