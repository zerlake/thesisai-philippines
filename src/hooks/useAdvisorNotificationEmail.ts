import { useState } from 'react';
import { toast } from 'sonner';
import { SendAdvisorToStudentNotificationEmailProps } from '@/lib/resend-notification';

export function useAdvisorNotificationEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendAdvisorEmail = async (params: SendAdvisorToStudentNotificationEmailProps) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send-advisor-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      const data = await response.json();
      toast.success('Email sent successfully');
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendAdvisorEmail,
    isLoading,
    error,
  };
}
