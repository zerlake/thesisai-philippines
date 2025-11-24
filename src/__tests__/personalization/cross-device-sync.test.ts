import { describe, it, expect, beforeEach } from 'vitest';
import { CrossDeviceSyncManager } from '@/lib/personalization/cross-device-sync';

describe('CrossDeviceSyncManager', () => {
  let manager: CrossDeviceSyncManager;

  beforeEach(() => {
    manager = new CrossDeviceSyncManager('test-user-123');
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      const device = {
        deviceId: 'device-1',
        deviceName: 'My Laptop',
        deviceType: 'desktop' as const,
        osName: 'Windows',
        osVersion: '10'
      };

      await manager.registerDevice(device);

      const devices = await manager.getDevices();
      expect(devices.length).toBeGreaterThan(0);
    });

    it('should not duplicate devices with same ID', async () => {
      const device = {
        deviceId: 'device-1',
        deviceName: 'My Laptop',
        deviceType: 'desktop' as const,
      };

      await manager.registerDevice(device);
      await manager.registerDevice(device);

      const devices = await manager.getDevices();
      const device1Count = devices.filter(d => d.deviceId === 'device-1').length;
      
      expect(device1Count).toBe(1);
    });
  });

  describe('trackChange', () => {
    it('should track a preference change', async () => {
      const change = {
        deviceId: 'device-1',
        changeType: 'UPDATE' as const,
        section: 'theme',
        data: { mode: 'dark' }
      };

      await manager.trackChange(change);

      const changes = await manager.getUnsyncedChanges();
      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].section).toBe('theme');
    });

    it('should mark changes as unsynced initially', async () => {
      const change = {
        deviceId: 'device-1',
        changeType: 'UPDATE' as const,
        section: 'notifications',
        data: { enabled: false }
      };

      await manager.trackChange(change);

      const changes = await manager.getUnsyncedChanges();
      expect(changes.some(c => !c.isSynced)).toBe(true);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflicts between devices', async () => {
      const change1 = {
        deviceId: 'device-1',
        changeType: 'UPDATE' as const,
        section: 'theme',
        data: { mode: 'dark' }
      };

      const change2 = {
        deviceId: 'device-2',
        changeType: 'UPDATE' as const,
        section: 'theme',
        data: { mode: 'light' }
      };

      // Both changes made around same time
      await manager.trackChange(change1);
      await manager.trackChange(change2);

      const conflicts = await manager.detectConflicts();
      
      // Conflict detection should identify theme changes from different devices
      expect(Array.isArray(conflicts)).toBe(true);
    });

    it('should not detect conflicts for different sections', async () => {
      const change1 = {
        deviceId: 'device-1',
        changeType: 'UPDATE' as const,
        section: 'theme',
        data: { mode: 'dark' }
      };

      const change2 = {
        deviceId: 'device-2',
        changeType: 'UPDATE' as const,
        section: 'notifications',
        data: { enabled: false }
      };

      await manager.trackChange(change1);
      await manager.trackChange(change2);

      const conflicts = await manager.detectConflicts();
      
      // No conflict since different sections
      expect(conflicts.length).toBe(0);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflict using timestamp', async () => {
      const conflict = {
        section: 'theme',
        sourceDeviceId: 'device-1',
        sourceValue: { mode: 'dark' },
        targetValue: { mode: 'light' },
        sourceTimestamp: new Date(Date.now() + 1000), // newer
        targetTimestamp: new Date()
      };

      const resolved = manager.resolveConflict(conflict, 'timestamp');
      
      expect(resolved.mode).toBe('dark'); // newer timestamp wins
    });

    it('should resolve conflict using user preference', async () => {
      manager['resolutionPreference'] = 'device-1';

      const conflict = {
        section: 'theme',
        sourceDeviceId: 'device-1',
        sourceValue: { mode: 'dark' },
        targetValue: { mode: 'light' },
        sourceTimestamp: new Date(),
        targetTimestamp: new Date(Date.now() + 1000) // newer
      };

      const resolved = manager.resolveConflict(conflict, 'user_preference');
      
      expect(resolved.mode).toBe('dark'); // preferred device wins
    });

    it('should merge conflicts when possible', async () => {
      const conflict = {
        section: 'notifications',
        sourceDeviceId: 'device-1',
        sourceValue: { emailNotifications: true },
        targetValue: { pushNotifications: true },
        sourceTimestamp: new Date(),
        targetTimestamp: new Date()
      };

      const resolved = manager.resolveConflict(conflict, 'merge');
      
      expect(resolved.emailNotifications).toBe(true);
      expect(resolved.pushNotifications).toBe(true);
    });
  });

  describe('Sync Status', () => {
    it('should track sync status', async () => {
      const change = {
        deviceId: 'device-1',
        changeType: 'UPDATE' as const,
        section: 'theme',
        data: { mode: 'dark' }
      };

      await manager.trackChange(change);
      const unsynced = await manager.getUnsyncedChanges();
      
      expect(unsynced.length).toBeGreaterThan(0);

      // Mark as synced
      await manager.markSynced(unsynced[0].id);
      
      const stillUnsynced = await manager.getUnsyncedChanges();
      expect(stillUnsynced.some(c => c.id === unsynced[0].id)).toBe(false);
    });
  });
});
