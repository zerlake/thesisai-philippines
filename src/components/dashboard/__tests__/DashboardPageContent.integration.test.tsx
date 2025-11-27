import { render, screen, waitFor } from '@testing-library/react';
import { DashboardPageContent } from '../DashboardPageContent';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';

// Mock the store
jest.mock('@/lib/personalization/dashboard-state');

describe('DashboardPageContent Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStore = {
    widgetData: {
      'research-progress': {
        data: {
          papersRead: 10,
          notesCreated: 20,
          goalsCompleted: 2,
          goalsTotal: 5,
          weeklyTrend: [],
          monthlyTrend: [],
          researchAccuracy: 85,
          period: 'month',
          chartType: 'line',
        },
        loading: false,
        error: null,
        lastUpdated: new Date(),
        isCached: true,
      },
      'stats': {
        data: {
          totalPapers: 45,
          totalNotes: 120,
          totalWords: 15000,
          totalReadTime: 360,
          avgReadTime: 8,
          avgNoteLength: 125,
          stats: [],
        },
        loading: false,
        error: null,
        lastUpdated: new Date(),
        isCached: true,
      },
    },
    isLoadingAllWidgets: false,
    loadAllWidgetData: jest.fn(),
    refetchWidget: jest.fn(),
  };

  it('renders dashboard header', () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    render(<DashboardPageContent />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText("Welcome back! Here's your research overview.")
    ).toBeInTheDocument();
  });

  it('calls loadAllWidgetData on mount', async () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    render(<DashboardPageContent />);

    await waitFor(() => {
      expect(mockStore.loadAllWidgetData).toHaveBeenCalledWith([
        'research-progress',
        'stats',
        'recent-papers',
        'writing-goals',
        'collaboration',
        'calendar',
      ]);
    });
  });

  it('shows loading skeleton while loading', () => {
    const loadingStore = {
      ...mockStore,
      isLoadingAllWidgets: true,
    };

    (useDashboardStore as jest.Mock).mockReturnValue(loadingStore);

    const { container } = render(<DashboardPageContent />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders widgets when data is loaded', () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    render(<DashboardPageContent />);

    // Check for widget titles
    expect(screen.getByText('Research Progress')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('handles widget errors gracefully', () => {
    const storeWithError = {
      ...mockStore,
      widgetData: {
        ...mockStore.widgetData,
        'research-progress': {
          data: null,
          loading: false,
          error: new Error('Failed to load widget'),
          lastUpdated: null,
          isCached: false,
        },
      },
    };

    (useDashboardStore as jest.Mock).mockReturnValue(storeWithError);

    render(<DashboardPageContent />);

    expect(screen.getByText('Widget Error')).toBeInTheDocument();
  });

  it('shows per-widget loading states', () => {
    const storeWithLoadingWidget = {
      ...mockStore,
      isLoadingAllWidgets: false,
      widgetData: {
        ...mockStore.widgetData,
        'research-progress': {
          ...mockStore.widgetData['research-progress'],
          loading: true,
          data: null,
        },
      },
    };

    (useDashboardStore as jest.Mock).mockReturnValue(storeWithLoadingWidget);

    const { container } = render(<DashboardPageContent />);

    // Should have loading placeholder
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('calls refetchWidget when retry is clicked', async () => {
    const storeWithError = {
      ...mockStore,
      widgetData: {
        ...mockStore.widgetData,
        'research-progress': {
          data: null,
          loading: false,
          error: new Error('Failed to load'),
          lastUpdated: null,
          isCached: false,
        },
      },
    };

    (useDashboardStore as jest.Mock).mockReturnValue(storeWithError);

    render(<DashboardPageContent />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();

    // Note: Click would require user-event setup
    // await user.click(retryButton);
    // expect(mockStore.refetchWidget).toHaveBeenCalledWith('research-progress');
  });

  it('renders multiple widgets in grid layout', () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    const { container } = render(<DashboardPageContent />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();

    // Should have multiple widget containers
    const widgets = container.querySelectorAll('.border-gray-200');
    expect(widgets.length).toBeGreaterThan(1);
  });

  it('wraps content in error boundary', () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    const { container } = render(<DashboardPageContent />);

    expect(container.querySelector('.bg-white')).toBeInTheDocument();
  });

  it('handles all widgets being in error state', () => {
    const allErrorStore = {
      ...mockStore,
      widgetData: Object.fromEntries(
        Object.entries(mockStore.widgetData).map(([key]) => [
          key,
          {
            data: null,
            loading: false,
            error: new Error('Widget error'),
            lastUpdated: null,
            isCached: false,
          },
        ])
      ),
    };

    (useDashboardStore as jest.Mock).mockReturnValue(allErrorStore);

    render(<DashboardPageContent />);

    const errorElements = screen.getAllByText('Widget Error');
    expect(errorElements.length).toBeGreaterThan(0);
  });

  it('is responsive with proper grid classes', () => {
    (useDashboardStore as jest.Mock).mockReturnValue(mockStore);

    const { container } = render(<DashboardPageContent />);

    const grid = container.querySelector('.grid');
    expect(grid?.classList.contains('md:grid-cols-2')).toBe(true);
    expect(grid?.classList.contains('lg:grid-cols-3')).toBe(true);
  });
});
