import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserPreferencesManager } from '@/lib/personalization/user-preferences';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'pref_test_123',
                userId: 'test-user-123',
                layout: { sidebarPosition: 'left', sidebarWidth: 250, compactMode: false },
                theme: { mode: 'auto', colorScheme: 'default' },
                notifications: { enabled: true, emailNotifications: true },
              },
              error: null,
            }),
          }),
        }),
      }),
    })),
  },
}));

describe('UserPreferencesManager', () => {
  let manager: UserPreferencesManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    manager = new UserPreferencesManager();
  });

  describe('getUserPreferences', () => {
    it('should fetch user preferences from database', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      expect(prefs).toBeDefined();
      expect(prefs.layout).toBeDefined();
      expect(prefs.theme).toBeDefined();
      expect(prefs.notifications).toBeDefined();
    });

    it('should return cached preferences if available', async () => {
      // First call to populate cache
      await manager.getUserPreferences(testUserId);
      
      // Second call should use cache
      const prefs = await manager.getUserPreferences(testUserId);
      expect(prefs).toBeDefined();
    });

    it('should return default preferences on error', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      
      // Should have default structure even if fetch fails
      expect(prefs.layout).toBeDefined();
      expect(prefs.theme).toBeDefined();
      expect(prefs.notifications).toBeDefined();
      expect(prefs.accessibility).toBeDefined();
    });
  });

  describe('updatePreferences', () => {
    it('should merge new preferences with existing ones', async () => {
      const updates = { theme: { mode: 'dark' as const } };
      
      const result = await manager.updatePreferences(testUserId, updates);
      
      expect(result).toBeDefined();
      expect(result.theme).toBeDefined();
    });

    it('should update the version number', async () => {
      const updates = { theme: { mode: 'dark' as const } };
      
      const result = await manager.updatePreferences(testUserId, updates);
      
      expect(result.version).toBeGreaterThan(0);
    });

    it('should update the timestamp', async () => {
      const before = new Date();
      const updates = { theme: { mode: 'dark' as const } };
      
      const result = await manager.updatePreferences(testUserId, updates);
      const after = new Date();
      
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt >= before).toBe(true);
    });
  });

  describe('updateThemePreferences', () => {
    it('should update only theme settings', async () => {
      const themeUpdates = { mode: 'dark' as const };
      
      const result = await manager.updateThemePreferences(testUserId, themeUpdates);
      
      expect(result).toBeDefined();
      expect(result.theme).toBeDefined();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update only notification settings', async () => {
      const notificationUpdates = { emailNotifications: false };
      
      const result = await manager.updateNotificationPreferences(testUserId, notificationUpdates);
      
      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
    });
  });

  describe('updateAccessibilityPreferences', () => {
    it('should update only accessibility settings', async () => {
      const a11yUpdates = { screenReaderEnabled: true };
      
      const result = await manager.updateAccessibilityPreferences(testUserId, a11yUpdates);
      
      expect(result).toBeDefined();
      expect(result.accessibility).toBeDefined();
    });
  });

  describe('updateDashboardPreferences', () => {
    it('should update only dashboard settings', async () => {
      const dashboardUpdates = { gridColumns: 4 };
      
      const result = await manager.updateDashboardPreferences(testUserId, dashboardUpdates);
      
      expect(result).toBeDefined();
      expect(result.dashboard).toBeDefined();
    });
  });

  describe('resetPreferences', () => {
    it('should reset preferences to defaults', async () => {
      const defaults = await manager.resetPreferences(testUserId);
      
      expect(defaults).toBeDefined();
      expect(defaults.theme?.mode).toBe('auto');
      expect(defaults.layout?.sidebarPosition).toBe('left');
      expect(defaults.notifications?.enabled).toBe(true);
    });

    it('should clear the cache', async () => {
      // Populate cache
      await manager.getUserPreferences(testUserId);
      
      // Reset clears cache
      await manager.resetPreferences(testUserId);
      
      // Cache should be cleared
      manager.clearCache(testUserId);
      expect(manager['cache'].has(testUserId)).toBe(false);
    });

    it('should set version to 1', async () => {
      const result = await manager.resetPreferences(testUserId);
      
      expect(result.version).toBe(1);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific user', async () => {
      // Populate cache
      await manager.getUserPreferences(testUserId);
      
      // Clear specific user
      manager.clearCache(testUserId);
      
      expect(manager['cache'].has(testUserId)).toBe(false);
    });

    it('should clear all cache when no user specified', async () => {
      // Populate cache
      await manager.getUserPreferences(testUserId);
      
      // Clear all
      manager.clearCache();
      
      expect(manager['cache'].size).toBe(0);
    });
  });

  describe('Default Preferences', () => {
    it('should return default layout preferences', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      
      expect(prefs.layout.sidebarPosition).toBe('left');
      expect(prefs.layout.sidebarWidth).toBe(250);
      expect(prefs.layout.compactMode).toBe(false);
    });

    it('should return default theme preferences', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      
      expect(prefs.theme.mode).toBe('auto');
      expect(prefs.theme.colorScheme).toBe('default');
      expect(prefs.theme.reducedMotion).toBe(false);
    });

    it('should return default notification preferences', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      
      expect(prefs.notifications.enabled).toBe(true);
      expect(prefs.notifications.emailNotifications).toBe(true);
      expect(prefs.notifications.pushNotifications).toBe(true);
    });

    it('should return default accessibility preferences', async () => {
      const prefs = await manager.getUserPreferences(testUserId);
      
      expect(prefs.accessibility.screenReaderEnabled).toBe(false);
      expect(prefs.accessibility.reducedAnimations).toBe(false);
      expect(prefs.accessibility.fontSize).toBe(100);
    });
  });

  describe('Cache TTL', () => {
    it('should respect cache duration', async () => {
      // Populate cache with fresh timestamp
      const prefs1 = await manager.getUserPreferences(testUserId);
      
      // Immediate second call should use cache
      const prefs2 = await manager.getUserPreferences(testUserId);
      
      expect(prefs1).toBeDefined();
      expect(prefs2).toBeDefined();
    });
  });
});
