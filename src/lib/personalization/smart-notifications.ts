/**
 * Smart Notifications System
 * ML-based priority calculation, optimal timing, and delivery channel selection
 * Uses the main notifications table with field mapping
 */

import { SmartNotification } from './types';
import { supabase } from '@/integrations/supabase/client';
import { userPreferencesManager } from './user-preferences';

const NOTIFICATIONS_TABLE = 'notifications';

// Map database fields to SmartNotification type
interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: number;
  channels: string[];
  data: Record<string, unknown>;
  read_at: string | null;
  delivered_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToSmartNotification(db: DbNotification): SmartNotification {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    message: db.message,
    type: mapNotificationType(db.notification_type),
    priority: mapPriority(db.priority),
    channel: 'in-app',
    scheduledFor: new Date(db.created_at),
    sentAt: db.delivered_at ? new Date(db.delivered_at) : undefined,
    read: db.read_at !== null,
    data: db.data || {},
    mlScore: undefined,
  };
}

function mapNotificationType(type: string): 'info' | 'success' | 'warning' | 'error' | 'urgent' {
  const mapping: Record<string, 'info' | 'success' | 'warning' | 'error' | 'urgent'> = {
    system: 'info',
    feature: 'info',
    recommendation: 'info',
    alert: 'warning',
    warning: 'warning',
    error: 'error',
    urgent: 'urgent',
    success: 'success',
  };
  return mapping[type] || 'info';
}

function mapPriority(priority: number): 'low' | 'medium' | 'high' | 'urgent' {
  if (priority >= 4) return 'urgent';
  if (priority >= 3) return 'high';
  if (priority >= 2) return 'medium';
  return 'low';
}

