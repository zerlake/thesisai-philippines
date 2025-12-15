/**
 * Smart Notifications System
 * ML-based priority calculation, optimal timing, and delivery channel selection
 */

import { SmartNotification, NotificationPreferences } from './types';
import { supabase } from '@/integrations/supabase/client';
import { userPreferencesManager } from './user-preferences';

const NOTIFICATIONS_TABLE = 'notifications';

class SmartNotificationManager {
  private notificationQueue: Map<string, SmartNotification[]> = new Map();
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

      const smartNotification: SmartNotification = {
        ...notification,
        id: `notif_${userId}_${Date.now()}`,
        userId,
        scheduledFor,
        read: false,
        mlScore,
      };

      // Save to database
      const { data, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .insert(smartNotification)
        .select()
        .single();

      if (error) throw error;

      const notif = data as SmartNotification;

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
    const channel = preferences.notifications.channels.find((c: any) => c.id === notification.data.channelId);
    if (channel) {
      score *= channel.priority === 'urgent' ? 1.2 : channel.priority === 'high' ? 1.1 : 0.9;
    }

    // Factor 3: Time sensitivity
    if (notification.data.timeSensitive) {
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
    if (preferences.notifications.quietHours.enabled) {
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
    if (!preferences.notifications.enabled) return false;

    // Check if channel is enabled and set to instant
    const instantChannels = preferences.notifications.channels.filter(
      (c: any) => c.enabled && c.frequency === 'instant'
    );

    return instantChannels.length > 0;
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
        case 'sms':
          await this._deliverSMS(notification);
          break;
      }
    }

    // Mark as sent
    await supabase
      .from(NOTIFICATIONS_TABLE)
      .update({ sentAt: new Date() })
      .eq('id', notification.id);
  }

  /**
   * Select optimal delivery channels
   */
  private _selectChannels(
    notification: SmartNotification,
    preferences: any
  ): Array<'in-app' | 'email' | 'push' | 'sms'> {
    const channels: Array<'in-app' | 'email' | 'push' | 'sms'> = [];

    // In-app is always included for immediate notifications
    channels.push('in-app');

    // Add other channels based on preferences and priority
    if (preferences.notifications.emailNotifications && notification.priority !== 'low') {
      channels.push('email');
    }

    if (preferences.notifications.pushNotifications && notification.priority === 'high' || notification.priority === 'urgent') {
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
   * Deliver SMS notification (stub for future implementation)
   */
  private async _deliverSMS(notification: SmartNotification): Promise<void> {
    console.log('SMS delivery not yet implemented');
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
        .eq('userId', userId)
        .eq('read', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return (data || []) as SmartNotification[];
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
        .update({ read: true })
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
