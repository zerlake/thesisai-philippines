"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

type Notification = {
  id: string;
  message: string;
  link: string | null;
  created_at: string;
  is_read: boolean;
};

export function NotificationBell() {
  const { session, supabase } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let channel: any = null;

    const fetchNotifications = async () => {
      try {
         setIsLoading(true);

        // Using the enhanced error handling approach
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!isMounted) return;

        if (error) {
          console.error("Failed to fetch notifications:", error);
          // Only show toast for non-network errors (avoid spam during connection issues)
          if (error.message && !error.message.includes("Failed to fetch")) {
            toast.error("Failed to fetch notifications.");
          }
          setNotifications([]);
          setUnreadCount(0);
        } else {
          setNotifications(data || []);
          setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching notifications:", err);
          // Check if it's a network error
          if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
            // Don't show error toast for network issues, just set empty notifications
            setNotifications([]);
            setUnreadCount(0);
          } else {
            toast.error("Failed to fetch notifications.");
            setNotifications([]);
            setUnreadCount(0);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const setupRealtime = async () => {
      try {
        await fetchNotifications();

        // Only setup Realtime if we have a valid session with access token and Supabase is configured
        if (!session?.access_token || !session?.user?.id || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          return;
        }

        // Verify the token is still valid before subscribing
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return;
        }

        channel = supabase
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
              if (!isMounted) return;
              const newNotification = payload.new as Notification;
              setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
              setUnreadCount(prev => prev + 1);
              toast.info(newNotification.message);
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;

            if (status === 'CHANNEL_ERROR') {
              console.warn('Channel error for notifications');
             } else if (status === 'TIMED_OUT') {
              console.warn('Channel timed out for notifications');
             } else if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notifications');
             }
          });
      } catch (err: any) {
        if (!isMounted) return;

        // Silently handle authentication errors
        if (err?.message?.includes("Refresh Token") || err?.message?.includes("Invalid") || err?.message?.includes("JWT")) {
          return;
        }

        // Check if it's a network error and handle appropriately
        if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
          console.warn("Network error in notification setup:", err);
          // Don't crash the component, just continue without realtime
          return;
        }

        // Log other errors but don't crash
        console.error("Error in notification setup:", err);
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel).catch((err) => {
          console.warn("Error removing channel:", err);
        });
      }
    };
  }, [session?.user?.id, session?.user, session?.access_token, supabase]);

  const handleMarkAllAsRead = async () => {
    if (!session || unreadCount === 0) return;

    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (error) {
      toast.error("Failed to mark notifications as read.");
    } else {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return (
    <Popover onOpenChange={(open) => { if (open) handleMarkAllAsRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
        </div>
        <div className="grid gap-1 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <Link key={n.id} href={n.link || "#"} passHref>
                <div className={`px-4 py-3 hover:bg-accent ${!n.is_read ? 'bg-accent/50' : ''}`}>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isMounted && formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">You have no notifications.</p>
          )}
        </div>
        {unreadCount > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}