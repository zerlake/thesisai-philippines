/**
 * Chat Notification Bell Component
 * Phase 5: Real-time Communication & Collaboration
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  MessageCircle, 
  MessageCircleMore, 
  User, 
  Users,
  Mail,
  Bot
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

type ChatNotification = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
  read_status: boolean;
  conversation_id: string;
};

export function ChatNotificationBell() {
  const { session, profile } = useAuth();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!session?.user.id) return;

      setLoading(true);

      let notificationsData: any[] = [];
      try {
        // Fetch unread messages where user is recipient
        const { data, error } = await supabase
          .from('advisor_student_messages')
          .select(`
            id,
            sender_id,
            message,
            created_at,
            read_status,
            sender:sender_id(first_name, last_name, role)
          `)
          .eq('recipient_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          // If the main table doesn't exist, try a generic messages table
          if (error.code === '42P01' || error.message.toLowerCase().includes('does not exist')) {
            const { data: altData, error: altError } = await supabase
              .from('messages')
              .select(`
                id,
                sender_id,
                message,
                created_at,
                read_status
              `)
              .eq('recipient_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(10);

            if (altError) {
              console.warn('Chat notifications table not available, continuing without notifications:', altError);
              notificationsData = [];
            } else {
              notificationsData = altData || [];
            }
          } else {
            throw error; // Re-throw other errors
          }
        } else {
          notificationsData = data || [];
        }
      } catch (error: any) {
        console.error('Error loading chat notifications:', error);
        notificationsData = []; // Continue with empty notifications
      }

      if (notificationsData && notificationsData.length > 0) {
        const chatNotifications: ChatNotification[] = notificationsData.map(item => ({
          id: item.id,
          sender_id: item.sender_id,
          message: item.message,
          created_at: item.created_at,
          read_status: item.read_status,
          conversation_id: `${session.user.id}-${item.sender_id}`, // Basic conversation ID
          sender_name: item.sender ? `${item.sender.first_name} ${item.sender.last_name}` : `User ${item.sender_id.substring(0, 4)}`,
          sender_role: item.sender?.role || 'user'
        }));

        setNotifications(chatNotifications);
        setUnreadCount(chatNotifications.filter(n => !n.read_status).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }

      setLoading(false);
    };

    loadNotifications();

    // Set up real-time notifications (only if table exists)
    let channel: any = null;
    try {
      channel = supabase
        .channel('chat-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'advisor_student_messages',
            filter: `recipient_id=eq.${session?.user.id}`
          },
          (payload: { new: any }) => {
            const newNotification: ChatNotification = {
              id: payload.new.id,
              sender_id: payload.new.sender_id,
              message: payload.new.message,
              created_at: payload.new.created_at,
              read_status: payload.new.read_status,
              conversation_id: `${session?.user.id}-${payload.new.sender_id}`,
              sender_name: payload.new.sender_name || `User ${payload.new.sender_id.substring(0, 4)}`,
              sender_role: payload.new.sender_role || 'user'
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only recent 10
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();
    } catch (error) {
      console.warn('Real-time notifications subscription failed, continuing without real-time updates:', error);
      // Continue without real-time notifications if subscription fails
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session?.user.id]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('advisor_student_messages')
      .update({ read_status: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    // Update local state
    setNotifications(prev =>
      prev.map(n => 
        n.id === notificationId ? { ...n, read_status: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'advisor':
        return <User className="w-4 h-4" />;
      case 'critic':
        return <User className="w-4 h-4" />;
      case 'admin':
        return <Users className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getNotificationIcon = () => {
    if (unreadCount > 0) {
      return <MessageCircleMore className="h-5 w-5" />;
    }
    return <MessageCircle className="h-5 w-5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {getNotificationIcon()}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Chat Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-8 w-8 mb-2" />
              <p>No new messages</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-md transition-colors ${
                      !notification.read_status ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getRoleIcon(notification.sender_role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.sender_name}
                            <span className="ml-2 text-xs text-muted-foreground capitalize">
                              ({notification.sender_role})
                            </span>
                          </p>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Mark read
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}