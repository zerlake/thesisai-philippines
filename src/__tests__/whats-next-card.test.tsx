import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WhatsNextCard } from '@/components/whats-next-card';
import { CheckSquare, MessageSquare, Target, AlertCircle } from 'lucide-react';

describe('WhatsNextCard Component', () => {
  describe('Rendering', () => {
    it('should render null when nextAction is null', () => {
      const { container } = render(
        <WhatsNextCard nextAction={null} isLoading={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render skeleton when loading', () => {
      const { container } = render(
        <WhatsNextCard nextAction={null} isLoading={true} />
      );
      expect(container.querySelector('.skeleton')).toBeTruthy();
    });

    it('should render action card with title and detail', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue: Chapter 2 - Literature Review',
        detail: 'You were 45% done. Pick up where you left off.',
        urgency: 'normal' as const,
        href: '/thesis-phases/chapter_2',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.getByText("What's Next?")).toBeTruthy();
      expect(screen.getByText('Continue: Chapter 2 - Literature Review')).toBeTruthy();
      expect(screen.getByText('You were 45% done. Pick up where you left off.')).toBeTruthy();
    });
  });

  describe('Urgency Styling', () => {
    it('should apply normal urgency styling (blue)', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Test',
        detail: 'Detail',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const card = container.querySelector('[class*="bg-blue"]');
      expect(card).toBeTruthy();
    });

    it('should apply high urgency styling (amber)', () => {
      const action = {
        type: 'feedback' as const,
        title: 'Revise Chapter 1',
        detail: 'Your advisor has requested revisions.',
        urgency: 'high' as const,
        href: '#',
        icon: MessageSquare,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const card = container.querySelector('[class*="bg-amber"]');
      expect(card).toBeTruthy();
    });

    it('should apply critical urgency styling (red)', () => {
      const action = {
        type: 'milestone' as const,
        title: 'Overdue: Defense Presentation',
        detail: 'Due 3 days ago.',
        urgency: 'critical' as const,
        href: '#',
        icon: Target,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const card = container.querySelector('[class*="bg-red"]');
      expect(card).toBeTruthy();
    });
  });

  describe('URGENT Badge', () => {
    it('should show URGENT badge for critical urgency', () => {
      const action = {
        type: 'milestone' as const,
        title: 'Overdue Task',
        detail: 'Due yesterday',
        urgency: 'critical' as const,
        href: '#',
        icon: Target,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.getByText('URGENT')).toBeTruthy();
    });

    it('should not show URGENT badge for non-critical urgency', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue Chapter',
        detail: 'Pick it up',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.queryByText('URGENT')).toBeNull();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar for chapter work with completion_percentage', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue: Chapter 2',
        detail: 'You were 45% done.',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
        chapter: 'chapter_2',
        completion_percentage: 45,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.getByText('Progress')).toBeTruthy();
      expect(screen.getByText('45%')).toBeTruthy();
    });

    it('should not render progress bar when completion_percentage is undefined', () => {
      const action = {
        type: 'feedback' as const,
        title: 'Revise Chapter',
        detail: 'Feedback',
        urgency: 'high' as const,
        href: '#',
        icon: MessageSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.queryByText('Progress')).toBeNull();
    });

    it('should render progress bar with 0%', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Start: Chapter 3',
        detail: 'New chapter',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
        chapter: 'chapter_3',
        completion_percentage: 0,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('should render progress bar with 100%', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Complete: Chapter 1',
        detail: 'Almost done',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
        chapter: 'chapter_1',
        completion_percentage: 100,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      expect(screen.getByText('100%')).toBeTruthy();
    });
  });

  describe('Progress Bar Styling', () => {
    it('should use blue progress bar for normal urgency', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue',
        detail: 'Detail',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
        chapter: 'chapter_2',
        completion_percentage: 50,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const progressFill = container.querySelector('[class*="bg-blue-500"]');
      expect(progressFill).toBeTruthy();
    });

    it('should use amber progress bar for high urgency', () => {
      const action = {
        type: 'feedback' as const,
        title: 'Revise',
        detail: 'Detail',
        urgency: 'high' as const,
        href: '#',
        icon: MessageSquare,
        chapter: 'chapter_2',
        completion_percentage: 50,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const progressFill = container.querySelector('[class*="bg-amber-500"]');
      expect(progressFill).toBeTruthy();
    });

    it('should use red progress bar for critical urgency', () => {
      const action = {
        type: 'milestone' as const,
        title: 'Overdue',
        detail: 'Detail',
        urgency: 'critical' as const,
        href: '#',
        icon: Target,
        chapter: 'chapter_2',
        completion_percentage: 50,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const progressFill = container.querySelector('[class*="bg-red-500"]');
      expect(progressFill).toBeTruthy();
    });
  });

  describe('Button', () => {
    it('should render Start Now button', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue Chapter',
        detail: 'Pick it up',
        urgency: 'normal' as const,
        href: '/thesis-phases/chapter_2',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);

      const button = screen.getByText('Start Now');
      expect(button).toBeTruthy();
    });

    it('should have correct href in button link', () => {
      const href = '/thesis-phases/chapter_2_literature_review';
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue',
        detail: 'Detail',
        urgency: 'normal' as const,
        href,
        icon: CheckSquare,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe(href);
    });
  });

  describe('Icons', () => {
    it('should render icon from action', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue',
        detail: 'Detail',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      // Icon should be rendered (lucide-react renders as SVG)
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should show alert icon with URGENT badge', () => {
      const action = {
        type: 'milestone' as const,
        title: 'Overdue',
        detail: 'Detail',
        urgency: 'critical' as const,
        href: '#',
        icon: Target,
      };

      const { container } = render(
        <WhatsNextCard nextAction={action} isLoading={false} />
      );

      // Should have at least 2 SVG icons (title icon + alert icon)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Data Types', () => {
    it('should handle chapter_continuation type', () => {
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Continue: Chapter 2',
        detail: 'You were 45% done.',
        urgency: 'normal' as const,
        href: '/thesis-phases/chapter_2',
        icon: CheckSquare,
        chapter: 'chapter_2',
        completion_percentage: 45,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText('Continue: Chapter 2')).toBeTruthy();
    });

    it('should handle feedback type', () => {
      const action = {
        type: 'feedback' as const,
        title: 'Revise "Chapter 1: Introduction"',
        detail: 'Your advisor has requested revisions.',
        urgency: 'high' as const,
        href: '/drafts/doc-123',
        icon: MessageSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText('Revise "Chapter 1: Introduction"')).toBeTruthy();
    });

    it('should handle milestone type', () => {
      const action = {
        type: 'milestone' as const,
        title: 'Overdue: Defense Presentation',
        detail: 'Due 3 days ago.',
        urgency: 'critical' as const,
        href: '/thesis-phases/chapters',
        icon: Target,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText('Overdue: Defense Presentation')).toBeTruthy();
    });

    it('should handle task type', () => {
      const action = {
        type: 'task' as const,
        title: 'Prepare for Submission',
        detail: 'Run a final check and prepare your defense presentation.',
        urgency: 'normal' as const,
        href: '/originality-check',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText('Prepare for Submission')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      const action = {
        type: 'chapter_continuation' as const,
        title: longTitle,
        detail: 'Detail',
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should handle very long detail text', () => {
      const longDetail = 'This is a very long detail text. '.repeat(10);
      const action = {
        type: 'chapter_continuation' as const,
        title: 'Title',
        detail: longDetail,
        urgency: 'normal' as const,
        href: '#',
        icon: CheckSquare,
      };

      render(<WhatsNextCard nextAction={action} isLoading={false} />);
      expect(screen.getByText(longDetail)).toBeTruthy();
    });

    it('should handle completion_percentage boundaries', () => {
      [0, 1, 50, 99, 100].forEach(percentage => {
        const action = {
          type: 'chapter_continuation' as const,
          title: 'Continue',
          detail: 'Detail',
          urgency: 'normal' as const,
          href: '#',
          icon: CheckSquare,
          chapter: 'chapter_2',
          completion_percentage: percentage,
        };

        const { unmount } = render(
          <WhatsNextCard nextAction={action} isLoading={false} />
        );

        expect(screen.getByText(`${percentage}%`)).toBeTruthy();
        unmount();
      });
    });
  });
});
