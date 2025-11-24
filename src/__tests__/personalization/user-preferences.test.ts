import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserPreferencesManager } from '@/lib/personalization/user-preferences';

describe('UserPreferencesManager', () => {
  let manager: UserPreferencesManager;

  beforeEach(() => {
    manager = new UserPreferencesManager('test-user-123');
  });

  describe('getCachedPreferences', () => {
    it('should return default preferences when none are cached', () => {
      const prefs = manager.getCachedPreferences();
      expect(prefs).toBeDefined();
      expect(prefs.theme).toBeDefined();
      expect(prefs.notifications).toBeDefined();
    });

    it('should return cached preferences if available', () => {
      const testPrefs = { theme: { mode: 'dark' as const } };
      manager['cache'] = { data: testPrefs, timestamp: Date.now() };
      
      const prefs = manager.getCachedPreferences();
      expect(prefs.theme?.mode).toBe('dark');
    });
  });

  describe('updatePreferences', () => {
    it('should merge new preferences with existing ones', async () => {
      const updates = { theme: { mode: 'dark' as const } };
      
      manager['cache'] = {
        data: {
          theme: { mode: 'light' as const },
          notifications: { enabled: true }
        },
        timestamp: Date.now()
      };

      const result = manager['mergePreferences'](
        manager['cache'].data,
        updates
      );
      
      expect(result.theme.mode).toBe('dark');
      expect(result.notifications.enabled).toBe(true);
    });

    it('should update the cache timestamp', async () => {
      const oldTime = Date.now() - 1000;
      manager['cache'] = {
        data: {},
        timestamp: oldTime
      };

      await manager.updatePreferences({ theme: { mode: 'dark' as const } });

      expect(manager['cache'].timestamp).toBeGreaterThan(oldTime);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset preferences to defaults', async () => {
      manager['cache'] = {
        data: { theme: { mode: 'dark' as const } },
        timestamp: Date.now()
      };

      await manager.resetToDefaults();

      const prefs = manager.getCachedPreferences();
      expect(prefs.theme?.mode).toBe('light');
    });

    it('should clear the cache', async () => {
      manager['cache'] = { data: {}, timestamp: Date.now() };
      
      await manager.resetToDefaults();

      expect(manager['cache']).toBeNull();
    });
  });

  describe('updateTheme', () => {
    it('should update only theme settings', async () => {
      manager['cache'] = {
        data: {
          theme: { mode: 'light' as const },
          notifications: { enabled: true }
        },
        timestamp: Date.now()
      };

      await manager.updateTheme({ mode: 'dark' as const });

      const prefs = manager.getCachedPreferences();
      expect(prefs.theme?.mode).toBe('dark');
      expect(prefs.notifications?.enabled).toBe(true);
    });
  });

  describe('updateNotifications', () => {
    it('should update only notification settings', async () => {
      manager['cache'] = {
        data: {
          theme: { mode: 'light' as const },
          notifications: { enabled: true, emailNotifications: false }
        },
        timestamp: Date.now()
      };

      await manager.updateNotifications({ emailNotifications: true });

      const prefs = manager.getCachedPreferences();
      expect(prefs.notifications?.emailNotifications).toBe(true);
      expect(prefs.theme?.mode).toBe('light');
    });
  });

  describe('Cache TTL', () => {
    it('should consider cache invalid after TTL expires', () => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000) - 1000; // 5 min + 1 sec
      manager['cache'] = {
        data: { theme: { mode: 'dark' as const } },
        timestamp: fiveMinutesAgo
      };

      const prefs = manager.getCachedPreferences();
      // Should return default since cache is expired
      expect(manager['isCacheValid']()).toBe(false);
    });

    it('should consider cache valid within TTL', () => {
      const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
      manager['cache'] = {
        data: { theme: { mode: 'dark' as const } },
        timestamp: oneMinuteAgo
      };

      expect(manager['isCacheValid']()).toBe(true);
    });
  });
});
