"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CustomerInfo } from '@revenuecat/purchases-js';
import {
  initializeRevenueCat,
  getCustomerInfo,
  hasProEntitlement,
  getOfferings,
  purchaseProduct,
  restorePurchases,
  identifyUser,
  ENTITLEMENT_PRO,
} from '@/lib/revenuecat';
import { useAuth } from '@/components/auth-provider';

interface RevenueCatContextType {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  hasProAccess: boolean;
  offerings: any;

  // Methods
  refresh: () => Promise<void>;
  purchase: (productId: string) => Promise<void>;
  restore: () => Promise<void>;

  // Error
  error: string | null;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const user = session?.user;
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [hasProAccess, setHasProAccess] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize RevenueCat
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize RevenueCat (will use anonymous ID if no user)
        await initializeRevenueCat(user?.id);

        setIsInitialized(true);

        // Load initial data
        await loadCustomerData();
      } catch (err) {
        console.error('[RevenueCat] Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize RevenueCat');
      } finally {
        setIsLoading(false);
      }
    };

    // Only initialize once
    if (!isInitialized) {
      initialize();
    }
  }, []);

  // Handle user login/logout
  useEffect(() => {
    const handleUserChange = async () => {
      if (!isInitialized) return;

      try {
        if (user?.id) {
          // User logged in - identify them
          await identifyUser(user.id);
          await loadCustomerData();
        }
      } catch (err) {
        console.error('[RevenueCat] User identification error:', err);
      }
    };

    handleUserChange();
  }, [user?.id, isInitialized]);

  // Load customer data
  const loadCustomerData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get customer info
      const info = await getCustomerInfo();
      setCustomerInfo(info);

      // Check Pro entitlement
      const hasPro = await hasProEntitlement();
      setHasProAccess(hasPro);

      // Get offerings
      const availableOfferings = await getOfferings();
      setOfferings(availableOfferings);

      console.log('[RevenueCat] Customer data loaded', {
        hasProAccess: hasPro,
        offeringsCount: availableOfferings?.all ? Object.keys(availableOfferings.all).length : 0,
      });
    } catch (err) {
      console.error('[RevenueCat] Failed to load customer data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh customer info
  const refresh = useCallback(async () => {
    await loadCustomerData();
  }, [loadCustomerData]);

  // Purchase a product
  const purchase = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await purchaseProduct(productId);

      // Refresh customer info after purchase
      await loadCustomerData();
    } catch (err) {
      console.error('[RevenueCat] Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Purchase failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomerData]);

  // Restore purchases
  const restore = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await restorePurchases();

      // Refresh customer info after restore
      await loadCustomerData();
    } catch (err) {
      console.error('[RevenueCat] Restore error:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadCustomerData]);

  const value: RevenueCatContextType = {
    isInitialized,
    isLoading,
    customerInfo,
    hasProAccess,
    offerings,
    refresh,
    purchase,
    restore,
    error,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

// Hook to use RevenueCat context
export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider');
  }
  return context;
}

// Hook to check Pro entitlement
export function useProEntitlement() {
  const { hasProAccess, isLoading } = useRevenueCat();
  return { hasProAccess, isLoading };
}

// Hook to get subscription details
export function useSubscription() {
  const { customerInfo, hasProAccess, isLoading } = useRevenueCat();

  if (!customerInfo || !hasProAccess) {
    return {
      isActive: false,
      productId: null,
      expirationDate: null,
      willRenew: false,
      isLifetime: false,
      isLoading,
    };
  }

  const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_PRO];

  return {
    isActive: true,
    productId: proEntitlement?.productIdentifier || null,
    expirationDate: proEntitlement?.expirationDate || null,
    willRenew: proEntitlement?.willRenew || false,
    isLifetime: proEntitlement?.productIdentifier === 'lifetime',
    isLoading,
  };
}
