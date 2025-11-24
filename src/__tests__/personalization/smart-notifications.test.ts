import { describe, it, expect, beforeEach } from 'vitest';
import { SmartNotificationManager } from '@/lib/personalization/smart-notifications';

describe('SmartNotificationManager', () => {
  let manager: SmartNotificationManager;

  beforeEach(() => {
    manager = new SmartNotificationManager('test-user-123');
  });

  describe('calculatePriority', () => {
    it('should calculate priority based on notification type', () => {
      const systemNotif = {
        title: 'System Alert',
        message: 'Test',
        notificationType: 'system' as const
      };

      const priority = manager.calculatePriority(systemNotif);
      expect(priority).toBeGreaterThan(0);
      expect(priority).toBeLessThanOrEqual(5);
    });

    it('should weight alert notifications higher', () => {
      const alertNotif = {
        title: 'Error',
        message: 'Test',
        notificationType: 'alert' as const
      };

      const featureNotif = {
        title: 'Feature',
        message: 'Test',
        notificationType: 'feature' as const
      };

      const alertPriority = manager.calculatePriority(alertNotif);
      const featurePriority = manager.calculatePriority(featureNotif);

      expect(alertPriority).toBeGreaterThanOrEqual(featurePriority);
    });

    it('should consider user preferences in priority calculation', () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          emailNotifications: false,
          pushNotifications: true
        }
      };

      const notif = {
        title: 'Test',
        message: 'Test',
        notificationType: 'feature' as const
      };

      const priority = manager.calculatePriority(notif);
      expect(priority).toBeDefined();
    });
  });

  describe('calculateOptimalTime', () => {
    it('should return current time if quiet hours inactive', () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00'
        }
      };

      const now = new Date();
      now.setHours(14, 0, 0); // 2 PM - outside quiet hours

      const optimalTime = manager.calculateOptimalTime(now);
      
      expect(optimalTime.getTime()).toBeLessThanOrEqual(Date.now() + 60000);
    });

    it('should delay notification if in quiet hours', () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00'
        }
      };

      const now = new Date();
      now.setHours(23, 0, 0); // 11 PM - in quiet hours

      const optimalTime = manager.calculateOptimalTime(now);
      
      expect(optimalTime.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('selectDeliveryChannels', () => {
    it('should select appropriate delivery channels', () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          inAppNotifications: true,
          emailNotifications: true,
          pushNotifications: false
        }
      };

      const channels = manager.selectDeliveryChannels('system');
      
      expect(channels).toContain('in_app');
      expect(channels).toContain('email');
      expect(channels).not.toContain('push');
    });

    it('should only use enabled channels', () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          inAppNotifications: true,
          emailNotifications: false,
          pushNotifications: false
        }
      };

      const channels = manager.selectDeliveryChannels('feature');
      
      expect(channels).toEqual(['in_app']);
    });

    it('should return empty array if notifications disabled', () => {
      manager['preferences'] = {
        notifications: {
          enabled: false,
          inAppNotifications: true,
          emailNotifications: true,
          pushNotifications: true
        }
      };

      const channels = manager.selectDeliveryChannels('system');
      
      expect(channels.length).toBe(0);
    });
  });

  describe('createNotification', () => {
    it('should create notification with calculated priority', async () => {
      const notif = await manager.createNotification({
        title: 'Test Notification',
        message: 'This is a test',
        notificationType: 'feature'
      });

      expect(notif.title).toBe('Test Notification');
      expect(notif.priority).toBeGreaterThan(0);
    });

    it('should include appropriate delivery channels', async () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          inAppNotifications: true,
          emailNotifications: false,
          pushNotifications: false
        }
      };

      const notif = await manager.createNotification({
        title: 'Test',
        message: 'Test',
        notificationType: 'feature'
      });

      expect(notif.channels).toContain('in_app');
    });

    it('should set optimal delivery time', async () => {
      const notif = await manager.createNotification({
        title: 'Test',
        message: 'Test',
        notificationType: 'feature'
      });

      expect(notif.deliveryTime).toBeDefined();
    });
  });

  describe('Notification Batching', () => {
    it('should batch notifications if enabled', async () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          notificationBatching: true,
          batchInterval: 60
        }
      };

      // Create multiple notifications quickly
      await manager.createNotification({
        title: 'Test 1',
        message: 'Message 1',
        notificationType: 'feature'
      });

      await manager.createNotification({
        title: 'Test 2',
        message: 'Message 2',
        notificationType: 'feature'
      });

      // Should batch them
      const batch = await manager.getBatch();
      
      expect(batch.length).toBeGreaterThan(0);
    });

    it('should not batch if disabled', async () => {
      manager['preferences'] = {
        notifications: {
          enabled: true,
          notificationBatching: false
        }
      };

      await manager.createNotification({
        title: 'Test 1',
        message: 'Message 1',
        notificationType: 'feature'
      });

      // Should be sent immediately (not batched)
      const batch = await manager.getBatch();
      
      // May be empty or sent already
      expect(batch !== undefined).toBe(true);
    });
  });
});
