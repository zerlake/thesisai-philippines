'use client';

import { useState, useEffect, useMemo } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'advisor' | 'critic' | 'student';
  message: string;
  created_at: string;
}

interface ConversationPanelProps {
  documentId: string;
  recipientId?: string;
  onMessageSent?: () => void;
}

export function ConversationPanel({
  documentId,
  recipientId,
  onMessageSent,
}: ConversationPanelProps) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const userId = useMemo(() => session?.user?.id || '', [session?.user?.id]);

  // Fetch messages from database
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      // Check if documentId is a demo document (non-UUID format)
      const isDemoDocument = documentId && 
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId);
      
      if (isDemoDocument) {
        // Skip API calls for demo documents
        setIsLoading(false);
        return;
      }

      try {
        // If documentId is provided, fetch messages for that document
        // Otherwise, fetch all messages for the user with the recipientId
        const query = documentId
          ? `/api/messages/get?documentId=${documentId}&userId=${userId}`
          : `/api/messages/get?userId=${userId}${recipientId ? `&recipientId=${recipientId}` : ''}`;

        const response = await fetch(query);
        const data = await response.json();
        
        // API returns { data: [...] } structure
        setMessages(data.data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, documentId, recipientId]);

  // Real-time subscription to messages
  useEffect(() => {
    if (!userId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${userId}:${recipientId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'advisor_student_messages',
          filter: `sender_id=eq.${recipientId || ''}or recipient_id=eq.${userId}`,
        },
        (payload: any) => {
          // Add new message to the list in real-time
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, recipientId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!session?.user) {
      setSendStatus({
        type: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    // Check for demo mode (no recipientId) for non-admin users
    if (!recipientId && !isDeveloperMode) {
      setSendStatus({
        type: 'error',
        message: 'Messaging not available in demo mode. This feature requires real documents with actual users.',
      });
      return;
    }

    // For users in demo mode, we'll use a special demo recipient ID to allow testing
    // The backend API now handles 'demo-student-1' properly
    const actualRecipientId = recipientId || (isDeveloperMode ? 'demo-student-1' : undefined);

    if (!actualRecipientId) {
      setSendStatus({
        type: 'error',
        message: 'No recipient available to send message to.',
      });
      return;
    }

    setIsSending(true);
    setSendStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          senderId: session.user.id,
          senderRole: profile?.role || 'student',
          recipientId: actualRecipientId,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const { data } = await response.json();
      setMessages([...messages, data[0]]);
      setNewMessage('');
      setSendStatus({
        type: 'success',
        message: 'Message sent successfully!',
      });
      onMessageSent?.();

      // Clear status message after 3 seconds
      setTimeout(() => {
        setSendStatus({ type: null, message: '' });
      }, 3000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setSendStatus({
        type: 'error',
        message: error.message || 'Failed to send message',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Determine if this is a demo document (no valid recipient)
  const isDemoMode = !recipientId;

  // Check if user has admin/developer privileges to bypass demo limitations
  // Allow advisor, critic, and admin roles to have extended access
  const isAdmin = profile?.role === 'admin';
  const isAdvisor = profile?.role === 'advisor';
  const isCritic = profile?.role === 'critic';
  const isDeveloperMode = isAdmin || isAdvisor || isCritic; // Extend to advisor/critic roles as well

  return (
    <div className="flex flex-col border-l border-gray-200 dark:border-gray-800 w-[350px] max-h-[calc(100vh-150px)] relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="font-semibold text-lg">Conversation</h2>
        <p className="text-sm text-muted-foreground">
          {isDemoMode
            ? 'Demo mode - messaging requires real documents'
            : documentId
              ? 'Discussion about this document'
              : 'Direct conversation'}
        </p>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && !isDeveloperMode && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Demo Mode:</strong> This messaging feature requires real users to function.
            To test fully, use a real document with an actual student.
          </p>
        </div>
      )}
      {isDemoMode && isDeveloperMode && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Developer Mode:</strong> You have admin privileges to test this feature with demo data.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground pt-10">
            {isDemoMode && !isDeveloperMode
              ? 'Messages will appear here when using real documents with actual users.'
              : isDemoMode && isDeveloperMode
                ? 'Demo mode - you can test functionality with admin privileges.'
                : 'No messages yet. Start the conversation!'}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.sender_id === session?.user?.id ? 'justify-end' : ''
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg text-sm ${
                  msg.sender_id === session?.user?.id
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-semibold text-xs mb-1">{msg.sender_name}</p>
                <p className="break-words">{msg.message}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Modal */}
      {sendStatus.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className={`bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4 shadow-lg border ${
              sendStatus.type === 'success'
                ? 'border-green-200 dark:border-green-800'
                : 'border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {sendStatus.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {sendStatus.type === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sendStatus.message}
                </p>
              </div>
              <button
                onClick={() => setSendStatus({ type: null, message: '' })}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="space-y-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isDemoMode && !isDeveloperMode
              ? "Messaging not available in demo mode"
              : "Type your message here..."}
            className={`w-full p-2 border rounded-md min-h-[80px] text-sm resize-none ${isDemoMode && !isDeveloperMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}`}
            disabled={isSending || (isDemoMode && !isDeveloperMode)}
            style={{ color: '#111827' }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim() || (isDemoMode && !isDeveloperMode)}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {isDemoMode && !isDeveloperMode ? 'Messaging Unavailable' : 'Send Message'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
