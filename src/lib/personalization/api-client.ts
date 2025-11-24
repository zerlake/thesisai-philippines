/**
 * API Client for Personalization System
 * Handles all HTTP communication with personalization endpoints
 */

import { UserPreferences, UserDevice, SyncChange, Notification, DashboardLayout } from './validation';

const BASE_URL = '/api/personalization';

class ApiError extends Error {
  constructor(
    public status: number,
    public endpoint: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Personalization API Client
 */
export class PersonalizationApiClient {
  private baseUrl: string;
  private timeout: number = 30000; // 30 seconds

  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        response.status,
        response.url,
        error.error || `HTTP ${response.status}`
      );
    }

    return response.json();
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<Partial<UserPreferences>> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/preferences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return this.handleResponse(response);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<Partial<UserPreferences>> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });

    return this.handleResponse(response);
  }

  /**
   * Get specific preference section
   */
  async getPreferenceSection(section: string): Promise<Record<string, any>> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/preferences/${section}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Update specific preference section
   */
  async updatePreferenceSection(
    section: string,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/preferences/${section}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Get user devices
   */
  async getDevices(): Promise<UserDevice[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await this.handleResponse<{ devices: UserDevice[] }>(response);
    return data.devices;
  }

  /**
   * Register new device
   */
  async registerDevice(device: Partial<UserDevice>): Promise<UserDevice> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(device)
    });

    return this.handleResponse(response);
  }

  /**
   * Update device (e.g., trust status)
   */
  async updateDevice(
    deviceId: string,
    updates: Partial<UserDevice>
  ): Promise<UserDevice> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/devices/${deviceId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Remove device
   */
  async removeDevice(deviceId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/devices/${deviceId}`,
      {
        method: 'DELETE'
      }
    );

    await this.handleResponse(response);
  }

  /**
   * Get sync changes
   */
  async getSyncChanges(unsynced = false): Promise<SyncChange[]> {
    const query = unsynced ? '?synced=false' : '';
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/sync${query}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await this.handleResponse<{ changes: SyncChange[] }>(response);
    return data.changes;
  }

  /**
   * Create sync change
   */
  async createSyncChange(change: Partial<SyncChange>): Promise<SyncChange> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(change)
    });

    return this.handleResponse(response);
  }

  /**
   * Mark changes as synced
   */
  async markSynced(changeIds: string[]): Promise<SyncChange[]> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/sync`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ changeIds })
    });

    const data = await this.handleResponse<{ updated: SyncChange[] }>(response);
    return data.updated;
  }

  /**
   * Get notifications
   */
  async getNotifications(
    unread = false,
    limit = 50
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (unread) params.append('unread', 'true');
    params.append('limit', limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/notifications${query}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await this.handleResponse<{ notifications: Notification[] }>(response);
    return data.notifications;
  }

  /**
   * Create notification
   */
  async createNotification(
    notification: Partial<Notification>
  ): Promise<Notification> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/notifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Update notifications (read, unread, delete)
   */
  async updateNotifications(
    notificationIds: string[],
    action: 'read' | 'unread' | 'delete'
  ): Promise<{ success: boolean; action: string; updated?: Notification[] }> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/notifications`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds, action })
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Get dashboard layouts
   */
  async getDashboardLayouts(
    defaultOnly = false
  ): Promise<{ layouts: DashboardLayout[]; default: DashboardLayout | null }> {
    const query = defaultOnly ? '?default=true' : '';
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/dashboard${query}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Save dashboard layout
   */
  async saveDashboardLayout(
    layout: Partial<DashboardLayout>
  ): Promise<DashboardLayout> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/dashboard`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(layout)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * Delete dashboard layout
   */
  async deleteDashboardLayout(layoutId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/dashboard?id=${layoutId}`,
      {
        method: 'DELETE'
      }
    );

    await this.handleResponse(response);
  }

  /**
   * Export user data
   */
  async exportUserData(): Promise<Blob> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/export`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.url, 'Failed to export data');
    }

    return response.blob();
  }

  /**
   * Delete user data
   */
  async deleteUserData(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await this.handleResponse(response);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET'
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new PersonalizationApiClient();

// Export error class
export { ApiError };
