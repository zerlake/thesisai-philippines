# RevenueCat Integration - Complete Implementation Guide

## 🎯 Overview

This document provides a complete guide for the RevenueCat implementation in ThesisAI Philippines. RevenueCat handles subscription management, in-app purchases, and entitlement checking.

**API Key (Test):** `test_VwFWFtbcuwcFfKiaQsRVNbrCsVp`
**Entitlement:** `ThesisAI Philippines Pro`
**Products:** `monthly`, `yearly`, `lifetime`

---

## 📦 Installation

```bash
# Install RevenueCat Web SDK
pnpm add @revenuecat/purchases-js

# Install date-fns (for date formatting)
pnpm add date-fns
```

---

## 🏗️ Architecture

### File Structure

```
src/
├── lib/
│   └── revenuecat.ts                    # Core RevenueCat configuration
├── contexts/
│   └── revenuecat-context.tsx           # React Context provider
├── components/
│   ├── revenuecat-paywall.tsx           # Paywall UI
│   └── revenuecat-customer-center.tsx   # Customer center UI
└── app/
    ├── layout.tsx                       # Provider setup
    └── (app)/
        └── settings/
            └── billing/
                └── page.tsx             # Billing page
```

---

## 🔧 Core Configuration (`src/lib/revenuecat.ts`)

### Key Features:
- ✅ Singleton pattern for SDK instance
- ✅ User identification
- ✅ Customer info retrieval
- ✅ Entitlement checking
- ✅ Purchase and restore functionality
- ✅ Subscription status details

### Usage:

```typescript
import {
  initializeRevenueCat,
  hasProEntitlement,
  purchaseProduct,
  getCustomerInfo,
} from '@/lib/revenuecat';

// Initialize (done automatically in provider)
await initializeRevenueCat(userId);

// Check entitlement
const hasPro = await hasProEntitlement();

// Purchase product
await purchaseProduct('monthly');

// Get customer info
const info = await getCustomerInfo();
```

---

## 🎯 Context Provider (`src/contexts/revenuecat-context.tsx`)

### Features:
- ✅ Automatic initialization on mount
- ✅ User identification on auth change
- ✅ Real-time customer info
- ✅ Pro entitlement checking
- ✅ Purchase and restore methods
- ✅ Error handling and loading states

### Custom Hooks:

#### `useRevenueCat()`
Main hook for accessing RevenueCat state and methods.

```typescript
const {
  isInitialized,  // SDK initialization status
  isLoading,      // Loading state
  customerInfo,   // Full customer info
  hasProAccess,   // Pro entitlement status
  offerings,      // Available products
  refresh,        // Refresh customer data
  purchase,       // Purchase a product
  restore,        // Restore purchases
  error,          // Error message
} = useRevenueCat();
```

#### `useProEntitlement()`
Simplified hook for checking Pro access.

```typescript
const { hasProAccess, isLoading } = useProEntitlement();

if (isLoading) return <Spinner />;
if (!hasProAccess) return <PaywallPrompt />;
return <ProFeature />;
```

#### `useSubscription()`
Get detailed subscription information.

```typescript
const {
  isActive,        // Is subscription active?
  productId,       // Current product ID
  expirationDate,  // Expiration date
  willRenew,       // Will auto-renew?
  isLifetime,      // Is lifetime purchase?
  isLoading,       // Loading state
} = useSubscription();
```

---

## 💳 Paywall Component (`src/components/revenuecat-paywall.tsx`)

### Features:
- ✅ Three pricing tiers (Monthly, Yearly, Lifetime)
- ✅ Philippine Peso pricing (₱)
- ✅ Popular badge on recommended plan
- ✅ Savings indicators
- ✅ Feature comparison
- ✅ Loading states during purchase
- ✅ Error handling with toast notifications
- ✅ Trust indicators (cancel anytime, secure payment, etc.)

### Usage:

```typescript
import { RevenueCatPaywall } from '@/components/revenuecat-paywall';

<RevenueCatPaywall />
```

