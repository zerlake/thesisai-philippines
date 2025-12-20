import { useState } from 'react';
import { toast } from 'sonner';

interface SendEmailParams {
  to: string;
  advisorName?: string;
  studentName?: string;
  actionType?: 'submission' | 'revision' | 'request' | 'milestone';
  documentTitle?: string;
  message?: string;
  actionUrl?: string;
  actionButtonText?: string;
}

export function useNotificationEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (params: SendEmailParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
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
    sendEmail,
    isLoading,
    error,
  };
}
