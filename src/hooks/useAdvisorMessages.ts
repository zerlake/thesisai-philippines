import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Message {
  id: string;
  document_id: string;
  sender_id: string;
  sender_role: 'student' | 'advisor' | 'critic';
  recipient_id: string;
  message: string;
  subject?: string;
  is_read: boolean;
  created_at: string;
}

export function useAdvisorMessages(documentId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('advisor_student_messages')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setMessages(data || []);

        // Mark received messages as read
        if (data && data.length > 0) {
          const unreadIds = data
            .filter((m) => !m.is_read && m.recipient_id === userId)
            .map((m) => m.id);

          if (unreadIds.length > 0) {
            await supabase
              .from('advisor_student_messages')
              .update({ is_read: true })
              .in('id', unreadIds);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (documentId && userId) {
      fetchMessages();
    }
  }, [documentId, userId]);

  const sendMessage = async (
    message: string,
    senderRole: 'student' | 'advisor' | 'critic',
    recipientId: string,
    subject?: string
  ) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          senderId: userId,
          senderRole,
          recipientId,
          message,
          subject,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const { data } = await response.json();
      setMessages([...messages, data[0]]);
      return { success: true, data: data[0] };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return { messages, loading, error, sendMessage };
}
