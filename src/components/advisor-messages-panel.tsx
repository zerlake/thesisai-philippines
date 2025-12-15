'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Send } from 'lucide-react';

interface Message {
  id: string;
  document_id: string;
  sender_id: string;
  sender_role: 'student' | 'advisor' | 'critic';
  recipient_id: string;
  message: string;
  subject: string;
  created_at: string;
  is_read: boolean;
}

export function AdvisorMessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!user?.id) return;

    const fetchMessages = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/messages/get?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch messages');

        const { data } = await response.json();
        setMessages(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    // Fetch immediately
    fetchMessages();

    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || !user?.id) {
      setError('Please select a message and enter a reply');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Sending message:', {
        documentId: selectedMessage.document_id,
        senderId: user.id,
        senderRole: 'advisor',
        recipientId: selectedMessage.sender_id,
        message: replyText,
      });

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedMessage.document_id,
          senderId: user.id,
          senderRole: 'advisor',
          recipientId: selectedMessage.sender_id,
          message: replyText,
          subject: `Re: ${selectedMessage.subject}`,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message');
      }

      setSuccess('Message sent successfully!');
      setReplyText('');
      
      // Refetch messages to show the new reply
      const getResponse = await fetch(
        `/api/messages/get?userId=${user.id}`
      );
      if (getResponse.ok) {
        const { data } = await getResponse.json();
        setMessages(data || []);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending reply:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Message List */}
      <div className="flex-1 border-r border-gray-200 overflow-y-auto">
        <div className="divide-y">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="w-12 h-12 mb-2 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                  selectedMessage?.id === msg.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-semibold text-sm mb-1">{msg.subject}</div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {msg.message}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Detail & Reply */}
      {selectedMessage ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">
                {selectedMessage.subject}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                From: {selectedMessage.sender_role} ({selectedMessage.sender_id})
              </p>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p>{selectedMessage.message}</p>
              </div>
              {user?.id && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <p>Your ID: {user.id}</p>
                  <p>Recipient (to send to): {selectedMessage.sender_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reply Box */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {error && (
              <div className="mb-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-2 p-2 bg-green-50 text-green-700 text-sm rounded">
                {success}
              </div>
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              disabled={sending}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 resize-none disabled:opacity-50 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#111827' }}
              rows={3}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a message to reply
        </div>
      )}
    </div>
  );
}
