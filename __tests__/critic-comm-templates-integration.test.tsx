import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import CommTemplatesPage from '@/app/(dashboard)/critic/comm-templates/page';

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

describe('Communication Templates Integration Tests', () => {
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

  it('renders the communication templates page with all components', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
      expect(screen.getByText('Predefined templates for efficient and consistent feedback')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Feedback Communication Templates')).toBeInTheDocument();
    expect(screen.getByText('Create New Template')).toBeInTheDocument();
  });

  it('displays communication templates in the list', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Check if communication templates are displayed in the list
    expect(screen.getByText('Positive Feedback')).toBeInTheDocument();
    expect(screen.getByText('Constructive Criticism')).toBeInTheDocument();
    expect(screen.getByText('Citation Issues')).toBeInTheDocument();
    expect(screen.getByText('Methodology Concerns')).toBeInTheDocument();
  });

  it('allows filtering by category', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Find and click the category filter
    const categorySelect = screen.getByText('Filter by category');
    fireEvent.click(categorySelect);

    // Select a category
    const encouragementOption = screen.getByText('Encouragement');
    fireEvent.click(encouragementOption);
  });

  it('allows searching templates', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'positive' } });
  });

  it('allows creating a new template', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Fill out the new template form
    const nameInput = screen.getByPlaceholderText('Template name');
    fireEvent.change(nameInput, { target: { value: 'New Template' } });

    const purposeInput = screen.getByPlaceholderText('Purpose/Use case');
    fireEvent.change(purposeInput, { target: { value: 'For general feedback' } });

    const contentInput = screen.getByPlaceholderText('Template content');
    fireEvent.change(contentInput, { target: { value: 'This is a new template' } });

    // Submit the form
    const saveButton = screen.getByText('Save Template');
    fireEvent.click(saveButton);
  });

  it('allows using and editing templates', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Find and click the use template button
    const useButtons = screen.getAllByText('Use Template');
    expect(useButtons.length).toBeGreaterThan(0);
    fireEvent.click(useButtons[0]);

    // Find and click the edit button
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]);
  });

  it('displays template analytics', async () => {
    render(
      <TestWrapper>
        <CommTemplatesPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Communication Templates')).toBeInTheDocument();
    });

    // Check the template analytics table
    expect(screen.getByText('Template Analytics')).toBeInTheDocument();
    expect(screen.getByText('Usage statistics and effectiveness metrics')).toBeInTheDocument();
  });
});