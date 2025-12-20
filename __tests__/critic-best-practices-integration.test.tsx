import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import BestPracticesPage from '@/app/(dashboard)/critic/best-practices/page';

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

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
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

describe('Best Practices Integration Tests', () => {
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

  it('renders the best practices page with all components', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive guide to academic writing best practices')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Best Practices Library')).toBeInTheDocument();
    expect(screen.getByText('Add New Practice')).toBeInTheDocument();
  });

  it('displays best practices in the accordion', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
    });

    // Check if best practices are displayed in the accordion
    expect(screen.getByText('Clear Thesis Statement')).toBeInTheDocument();
    expect(screen.getByText('Proper Citations')).toBeInTheDocument();
    expect(screen.getByText('Logical Flow')).toBeInTheDocument();
    expect(screen.getByText('Evidence-Based Arguments')).toBeInTheDocument();
  });

  it('allows filtering by category', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
    });

    // Find and click the category filter
    const categorySelect = screen.getByText('Filter by category');
    fireEvent.click(categorySelect);

    // Select a category
    const structureOption = screen.getByText('Structure');
    fireEvent.click(structureOption);
  });

  it('allows searching practices', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Search practices...');
    fireEvent.change(searchInput, { target: { value: 'thesis' } });
  });

  it('allows adding a new practice', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
    });

    // Fill out the new practice form
    const titleInput = screen.getByPlaceholderText('Practice title');
    fireEvent.change(titleInput, { target: { value: 'New Practice' } });

    const descriptionInput = screen.getByPlaceholderText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New practice description' } });

    // Submit the form
    const addButton = screen.getByText('Add Practice');
    fireEvent.click(addButton);
  });

  it('displays practice statistics', async () => {
    render(
      <TestWrapper>
        <BestPracticesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Best Practices Guide')).toBeInTheDocument();
    });

    // Check the practice statistics table
    expect(screen.getByText('Practice Statistics')).toBeInTheDocument();
    expect(screen.getByText('Overview of best practices by category')).toBeInTheDocument();
  });
});