'use client';

import { useState, useEffect } from 'react';
import { Mail, Inbox, AlertCircle, CheckCircle, Clock, Trash2, ArrowRight, Send } from 'lucide-react';
import { useAuth } from './auth-provider';

interface EmailNotification {
  id: string;
  from: string;
  fromRole: 'advisor' | 'critic';
  subject: string;
  message: string;
  type: 'feedback' | 'suggestion' | 'alert' | 'status';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  fromUserId?: string;
}

interface ConversationMessage {
  id: string;
  sender_id: string;
  sender_role: 'student' | 'advisor' | 'critic';
  message: string;
  created_at: string;
}

// Helper function to convert section IDs to readable names and find them in editor
const getSectionName = (sectionId: string): string => {
  const sectionMap: Record<string, string> = {
    'introduction': 'Introduction',
    'literature-review': 'Literature Review',
    'key-findings': 'Key Findings',
    'methodology': 'Methodology',
    'conclusion': 'Conclusion',
    'background': 'Background',
  };
  return sectionMap[sectionId] || sectionId.replace(/-/g, ' ');
};

// Helper function to check if a section is currently in viewport
const isSectionInViewport = (sectionId: string): boolean => {
  const sectionName = getSectionName(sectionId);
  
  // Get the editor content area
  const editorContent = document.querySelector('[class*="prose"]');
  if (!editorContent) return false;

  // Search through the editor content for heading or section text
  const headings = Array.from(editorContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  
  for (const heading of headings) {
    const text = heading.textContent || '';
    // Check if this heading matches our section name
    if (text.toLowerCase().includes(sectionName.toLowerCase())) {
      const rect = (heading as HTMLElement).getBoundingClientRect();
      // Check if element is within viewport (with some buffer)
      return rect.top >= -100 && rect.top <= window.innerHeight;
    }
  }
  
  return false;
};

// Helper function to find and scroll to section text
const jumpToSection = (sectionId: string, onHighlight?: (element: HTMLElement) => void) => {
  const sectionName = getSectionName(sectionId);
  
  // Get the editor content area
  const editorContent = document.querySelector('[class*="prose"]');
  if (!editorContent) return false;

  // Search through the editor content for heading or section text
  const headings = Array.from(editorContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
  let foundElement: HTMLElement | null = null;

  for (const heading of headings) {
    const text = heading.textContent || '';
    // Check if this heading matches our section name
    if (text.toLowerCase().includes(sectionName.toLowerCase())) {
      foundElement = heading as HTMLElement;
      break;
    }
  }

  if (foundElement) {
    // Scroll to the element
    foundElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add highlight effect
    foundElement.classList.add('editor-section-highlight');
    onHighlight?.(foundElement);
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      foundElement?.classList.remove('editor-section-highlight');
    }, 3000);
    
    return true;
  } else {
    // Fallback: scroll the editor content area
    editorContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return false;
  }
};

interface EditorEmailNotificationsSidebarProps {
  documentId?: string;
}

