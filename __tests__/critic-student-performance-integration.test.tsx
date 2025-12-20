import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import StudentPerformancePage from '@/app/(dashboard)/critic/student-performance/page';

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

// Mock chart components
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div>Line</div>,
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

describe('Student Performance Integration Tests', () => {
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

  it('renders the student performance page with all components', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
      expect(screen.getByText('Track and analyze student performance metrics')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Avg. Score')).toBeInTheDocument();
    expect(screen.getByText('Improving')).toBeInTheDocument();
    expect(screen.getByText('Avg. Engagement')).toBeInTheDocument();
  });

  it('displays student performance in the table', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Check if students are displayed in the table
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Michael Chen')).toBeInTheDocument();
    expect(screen.getByText('Emma Rodriguez')).toBeInTheDocument();
  });

  it('allows filtering by status', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Find and click the status filter
    const statusSelect = screen.getByText('Filter students');
    fireEvent.click(statusSelect);

    // Select a status
    const improvingOption = screen.getByText('Improving');
    fireEvent.click(improvingOption);
  });

  it('allows searching students', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Search students...');
    fireEvent.change(searchInput, { target: { value: 'john' } });
  });

  it('displays student details when selected', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Check if the student details section is rendered
    expect(screen.getByText('Student Details')).toBeInTheDocument();
    expect(screen.getByText('Performance metrics for selected student')).toBeInTheDocument();
  });

  it('displays performance analytics', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Check the performance analytics section
    expect(screen.getByText('Performance Analytics')).toBeInTheDocument();
    expect(screen.getByText('Overview of student performance metrics')).toBeInTheDocument();
  });

  it('shows efficiency analysis', async () => {
    render(
      <TestWrapper>
        <StudentPerformancePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Performance')).toBeInTheDocument();
    });

    // Check the efficiency analysis section
    expect(screen.getByText('Efficiency Analysis')).toBeInTheDocument();
    expect(screen.getByText('Review completion rates and performance')).toBeInTheDocument();
  });
});