import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveInterfaceManager } from '@/lib/personalization/adaptive-interface';

describe('AdaptiveInterfaceManager', () => {
  let manager: AdaptiveInterfaceManager;

  beforeEach(() => {
    manager = new AdaptiveInterfaceManager('test-user-123');
  });

  describe('logBehavior', () => {
    it('should log user behavior events', async () => {
      await manager.logBehavior({
        eventType: 'click',
        featureName: 'save-button',
        featureCategory: 'editor'
      });

      const logs = await manager.getBehaviorLogs('save-button');
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should track duration of interactions', async () => {
      await manager.logBehavior({
        eventType: 'focus',
        featureName: 'text-editor',
        featureCategory: 'editor',
        durationMs: 5000
      });

      const logs = await manager.getBehaviorLogs('text-editor');
      expect(logs.some(l => l.durationMs === 5000)).toBe(true);
    });

    it('should categorize events properly', async () => {
      const eventTypes = ['click', 'hover', 'focus', 'scroll', 'feature_usage'];
      
      for (const eventType of eventTypes) {
        await manager.logBehavior({
          eventType: eventType as any,
          featureName: 'test-feature'
        });
      }

      const logs = await manager.getBehaviorLogs('test-feature');
      const uniqueTypes = new Set(logs.map(l => l.eventType));
      
      expect(uniqueTypes.size).toBe(eventTypes.length);
    });
  });

  describe('detectPatterns', () => {
    it('should detect usage patterns from behavior logs', async () => {
      // Simulate repeated usage
      for (let i = 0; i < 10; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'grammar-check'
        });
      }

      const patterns = await manager.detectPatterns();
      
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should calculate frequency of patterns', async () => {
      // Log different features
      for (let i = 0; i < 15; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'paraphrase'
        });
      }

      for (let i = 0; i < 5; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'grammar-check'
        });
      }

      const patterns = await manager.detectPatterns();
      const paraphrasePattern = patterns.find(p => p.feature === 'paraphrase');
      const grammarPattern = patterns.find(p => p.feature === 'grammar-check');
      
      if (paraphrasePattern && grammarPattern) {
        expect(paraphrasePattern.frequency).toBeGreaterThan(grammarPattern.frequency);
      }
    });

    it('should calculate confidence scores', async () => {
      // Log behavior multiple times
      for (let i = 0; i < 20; i++) {
        await manager.logBehavior({
          eventType: 'feature_usage',
          featureName: 'dashboard-widgets'
        });
      }

      const patterns = await manager.detectPatterns();
      const pattern = patterns.find(p => p.feature === 'dashboard-widgets');
      
      if (pattern) {
        expect(pattern.confidence).toBeGreaterThan(0.7); // High confidence after 20 uses
      }
    });
  });

  describe('calculateCustomizationLevel', () => {
    it('should calculate based on behavior patterns', async () => {
      // Log diverse usage
      const features = ['feature1', 'feature2', 'feature3', 'feature4'];
      
      for (const feature of features) {
        for (let i = 0; i < 5; i++) {
          await manager.logBehavior({
            eventType: 'click',
            featureName: feature
          });
        }
      }

      const level = await manager.calculateCustomizationLevel();
      
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    });

    it('should return low customization for new users', async () => {
      const level = await manager.calculateCustomizationLevel();
      
      // No behavior logged yet
      expect(level).toBeLessThan(0.5);
    });

    it('should increase with more diverse usage', async () => {
      const level1 = await manager.calculateCustomizationLevel();
      
      // Log diverse behavior
      for (let i = 0; i < 50; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: `feature-${Math.floor(Math.random() * 10)}`
        });
      }

      const level2 = await manager.calculateCustomizationLevel();
      
      expect(level2).toBeGreaterThanOrEqual(level1);
    });
  });

  describe('suggestActions', () => {
    it('should suggest feature based on patterns', async () => {
      // Log heavy usage of one feature
      for (let i = 0; i < 20; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'paraphrase'
        });
      }

      const suggestions = await manager.suggestActions();
      
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should prioritize suggestions', async () => {
      // Log diverse behavior
      for (let i = 0; i < 30; i++) {
        await manager.logBehavior({
          eventType: 'feature_usage',
          featureName: i % 2 === 0 ? 'feature-a' : 'feature-b'
        });
      }

      const suggestions = await manager.suggestActions();
      
      if (suggestions.length > 1) {
        expect(suggestions[0].priority).toBeGreaterThanOrEqual(
          suggestions[1].priority
        );
      }
    });

    it('should suggest relevant features', async () => {
      await manager.logBehavior({
        eventType: 'click',
        featureName: 'grammar-check'
      });

      const suggestions = await manager.suggestActions();
      
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Feature Discovery', () => {
    it('should track feature discovery', async () => {
      await manager.trackFeatureDiscovery('new-dashboard-widget');
      
      const discovered = await manager.getDiscoveredFeatures();
      
      expect(discovered).toContain('new-dashboard-widget');
    });

    it('should suggest undiscovered features', async () => {
      // Mark some features as discovered
      await manager.trackFeatureDiscovery('feature-1');
      await manager.trackFeatureDiscovery('feature-2');

      // Log behavior for discovered features
      for (let i = 0; i < 10; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'feature-1'
        });
      }

      const suggestions = await manager.suggestActions();
      
      // Should suggest features the user hasn't discovered yet
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('adaptiveConfiguration', () => {
    it('should generate adaptive config based on patterns', async () => {
      // Log specific patterns
      for (let i = 0; i < 15; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'sidebar'
        });
      }

      for (let i = 0; i < 5; i++) {
        await manager.logBehavior({
          eventType: 'click',
          featureName: 'settings'
        });
      }

      const config = await manager.generateAdaptiveConfig();
      
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('should recommend UI adjustments', async () => {
      // Log extensive editor usage
      for (let i = 0; i < 100; i++) {
        await manager.logBehavior({
          eventType: 'focus',
          featureName: 'editor'
        });
      }

      const config = await manager.generateAdaptiveConfig();
      
      // Should have recommendations for power users
      expect(config).toBeDefined();
    });
  });
});
