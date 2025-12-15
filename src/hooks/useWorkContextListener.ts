"use client";

import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useWorkContextListener(
  onContextChange: () => void,
  options?: {
    debounceMs?: number;
    enabled?: boolean;
  }
) {
  const { supabase, session } = useAuth();
  const debounceMs = options?.debounceMs ?? 500;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!session?.user.id || !enabled) return;

    let debounceTimeout: NodeJS.Timeout;
    let subscriptions: RealtimeChannel[] = [];

    const handleContextChange = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        console.debug('[useWorkContextListener] Context changed, refreshing...');
        onContextChange();
      }, debounceMs);
    };

    // Subscribe to documents table changes
    const docsSubscription = supabase
      .channel(`documents:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.debug('[useWorkContextListener] Document change detected:', payload.eventType);
          handleContextChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug('[useWorkContextListener] Subscribed to documents');
        } else if (status === 'CLOSED') {
          console.debug('[useWorkContextListener] Documents subscription closed');
        }
      });

    subscriptions.push(docsSubscription);

    // Subscribe to work context table changes
    const contextSubscription = supabase
      .channel(`student_work_context:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_work_context',
          filter: `student_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.debug('[useWorkContextListener] Work context change detected:', payload.eventType);
          handleContextChange();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug('[useWorkContextListener] Subscribed to work context');
        }
      });

    subscriptions.push(contextSubscription);

    // Cleanup on unmount
    return () => {
      clearTimeout(debounceTimeout);
      subscriptions.forEach((sub) => {
        supabase.removeChannel(sub);
      });
    };
  }, [session?.user.id, supabase, onContextChange, debounceMs, enabled]);
}