class SmartNotificationManager {
  private notificationQueue: Map<string, NodeJS.Timeout> = new Map();
  private quietHourTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create and schedule a smart notification
   */
  async createNotification(
    userId: string,
    notification: Omit<SmartNotification, 'id' | 'scheduledFor' | 'sentAt' | 'read' | 'mlScore'>,
    options?: { immediate?: boolean }
  ): Promise<SmartNotification> {
    try {
      const preferences = await userPreferencesManager.getUserPreferences(userId);
      const mlScore = await this._calculatePriority(notification, preferences);

      // Determine optimal send time
      const scheduledFor = this._calculateOptimalTime(preferences, notification.priority);

      // Map to database schema
      const dbNotification = {
        user_id: userId,
        title: notification.title,
        message: notification.message,
        notification_type: this._mapTypeToDb(notification.type),
        priority: this._mapPriorityToDb(notification.priority),
        channels: ['in_app'],
        data: notification.data || {},
        created_at: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .insert(dbNotification)
        .select()
        .single();

      if (error) throw error;

      const notif = mapDbToSmartNotification(data as DbNotification);

      // Queue for delivery
      if (options?.immediate || this._shouldSendImmediately(notification.priority, preferences)) {
        await this._deliverNotification(notif, preferences);
      } else {
        this._scheduleNotification(notif, scheduledFor, preferences);
      }

      return notif;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  private _mapTypeToDb(type: string): string {
    const mapping: Record<string, string> = {
      info: 'system',
      success: 'system',
      warning: 'alert',
      error: 'alert',
      urgent: 'system',
    };
    return mapping[type] || 'system';
  }

  private _mapPriorityToDb(priority: string): number {
    const mapping: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    };
    return mapping[priority] || 2;
  }

  /**
   * Calculate ML-based priority score
   */
  private async _calculatePriority(
    notification: Omit<SmartNotification, 'id' | 'scheduledFor' | 'sentAt' | 'read' | 'mlScore'>,
    preferences: any
  ): Promise<number> {
    let score = 0.5; // Base score

    // Factor 1: Notification type
    const typeScores: Record<string, number> = {
      urgent: 0.9,
      error: 0.8,
      warning: 0.6,
      success: 0.4,
      info: 0.3,
    };
    score += typeScores[notification.type] || 0.3;

    // Factor 2: User preference for this channel
    const channel = preferences.notifications?.channels?.find((c: any) => c.id === notification.data?.channelId);
    if (channel) {
      score *= channel.priority === 'urgent' ? 1.2 : channel.priority === 'high' ? 1.1 : 0.9;
    }

    // Factor 3: Time sensitivity
    if (notification.data?.timeSensitive) {
      score += 0.2;
    }

    // Clamp score between 0 and 1
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate optimal send time based on user patterns and preferences
   */
  private _calculateOptimalTime(preferences: any, priority: string): Date {
    const now = new Date();
    const scheduledFor = new Date(now);

    // Check quiet hours
    if (preferences.notifications?.quietHours?.enabled) {
      const [qStart, qEnd] = [
        preferences.notifications.quietHours.start,
        preferences.notifications.quietHours.end,
      ];

      const [startHour, startMin] = qStart.split(':').map(Number);
      const [endHour, endMin] = qEnd.split(':').map(Number);

      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTime = currentHour * 60 + currentMin;
      const quietStart = startHour * 60 + startMin;
      const quietEnd = endHour * 60 + endMin;

      // If in quiet hours, schedule for end of quiet hours
      if (quietStart <= currentTime || currentTime < quietEnd) {
        scheduledFor.setHours(endHour, endMin, 0, 0);
        if (scheduledFor <= now) {
          scheduledFor.setDate(scheduledFor.getDate() + 1);
        }
      }
    }

    // Urgent notifications bypass quiet hours
    if (priority === 'urgent') {
      return now;
    }

    return scheduledFor;
  }

  /**
   * Determine if notification should be sent immediately
   */
  private _shouldSendImmediately(priority: string, preferences: any): boolean {
    if (priority === 'urgent') return true;
    if (!preferences.notifications?.enabled) return false;

    // Check if channel is enabled and set to instant
    const instantChannels = preferences.notifications.channels?.filter(
      (c: any) => c.enabled && c.frequency === 'instant'
    );

    return (instantChannels?.length || 0) > 0;
  }

  /**
   * Deliver notification through appropriate channels
   */
  private async _deliverNotification(notification: SmartNotification, preferences: any): Promise<void> {
    const channels = this._selectChannels(notification, preferences);

    for (const channel of channels) {
      switch (channel) {
        case 'in-app':
          await this._deliverInApp(notification);
          break;
        case 'email':
          await this._deliverEmail(notification);
          break;
        case 'push':
          await this._deliverPush(notification);
          break;
      }
    }

    // Mark as sent
    await supabase
      .from(NOTIFICATIONS_TABLE)
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', notification.id);
  }

  /**
   * Select optimal delivery channels
   */
  private _selectChannels(
    notification: SmartNotification,
    preferences: any
  ): Array<'in-app' | 'email' | 'push'> {
    const channels: Array<'in-app' | 'email' | 'push'> = [];

    // In-app is always included for immediate notifications
    channels.push('in-app');

    // Add other channels based on preferences and priority
    if (preferences.notifications?.emailNotifications && notification.priority !== 'low') {
      channels.push('email');
    }

    if (preferences.notifications?.pushNotifications && (notification.priority === 'high' || notification.priority === 'urgent')) {
      channels.push('push');
    }

    return channels;
  }

  /**
   * Deliver in-app notification
   */
  private async _deliverInApp(notification: SmartNotification): Promise<void> {
    // Trigger browser notification or toast
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
        });
      }
    }
  }

  /**
   * Deliver email notification
   */
  private async _deliverEmail(notification: SmartNotification): Promise<void> {
    try {
      // Call email service
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: notification.userId,
          notification,
        }),
      });

      if (!response.ok) throw new Error('Email delivery failed');
    } catch (error) {
      console.error('Error delivering email notification:', error);
    }
  }

  /**
   * Deliver push notification
   */
  private async _deliverPush(notification: SmartNotification): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: notification.id,
          data: notification.data,
        });
      }
    } catch (error) {
      console.error('Error delivering push notification:', error);
    }
  }

  /**
   * Schedule notification for future delivery
   */
  private _scheduleNotification(notification: SmartNotification, scheduledFor: Date, preferences: any): void {
    const delay = Math.max(0, scheduledFor.getTime() - Date.now());

    const timer = setTimeout(() => {
      this._deliverNotification(notification, preferences).catch(error =>
        console.error('Error delivering scheduled notification:', error)
      );
    }, delay);

    this.quietHourTimers.set(notification.id, timer);
  }

  /**
   * Get user's unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<SmartNotification[]> {
    try {
      const { data, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .is('read_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as DbNotification[]) || []).map(mapDbToSmartNotification);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from(NOTIFICATIONS_TABLE)
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Clear scheduled notification
   */
  clearScheduled(notificationId: string): void {
    const timer = this.quietHourTimers.get(notificationId);
    if (timer) {
      clearTimeout(timer);
      this.quietHourTimers.delete(notificationId);
    }
  }
}

export const smartNotificationManager = new SmartNotificationManager();
export { SmartNotificationManager };
