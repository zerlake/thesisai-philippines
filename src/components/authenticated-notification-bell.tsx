"use client";

import { useAuth } from "./auth-provider";
import { NotificationBell } from "./notification-bell";
import { useEffect, useState } from "react";

/**
 * Wrapper component that only renders NotificationBell when user is authenticated
 * This prevents Realtime setup attempts for unauthenticated users
 */
export function AuthenticatedNotificationBell() {
  const { session } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  // Only render if user is authenticated and component is mounted
  if (!isReady || !session?.access_token) {
    return null;
  }

  return <NotificationBell />;
}