### Pricing:
- **Monthly:** ₱299/month
- **Yearly:** ₱2,999/year (Save 17%, 2 months free)
- **Lifetime:** ₱9,999 one-time (Best deal)

---

## 👤 Customer Center (`src/components/revenuecat-customer-center.tsx`)

### Features:
- ✅ Subscription status display
- ✅ Pro/Free plan indicator
- ✅ Subscription details (plan type, expiration, renewal)
- ✅ Restore purchases button
- ✅ Manage subscription link
- ✅ Lifetime vs recurring indicator
- ✅ Debug mode for development

### Usage:

```typescript
import { RevenueCatCustomerCenter } from '@/components/revenuecat-customer-center';

<RevenueCatCustomerCenter />
```

### Displays:
- Current plan (Pro/Free)
- Plan type (Monthly/Yearly/Lifetime)
- Renewal date (for recurring subscriptions)
- Auto-renewal status
- Restore purchases action
- Manage subscription link

---

## 📄 Billing Page (`src/app/settings/billing/page.tsx`)

### Features:
- ✅ Two tabs: "My Subscription" and "Upgrade"
- ✅ Current subscription status
- ✅ Upgrade options (Paywall)
- ✅ Features comparison table
- ✅ FAQ section
- ✅ Test mode indicator (development)

### Access:
Navigate to `/settings/billing` to view the billing page.

### Sections:
1. **My Subscription Tab:**
   - Current subscription status
   - Plan details
   - Restore purchases
   - Free vs Pro features comparison

2. **Upgrade Tab:**
   - Full paywall with pricing
   - Purchase buttons
   - Feature lists

3. **FAQ:**
   - Cancellation policy
   - Payment methods
   - Plan switching
   - Refund policy

---

## 🔐 Provider Setup (`src/app/layout.tsx`)

The RevenueCatProvider is automatically included in the app layout:

```typescript
<AuthProvider>
  <RevenueCatProvider>
    <RootLayoutClient>{children}</RootLayoutClient>
    <Toaster />
  </RevenueCatProvider>
</AuthProvider>
```

**Important:** RevenueCatProvider must be nested inside AuthProvider to access user information.

---

## 🧪 Testing Guide

### 1. Test Mode Setup
The integration uses a test API key, so no real charges occur.

```typescript
// Test API Key (already configured)
const REVENUECAT_API_KEY = 'test_VwFWFtbcuwcFfKiaQsRVNbrCsVp';
```

### 2. Testing Purchases

1. Navigate to `/settings/billing`
2. Click "Upgrade" tab
3. Click "Subscribe Now" on any plan
4. Accept the purchase (test mode)
5. Check "My Subscription" tab for activation

### 3. Testing Restore

1. Click "Restore Purchases" button
2. Check for success message
3. Verify subscription status updates

### 4. Testing Entitlements

```typescript
// In any component
const { hasProAccess } = useProEntitlement();

{hasProAccess ? (
  <ProFeature />
) : (
  <UpgradePrompt />
)}
```

### 5. Debug Mode

In development, additional debug information is shown:
- RevenueCat offerings JSON
- Customer info JSON
- Test mode alerts

---

## 🎨 UI Components Reference

### Paywall
- **Location:** `/settings/billing` (Upgrade tab)
- **Features:** Pricing cards, purchase buttons, trust indicators
- **State:** Handles loading, success, and error states

### Customer Center
- **Location:** `/settings/billing` (My Subscription tab)
- **Features:** Subscription details, restore button, manage link
- **State:** Shows active/inactive status

---

## 🔑 Key Functions

### Initialize RevenueCat
```typescript
await initializeRevenueCat(userId);
```

### Check Entitlement
```typescript
const hasPro = await hasProEntitlement();
```

### Purchase Product
```typescript
await purchaseProduct('monthly');  // or 'yearly' or 'lifetime'
```

### Restore Purchases
```typescript
await restorePurchases();
```

### Get Customer Info
```typescript
const info = await getCustomerInfo();
```

