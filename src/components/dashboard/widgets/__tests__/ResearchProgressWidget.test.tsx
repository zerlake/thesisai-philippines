import { render, screen } from '@testing-library/react';
import { ResearchProgressWidget } from '../ResearchProgressWidget';
import type { z } from 'zod';
import type { ResearchProgressSchema } from '@/lib/dashboard/widget-schemas';

type ResearchProgressData = z.infer<typeof ResearchProgressSchema>;

describe('ResearchProgressWidget', () => {
  const mockData: ResearchProgressData = {
    papersRead: 15,
    notesCreated: 32,
    goalsCompleted: 3,
    goalsTotal: 5,
    weeklyTrend: [
      { date: '2025-11-24', value: 10, label: 'Mon' },
      { date: '2025-11-25', value: 12, label: 'Tue' },
    ],
    monthlyTrend: [
      { date: '2025-10-01', value: 20 },
      { date: '2025-11-01', value: 25 },
    ],
    researchAccuracy: 85,
    period: 'month',
    chartType: 'line',
  };

  it('renders null when data is undefined', () => {
    const { container } = render(<ResearchProgressWidget data={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders widget title', () => {
    render(<ResearchProgressWidget data={mockData} />);
    expect(screen.getByText('Research Progress')).toBeInTheDocument();
  });

  it('displays papers read stat', () => {
    render(<ResearchProgressWidget data={mockData} />);
    expect(screen.getByText('Papers Read')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays notes created stat', () => {
    render(<ResearchProgressWidget data={mockData} />);
    expect(screen.getByText('Notes Created')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('displays goals completed stat', () => {
    render(<ResearchProgressWidget data={mockData} />);
    expect(screen.getByText('Goals Completed')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('displays research accuracy percentage', () => {
    render(<ResearchProgressWidget data={mockData} />);
    expect(screen.getByText('Research Accuracy')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders progress bar for accuracy', () => {
    const { container } = render(<ResearchProgressWidget data={mockData} />);
    const progressBar = container.querySelector('[style*="width: 85%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders with different accuracy values', () => {
    const dataWith50Accuracy = {
      ...mockData,
      researchAccuracy: 50,
    };

    const { container } = render(
      <ResearchProgressWidget data={dataWith50Accuracy} />
    );

    expect(screen.getByText('50%')).toBeInTheDocument();
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('handles zero values properly', () => {
    const zeroData: ResearchProgressData = {
      ...mockData,
      papersRead: 0,
      notesCreated: 0,
      goalsCompleted: 0,
      goalsTotal: 0,
      researchAccuracy: 0,
    };

    render(<ResearchProgressWidget data={zeroData} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles large values properly', () => {
    const largeData: ResearchProgressData = {
      ...mockData,
      papersRead: 1000,
      notesCreated: 5000,
    };

    render(<ResearchProgressWidget data={largeData} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  it('has proper styling and layout', () => {
    const { container } = render(<ResearchProgressWidget data={mockData} />);
    
    expect(container.querySelector('.bg-white')).toBeInTheDocument();
    expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('renders three stat cards in grid', () => {
    const { container } = render(<ResearchProgressWidget data={mockData} />);
    const statCards = container.querySelectorAll('.bg-gray-50');
    expect(statCards.length).toBe(3);
  });

  it('has TrendingUp icon', () => {
    const { container } = render(<ResearchProgressWidget data={mockData} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
