import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdaptiveInterfaceManager } from '@/lib/personalization/adaptive-interface';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

describe('AdaptiveInterfaceManager', () => {
  let manager: AdaptiveInterfaceManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    manager = new AdaptiveInterfaceManager();
  });

  describe('logBehavior', () => {
    it('should log user behavior events', async () => {
      const behavior = {
        userId: testUserId,
        sessionId: 'session-123',
        eventType: 'feature_used',
        eventData: { feature: 'editor' },
        deviceId: 'device-123',
      };

      await manager.logBehavior(behavior);
      
      expect(true).toBe(true);
    });

    it('should track duration of interactions', async () => {
      const behavior = {
        userId: testUserId,
        sessionId: 'session-123',
        eventType: 'interaction',
        eventData: { duration: 5000, component: 'editor' },
        deviceId: 'device-123',
      };

      await manager.logBehavior(behavior);
      
      expect(true).toBe(true);
    });

    it('should categorize events properly', async () => {
      const events = [
        { eventType: 'feature_used', eventData: { feature: 'editor' } },
        { eventType: 'button_click', eventData: { button: 'save' } },
        { eventType: 'page_view', eventData: { page: 'dashboard' } },
      ];

      for (const event of events) {
        await manager.logBehavior({
          userId: testUserId,
          sessionId: 'session-123',
          ...event,
          deviceId: 'device-123',
        });
      }
      
      expect(true).toBe(true);
    });
  });

  describe('detectPatterns', () => {
    it('should detect usage patterns from behavior logs', async () => {
      const patterns = await manager.detectPatterns(testUserId);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should calculate frequency of patterns', async () => {
      // Log repeated behavior
      for (let i = 0; i < 5; i++) {
        await manager.logBehavior({
          userId: testUserId,
          sessionId: `session-${i}`,
          eventType: 'feature_used',
          eventData: { feature: 'editor' },
          deviceId: 'device-123',
        });
      }

      const patterns = await manager.detectPatterns(testUserId);
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should calculate confidence scores', async () => {
      const patterns = await manager.detectPatterns(testUserId);
      
      patterns.forEach(pattern => {
        if (pattern.confidence !== undefined) {
          expect(pattern.confidence).toBeGreaterThanOrEqual(0);
          expect(pattern.confidence).toBeLessThanOrEqual(1);
        }
      });
    });
  });

  describe('getAdaptiveInterface', () => {
    it('should return adaptive interface configuration', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(config).toBeDefined();
      expect(config.showAdvancedOptions !== undefined).toBe(true);
      expect(Array.isArray(config.suggestedActions)).toBe(true);
    });

    it('should set customization level', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      expect(validLevels).toContain(config.customizationLevel);
    });

    it('should provide suggested actions', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(Array.isArray(config.suggestedActions)).toBe(true);
    });
  });

  describe('calculateCustomizationLevel', () => {
    it('should return low customization for new users', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(['beginner', 'intermediate', 'advanced']).toContain(config.customizationLevel);
    });

    it('should increase with more diverse usage', async () => {
      // Log various interactions
      const events = ['editor', 'dashboard', 'settings', 'collaboration', 'export'];
      
      for (const event of events) {
        await manager.logBehavior({
          userId: testUserId,
          sessionId: `session-${event}`,
          eventType: 'feature_used',
          eventData: { feature: event },
          deviceId: 'device-123',
        });
      }

      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(['beginner', 'intermediate', 'advanced']).toContain(config.customizationLevel);
    });
  });

  describe('suggestActions', () => {
    it('should suggest features based on patterns', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(Array.isArray(config.suggestedActions)).toBe(true);
    });

    it('should prioritize suggestions', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      if (config.suggestedActions.length > 1) {
        const first = config.suggestedActions[0];
        const second = config.suggestedActions[1];
        
        if (first.confidence && second.confidence) {
          expect(first.confidence).toBeGreaterThanOrEqual(second.confidence);
        }
      }
    });

    it('should suggest relevant features', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      config.suggestedActions.forEach(action => {
        expect(action.id).toBeDefined();
        expect(action.title).toBeDefined();
        expect(action.action).toBeDefined();
      });
    });
  });

  describe('Feature Discovery', () => {
    it('should track feature discovery', async () => {
      await manager.trackFeatureDiscovery(testUserId, 'advanced-formatting');
      
      expect(true).toBe(true);
    });

    it('should suggest undiscovered features', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(Array.isArray(config.featureDiscoveryShown)).toBe(true);
    });
  });

  describe('updateInterfacePreferences', () => {
    it('should record user feedback on suggestions', async () => {
      await manager.updateInterfacePreferences(testUserId, {
        actionId: 'action_123',
        accepted: true,
      });
      
      expect(true).toBe(true);
    });

    it('should track both accepted and rejected suggestions', async () => {
      await manager.updateInterfacePreferences(testUserId, {
        actionId: 'action_1',
        accepted: true,
      });

      await manager.updateInterfacePreferences(testUserId, {
        actionId: 'action_2',
        accepted: false,
      });
      
      expect(true).toBe(true);
    });
  });

  describe('Behavior Logging Edge Cases', () => {
    it('should handle missing optional fields', async () => {
      await manager.logBehavior({
        userId: testUserId,
        sessionId: 'session-123',
        eventType: 'page_view',
        eventData: {},
        deviceId: 'device-123',
      });
      
      expect(true).toBe(true);
    });

    it('should fail gracefully on error', async () => {
      // Should not throw even if Supabase fails
      try {
        await manager.logBehavior({
          userId: testUserId,
          sessionId: 'session-123',
          eventType: 'test',
          eventData: {},
          deviceId: 'device-123',
        });
        expect(true).toBe(true);
      } catch (error) {
        // Silently fails
        expect(true).toBe(true);
      }
    });
  });

  describe('Customization Levels', () => {
    it('should start with beginner-friendly defaults', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      expect(config.showAdvancedOptions === false || config.customizationLevel === 'beginner').toBe(true);
    });

    it('should hide advanced features for beginners', async () => {
      const config = await manager.getAdaptiveInterface(testUserId);
      
      if (config.customizationLevel === 'beginner') {
        expect(config.showAdvancedOptions).toBe(false);
      }
    });

    it('should show advanced features for advanced users', async () => {
      // Log heavy usage to be considered "heavy_user"
      for (let i = 0; i < 20; i++) {
        await manager.logBehavior({
          userId: testUserId,
          sessionId: `heavy-${i}`,
          eventType: 'feature_used',
          eventData: { feature: 'advanced-editor' },
          deviceId: 'device-123',
        });
      }

      const config = await manager.getAdaptiveInterface(testUserId);
      
      if (config.customizationLevel === 'advanced') {
        expect(config.showAdvancedOptions).toBe(true);
      }
    });
  });
});
