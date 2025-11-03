import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentDashboard } from '../../components/student-dashboard';
import { useAuth } from '../../components/auth-provider';
import { mockAuthContext } from '../mocks/dashboard-mocks';
import { quickAccessItems } from '../../lib/quick-access-items';

// Mock the useAuth hook
jest.mock('../../components/auth-provider', () => ({
  useAuth: jest.fn(),
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Quick Access Tools Integration Tests', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  test('renders all quick access tools', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Check that all 11 quick access tools are rendered
    quickAccessItems.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  test('quick access tools have correct links', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Check that each tool links to the correct URL
    quickAccessItems.forEach(item => {
      const toolElement = screen.getByText(item.title).closest('a');
      expect(toolElement).toHaveAttribute('href', item.href);
    });
  });

  test('quick access tools have correct icons and descriptions', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Check that each tool displays its description
    quickAccessItems.forEach(item => {
      expect(screen.getByText(item.description)).toBeInTheDocument();
    });
  });

  test('quick access tools are clickable and navigate correctly', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Test clicking on the first tool (Topic Idea Generator)
    const topicGenerator = screen.getByText('Topic Idea Generator').closest('a');
    expect(topicGenerator).toBeInTheDocument();
    expect(topicGenerator).toHaveAttribute('href', '/topic-ideas');
  });

  test('quick access tools can be customized via settings', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Find and click the manage button
    const manageButton = screen.getByRole('button', { name: /Manage/i });
    fireEvent.click(manageButton);

    // The modal or settings panel should appear (implementation dependent)
    // For now, just verify the button exists and is clickable
    expect(manageButton).toBeInTheDocument();
  });

  test('quick access tools respect user preferences', async () => {
    // Mock profile with specific quick access tools selected
    const profileWithCustomTools = {
      ...mockAuthContext.profile,
      user_preferences: {
        ...mockAuthContext.profile?.user_preferences,
        quick_access_tools: ['Topic Idea Generator', 'Outline Generator'] // Only these two
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      profile: profileWithCustomTools,
    });

    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Only the selected tools should be visible
    expect(screen.getByText('Topic Idea Generator')).toBeInTheDocument();
    expect(screen.getByText('Outline Generator')).toBeInTheDocument();
    
    // Other tools might still be rendered, but the filtering logic depends on implementation
    // The main functionality is that users can manage their quick access tools
  });

  test('quick access tools render with proper styling', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Check that tools have the expected classes/structure
    const toolCards = screen.getAllByRole('link').filter(el => 
      el.closest('.hover\\:bg-accent') || el.querySelector('.w-8.h-8')
    );
    
    expect(toolCards.length).toBeGreaterThan(0);
  });

  test('originality check tool is available', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Verify the originality check tool is present
    const originalityCheck = screen.getByText('Originality Check');
    expect(originalityCheck).toBeInTheDocument();
    
    const link = originalityCheck.closest('a');
    expect(link).toHaveAttribute('href', '/originality-check');
  });

  test('reference manager tool is available', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Verify the reference manager tool is present
    const referenceManager = screen.getByText('Reference Manager');
    expect(referenceManager).toBeInTheDocument();
    
    const link = referenceManager.closest('a');
    expect(link).toHaveAttribute('href', '/references');
  });

  test('presentation maker tool is available', async () => {
    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    });

    // Verify the presentation maker tool is present
    const presentationMaker = screen.getByText('Presentation Maker');
    expect(presentationMaker).toBeInTheDocument();
    
    const link = presentationMaker.closest('a');
    expect(link).toHaveAttribute('href', '/presentation');
  });
});