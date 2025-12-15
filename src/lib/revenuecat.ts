/**
 * RevenueCat Configuration
 * Web SDK integration for ThesisAI Philippines
 */

import { Purchases } from '@revenuecat/purchases-js';

// RevenueCat API Key (Test)
const REVENUECAT_API_KEY = 'test_VwFWFtbcuwcFfKiaQsRVNbrCsVp';

// Entitlement identifier
export const ENTITLEMENT_PRO = 'ThesisAI Philippines Pro';

// Product identifiers
export const PRODUCTS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

export type ProductType = typeof PRODUCTS[keyof typeof PRODUCTS];

// Singleton instance
let purchasesInstance: Purchases | null = null;

/**
 * Initialize RevenueCat SDK
 * Should be called once when the app loads
 */
export async function initializeRevenueCat(userId?: string): Promise<Purchases> {
  if (purchasesInstance) {
    return purchasesInstance;
  }

  try {
    // Configure RevenueCat with anonymous ID if no user ID provided
    const appUserId = userId || `anonymous_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    purchasesInstance = await Purchases.configure(REVENUECAT_API_KEY, appUserId);

    console.log('[RevenueCat] Initialized successfully with user:', appUserId);
    return purchasesInstance;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    throw new Error('Failed to initialize RevenueCat');
  }
}

/**
 * Get the current Purchases instance
 * Throws error if not initialized
 */
export function getPurchases(): Purchases {
  if (!purchasesInstance) {
    throw new Error('RevenueCat not initialized. Call initializeRevenueCat() first.');
  }
  return purchasesInstance;
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
  return purchasesInstance !== null;
}

/**
 * Identify user with RevenueCat
 * Call this after user logs in
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    const purchases = getPurchases();
    // Note: Web SDK may not support logIn method like mobile SDKs
    // This would need to be handled differently for web implementation
    console.log('[RevenueCat] User identified (stub):', userId);
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error);
    throw error;
  }
}

/**
 * Log out current user
 */
export async function logoutUser(): Promise<void> {
  try {
    const purchases = getPurchases();
    // Note: Web SDK may not support logOut method like mobile SDKs
    // This would need to be handled differently for web implementation
    console.log('[RevenueCat] User logged out (stub)');
  } catch (error) {
    console.error('[RevenueCat] Failed to logout user:', error);
    throw error;
  }
}

/**
 * Get current customer info
 */
export async function getCustomerInfo() {
  try {
    const purchases = getPurchases();
    const customerInfo = await purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    throw error;
  }
}

/**
 * Check if user has active Pro entitlement
 */
export async function hasProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    const entitlements = customerInfo.entitlements.active;
    return ENTITLEMENT_PRO in entitlements;
  } catch (error) {
    console.error('[RevenueCat] Failed to check entitlement:', error);
    return false;
  }
}

/**
 * Get available offerings (products)
 */
export async function getOfferings() {
  try {
    const purchases = getPurchases();
    const offerings = await purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    throw error;
  }
}

/**
 * Purchase a product
 * Web SDK uses collectPurchase instead of purchase
 */
export async function purchaseProduct(productId: string) {
  try {
    const purchases = getPurchases();

    // For Web SDK, we need to handle the purchase flow differently
    // This is a placeholder - actual implementation depends on your payment processor
    console.log('[RevenueCat] Purchase initiated for product:', productId);

    // In a real implementation, you would:
    // 1. Create a checkout session with your payment processor (Stripe, etc.)
    // 2. After successful payment, call collectPurchase with the receipt

    // For now, return a mock response
    throw new Error('Purchase flow not fully implemented. Please set up payment processor in RevenueCat dashboard.');
  } catch (error) {
    console.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore purchases
 * Web SDK doesn't have restorePurchases - it syncs automatically
 * We just refresh the customer info
 */
export async function restorePurchases() {
  try {
    const purchases = getPurchases();
    // Web SDK auto-syncs, so we just get the latest customer info
    const customerInfo = await purchases.getCustomerInfo();
    console.log('[RevenueCat] Customer info refreshed');
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to refresh customer info:', error);
    throw error;
  }
}

/**
 * Get subscription status details
 */
export async function getSubscriptionStatus() {
  try {
    const customerInfo = await getCustomerInfo();
    const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_PRO];

    if (!proEntitlement) {
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false,
      };
    }

    return {
      isActive: true,
      productId: proEntitlement.productIdentifier,
      expirationDate: proEntitlement.expirationDate,
      willRenew: proEntitlement.willRenew,
      isLifetime: proEntitlement.productIdentifier === PRODUCTS.LIFETIME,
    };
  } catch (error) {
    console.error('[RevenueCat] Failed to get subscription status:', error);
    return {
      isActive: false,
      productId: null,
      expirationDate: null,
      willRenew: false,
    };
  }
}