export function EditorEmailNotificationsSidebar({ documentId }: EditorEmailNotificationsSidebarProps = {}) {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const [sectionInViewport, setSectionInViewport] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { session } = useAuth();
  const currentUserId = session?.user?.id || '';

  // Load real notifications from database
  useEffect(() => {
    if (!currentUserId) return; // Wait for user to load

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/messages/get?userId=${currentUserId}`);

        // Parse response regardless of status - API returns data even on errors
        const result = await response.json();
        const data = result?.data || [];

        // Convert database messages to EmailNotification format
        const emailNotifications: EmailNotification[] = data.map((msg: any) => ({
          id: msg.id,
          from: msg.sender_role === 'advisor' ? 'Advisor' : msg.sender_role === 'critic' ? 'Critic' : 'User',
          fromRole: msg.sender_role,
          fromUserId: msg.sender_id,
          subject: msg.subject || 'New Message',
          message: msg.message,
          type: msg.sender_role === 'advisor' ? 'feedback' : 'suggestion',
          timestamp: new Date(msg.created_at),
          read: msg.is_read || false,
          actionUrl: documentId ? `#document-${documentId}` : '#',
        }));

        setNotifications(emailNotifications);
      } catch (error) {
        // Silently handle errors - notifications are not critical
        console.warn('Could not fetch notifications:', error);
        setNotifications([]);
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Poll every 5 seconds for new messages
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, documentId]);

  // Also update the main notification bell's unread count when new messages arrive
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;

    // Update the global notification count if we have the context
    // In a real implementation, you would update a global state context here
    if (typeof window !== 'undefined') {
      // Store the count in a global variable that can be accessed by the notification bell
      (window as any).emailNotificationCount = unreadCount;
    }
  }, [notifications]);

  // Check if selected notification's section is in viewport
  useEffect(() => {
    if (selectedNotification?.actionUrl) {
      const sectionId = selectedNotification.actionUrl.replace('#', '');
      setSectionInViewport(isSectionInViewport(sectionId));
      
      // Recheck on scroll
      const handleScroll = () => {
        setSectionInViewport(isSectionInViewport(sectionId));
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [selectedNotification]);

  // Load and poll conversation messages when notification is selected
  useEffect(() => {
    if (!selectedNotification || !documentId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/messages/get?documentId=${documentId}&userId=${currentUserId}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch messages:', response.status, errorData);
          throw new Error(`Failed to fetch messages: ${errorData.error || response.statusText}`);
        }

        const { data } = await response.json();
        const messages = data || [];

        // Convert to ConversationMessage format
        const formattedMessages: ConversationMessage[] = messages.map(
          (msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            sender_role: msg.sender_role,
            message: msg.message,
            created_at: msg.created_at,
          })
        );

        setConversationMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Fallback to initial notification message
        const mockMessages: ConversationMessage[] = [
          {
            id: selectedNotification.id,
            sender_id: selectedNotification.fromUserId || '',
            sender_role: selectedNotification.fromRole,
            message: selectedNotification.message,
            created_at: selectedNotification.timestamp.toISOString(),
          },
        ];
        setConversationMessages(mockMessages);
      }
    };

    // Fetch immediately
    fetchMessages();

    // Poll every 3 seconds for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedNotification, documentId, currentUserId]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedNotification) return;

    setSendingReply(true);
    setReplyStatus(null);
    try {
      // For now, use mock data if no real recipient ID
      // TODO: Ensure selectedNotification.fromUserId is always set from authenticated users
      if (!selectedNotification.fromUserId || !currentUserId) {
        throw new Error('Recipient and sender information are required');
      }

      console.log('Sending reply:', {
        documentId,
        senderId: currentUserId,
        senderRole: 'student',
        recipientId: selectedNotification.fromUserId,
        message: replyText,
        subject: `Re: ${selectedNotification.subject}`,
      });

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          senderId: currentUserId,
          senderRole: 'student',
          recipientId: selectedNotification.fromUserId,
          message: replyText,
          subject: `Re: ${selectedNotification.subject}`,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message');
      }

      const { data } = responseData;
      
      // Add to local conversation
      const newMessage: ConversationMessage = {
        id: data[0]?.id || `reply-${Date.now()}`,
        sender_id: currentUserId,
        sender_role: 'student',
        message: replyText,
        created_at: data[0]?.created_at || new Date().toISOString(),
      };
      
      setConversationMessages([...conversationMessages, newMessage]);
      setReplyText('');
      setReplyStatus({
        type: 'success',
        message: 'Your reply has been sent successfully!',
      });

      // Auto-clear success message after 5 seconds
      setTimeout(() => setReplyStatus(null), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reply';
      console.error('Failed to send reply:', error);
      setReplyStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setSendingReply(false);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const getTypeIcon = (type: EmailNotification['type']) => {
    switch (type) {
      case 'feedback':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'suggestion':
        return <Inbox className="h-4 w-4 text-purple-500" />;
      case 'status':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeColor = (type: EmailNotification['type']) => {
    switch (type) {
      case 'feedback':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'suggestion':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'status':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'alert':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Workspace</span>
        </div>
        {unreadCount > 0 && (
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-2 py-1.5 font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`text-xs px-2 py-1.5 font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filter === 'unread' ? 'No unread messages' : 'No messages yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => {
                setSelectedNotification(notification);
                handleMarkAsRead(notification.id);
              }}
              className={`w-full text-left text-xs p-2.5 rounded-md border transition-all ${
                selectedNotification?.id === notification.id
                  ? 'ring-2 ring-blue-500 ' + getTypeColor(notification.type)
                  : getTypeColor(notification.type) + (notification.read ? ' opacity-70' : '')
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {notification.subject}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 truncate">
                    {notification.from}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatTime(new Date(notification.timestamp))}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Selected Notification Details with Conversation */}
      {selectedNotification && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-3 flex flex-col h-[400px]">
          {/* Header */}
          <div className={`rounded-lg p-3 border space-y-2 ${getTypeColor(selectedNotification.type)}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedNotification.subject}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  From: {selectedNotification.from} ({selectedNotification.fromRole})
                </p>
              </div>
              <button
                onClick={() => handleDelete(selectedNotification.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {selectedNotification.actionUrl && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Target Section: <span className="font-semibold text-gray-800 dark:text-gray-200">{getSectionName(selectedNotification.actionUrl.replace('#', ''))}</span>
              </div>
            )}
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-y-auto space-y-3 px-1">
            {conversationMessages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs p-2 rounded ${
                  msg.sender_role === 'student'
                    ? 'bg-blue-100 dark:bg-blue-900/30 ml-4 text-gray-800 dark:text-gray-200'
                    : 'bg-gray-100 dark:bg-gray-700 mr-4 text-gray-700 dark:text-gray-300'
                }`}
              >
                <p className="font-medium text-xs mb-1">
                  {msg.sender_role === 'student' ? 'You' : selectedNotification.from}
                </p>
                <p className="leading-relaxed">{msg.message}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-2 space-y-2">
            {/* Status Message */}
            {replyStatus && (
              <div
                className={`p-3 rounded text-xs font-medium flex items-start gap-2 ${
                  replyStatus.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex-1">
                  {replyStatus.type === 'success' ? (
                    <>
                      <p className="font-semibold">✓ Success</p>
                      <p>{replyStatus.message}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">✕ Error</p>
                      <p>{replyStatus.message}</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              disabled={sendingReply}
              className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              rows={3}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sendingReply}
              className="w-full flex items-center justify-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors font-medium"
            >
              <Send className="h-3.5 w-3.5" />
              {sendingReply ? 'Sending...' : 'Reply'}
            </button>
          </div>

          {/* Jump to Section Button */}
          {selectedNotification.actionUrl && !sectionInViewport && (
            <button
              onClick={() => {
                const sectionId = selectedNotification.actionUrl?.replace('#', '');
                if (sectionId) {
                  jumpToSection(sectionId, () => {
                    setHighlightedSection(sectionId);
                    setTimeout(() => setHighlightedSection(null), 3000);
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-2 text-xs px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors font-medium"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Jump to Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}
