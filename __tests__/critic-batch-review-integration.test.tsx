import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import BatchReviewPage from '@/app/(dashboard)/critic/batch-review/page';

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

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => <button data-value={value}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, type }: { placeholder?: string; type?: string }) => (
    <input placeholder={placeholder} type={type} />
  ),
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
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

describe('Batch Review Integration Tests', () => {
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

  it('renders the batch review page with all components', async () => {
    render(
      <TestWrapper>
        <BatchReviewPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Batch Review')).toBeInTheDocument();
      expect(screen.getByText('Process multiple manuscripts simultaneously')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Total Reviews')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Avg. Score')).toBeInTheDocument();
    expect(screen.getByText('Upload & Process')).toBeInTheDocument();
  });

  it('allows file upload and processing', async () => {
    render(
      <TestWrapper>
        <BatchReviewPage />
      </TestWrapper>
    );

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Batch Review')).toBeInTheDocument();
    });

    // Simulate file upload
    const fileInput = screen.getByPlaceholderText('Select documents to review');
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate click on process button
    const processButton = screen.getByText('Upload & Process');
    fireEvent.click(processButton);
  });

  it('displays batch review data in table', async () => {
    render(
      <TestWrapper>
        <BatchReviewPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Batch Review')).toBeInTheDocument();
    });

    // Check if the table with batch reviews is rendered
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning in Healthcare Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('switches between tabs properly', async () => {
    render(
      <TestWrapper>
        <BatchReviewPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Batch Review')).toBeInTheDocument();
    });

    // Check initial tab is active
    const overviewTab = screen.getByText('Overview');
    const detailsTab = screen.getByText('Details');
    const reportsTab = screen.getByText('Reports');

    fireEvent.click(detailsTab);
    await waitFor(() => {
      expect(detailsTab).toBeInTheDocument();
    });

    fireEvent.click(reportsTab);
    await waitFor(() => {
      expect(reportsTab).toBeInTheDocument();
    });

    fireEvent.click(overviewTab);
    await waitFor(() => {
      expect(overviewTab).toBeInTheDocument();
    });
  });
});