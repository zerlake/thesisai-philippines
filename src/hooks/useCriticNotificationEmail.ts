import { useState } from 'react';
import { toast } from 'sonner';
import { SendCriticToStudentNotificationEmailProps } from '@/lib/resend-notification';

export function useCriticNotificationEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCriticEmail = async (params: SendCriticToStudentNotificationEmailProps) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send-critic-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_INTERNAL_API_KEY || '',
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
    sendCriticEmail,
    isLoading,
    error,
  };
}
