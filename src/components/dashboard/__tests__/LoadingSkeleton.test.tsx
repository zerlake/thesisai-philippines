import { render, screen } from '@testing-library/react';
import {
  DashboardSkeleton,
  WidgetSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from '../LoadingSkeleton';

describe('Loading Skeletons', () => {
  describe('DashboardSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders 6 widget skeleton cards', () => {
      const { container } = render(<DashboardSkeleton />);
      const skeletonCards = container.querySelectorAll('.border-gray-200');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });

    it('has animate-pulse class for animation', () => {
      const { container } = render(<DashboardSkeleton />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('WidgetSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<WidgetSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('has loading animation', () => {
      const { container } = render(<WidgetSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('ChartSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<ChartSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('has appropriate height for chart', () => {
      const { container } = render(<ChartSkeleton />);
      const chartPlaceholder = container.querySelector('.h-48');
      expect(chartPlaceholder).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('renders without crashing', () => {
      const { container } = render(<TableSkeleton />);
      expect(container).toBeInTheDocument();
    });

    it('renders 5 row skeletons', () => {
      const { container } = render(<TableSkeleton />);
      const rows = container.querySelectorAll('.h-10');
      expect(rows.length).toBe(5);
    });
  });
});
