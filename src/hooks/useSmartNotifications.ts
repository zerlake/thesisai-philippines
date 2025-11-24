'use client';

/**
 * Smart notifications hook
 * Manages intelligent notification delivery and user preferences
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  smartNotificationManager,
  SmartNotification,
} from '@/lib/personalization';

interface UseSmartNotificationsReturn {
  notifications: SmartNotification[];
  unreadCount: number;
  isLoading: boolean;
  createNotification: (
    notification: Omit<SmartNotification, 'id' | 'scheduledFor' | 'sentAt' | 'read' | 'mlScore'>,
    options?: { immediate?: boolean }
  ) => Promise<SmartNotification>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useSmartNotifications(): UseSmartNotificationsReturn {
  const { user, isLoaded } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load unread notifications
  useEffect(() => {
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const unread = await smartNotificationManager.getUnreadNotifications(user.id);
        setNotifications(unread);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [user, isLoaded]);

  const createNotification = useCallback(
    async (
      notification: Omit<SmartNotification, 'id' | 'scheduledFor' | 'sentAt' | 'read' | 'mlScore'>,
      options?: { immediate?: boolean }
    ) => {
      if (!user) throw new Error('User not authenticated');

      const newNotification = await smartNotificationManager.createNotification(
        user.id,
        notification,
        options
      );

      // Add to local state if it's for the current user
      if (newNotification.userId === user.id && !newNotification.read) {
        setNotifications(prev => [newNotification, ...prev]);
      }

      return newNotification;
    },
    [user]
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await smartNotificationManager.markAsRead(notificationId);
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        throw error;
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      for (const notif of notifications.filter(n => !n.read)) {
        await smartNotificationManager.markAsRead(notif.id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    isLoading,
    createNotification,
    markAsRead,
    markAllAsRead,
  };
}
