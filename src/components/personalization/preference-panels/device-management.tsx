'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardCustomization } from '@/hooks/useDashboardCustomization';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smartphone, Laptop, Tablet, Clock, Trash2, CheckCircle } from 'lucide-react';

interface Device {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  osName?: string;
  browserName?: string;
  lastSeen?: string;
  isTrusted?: boolean;
  isActive?: boolean;
}

export default function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/personalization/devices');
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrustDevice = async (deviceId: string) => {
    try {
      // Call trust device API
      const response = await fetch(`/api/personalization/devices/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrusted: true })
      });

      if (response.ok) {
        setDevices(devices.map(d =>
          d.id === deviceId ? { ...d, isTrusted: true } : d
        ));
      }
    } catch (error) {
      console.error('Failed to trust device:', error);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      try {
        setDeletingId(deviceId);
        const response = await fetch(`/api/personalization/devices/${deviceId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setDevices(devices.filter(d => d.id !== deviceId));
        }
      } catch (error) {
        console.error('Failed to remove device:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
      default:
        return <Laptop className="w-5 h-5" />;
    }
  };

  const formatLastSeen = (date?: string) => {
    if (!date) return 'Never';
    const lastDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - lastDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Active Devices */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Connected Devices ({devices.length})
        </h3>

        {devices.length === 0 ? (
          <Card className="p-6 text-center border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">
              No devices registered yet. This device will be registered on next login.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {devices.map((device) => (
              <Card
                key={device.id}
                className="p-6 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {getDeviceIcon(device.deviceType)}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {device.deviceName}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {device.osName && `${device.osName}`}
                        {device.browserName && ` • ${device.browserName}`}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Last seen: {formatLastSeen(device.lastSeen)}
                        </div>

                        {device.isTrusted && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Trusted
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!device.isTrusted && (
                      <Button
                        onClick={() => handleTrustDevice(device.id)}
                        variant="outline"
                        size="sm"
                      >
                        Trust
                      </Button>
                    )}

                    <Button
                      onClick={() => handleRemoveDevice(device.id)}
                      disabled={deletingId === device.id}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {deletingId === device.id ? (
                        'Removing...'
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Device Sync Info */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Cross-Device Sync
        </h3>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Your preferences are automatically synced across all your devices</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Changes made on any device appear within seconds on others</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Conflicts are automatically resolved using the most recent change</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Trust a device to enable additional sync features</span>
          </div>
        </div>
      </Card>

      {/* Security Info */}
      <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Security:</strong> Only devices you trust have access to all your data. Untrusted devices have limited sync capabilities.
        </p>
      </Card>

      {/* What is Synced */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          What Gets Synced
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Theme Settings</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Dark mode, colors, fonts</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Preferences</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Layout, notifications, privacy</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Dashboard Layout</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Widget arrangement & settings</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Accessibility</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">Accessibility settings</p>
          </div>
        </div>
      </Card>

      {/* Manual Sync Button */}
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        Force Sync Now
      </Button>
    </div>
  );
}
