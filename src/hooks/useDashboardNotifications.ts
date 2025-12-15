import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface DashboardNotificationConfig {
  enabled: boolean;
  emailOnSubmission: boolean;
  emailOnFeedback: boolean;
  emailOnMilestone: boolean;
  emailOnGroupActivity: boolean;
}

export interface DashboardNotificationEvent {
  type: 'submission' | 'feedback' | 'revision' | 'milestone' | 'group-activity';
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: 'student' | 'advisor' | 'critic';
  documentTitle?: string;
  groupName?: string;
  message: string;
  actionUrl: string;
}

export function useDashboardNotifications() {
  const [isSending, setIsSending] = useState(false);

  const sendDashboardNotification = useCallback(
    async (event: DashboardNotificationEvent, config: DashboardNotificationConfig) => {
      // Check if notifications are enabled
      if (!config.enabled) {
        return { success: false, message: 'Notifications disabled' };
      }

      // Check specific notification type settings
      const shouldSend = {
        submission: config.emailOnSubmission,
        feedback: config.emailOnFeedback,
        revision: config.emailOnFeedback,
        milestone: config.emailOnMilestone,
        'group-activity': config.emailOnGroupActivity,
      }[event.type];

      if (!shouldSend) {
        return { success: false, message: `${event.type} notifications disabled` };
      }

      setIsSending(true);
      try {
        const response = await fetch('/api/notifications/dashboard-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send notification');
        }

        const result = await response.json();
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send notification';
        console.error('Dashboard notification error:', error);
        return { success: false, message };
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  return {
    sendDashboardNotification,
    isSending,
  };
}