### Get Offerings
```typescript
const offerings = await getOfferings();
```

---

## 📱 Products Configuration

### Monthly Subscription
- **Product ID:** `monthly`
- **Price:** ₱299/month
- **Billing:** Recurring monthly

### Yearly Subscription
- **Product ID:** `yearly`
- **Price:** ₱2,999/year
- **Billing:** Recurring yearly
- **Savings:** 17% (2 months free)

### Lifetime Purchase
- **Product ID:** `lifetime`
- **Price:** ₱9,999
- **Billing:** One-time payment
- **Access:** Forever

---

## 🛡️ Entitlement

**Entitlement ID:** `ThesisAI Philippines Pro`

Features included with Pro:
- ✅ Unlimited AI assistance
- ✅ Advanced research tools
- ✅ Premium templates
- ✅ Priority support
- ✅ All future updates
- ✅ Extended cloud storage
- ✅ Advanced analytics
- ✅ Exclusive webinars (Yearly)
- ✅ Priority feature requests (Lifetime)
- ✅ VIP support (Lifetime)

---

## 🚀 Going to Production

### 1. Update API Key
Replace test key with production key:

```typescript
// In src/lib/revenuecat.ts
const REVENUECAT_API_KEY = 'prod_YOUR_PRODUCTION_KEY';
```

### 2. Configure Products in RevenueCat Dashboard
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create products:
   - `monthly` - Monthly subscription
   - `yearly` - Yearly subscription
   - `lifetime` - Non-consumable purchase
3. Set up entitlement: `ThesisAI Philippines Pro`
4. Link products to entitlement

### 3. Set Up Payment Processor
Configure Stripe, PayPal, or other payment processors in RevenueCat dashboard.

### 4. Test Production Environment
1. Use sandbox accounts
2. Verify purchases work
3. Test restore functionality
4. Check entitlement granting

### 5. Update Pricing
Adjust prices in:
- `src/components/revenuecat-paywall.tsx`
- RevenueCat dashboard

---

## 🐛 Common Issues

### Issue: "RevenueCat not initialized"
**Solution:** Ensure RevenueCatProvider is in layout and initialized before use.

### Issue: Purchases not showing
**Solution:** Call `restore()` or refresh customer info.

### Issue: Entitlement not granted
**Solution:** Check product-entitlement mapping in RevenueCat dashboard.

### Issue: User ID not syncing
**Solution:** Ensure `identifyUser()` is called after login.

---

## 📊 Best Practices

1. **Always check entitlements on the backend** - Client-side checks can be bypassed
2. **Cache customer info** - Reduce API calls with context provider
3. **Handle errors gracefully** - Show user-friendly messages
4. **Test restore flow** - Users expect purchases to sync across devices
5. **Use test mode** - Never use production keys in development
6. **Monitor logs** - RevenueCat provides detailed analytics

---

## 📚 Resources

- [RevenueCat Web SDK Docs](https://www.revenuecat.com/docs/getting-started/installation/web-sdk)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Paywall Best Practices](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center Guide](https://www.revenuecat.com/docs/tools/customer-center)

---

## ✅ Implementation Checklist

- [x] Install RevenueCat SDK
- [x] Create configuration file
- [x] Set up Context Provider
- [x] Implement Paywall component
- [x] Implement Customer Center
- [x] Create billing page
- [x] Add provider to layout
- [x] Configure test API key
- [x] Set up products (monthly, yearly, lifetime)
- [x] Configure entitlement checking
- [x] Add error handling
- [x] Implement restore purchases
- [ ] Configure production API key
- [ ] Set up payment processor
- [ ] Test in production sandbox
- [ ] Go live!

---

## 🎉 Summary

Your RevenueCat integration is complete and ready to use! Navigate to `/settings/billing` to see it in action.

**Next Steps:**
1. Test the billing page locally
2. Configure products in RevenueCat dashboard
3. Set up payment processor
4. Replace test API key with production key
5. Launch! 🚀
