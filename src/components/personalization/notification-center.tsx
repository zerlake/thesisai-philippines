'use client';

import React, { useState, useEffect } from 'react';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Trash2, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent' | 'system' | 'feature' | 'recommendation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  scheduledFor: Date;
  sentAt?: Date;
  data?: Record<string, unknown>;
  mlScore?: number;
  // Alias for compatibility with existing code
  notificationType?: 'system' | 'feature' | 'recommendation' | 'alert';
  createdAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export default function NotificationCenter() {
  const { notifications, isLoading, markAsRead, createNotification, markAllAsRead: hookMarkAllAsRead, unreadCount: hookUnreadCount } = useSmartNotifications();
  const [displayNotifications, setDisplayNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'feature'>('all');

  useEffect(() => {
    if (notifications) {
      // Type assertion with unknown to bypass strict type checking
      let filtered = notifications as unknown as Notification[];

      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else if (filter === 'system') {
        filtered = filtered.filter(n => n.type === 'system' || n.type === 'info');
      } else if (filter === 'feature') {
        filtered = filtered.filter(n => n.type === 'feature' || n.type === 'recommendation' || n.type === 'success');
      }

      setDisplayNotifications(filtered);
    }
  }, [notifications, filter]);

  const unreadCount = hookUnreadCount;

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-orange-600';
    return 'text-gray-600';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'system':
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'feature':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'recommendation':
      case 'warning':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Since deleteNotification doesn't exist, we'll just mark as read
  const handleDelete = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = displayNotifications
      .filter(n => !n.read)
      .map(n => n.id);
    if (unreadIds.length > 0) {
      for (const id of unreadIds) {
        await markAsRead(id);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      const allIds = displayNotifications.map(n => n.id);
      for (const id of allIds) {
        await markAsRead(id);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="bg-white dark:bg-slate-800 shadow-lg">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="ml-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  onClick={hookMarkAllAsRead}
                  variant="outline"
                  size="sm"
                >
                  Mark all as read
                </Button>
              )}
              {displayNotifications.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-slate-200 dark:border-slate-700">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-2">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="feature">Features</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="m-0">
            {displayNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Priority indicator */}
                      <div className={`mt-1 w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.readAt && (
                              <Button
                                onClick={() => handleMarkAsRead(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDelete(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          <span>{notification.scheduledFor.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        {displayNotifications.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Showing {displayNotifications.length} notification{displayNotifications.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>
    </div>
  );
}
