import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import RubricsPage from '@/app/(dashboard)/critic/rubrics/page';

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

describe('Rubrics Integration Tests', () => {
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

  it('renders the rubrics page with all components', async () => {
    render(
      <TestWrapper>
        <RubricsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Evaluation Rubrics')).toBeInTheDocument();
      expect(screen.getByText('Manage and customize evaluation rubrics for manuscript reviews')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Rubric Categories')).toBeInTheDocument();
    expect(screen.getByText('Add New Rubric')).toBeInTheDocument();
  });

  it('displays rubrics in the table', async () => {
    render(
      <TestWrapper>
        <RubricsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Evaluation Rubrics')).toBeInTheDocument();
    });

    // Check if rubrics are displayed in the table
    expect(screen.getByText('Research Quality')).toBeInTheDocument();
    expect(screen.getByText('Writing Clarity')).toBeInTheDocument();
    expect(screen.getByText('Methodology')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });

  it('allows adding a new rubric', async () => {
    render(
      <TestWrapper>
        <RubricsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Evaluation Rubrics')).toBeInTheDocument();
    });

    // Click the "Add New Rubric" button
    const addRubricButton = screen.getByText('Add New Rubric');
    fireEvent.click(addRubricButton);

    // Fill out the form fields
    const nameInput = screen.getByPlaceholderText('Rubric name');
    fireEvent.change(nameInput, { target: { value: 'New Rubric' } });

    const criteriaInput = screen.getByPlaceholderText('Criteria description');
    fireEvent.change(criteriaInput, { target: { value: 'Test criteria' } });

    // Submit the form
    const addButton = screen.getByText('Add Rubric');
    fireEvent.click(addButton);
  });

  it('displays rubric details when selected', async () => {
    render(
      <TestWrapper>
        <RubricsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Evaluation Rubrics')).toBeInTheDocument();
    });

    // Check if the rubric details section is rendered
    expect(screen.getByText('Rubric Details')).toBeInTheDocument();
    expect(screen.getByText('Review and edit specific rubric criteria')).toBeInTheDocument();
  });

  it('displays complete rubric criteria', async () => {
    render(
      <TestWrapper>
        <RubricsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Evaluation Rubrics')).toBeInTheDocument();
    });

    // Check the complete rubric criteria section
    expect(screen.getByText('Complete Rubric Criteria')).toBeInTheDocument();
  });
});