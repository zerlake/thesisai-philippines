/**
 * Notification Bell Component
 * Phase 5: Real-time Monitoring & Analytics
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

type Notification = {
  id: string;
  message: string;
  link: string | null;
  created_at: string;
  is_read: boolean;
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
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    let notificationChannel: any = null;
    let messageChannel: any = null;

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Fetch regular notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch unread messages from the existing system
        let messagesData: any[] = [];
        try {
          const { data: messageResponse, error: messageError } = await supabase
            .from("advisor_student_messages")
            .select(`
              id,
              sender_id,
              recipient_id,
              message,
              subject,
              created_at,
              read_status,
              sender_role,
              document_id
            `)
            .eq('recipient_id', session.user.id)
            .eq('read_status', false)
            .order('created_at', { ascending: false })
            .limit(5);

          if (messageError) {
            // If primary table doesn't exist, try alternatives
            if (messageError.code === '42P01' || // Undefined table
                messageError.message?.toLowerCase().includes('permission') ||
                messageError.message?.toLowerCase().includes('does not exist')) {
              console.warn("Primary messages table not available:", messageError.message);
              messagesData = [];
            } else {
              throw messageError;
            }
          } else {
            messagesData = messageResponse || [];
          }
        } catch (error: any) {
          console.warn("Messages not available:", error.message);
          messagesData = [];
        }

        if (!isMounted.current) return;

        // Handle notifications
        if (notificationsError) {
          console.error("Failed to fetch notifications:", notificationsError);
          setNotifications([]);
        } else {
          setNotifications(notificationsData || []);
        }

        // Handle messages
        const transformedMessages = messagesData.map(msg => ({
          id: msg.id,
          content: msg.message || 'Message content unavailable',
          subject: msg.subject || 'No subject',
          timestamp: msg.created_at,
          sender: {
            id: msg.sender_id,
            first_name: msg.sender_role || 'User',
            last_name: '',
            role: msg.sender_role || 'user'
          },
          read: msg.read_status ?? false,
          documentId: msg.document_id || null
        }));
        
        setChatMessages(transformedMessages);

        // Calculate total unread count (notifications + messages)
        const notificationUnreadCount = (notificationsData || []).filter(n => !n.is_read).length;
        const messageUnreadCount = transformedMessages.length;
        
        setUnreadCount(notificationUnreadCount + messageUnreadCount);
        setLastRefresh(new Date());
      } catch (error: any) {
        if (isMounted.current) {
          console.error("Error in fetchNotifications:", error);
          setNotifications([]);
          setChatMessages([]);
          setUnreadCount(0);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    const setupRealtime = async () => {
      try {
        await fetchNotifications();

        // Only setup Realtime if we have a valid session and Supabase is configured
        if (!session?.access_token || !session?.user?.id || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          return;
        }

        // Verify the token is still valid before subscribing
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return;
        }

        // Setup notifications channel
        notificationChannel = supabase
          .channel(`notifications:${session.user.id}`, {
            config: {
              broadcast: { self: false }
            }
          })
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`
            },
            (payload) => {
              if (!isMounted.current) return;
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep only 5 newest

              // Update unread count
              const messageUnreadCount = chatMessages.length;
              setUnreadCount(prev => prev + 1 + messageUnreadCount); // +1 for new notification
              toast.info(newNotification.message);
            }
          )
          .subscribe((status) => {
            if (!isMounted.current) return;

            if (status === 'CHANNEL_ERROR') {
              console.warn('Channel error for notifications');
            } else if (status === 'TIMED_OUT') {
              console.warn('Channel timed out for notifications');
            } else if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notifications');
            }
          });

        // Setup messages channel for real-time updates
        try {
          messageChannel = supabase
            .channel(`messages:${session.user.id}`, {
              config: {
                broadcast: { self: false }
              }
            })
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'advisor_student_messages',
                filter: `recipient_id=eq.${session.user.id}`
              },
              (payload) => {
                if (!isMounted.current) return;

                const newMessage = {
                  id: payload.new.id,
                  content: payload.new.message || 'Message content unavailable',
                  subject: payload.new.subject || 'No subject',
                  timestamp: payload.new.created_at,
                  sender: {
                    id: payload.new.sender_id,
                    first_name: payload.new.sender_role || 'User',
                    last_name: '',
                    role: payload.new.sender_role || 'user'
                  },
                  read: payload.new.read_status ?? false,
                  documentId: payload.new.document_id || null
                };

                setChatMessages(prev => [newMessage, ...prev.slice(0, 4)]); // Keep only 5 newest

                // Update unread count
                const notificationUnreadCount = notifications.filter(n => !n.is_read).length;
                setUnreadCount(prev => prev + 1 + notificationUnreadCount); // +1 for new message
                toast.info(`New message from ${newMessage.sender?.first_name || 'User'}`);
              }
            )
            .subscribe((status) => {
              if (!isMounted.current) return;

              if (status === 'CHANNEL_ERROR') {
                console.info('Messages table not available for real-time updates, continuing without subscription');
              } else if (status === 'TIMED_OUT') {
                console.warn('Channel timed out for messages');
              } else if (status === 'SUBSCRIBED') {
                console.info('Successfully subscribed to messages');
              }
            });
        } catch (subscriptionError) {
          console.warn("Could not set up real-time subscriptions for messages:", subscriptionError);
        }
      } catch (error: any) {
        if (!isMounted.current) return;

        // Silently handle authentication errors
        if (error?.message?.includes("Refresh Token") || error?.message?.includes("Invalid") || error?.message?.includes("JWT")) {
          return;
        }

        // Check if it's a network error and handle appropriately
        if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError")) {
          console.warn("Network error in notification setup:", error);
          return;
        }

        // Log other errors but don't crash
        console.error("Error in notification setup:", error);
      }
    };

    setupRealtime();

    return () => {
      isMounted.current = false;
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel).catch((err) => {
          console.warn("Error removing notification channel:", err);
        });
      }
      if (messageChannel) {
        supabase.removeChannel(messageChannel).catch((err) => {
          console.warn("Error removing messages channel:", err);
        });
      }
    };
  }, [session?.user?.id, session?.user, session?.access_token, supabase, notifications, chatMessages]);

  const handleMarkAllAsRead = async () => {
    if (!session || unreadCount === 0) return;

    // Mark notifications as read
    const unreadNotificationIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadNotificationIds.length > 0) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadNotificationIds);

      if (notificationError) {
        toast.error("Failed to mark notifications as read.");
      } else {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    }

    // Mark messages as read
    if (chatMessages.length > 0) {
      const messageIds = chatMessages.map(m => m.id);
      const { error: messageError } = await supabase
        .from("advisor_student_messages")
        .update({ read_status: true })
        .in("id", messageIds);

      if (messageError) {
        console.warn("Messages table might not exist, continuing without marking as read:", messageError);
        // Don't show error toast for this since it might be expected if table doesn't exist
        setChatMessages([]);
      } else {
        setChatMessages([]);
      }
    }

    setUnreadCount(0);
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
                    {message.sender?.first_name} {message.sender?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </div>
                </Link>
              ))}

              {notifications.length > 0 && chatMessages.length > 0 && (
                <div className="px-4 py-2 border-b">
                  <h4 className="text-sm font-semibold text-muted-foreground">Notifications</h4>
                </div>
              )}

              {notifications.map((notification) => {
                const hasLink = notification.link && notification.link !== "#";
                const Component = hasLink ? Link : 'div';
                const props = hasLink ? { href: notification.link } : {};

                return (
                  <Component
                    key={notification.id}
                    {...props}
                    className={`block px-4 py-3 hover:bg-accent border-b last:border-b-0 ${
                      !notification.is_read ? "bg-accent/50" : ""
                    } ${hasLink ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </div>
                  </Component>
                );
              })}

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