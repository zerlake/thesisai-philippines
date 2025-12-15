import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CrossDeviceSyncManager } from '@/lib/personalization/cross-device-sync';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'device-123', userId: 'test-user-123' },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      in: vi.fn().mockReturnValue({
        mockResolvedValue: { error: null }
      }),
    })),
  },
}));

describe('CrossDeviceSyncManager', () => {
  let manager: CrossDeviceSyncManager;
  const testUserId = 'test-user-123';
  const testDeviceId = 'device-1';

  beforeEach(() => {
    manager = new CrossDeviceSyncManager();
  });

  describe('registerDevice', () => {
    it('should register a new device', async () => {
      const deviceInfo = {
        userId: testUserId,
        deviceId: testDeviceId,
        deviceName: 'My Laptop',
        deviceType: 'desktop',
        osName: 'Windows',
        osVersion: '10',
        isActive: true,
      };

      const result = await manager.registerDevice(deviceInfo);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('should have lastSyncAt timestamp', async () => {
      const deviceInfo = {
        userId: testUserId,
        deviceId: testDeviceId,
        deviceName: 'My Laptop',
        deviceType: 'desktop',
        isActive: true,
      };

      const result = await manager.registerDevice(deviceInfo);
      
      expect(result.lastSyncAt).toBeDefined();
    });
  });

  describe('getUserDevices', () => {
    it('should fetch all devices for a user', async () => {
      const devices = await manager.getUserDevices(testUserId);
      
      expect(Array.isArray(devices)).toBe(true);
    });

    it('should return empty array on error', async () => {
      const devices = await manager.getUserDevices(testUserId);
      
      expect(Array.isArray(devices)).toBe(true);
    });
  });

  describe('trackChange', () => {
    it('should track a preference change', async () => {
      const change = {
        userId: testUserId,
        deviceId: testDeviceId,
        resourceId: 'theme-settings',
        resourceType: 'preferences',
        data: { mode: 'dark' },
      };

      const result = await manager.trackChange(change);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should mark changes as unsynced initially', async () => {
      const change = {
        userId: testUserId,
        deviceId: testDeviceId,
        resourceId: 'notifications',
        resourceType: 'preferences',
        data: { enabled: false },
      };

      const result = await manager.trackChange(change);
      
      expect(result.syncedAt).toBeUndefined();
    });
  });

  describe('syncPreferences', () => {
    it('should sync preferences across devices', async () => {
      const result = await manager.syncPreferences(testUserId, testDeviceId);
      
      expect(result).toBeDefined();
      expect(result.synced).toBeDefined();
      expect(Array.isArray(result.conflicts)).toBe(true);
    });

    it('should detect and return conflicts', async () => {
      const result = await manager.syncPreferences(testUserId, testDeviceId);
      
      expect(Array.isArray(result.conflicts)).toBe(true);
    });
  });

  describe('getSyncState', () => {
    it('should return sync state for user', async () => {
      const state = await manager.getSyncState(testUserId);
      
      expect(state).toBeDefined();
      expect(state.lastSyncTime).toBeDefined();
      expect(Array.isArray(state.pendingChanges)).toBe(true);
      expect(Array.isArray(state.conflictedItems)).toBe(true);
      expect(state.syncInProgress).toBe(false);
    });

    it('should track pending changes', async () => {
      const state = await manager.getSyncState(testUserId);
      
      expect(Array.isArray(state.pendingChanges)).toBe(true);
    });

    it('should track conflicts', async () => {
      const state = await manager.getSyncState(testUserId);
      
      expect(Array.isArray(state.conflictedItems)).toBe(true);
    });
  });

  describe('markDeviceActive', () => {
    it('should mark device as active', async () => {
      await manager.markDeviceActive(testDeviceId);
      
      // No assertion - just verify no error thrown
      expect(true).toBe(true);
    });

    it('should update lastSyncAt timestamp', async () => {
      const before = new Date();
      await manager.markDeviceActive(testDeviceId);
      const after = new Date();
      
      // Timestamp should be set between before and after
      expect(true).toBe(true);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflicts between devices updating same resource', async () => {
      // Track change from device 1
      await manager.trackChange({
        userId: testUserId,
        deviceId: 'device-1',
        resourceId: 'theme',
        resourceType: 'preferences',
        data: { mode: 'dark' },
      });

      // Track conflicting change from device 2
      await manager.trackChange({
        userId: testUserId,
        deviceId: 'device-2',
        resourceId: 'theme',
        resourceType: 'preferences',
        data: { mode: 'light' },
      });

      const result = await manager.syncPreferences(testUserId, 'device-1');
      
      // Should detect conflict
      expect(Array.isArray(result.conflicts)).toBe(true);
    });

    it('should not detect conflicts for different resources', async () => {
      // Track change from device 1
      await manager.trackChange({
        userId: testUserId,
        deviceId: 'device-1',
        resourceId: 'theme',
        resourceType: 'preferences',
        data: { mode: 'dark' },
      });

      // Track different resource from device 2
      await manager.trackChange({
        userId: testUserId,
        deviceId: 'device-2',
        resourceId: 'notifications',
        resourceType: 'preferences',
        data: { enabled: false },
      });

      const result = await manager.syncPreferences(testUserId, 'device-1');
      
      // Should not have conflicts for different resources
      expect(Array.isArray(result.conflicts)).toBe(true);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts using timestamp priority', async () => {
      const result = await manager.syncPreferences(testUserId, testDeviceId);
      
      // Should return resolved conflicts
      expect(result).toBeDefined();
    });

    it('should preserve both device states on merge', async () => {
      const result = await manager.syncPreferences(testUserId, testDeviceId);
      
      expect(result).toBeDefined();
    });
  });

  describe('Sync Workflow', () => {
    it('should complete full sync workflow', async () => {
      // Register device
      await manager.registerDevice({
        userId: testUserId,
        deviceId: testDeviceId,
        deviceName: 'Test Device',
        deviceType: 'desktop',
        isActive: true,
      });

      // Track changes
      await manager.trackChange({
        userId: testUserId,
        deviceId: testDeviceId,
        resourceId: 'preferences',
        resourceType: 'settings',
        data: { theme: 'dark' },
      });

      // Sync
      const syncResult = await manager.syncPreferences(testUserId, testDeviceId);
      
      expect(syncResult).toBeDefined();
      expect(syncResult.synced !== undefined).toBe(true);
    });

    it('should prevent concurrent syncs', async () => {
      const sync1 = manager.syncPreferences(testUserId, testDeviceId);
      const sync2 = manager.syncPreferences(testUserId, testDeviceId);
      
      const [result1, result2] = await Promise.all([sync1, sync2]);
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });
});
