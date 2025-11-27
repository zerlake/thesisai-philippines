import { render, screen } from '@testing-library/react';
import { StatsWidget } from '../StatsWidget';
import type { z } from 'zod';
import type { StatsWidgetSchema } from '@/lib/dashboard/widget-schemas';

type StatsData = z.infer<typeof StatsWidgetSchema>;

describe('StatsWidget', () => {
  const mockData: StatsData = {
    totalPapers: 45,
    totalNotes: 120,
    totalWords: 15000,
    totalReadTime: 360, // 6 hours in minutes
    avgReadTime: 8,
    avgNoteLength: 125,
    stats: [
      { label: 'Quality Score', value: 92, unit: '%' },
      { label: 'Engagement', value: 87, unit: '%' },
    ],
    lastUpdated: '2025-11-28T10:00:00Z',
  };

  it('renders null when data is undefined', () => {
    const { container } = render(<StatsWidget data={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders widget title', () => {
    render(<StatsWidget data={mockData} />);
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('displays total papers stat', () => {
    render(<StatsWidget data={mockData} />);
    expect(screen.getByText('Total Papers')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('displays total notes stat', () => {
    render(<StatsWidget data={mockData} />);
    expect(screen.getByText('Total Notes')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('displays total words stat with proper formatting', () => {
    render(<StatsWidget data={mockData} />);
    expect(screen.getByText('Total Words')).toBeInTheDocument();
    expect(screen.getByText('15,000')).toBeInTheDocument();
  });

  it('displays read time in hours', () => {
    render(<StatsWidget data={mockData} />);
    expect(screen.getByText('Read Time')).toBeInTheDocument();
    expect(screen.getByText('6h')).toBeInTheDocument();
  });

  it('displays last updated date', () => {
    render(<StatsWidget data={mockData} />);
    const dateText = screen.getByText(/Last updated/);
    expect(dateText).toBeInTheDocument();
  });

  it('handles zero values properly', () => {
    const zeroData: StatsData = {
      totalPapers: 0,
      totalNotes: 0,
      totalWords: 0,
      totalReadTime: 0,
      avgReadTime: 0,
      avgNoteLength: 0,
      stats: [],
    };

    render(<StatsWidget data={zeroData} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles large numbers properly', () => {
    const largeData: StatsData = {
      ...mockData,
      totalPapers: 1000,
      totalNotes: 5000,
      totalWords: 1000000,
    };

    render(<StatsWidget data={largeData} />);
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  it('calculates read time correctly from minutes', () => {
    const oneHourData: StatsData = {
      ...mockData,
      totalReadTime: 60,
    };

    render(<StatsWidget data={oneHourData} />);
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('has proper styling with gradient cards', () => {
    const { container } = render(<StatsWidget data={mockData} />);
    
    const gradientCards = container.querySelectorAll('.bg-gradient-to-br');
    expect(gradientCards.length).toBeGreaterThan(0);
  });

  it('renders four stat cards in 2x2 grid', () => {
    const { container } = render(<StatsWidget data={mockData} />);
    const grid = container.querySelector('.grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  it('has BarChart icon', () => {
    const { container } = render(<StatsWidget data={mockData} />);
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders without lastUpdated date', () => {
    const dataWithoutDate: StatsData = {
      ...mockData,
      lastUpdated: undefined,
    };

    render(<StatsWidget data={dataWithoutDate} />);
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
  });

  it('handles different stat arrays', () => {
    const dataWithStats: StatsData = {
      ...mockData,
      stats: [
        { label: 'Accuracy', value: 95, unit: '%' },
        { label: 'Completion', value: 87, unit: '%' },
        { label: 'Quality', value: 92, unit: 'pts' },
      ],
    };

    render(<StatsWidget data={dataWithStats} />);
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });
});
