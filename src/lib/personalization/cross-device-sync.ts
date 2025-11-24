/**
 * Cross-Device Synchronization with Conflict Resolution
 * Manages preference sync across multiple devices with smart conflict resolution
 */

import { DeviceInfo, SyncConflict, SyncState, SyncChange, UserPreferences } from './types';
import { supabase } from '@/lib/supabase/client';

const DEVICE_TABLE = 'user_devices';
const SYNC_CHANGES_TABLE = 'sync_changes';
const SYNC_CONFLICTS_TABLE = 'sync_conflicts';

class CrossDeviceSyncManager {
  private syncState: Map<string, SyncState> = new Map();
  private syncInProgress: Map<string, Promise<void>> = new Map();

  /**
   * Register a new device
   */
  async registerDevice(deviceInfo: Omit<DeviceInfo, 'id' | 'lastSyncAt'>): Promise<DeviceInfo> {
    const device: DeviceInfo = {
      ...deviceInfo,
      id: `device_${deviceInfo.userId}_${Date.now()}`,
      lastSyncAt: new Date(),
    };

    try {
      const { data, error } = await supabase
        .from(DEVICE_TABLE)
        .insert(device)
        .select()
        .single();

      if (error) throw error;
      return data as DeviceInfo;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    try {
      const { data, error } = await supabase
        .from(DEVICE_TABLE)
        .select('*')
        .eq('userId', userId);

      if (error) throw error;
      return (data || []) as DeviceInfo[];
    } catch (error) {
      console.error('Error fetching user devices:', error);
      return [];
    }
  }

  /**
   * Track a preference change for sync
   */
  async trackChange(change: Omit<SyncChange, 'id' | 'timestamp'>): Promise<SyncChange> {
    const syncChange: SyncChange = {
      ...change,
      id: `change_${Date.now()}`,
      timestamp: Date.now(),
    };

    try {
      const { data, error } = await supabase
        .from(SYNC_CHANGES_TABLE)
        .insert(syncChange)
        .select()
        .single();

      if (error) throw error;
      return data as SyncChange;
    } catch (error) {
      console.error('Error tracking change:', error);
      throw error;
    }
  }

  /**
   * Sync preferences across devices
   */
  async syncPreferences(userId: string, deviceId: string): Promise<{ synced: boolean; conflicts: SyncConflict[] }> {
    // Prevent concurrent syncs
    const existingSync = this.syncInProgress.get(userId);
    if (existingSync) {
      await existingSync;
    }

    const syncPromise = this._performSync(userId, deviceId);
    this.syncInProgress.set(userId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.syncInProgress.delete(userId);
    }
  }

  private async _performSync(userId: string, deviceId: string): Promise<{ synced: boolean; conflicts: SyncConflict[] }> {
    try {
      // Get pending changes from this device
      const { data: pendingChanges, error: changesError } = await supabase
        .from(SYNC_CHANGES_TABLE)
        .select('*')
        .eq('deviceId', deviceId)
        .eq('userId', userId)
        .is('syncedAt', null);

      if (changesError) throw changesError;

      // Get all other devices' recent changes
      const { data: remoteChanges, error: remoteError } = await supabase
        .from(SYNC_CHANGES_TABLE)
        .select('*')
        .eq('userId', userId)
        .neq('deviceId', deviceId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (remoteError) throw remoteError;

      // Detect conflicts
      const conflicts = this._detectConflicts(
        (pendingChanges || []) as SyncChange[],
        (remoteChanges || []) as SyncChange[]
      );

      // Resolve conflicts automatically when possible
      const resolved = await this._resolveConflicts(conflicts);

      // Mark synced changes
      if (pendingChanges && pendingChanges.length > 0) {
        const changeIds = (pendingChanges as SyncChange[]).map(c => c.id);
        await supabase
          .from(SYNC_CHANGES_TABLE)
          .update({ syncedAt: new Date() })
          .in('id', changeIds);
      }

      // Update last sync time
      await supabase
        .from(DEVICE_TABLE)
        .update({ lastSyncAt: new Date() })
        .eq('id', deviceId);

      return {
        synced: conflicts.length === 0 || (conflicts.length > 0 && resolved.length === conflicts.length),
        conflicts: conflicts.filter(c => !resolved.includes(c.id)),
      };
    } catch (error) {
      console.error('Error syncing preferences:', error);
      return { synced: false, conflicts: [] };
    }
  }

  /**
   * Detect conflicts between local and remote changes
   */
  private _detectConflicts(localChanges: SyncChange[], remoteChanges: SyncChange[]): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const localChange of localChanges) {
      const conflictingRemote = remoteChanges.find(
        rc =>
          rc.resourceId === localChange.resourceId &&
          rc.resourceType === localChange.resourceType &&
          rc.timestamp > localChange.timestamp - 5000 // 5 second window
      );

      if (conflictingRemote) {
        conflicts.push({
          id: `conflict_${Date.now()}_${Math.random()}`,
          resourceId: localChange.resourceId,
          resourceType: localChange.resourceType,
          deviceId: localChange.deviceId,
          otherDeviceId: conflictingRemote.deviceId,
          localVersion: localChange.data,
          remoteVersion: conflictingRemote.data,
          timestamp: new Date(),
          resolved: false,
          resolution: 'remote', // Default to most recent
        });
      }
    }

    return conflicts;
  }

