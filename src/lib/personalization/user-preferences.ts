/**
 * User Preferences Management
 * Handles CRUD operations for user preferences with persistence
 */

import { UserPreferences, LayoutPreferences, ThemePreferences, NotificationPreferences, AccessibilityPreferences, DashboardPreferences, BehaviorSettings } from './types';
import { supabase } from '@/integrations/supabase/client';

const PREFERENCES_TABLE = 'user_preferences';
const PREFERENCES_CACHE_KEY = 'user_preferences_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class UserPreferencesManager {
  private cache: Map<string, { data: UserPreferences; timestamp: number }> = new Map();

  /**
   * Get user preferences with caching
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from(PREFERENCES_TABLE)
        .select('*')
        .eq('userId', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const prefs = data || this.getDefaultPreferences(userId);
      this.cache.set(userId, { data: prefs, timestamp: Date.now() });
      return prefs;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const existing = await this.getUserPreferences(userId);
      const updated: UserPreferences = {
        ...existing,
        ...updates,
        userId,
        updatedAt: new Date(),
        version: (existing.version || 0) + 1,
      };

      const { data, error } = await supabase
        .from(PREFERENCES_TABLE)
        .upsert(updated)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      this.cache.set(userId, { data: data as UserPreferences, timestamp: Date.now() });
      return data as UserPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Update specific preference sections
   */
  async updateLayoutPreferences(userId: string, layout: Partial<LayoutPreferences>): Promise<UserPreferences> {
    const prefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      layout: { ...prefs.layout, ...layout },
    });
  }

  async updateThemePreferences(userId: string, theme: Partial<ThemePreferences>): Promise<UserPreferences> {
    const prefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      theme: { ...prefs.theme, ...theme },
    });
  }

  async updateNotificationPreferences(userId: string, notifications: Partial<NotificationPreferences>): Promise<UserPreferences> {
    const prefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      notifications: { ...prefs.notifications, ...notifications },
    });
  }

  async updateAccessibilityPreferences(userId: string, accessibility: Partial<AccessibilityPreferences>): Promise<UserPreferences> {
    const prefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      accessibility: { ...prefs.accessibility, ...accessibility },
    });
  }

  async updateDashboardPreferences(userId: string, dashboard: Partial<DashboardPreferences>): Promise<UserPreferences> {
    const prefs = await this.getUserPreferences(userId);
    return this.updatePreferences(userId, {
      dashboard: { ...prefs.dashboard, ...dashboard },
    });
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(userId: string): Promise<UserPreferences> {
    const defaults = this.getDefaultPreferences(userId);
    this.cache.delete(userId);
    return this.updatePreferences(userId, defaults);
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      id: `pref_${userId}_${Date.now()}`,
      userId,
      layout: {
        sidebarPosition: 'left',
        sidebarWidth: 250,
        compactMode: false,
        gridLayout: 'flexible',
        cardView: 'grid',
        itemsPerPage: 20,
      },
      theme: {
        mode: 'auto',
        colorScheme: 'default',
        accentColor: '#3b82f6',
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal',
      },
      notifications: {
        enabled: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        priorityBasedTiming: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        channels: [
          {
            id: 'updates',
            name: 'Updates',
            enabled: true,
            priority: 'medium',
            frequency: 'instant',
          },
          {
            id: 'reminders',
            name: 'Reminders',
            enabled: true,
            priority: 'medium',
            frequency: 'daily',
          },
          {
            id: 'messages',
            name: 'Messages',
            enabled: true,
            priority: 'high',
            frequency: 'instant',
          },
        ],
      },
      accessibility: {
        screenReaderEnabled: false,
        keyboardNavigationOnly: false,
        reducedAnimations: false,
        highContrast: false,
        fontSize: 100,
        lineHeight: 1.5,
        letterSpacing: 0,
        dyslexiaFriendlyFont: false,
        focusIndicatorSize: 'normal',
        captions: false,
        textToSpeech: false,
      },
      dashboard: {
        widgets: [],
        layout: 'grid',
        gridColumns: 3,
        enableDragAndDrop: true,
        autoArrangeWidgets: true,
        compactView: false,
      },
      behavior: {
        autoSave: true,
        autoSaveInterval: 30000,
        trackUsagePatterns: true,
        learnFromBehavior: true,
        predictiveFeatures: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  }

  /**
   * Clear cache for a user
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

export const userPreferencesManager = new UserPreferencesManager();
