/**
 * Notification Bell Component
 * Fixed to handle the actual database schema
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type Notification = {
  id: string;
  message: string;
  title?: string;
  created_at: string;
  read_at?: string | null;
  is_read?: boolean;
  link?: string | null;
  notification_type?: string;
};

type ChatMessage = {
  id: string;
  content: string;
  subject: string;
  timestamp: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  read: boolean;
  documentId?: string | null;
};

export function NotificationBell() {
  const { session, supabase } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesTableUsed, setMessagesTableUsed] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const messagesTableUsedRef = useRef<string>('');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    messagesTableUsedRef.current = messagesTableUsed;
  }, [messagesTableUsed]);

  useEffect(() => {
    const notificationUnreadCount = notifications.filter(n => !n.is_read).length;
    const messageUnreadCount = chatMessages.length;
    setUnreadCount(notificationUnreadCount + messageUnreadCount);
  }, [notifications, chatMessages]);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    let notificationChannel: any = null;
    let messageChannel: any = null;

    const fetchNotifications = async () => {
      if (!isMounted.current) return;

      try {
        setLoading(true);

        // Fetch notifications - try with all possible columns
        let notificationsData: any[] = [];

        try {
          // First try with the extended schema
          const result = await supabase
            .from("notifications")
            .select("id, message, title, created_at, read_at, notification_type, data")
            .eq('user_id', session.user.id)
            .order("created_at", { ascending: false })
            .limit(5);

          if (result.data && result.data.length > 0) {
            notificationsData = result.data;
          } else if (!result.error) {
            // Table exists but might have different columns
            const simpleResult = await supabase
              .from("notifications")
              .select("id, message, created_at")
              .eq('user_id', session.user.id)
              .order("created_at", { ascending: false })
              .limit(5);

            if (simpleResult.data) {
              notificationsData = simpleResult.data.map(n => ({
                ...n,
                title: null,
                read_at: null,
                notification_type: null,
                data: null
              }));
            }
          }
        } catch (notifError: any) {
          console.warn("Notifications table error:", notifError.message);
          notificationsData = [];
        }

        // Fetch unread messages
        let messagesData: any[] = [];

        try {
          // Try advisor_student_messages first
          const advisorResult = await supabase
            .from("advisor_student_messages")
            .select(`
              id,
              sender_id,
              recipient_id,
              message,
              subject,
              created_at,
              is_read,
              sender_role,
              document_id
            `)
            .eq('recipient_id', session.user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(5);

          if (advisorResult.data && advisorResult.data.length > 0) {
            // Fetch sender information for each message
            const messagesWithSender = [];
            for (const message of advisorResult.data) {
              const { data: senderData } = await supabase
                .from('profiles')
                .select('first_name, last_name, role')
                .eq('id', message.sender_id)
                .single();

              messagesWithSender.push({
                ...message,
                sender: senderData
              });
            }

            messagesData = messagesWithSender;
            setMessagesTableUsed('advisor_student_messages');
          } else if (advisorResult.error?.code !== '42P01') {
            // Try messages table if advisor_student_messages doesn't exist
            try {
              const messagesResult = await supabase
                .from("messages")
                .select(`
                  id,
                  sender_id,
                  recipient_id,
                  content,
                  subject,
                  created_at,
                  is_read
                `)
                .eq('recipient_id', session.user.id)
                .eq('is_read', false)
                .order('created_at', { ascending: false })
                .limit(5);

              if (messagesResult.data) {
                // Fetch sender information for each message
                const messagesWithSender = [];
                for (const message of messagesResult.data) {
                  const { data: senderData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, role')
                    .eq('id', message.sender_id)
                    .single();

                  messagesWithSender.push({
                    ...message,
                    sender: senderData,
                    sender_role: senderData?.role || 'user',
                    document_id: null
                  });
                }

                messagesData = messagesWithSender;
                setMessagesTableUsed('messages');
              }
            } catch (e) {
              setMessagesTableUsed('');
            }
          }
        } catch (msgError: any) {
          console.warn("Messages table error:", msgError.message);
          messagesData = [];
          setMessagesTableUsed('');
        }

        if (!isMounted.current) return;

        // Transform notifications
        const transformedNotifications = (notificationsData || []).map((n: any) => ({
          id: n.id,
          message: n.message || n.title || 'No message',
          title: n.title,
          created_at: n.created_at,
          read_at: n.read_at,
          is_read: n.read_at !== null,
          notification_type: n.notification_type,
          link: n.data?.link || null
        }));

        // Transform messages
        const transformedMessages = (messagesData || []).map((m: any) => ({
          id: m.id,
          content: m.message || m.content || 'No content',
          subject: m.subject || 'No subject',
          timestamp: m.created_at,
          sender: {
            id: m.sender_id,
            first_name: m.sender?.first_name || m.sender_role || 'User',
            last_name: m.sender?.last_name || '',
            role: m.sender?.role || m.sender_role || 'user'
          },
          read: m.is_read ?? false,
          documentId: m.document_id || null
        }));

        setNotifications(transformedNotifications);
        setChatMessages(transformedMessages);
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        if (isMounted.current) {
          setNotifications([]);
          setChatMessages([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    const setupRealtime = async () => {
      if (!session?.access_token || !session?.user?.id) return;

      try {
        await fetchNotifications();

        // Setup notifications channel
        notificationChannel = supabase
          .channel(`notifications:${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload: any) => {
              if (!isMounted.current) return;

              const newNotification = {
                ...payload.new,
                is_read: payload.new.read_at !== null,
                message: payload.new.message || payload.new.title || 'New notification'
              };

              setNotifications(prev => {
                const exists = prev.some(n => n.id === newNotification.id);
                if (exists) return prev;
                return [newNotification, ...prev.slice(0, 4)];
              });

              toast.info(newNotification.message);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload: any) => {
              if (!isMounted.current) return;

              // Remove notification if it's now marked as read
              if (payload.new.read_at !== null) {
                setNotifications(prev => prev.filter(n => n.id !== payload.new.id));
              }
            }
          )
          .subscribe();

        // Setup messages channel
        if (messagesTableUsedRef.current === 'advisor_student_messages') {
          messageChannel = supabase
            .channel(`advisor_student_messages:${session.user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'advisor_student_messages',
                filter: `recipient_id=eq.${session.user.id}`
              },
              async (payload: any) => {
                if (!isMounted.current) return;

                // Fetch sender information for the new message
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, role')
                  .eq('id', payload.new.sender_id)
                  .single();

                const newMessage = {
                  id: payload.new.id,
                  content: payload.new.message || 'No content',
                  subject: payload.new.subject || 'No subject',
                  timestamp: payload.new.created_at,
                  sender: {
                    id: payload.new.sender_id,
                    first_name: senderData?.first_name || payload.new.sender_role || 'User',
                    last_name: senderData?.last_name || '',
                    role: senderData?.role || payload.new.sender_role || 'user'
                  },
                  read: payload.new.is_read ?? false,
                  documentId: payload.new.document_id || null
                };

                setChatMessages(prev => {
                  const exists = prev.some(m => m.id === newMessage.id);
                  if (exists) return prev;
                  return [newMessage, ...prev.slice(0, 4)];
                });

                toast.info(`New message from ${newMessage.sender.first_name}`);
              }
            )
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'advisor_student_messages',
                filter: `recipient_id=eq.${session.user.id}`
              },
              (payload: any) => {
                if (!isMounted.current) return;

                // Remove message from list if it's now marked as read
                if (payload.new.is_read === true) {
                  setChatMessages(prev => prev.filter(m => m.id !== payload.new.id));
                }
              }
            )
            .subscribe();
        } else if (messagesTableUsedRef.current === 'messages') {
          messageChannel = supabase
            .channel(`messages:${session.user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${session.user.id}`
              },
              async (payload: any) => {
                if (!isMounted.current) return;

                // Fetch sender information for the new message
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('first_name, last_name, role')
                  .eq('id', payload.new.sender_id)
                  .single();

                const newMessage = {
                  id: payload.new.id,
                  content: payload.new.content || 'No content',
                  subject: payload.new.subject || 'No subject',
                  timestamp: payload.new.created_at,
                  sender: {
                    id: payload.new.sender_id,
                    first_name: senderData?.first_name || 'User',
                    last_name: senderData?.last_name || '',
                    role: senderData?.role || 'user'
                  },
                  read: payload.new.is_read ?? false,
                  documentId: null
                };

                setChatMessages(prev => {
                  const exists = prev.some(m => m.id === newMessage.id);
                  if (exists) return prev;
                  return [newMessage, ...prev.slice(0, 4)];
                });

                toast.info(`New message from ${newMessage.sender.first_name}`);
              }
            )
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${session.user.id}`
              },
              (payload: any) => {
                if (!isMounted.current) return;

                // Remove message from list if it's now marked as read
                if (payload.new.is_read === true) {
                  setChatMessages(prev => prev.filter(m => m.id !== payload.new.id));
                }
              }
            )
            .subscribe();
        }
      } catch (error: any) {
        if (error?.message?.includes("Refresh Token") || error?.message?.includes("Invalid")) {
          return;
        }
        console.error("Error setting up realtime:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted.current = false;
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
      if (messageChannel) {
        supabase.removeChannel(messageChannel);
      }
    };
  }, [session?.user?.id, session?.access_token, supabase]);

  const handleMarkAllAsRead = async () => {
    if (!session) return;

    // Mark notifications as read
    const unreadNotificationIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadNotificationIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadNotificationIds);

      setNotifications(prev => prev.map(n => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString()
      })));
    }

    // Mark messages as read
    if (chatMessages.length > 0) {
      const messageIds = chatMessages.map(m => m.id);

      if (messagesTableUsedRef.current === 'advisor_student_messages') {
        await supabase
          .from("advisor_student_messages")
          .update({ is_read: true })
          .in("id", messageIds);
      } else if (messagesTableUsedRef.current === 'messages') {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", messageIds);
      }

      setChatMessages([]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications & Messages</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              {chatMessages.length > 0 && (
                <div className="px-4 py-2 border-b border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground">New Messages</h4>
                </div>
              )}

              {chatMessages.map((message) => (
                <Link
                  key={message.id}
                  href={`/chat#${message.id}`}
                  className="block px-4 py-3 hover:bg-accent border-b last:border-b-0"
                >
                  <div className="font-medium">
                    {message.sender?.first_name || message.sender?.role || 'User'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{message.content || 'No content'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </div>
                </Link>
              ))}

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-b">
                  <h4 className="text-sm font-semibold text-muted-foreground">Notifications</h4>
                </div>
              )}

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`block px-4 py-3 hover:bg-accent border-b last:border-b-0 ${
                    !notification.is_read ? "bg-accent/50" : ""
                  }`}
                >
                  {notification.title && (
                    <div className="font-medium text-sm">{notification.title}</div>
                  )}
                  <div className="text-sm">{notification.message || 'No message content'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && chatMessages.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No new notifications or messages
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
