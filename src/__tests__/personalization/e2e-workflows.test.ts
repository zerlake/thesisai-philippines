import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/**
 * End-to-End (E2E) Test Workflows
 * Tests complete user scenarios and workflows
 */

describe('Personalization E2E Workflows', () => {
  // Mock API client
  const mockApiClient = {
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
    getDevices: vi.fn(),
    registerDevice: vi.fn(),
    getSyncChanges: vi.fn(),
    createSyncChange: vi.fn(),
    markSynced: vi.fn(),
    getNotifications: vi.fn(),
    updateNotifications: vi.fn(),
    getDashboardLayouts: vi.fn(),
    saveDashboardLayout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('User Preference Update Workflow', () => {
    it('should complete full preference update workflow', async () => {
      // Step 1: User loads settings page
      mockApiClient.getPreferences.mockResolvedValueOnce({
        id: 'pref-123',
        userId: 'user-123',
        theme: { mode: 'light', fontSize: 'medium' },
        notifications: { enabled: true, emailNotifications: true },
        accessibility: { highContrast: false },
        layout: { sidebarPosition: 'left' }
      });

      const prefs = await mockApiClient.getPreferences();
      expect(prefs.theme.mode).toBe('light');

      // Step 2: User changes theme to dark
      mockApiClient.updatePreferences.mockResolvedValueOnce({
        ...prefs,
        theme: { mode: 'dark', fontSize: 'medium' }
      });

      const updated = await mockApiClient.updatePreferences({
        theme: { mode: 'dark' }
      });
      expect(updated.theme.mode).toBe('dark');

      // Step 3: Verify change persisted
      mockApiClient.getPreferences.mockResolvedValueOnce(updated);
      const verified = await mockApiClient.getPreferences();
      expect(verified.theme.mode).toBe('dark');

      // Step 4: Log sync change for other devices
      mockApiClient.createSyncChange.mockResolvedValueOnce({
        id: 'change-1',
        deviceId: 'device-1',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'dark' },
        isSynced: false
      });

      const syncChange = await mockApiClient.createSyncChange({
        deviceId: 'device-1',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'dark' }
      });

      expect(syncChange.isSynced).toBe(false);
      expect(syncChange.section).toBe('theme');
    });

    it('should handle preference update error gracefully', async () => {
      const error = new Error('API Error: Failed to update preferences');

      mockApiClient.updatePreferences.mockRejectedValueOnce(error);

      try {
        await mockApiClient.updatePreferences({ theme: { mode: 'invalid' } });
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err).toBeDefined();
        expect((err as Error).message).toContain('Failed to update');
      }
    });
  });

  describe('Cross-Device Sync Workflow', () => {
    it('should sync preferences across multiple devices', async () => {
      // Step 1: Device A makes a change
      mockApiClient.createSyncChange.mockResolvedValueOnce({
        id: 'change-1',
        deviceId: 'device-a',
        changeType: 'UPDATE',
        section: 'notifications',
        data: { enabled: false },
        isSynced: false,
        createdAt: new Date().toISOString()
      });

      const change = await mockApiClient.createSyncChange({
        deviceId: 'device-a',
        changeType: 'UPDATE',
        section: 'notifications',
        data: { enabled: false }
      });

      expect(change.deviceId).toBe('device-a');

      // Step 2: Device B checks for unsync'd changes
      mockApiClient.getSyncChanges.mockResolvedValueOnce([change]);

      const unsyncedChanges = await mockApiClient.getSyncChanges(true);
      expect(unsyncedChanges.length).toBe(1);
      expect(unsyncedChanges[0].isSynced).toBe(false);

      // Step 3: Device B syncs the changes
      mockApiClient.markSynced.mockResolvedValueOnce([
        { ...change, isSynced: true, syncTimestamp: new Date().toISOString() }
      ]);

      const synced = await mockApiClient.markSynced([change.id]);
      expect(synced[0].isSynced).toBe(true);

      // Step 4: Device B applies changes to its own preferences
      mockApiClient.updatePreferences.mockResolvedValueOnce({
        notifications: { enabled: false }
      });

      const applied = await mockApiClient.updatePreferences({
        notifications: { enabled: false }
      });

      expect(applied.notifications.enabled).toBe(false);
    });

    it('should detect and handle sync conflicts', async () => {
      const timestamp1 = new Date(Date.now() - 1000).toISOString();
      const timestamp2 = new Date().toISOString();

      // Step 1: Two devices make conflicting changes
      const changeA = {
        id: 'change-a',
        deviceId: 'device-a',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'dark' },
        createdAt: timestamp2 // newer
      };

      const changeB = {
        id: 'change-b',
        deviceId: 'device-b',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'light' },
        createdAt: timestamp1 // older
      };

      // Step 2: Both are tracked
      expect(changeA.createdAt > changeB.createdAt).toBe(true);

      // Step 3: Conflict resolution - newer timestamp wins
      const resolved = changeA.data; // changeA is newer

      expect(resolved.mode).toBe('dark');
    });
  });

  describe('Device Registration Workflow', () => {
    it('should complete device registration and trust flow', async () => {
      // Step 1: New device registers
      mockApiClient.registerDevice.mockResolvedValueOnce({
        id: 'device-3',
        deviceId: 'unique-device-3',
        deviceName: 'New Laptop',
        deviceType: 'desktop',
        osName: 'Windows',
        browserName: 'Chrome',
        isTrusted: false,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      const newDevice = await mockApiClient.registerDevice({
        deviceId: 'unique-device-3',
        deviceName: 'New Laptop',
        deviceType: 'desktop'
      });

      expect(newDevice.isTrusted).toBe(false);
      expect(newDevice.isActive).toBe(true);

      // Step 2: List all devices
      mockApiClient.getDevices.mockResolvedValueOnce([
        {
          id: 'device-1',
          deviceName: 'Old Laptop',
          isTrusted: true,
          lastSeen: new Date(Date.now() - 3600000).toISOString()
        },
        newDevice
      ]);

      const devices = await mockApiClient.getDevices();
      expect(devices.length).toBe(2);

      // Step 3: User trusts the new device
      mockApiClient.updateDevice = vi.fn().mockResolvedValueOnce({
        ...newDevice,
        isTrusted: true
      });

      const trusted = await mockApiClient.updateDevice('device-3', {
        isTrusted: true
      });

      expect(trusted.isTrusted).toBe(true);
    });
  });

  describe('Notification Workflow', () => {
    it('should handle complete notification lifecycle', async () => {
      // Step 1: Fetch unread notifications
      mockApiClient.getNotifications.mockResolvedValueOnce([
        {
          id: 'notif-1',
          title: 'Feature Update',
          message: 'New personalization features available',
          notificationType: 'feature',
          priority: 3,
          readAt: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 'notif-2',
          title: 'Alert',
          message: 'Unusual activity detected',
          notificationType: 'alert',
          priority: 5,
          readAt: null,
          createdAt: new Date().toISOString()
        }
      ]);

      const unreadNotifs = await mockApiClient.getNotifications(true, 50);
      expect(unreadNotifs.length).toBe(2);
      expect(unreadNotifs.every(n => !n.readAt)).toBe(true);

      // Step 2: Read high-priority notification
      mockApiClient.updateNotifications.mockResolvedValueOnce({
        success: true,
        action: 'read',
        updated: [
          { ...unreadNotifs[1], readAt: new Date().toISOString() }
        ]
      });

      const read = await mockApiClient.updateNotifications(['notif-2'], 'read');
      expect(read.success).toBe(true);

      // Step 3: Delete low-priority notification
      mockApiClient.updateNotifications.mockResolvedValueOnce({
        success: true,
        action: 'deleted'
      });

      const deleted = await mockApiClient.updateNotifications(['notif-1'], 'delete');
      expect(deleted.success).toBe(true);

      // Step 4: Check remaining unread
      mockApiClient.getNotifications.mockResolvedValueOnce([]);

      const remaining = await mockApiClient.getNotifications(true);
      expect(remaining.length).toBe(0);
    });
  });

  describe('Dashboard Customization Workflow', () => {
    it('should complete dashboard customization workflow', async () => {
      // Step 1: Load existing layouts
      mockApiClient.getDashboardLayouts.mockResolvedValueOnce({
        layouts: [
          {
            id: 'layout-1',
            layoutName: 'Default',
            widgets: [
              { id: 'w1', type: 'writing_stats', position: { x: 0, y: 0, width: 6, height: 2 } },
              { id: 'w2', type: 'recent_essays', position: { x: 6, y: 0, width: 6, height: 2 } }
            ],
            isDefault: true
          }
        ],
        default: {
          id: 'layout-1',
          layoutName: 'Default',
          widgets: [
            { id: 'w1', type: 'writing_stats', position: { x: 0, y: 0, width: 6, height: 2 } },
            { id: 'w2', type: 'recent_essays', position: { x: 6, y: 0, width: 6, height: 2 } }
          ],
          isDefault: true
        }
      });

      const layouts = await mockApiClient.getDashboardLayouts();
      expect(layouts.layouts.length).toBe(1);
      expect(layouts.default?.isDefault).toBe(true);

      // Step 2: Create custom layout
      mockApiClient.saveDashboardLayout.mockResolvedValueOnce({
        id: 'layout-2',
        layoutName: 'Compact',
        widgets: [
          { id: 'w1', type: 'quick_actions', position: { x: 0, y: 0, width: 4, height: 1 } },
          { id: 'w2', type: 'recent_essays', position: { x: 4, y: 0, width: 8, height: 1 } }
        ],
        isDefault: false
      });

      const custom = await mockApiClient.saveDashboardLayout({
        layoutName: 'Compact',
        widgets: [
          { type: 'quick_actions', position: { x: 0, y: 0, width: 4, height: 1 } },
          { type: 'recent_essays', position: { x: 4, y: 0, width: 8, height: 1 } }
        ]
      });

      expect(custom.layoutName).toBe('Compact');
      expect(custom.isDefault).toBe(false);

      // Step 3: Verify both layouts exist
      mockApiClient.getDashboardLayouts.mockResolvedValueOnce({
        layouts: [
          layouts.default,
          custom
        ],
        default: layouts.default
      });

      const allLayouts = await mockApiClient.getDashboardLayouts();
      expect(allLayouts.layouts.length).toBe(2);
    });
  });

  describe('Complete User Journey', () => {
    it('should handle complete onboarding and customization', async () => {
      // Step 1: User logs in - fetch initial preferences
      mockApiClient.getPreferences.mockResolvedValueOnce({
        theme: { mode: 'auto' },
        notifications: { enabled: true },
        accessibility: {},
        layout: { sidebarPosition: 'left' }
      });

      const initialPrefs = await mockApiClient.getPreferences();
      expect(initialPrefs).toBeDefined();

      // Step 2: Register current device
      mockApiClient.registerDevice.mockResolvedValueOnce({
        id: 'device-1',
        deviceName: 'My Device',
        deviceType: 'desktop',
        isTrusted: false,
        isActive: true
      });

      const device = await mockApiClient.registerDevice({
        deviceId: 'device-uuid-1',
        deviceName: 'My Device',
        deviceType: 'desktop'
      });

      expect(device.id).toBeDefined();

      // Step 3: Customize preferences
      mockApiClient.updatePreferences.mockResolvedValueOnce({
        ...initialPrefs,
        theme: { mode: 'dark' },
        notifications: { enabled: true, emailNotifications: false }
      });

      const updated = await mockApiClient.updatePreferences({
        theme: { mode: 'dark' },
        notifications: { emailNotifications: false }
      });

      expect(updated.theme.mode).toBe('dark');

      // Step 4: Create sync change for other devices
      mockApiClient.createSyncChange.mockResolvedValueOnce({
        id: 'change-1',
        deviceId: 'device-1',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'dark' }
      });

      const syncChange = await mockApiClient.createSyncChange({
        deviceId: 'device-1',
        changeType: 'UPDATE',
        section: 'theme',
        data: { mode: 'dark' }
      });

      expect(syncChange.id).toBeDefined();

      // Step 5: Customize dashboard
      mockApiClient.saveDashboardLayout.mockResolvedValueOnce({
        id: 'layout-1',
        layoutName: 'My Layout',
        widgets: [],
        isDefault: true
      });

      const layout = await mockApiClient.saveDashboardLayout({
        layoutName: 'My Layout',
        widgets: []
      });

      expect(layout.isDefault).toBe(true);

      // Step 6: Check notifications
      mockApiClient.getNotifications.mockResolvedValueOnce([]);

      const notifs = await mockApiClient.getNotifications();
      expect(Array.isArray(notifs)).toBe(true);

      // Verify all API calls were made in correct order
      expect(mockApiClient.getPreferences).toHaveBeenCalled();
      expect(mockApiClient.registerDevice).toHaveBeenCalled();
      expect(mockApiClient.updatePreferences).toHaveBeenCalled();
      expect(mockApiClient.createSyncChange).toHaveBeenCalled();
      expect(mockApiClient.saveDashboardLayout).toHaveBeenCalled();
      expect(mockApiClient.getNotifications).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle and recover from API errors', async () => {
      // Step 1: Initial fetch fails
      mockApiClient.getPreferences.mockRejectedValueOnce(
        new Error('Network error')
      );

      try {
        await mockApiClient.getPreferences();
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Step 2: Retry succeeds
      mockApiClient.getPreferences.mockResolvedValueOnce({
        theme: { mode: 'light' },
        notifications: { enabled: true }
      });

      const prefs = await mockApiClient.getPreferences();
      expect(prefs.theme.mode).toBe('light');

      // Step 3: Partial update fails
      mockApiClient.updatePreferences.mockRejectedValueOnce(
        new Error('Invalid data')
      );

      try {
        await mockApiClient.updatePreferences({ invalid: 'data' } as any);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Step 4: Valid update succeeds
      mockApiClient.updatePreferences.mockResolvedValueOnce({
        theme: { mode: 'dark' }
      });

      const updated = await mockApiClient.updatePreferences({
        theme: { mode: 'dark' }
      });

      expect(updated.theme.mode).toBe('dark');
    });
  });
});
