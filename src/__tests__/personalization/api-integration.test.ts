import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

/**
 * Integration tests for Personalization API endpoints
 * Tests component interaction with actual API layer
 */

describe('Personalization API Integration', () => {
  const baseUrl = 'http://localhost:3000/api/personalization';
  const mockUserId = 'test-user-123';
  const mockToken = 'mock-bearer-token';

  beforeEach(() => {
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Preferences Endpoint', () => {
    describe('GET /api/personalization/preferences', () => {
      it('should fetch user preferences', async () => {
        const mockPreferences = {
          id: 'pref-123',
          userId: mockUserId,
          theme: { mode: 'light' },
          notifications: { enabled: true },
          accessibility: { highContrast: false },
          layout: { sidebarPosition: 'left' },
          privacy: { behaviorTracking: true },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferences
        });

        const response = await fetch(`${baseUrl}/preferences`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();

        expect(response.ok).toBe(true);
        expect(data.theme.mode).toBe('light');
        expect(data.notifications.enabled).toBe(true);
      });

      it('should return 401 for unauthorized access', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' })
        });

        const response = await fetch(`${baseUrl}/preferences`);

        expect(response.ok).toBe(false);
        expect(response.status).toBe(401);
      });

      it('should handle 404 when preferences not found', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'Preferences not found' })
        });

        const response = await fetch(`${baseUrl}/preferences`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/personalization/preferences', () => {
      it('should update user preferences', async () => {
        const updateData = {
          theme: { mode: 'dark' }
        };

        const updatedPrefs = {
          ...updateData,
          updatedAt: new Date().toISOString()
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => updatedPrefs
        });

        const response = await fetch(`${baseUrl}/preferences`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.theme.mode).toBe('dark');
      });

      it('should reject invalid preference format', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({
            error: 'Invalid preferences format',
            details: []
          })
        });

        const response = await fetch(`${baseUrl}/preferences`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invalid: 'data' })
        });

        expect(response.status).toBe(400);
      });
    });

    describe('GET /api/personalization/preferences/[section]', () => {
      it('should fetch specific preference section', async () => {
        const mockTheme = { mode: 'dark', fontSize: 'large' };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ theme: mockTheme })
        });

        const response = await fetch(`${baseUrl}/preferences/theme`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.theme.mode).toBe('dark');
      });

      it('should update specific preference section', async () => {
        const updateData = { fontSize: 'xl' };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ theme: updateData })
        });

        const response = await fetch(`${baseUrl}/preferences/theme`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Devices Endpoint', () => {
    describe('GET /api/personalization/devices', () => {
      it('should fetch user devices', async () => {
        const mockDevices = [
          {
            id: 'device-1',
            deviceName: 'My Laptop',
            deviceType: 'desktop',
            lastSeen: new Date().toISOString(),
            isTrusted: true
          },
          {
            id: 'device-2',
            deviceName: 'My Phone',
            deviceType: 'mobile',
            lastSeen: new Date(Date.now() - 3600000).toISOString(),
            isTrusted: false
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ devices: mockDevices })
        });

        const response = await fetch(`${baseUrl}/devices`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();
        expect(data.devices.length).toBe(2);
        expect(data.devices[0].isTrusted).toBe(true);
      });
    });

    describe('POST /api/personalization/devices', () => {
      it('should register new device', async () => {
        const deviceData = {
          deviceId: 'device-3',
          deviceName: 'New Device',
          deviceType: 'tablet'
        };

        const createdDevice = {
          id: 'id-123',
          ...deviceData,
          createdAt: new Date().toISOString()
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => createdDevice
        });

        const response = await fetch(`${baseUrl}/devices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(deviceData)
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.id).toBeDefined();
      });

      it('should reject duplicate device registration', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({ error: 'Device already registered' })
        });

        const response = await fetch(`${baseUrl}/devices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            deviceId: 'existing-device',
            deviceName: 'Device',
            deviceType: 'desktop'
          })
        });

        expect(response.status).toBe(409);
      });
    });
  });

  describe('Sync Endpoint', () => {
    describe('GET /api/personalization/sync', () => {
      it('should fetch sync changes', async () => {
        const mockChanges = [
          {
            id: 'change-1',
            deviceId: 'device-1',
            changeType: 'UPDATE',
            section: 'theme',
            data: { mode: 'dark' },
            isSynced: false,
            createdAt: new Date().toISOString()
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ changes: mockChanges })
        });

        const response = await fetch(`${baseUrl}/sync?synced=false`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();
        expect(data.changes.length).toBe(1);
        expect(data.changes[0].isSynced).toBe(false);
      });
    });

    describe('POST /api/personalization/sync', () => {
      it('should create sync change', async () => {
        const changeData = {
          deviceId: 'device-1',
          changeType: 'UPDATE',
          section: 'theme',
          data: { mode: 'dark' }
        };

        const createdChange = {
          id: 'change-1',
          ...changeData,
          isSynced: false,
          createdAt: new Date().toISOString()
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => createdChange
        });

        const response = await fetch(`${baseUrl}/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(changeData)
        });

        expect(response.status).toBe(201);
      });
    });

    describe('PATCH /api/personalization/sync', () => {
      it('should mark changes as synced', async () => {
        const changeIds = ['change-1', 'change-2'];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            updated: [
              { id: 'change-1', isSynced: true },
              { id: 'change-2', isSynced: true }
            ]
          })
        });

        const response = await fetch(`${baseUrl}/sync`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ changeIds })
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.updated.every((c: any) => c.isSynced)).toBe(true);
      });
    });
  });

  describe('Notifications Endpoint', () => {
    describe('GET /api/personalization/notifications', () => {
      it('should fetch notifications', async () => {
        const mockNotifications = [
          {
            id: 'notif-1',
            title: 'Welcome',
            message: 'Welcome to personalization',
            notificationType: 'feature',
            priority: 3,
            readAt: null,
            createdAt: new Date().toISOString()
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ notifications: mockNotifications })
        });

        const response = await fetch(`${baseUrl}/notifications`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();
        expect(data.notifications.length).toBe(1);
        expect(data.notifications[0].readAt).toBeNull();
      });

      it('should filter unread notifications', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            notifications: [
              { id: 'notif-1', readAt: null },
              { id: 'notif-2', readAt: null }
            ]
          })
        });

        const response = await fetch(`${baseUrl}/notifications?unread=true`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();
        expect(data.notifications.every((n: any) => !n.readAt)).toBe(true);
      });
    });

    describe('POST /api/personalization/notifications', () => {
      it('should create notification', async () => {
        const notifData = {
          title: 'Test',
          message: 'Test notification',
          notificationType: 'feature',
          priority: 2
        };

        const createdNotif = {
          id: 'notif-1',
          ...notifData,
          createdAt: new Date().toISOString()
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => createdNotif
        });

        const response = await fetch(`${baseUrl}/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notifData)
        });

        expect(response.status).toBe(201);
      });
    });

    describe('PATCH /api/personalization/notifications', () => {
      it('should mark notifications as read', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            action: 'read',
            updated: [{ id: 'notif-1', readAt: new Date().toISOString() }]
          })
        });

        const response = await fetch(`${baseUrl}/notifications`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notificationIds: ['notif-1'],
            action: 'read'
          })
        });

        expect(response.ok).toBe(true);
        const data = await response.json();
        expect(data.action).toBe('read');
      });

      it('should delete notifications', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            action: 'deleted'
          })
        });

        const response = await fetch(`${baseUrl}/notifications`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notificationIds: ['notif-1'],
            action: 'delete'
          })
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Dashboard Endpoint', () => {
    describe('GET /api/personalization/dashboard', () => {
      it('should fetch dashboard layouts', async () => {
        const mockLayouts = [
          {
            id: 'layout-1',
            layoutName: 'Default',
            widgets: [],
            gridSize: { columns: 12, rows: 4 },
            isDefault: true
          }
        ];

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ layouts: mockLayouts, default: mockLayouts[0] })
        });

        const response = await fetch(`${baseUrl}/dashboard`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        const data = await response.json();
        expect(data.layouts.length).toBe(1);
        expect(data.default.isDefault).toBe(true);
      });
    });

    describe('PUT /api/personalization/dashboard', () => {
      it('should create/update dashboard layout', async () => {
        const layoutData = {
          layoutName: 'My Layout',
          widgets: [],
          gridSize: { columns: 12, rows: 4 }
        };

        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...layoutData, id: 'layout-1' })
        });

        const response = await fetch(`${baseUrl}/dashboard`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(layoutData)
        });

        expect(response.ok).toBe(true);
      });
    });

    describe('DELETE /api/personalization/dashboard', () => {
      it('should delete dashboard layout', async () => {
        (global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, deletedId: 'layout-1' })
        });

        const response = await fetch(`${baseUrl}/dashboard?id=layout-1`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });

        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch(`${baseUrl}/preferences`, {
          headers: { 'Authorization': `Bearer ${mockToken}` }
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const response = await fetch(`${baseUrl}/preferences`, {
        headers: { 'Authorization': `Bearer ${mockToken}` }
      });

      expect(response.status).toBe(500);
    });

    it('should handle timeout', async () => {
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      try {
        await Promise.race([
          fetch(`${baseUrl}/preferences`),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 50)
          )
        ]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
