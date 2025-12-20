import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import PeerComparisonPage from '@/app/(dashboard)/critic/peer-comparison/page';

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
  RadarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Radar: () => <div>Radar</div>,
  PolarGrid: () => <div>PolarGrid</div>,
  PolarAngleAxis: () => <div>PolarAngleAxis</div>,
  PolarRadiusAxis: () => <div>PolarRadiusAxis</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
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

describe('Peer Comparison Integration Tests', () => {
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

  it('renders the peer comparison page with all components', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
      expect(screen.getByText('Compare your review performance against peers')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Your Rank')).toBeInTheDocument();
    expect(screen.getByText('Your Rating')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('displays reviewer performance in the table', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Check if reviewers are displayed in the table
    expect(screen.getByText('Dr. Anderson')).toBeInTheDocument();
    expect(screen.getByText('Prof. Williams')).toBeInTheDocument();
    expect(screen.getByText('Dr. Thompson')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lee')).toBeInTheDocument();
  });

  it('allows filtering by performance level', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Find and click the performance filter
    const perfSelect = screen.getByText('Filter reviewers');
    fireEvent.click(perfSelect);

    // Select a performance level
    const topOption = screen.getByText('Top 5 Reviewers');
    fireEvent.click(topOption);
  });

  it('allows searching reviewers', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Search reviewers...');
    fireEvent.change(searchInput, { target: { value: 'williams' } });
  });

  it('displays performance comparison charts', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Check the performance comparison chart
    expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
    expect(screen.getByText('Compare your metrics with other reviewers')).toBeInTheDocument();
  });

  it('displays your performance metrics', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Check the your performance section
    expect(screen.getByText('Your Performance')).toBeInTheDocument();
    expect(screen.getByText('Detailed metrics for your review performance')).toBeInTheDocument();
  });

  it('shows performance analysis', async () => {
    render(
      <TestWrapper>
        <PeerComparisonPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Peer Comparison')).toBeInTheDocument();
    });

    // Check the performance analysis section
    expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
    expect(screen.getByText('Areas for improvement and recommendations')).toBeInTheDocument();
  });
});