  /**
   * Automatically resolve conflicts using smart strategies
   */
  private async _resolveConflicts(conflicts: SyncConflict[]): Promise<string[]> {
    const resolved: string[] = [];

    for (const conflict of conflicts) {
      let resolution = conflict.resolution;

      // Use smart resolution strategies
      if (conflict.resourceType === 'preferences') {
        // For preferences, prefer the more recent change
        resolution = 'remote';
      } else if (conflict.resourceType === 'settings') {
        // For settings, try to merge if possible
        resolution = 'merged';
      }

      try {
        await this._applyResolution(conflict, resolution);
        resolved.push(conflict.id);
      } catch (error) {
        console.error('Error resolving conflict:', error);
      }
    }

    return resolved;
  }

  /**
   * Apply conflict resolution
   */
  private async _applyResolution(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merged'): Promise<void> {
    const finalData = resolution === 'local' ? conflict.localVersion : conflict.remoteVersion;

    // Update conflict record
    await supabase
      .from(SYNC_CONFLICTS_TABLE)
      .update({
        resolved: true,
        resolution,
      })
      .eq('id', conflict.id);

    // Apply the resolved data to sync changes
    await supabase
      .from(SYNC_CHANGES_TABLE)
      .update({ data: finalData, syncedAt: new Date() })
      .eq('resourceId', conflict.resourceId)
      .eq('resourceType', conflict.resourceType);
  }

  /**
   * Get sync state for a user
   */
  async getSyncState(userId: string): Promise<SyncState> {
    const cached = this.syncState.get(userId);
    if (cached) return cached;

    try {
      const { data: pendingChanges, error: changesError } = await supabase
        .from(SYNC_CHANGES_TABLE)
        .select('*')
        .eq('userId', userId)
        .is('syncedAt', null);

      if (changesError) throw changesError;

      const { data: conflicts, error: conflictsError } = await supabase
        .from(SYNC_CONFLICTS_TABLE)
        .select('*')
        .eq('userId', userId)
        .eq('resolved', false);

      if (conflictsError) throw conflictsError;

      const state: SyncState = {
        lastSyncTime: Date.now(),
        pendingChanges: (pendingChanges || []) as SyncChange[],
        conflictedItems: (conflicts || []) as SyncConflict[],
        syncInProgress: false,
      };

      this.syncState.set(userId, state);
      return state;
    } catch (error) {
      console.error('Error getting sync state:', error);
      return {
        lastSyncTime: 0,
        pendingChanges: [],
        conflictedItems: [],
        syncInProgress: false,
      };
    }
  }

  /**
   * Mark device as active
   */
  async markDeviceActive(deviceId: string): Promise<void> {
    try {
      await supabase
        .from(DEVICE_TABLE)
        .update({
          isActive: true,
          lastSyncAt: new Date(),
        })
        .eq('id', deviceId);
    } catch (error) {
      console.error('Error marking device active:', error);
    }
  }
}

export const crossDeviceSyncManager = new CrossDeviceSyncManager();
