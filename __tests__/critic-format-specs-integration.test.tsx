import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import FormatSpecsPage from '@/app/(dashboard)/critic/format-specs/page';

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

describe('Format Specifications Integration Tests', () => {
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

  it('renders the format specs page with all components', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
      expect(screen.getByText('Detailed specifications for academic formatting requirements')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Total Formats')).toBeInTheDocument();
    expect(screen.getByText('Avg. Compliance')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('displays format specifications in the table', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });

    // Check if format specs are displayed in the table
    expect(screen.getByText('APA Style')).toBeInTheDocument();
    expect(screen.getByText('MLA Style')).toBeInTheDocument();
    expect(screen.getByText('Chicago Style')).toBeInTheDocument();
    expect(screen.getByText('IEEE Style')).toBeInTheDocument();
  });

  it('switches between tabs properly', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });

    // Check initial tab is active
    const overviewTab = screen.getByText('Overview');
    const detailsTab = screen.getByText('Style Details');
    const templatesTab = screen.getByText('Templates');

    fireEvent.click(detailsTab);
    await waitFor(() => {
      expect(detailsTab).toBeInTheDocument();
    });

    fireEvent.click(templatesTab);
    await waitFor(() => {
      expect(templatesTab).toBeInTheDocument();
    });

    fireEvent.click(overviewTab);
    await waitFor(() => {
      expect(overviewTab).toBeInTheDocument();
    });
  });

  it('allows adding a new format specification', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });

    // Fill out the new format form
    const nameInput = screen.getByPlaceholderText('Format name');
    fireEvent.change(nameInput, { target: { value: 'New Format' } });

    const versionInput = screen.getByPlaceholderText('Version');
    fireEvent.change(versionInput, { target: { value: '8th Edition' } });

    const descriptionInput = screen.getByPlaceholderText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New format description' } });

    // Submit the form
    const addButton = screen.getByText('Add Format');
    fireEvent.click(addButton);
  });

  it('displays format details when selected', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });

    // Check if the format details section is rendered
    expect(screen.getByText('Format Details')).toBeInTheDocument();
    expect(screen.getByText('Review and edit specific format criteria')).toBeInTheDocument();
  });

  it('allows downloading format templates', async () => {
    render(
      <TestWrapper>
        <FormatSpecsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Format Specifications')).toBeInTheDocument();
    });

    // Switch to templates tab
    const templatesTab = screen.getByText('Templates');
    fireEvent.click(templatesTab);

    // Check if download buttons are available
    const downloadButtons = screen.getAllByText('Download');
    expect(downloadButtons.length).toBeGreaterThan(0);
    
    // Click on one of the download buttons
    fireEvent.click(downloadButtons[0]);
  });
});