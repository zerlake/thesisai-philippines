import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import IssueCertificatePage from '@/app/(dashboard)/critic/issue-certificate/page';

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

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: { value?: string; onChange?: () => void; placeholder?: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
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

describe('Issue Certificate Integration Tests', () => {
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

  it('renders the issue certificate page with all components', async () => {
    render(
      <TestWrapper>
        <IssueCertificatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Issue Certificate')).toBeInTheDocument();
      expect(screen.getByText('Generate and issue certificates for reviewed manuscripts')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Certificate Issuance')).toBeInTheDocument();
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText('Thesis Title')).toBeInTheDocument();
    expect(screen.getByText('Certificate Type')).toBeInTheDocument();
  });

  it('allows filling out certificate form', async () => {
    render(
      <TestWrapper>
        <IssueCertificatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Issue Certificate')).toBeInTheDocument();
    });

    // Fill out the form
    const studentNameInput = screen.getByPlaceholderText('Enter student name');
    fireEvent.change(studentNameInput, { target: { value: 'John Doe' } });

    const thesisTitleInput = screen.getByPlaceholderText('Enter thesis title');
    fireEvent.change(thesisTitleInput, { target: { value: 'Research on AI' } });

    const reviewDateInput = screen.getByLabelText('Review Date');
    fireEvent.change(reviewDateInput, { target: { value: '2023-12-20' } });

    // Select certificate type
    const certificateTypeSelect = screen.getByText('Select certificate type');
    fireEvent.click(certificateTypeSelect);

    // Submit the form
    const issueButton = screen.getByText('Issue Certificate');
    fireEvent.click(issueButton);
  });

  it('displays certificate history in table', async () => {
    render(
      <TestWrapper>
        <IssueCertificatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Issue Certificate')).toBeInTheDocument();
    });

    // Check if the table with certificates is rendered
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('The Impact of Climate Change on Biodiversity')).toBeInTheDocument();
    expect(screen.getByText('Approval Certificate')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays recent certificates in separate table', async () => {
    render(
      <TestWrapper>
        <IssueCertificatePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Issue Certificate')).toBeInTheDocument();
    });

    // Check recent certificates table
    expect(screen.getByText('Recent Certificates')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning in Healthcare Diagnostics')).toBeInTheDocument();
  });
});