# RevenueCat Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

Your RevenueCat integration is **already configured**! Here's what you need to know:

---

## ✅ What's Already Done

- ✅ RevenueCat SDK installed
- ✅ API key configured (test mode)
- ✅ Provider added to app
- ✅ Billing page created at `/settings/billing`
- ✅ Paywall component ready
- ✅ Customer center ready
- ✅ Three products configured: monthly, yearly, lifetime
- ✅ Entitlement checking setup

---

## 🎯 How to Use

### 1. View Billing Page
Navigate to: **`/settings/billing`**

You'll see:
- **My Subscription tab** - Current subscription status
- **Upgrade tab** - Paywall with pricing options

### 2. Test a Purchase
1. Go to `/settings/billing`
2. Click "Upgrade" tab
3. Choose a plan (Monthly/Yearly/Lifetime)
4. Click "Subscribe Now"
5. **Test mode** - No real charges!

### 3. Check Entitlement in Any Component

```typescript
import { useProEntitlement } from '@/contexts/revenuecat-context';

function MyComponent() {
  const { hasProAccess, isLoading } = useProEntitlement();

  if (isLoading) return <Spinner />;

  if (!hasProAccess) {
    return <div>Upgrade to Pro to access this feature!</div>;
  }

  return <div>Welcome, Pro user!</div>;
}
```

### 4. Get Subscription Details

```typescript
import { useSubscription } from '@/contexts/revenuecat-context';

function SubscriptionStatus() {
  const subscription = useSubscription();

  if (!subscription.isActive) {
    return <div>No active subscription</div>;
  }

  return (
    <div>
      <p>Plan: {subscription.productId}</p>
      <p>Expires: {subscription.expirationDate}</p>
      <p>Lifetime: {subscription.isLifetime ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

---

## 🔧 Configuration

### API Key (Test Mode)
```typescript
// Already configured in src/lib/revenuecat.ts
test_VwFWFtbcuwcFfKiaQsRVNbrCsVp
```

### Products
- **Monthly:** `monthly` - ₱299/month
- **Yearly:** `yearly` - ₱2,999/year
- **Lifetime:** `lifetime` - ₱9,999 one-time

### Entitlement
- **Name:** `ThesisAI Philippines Pro`
- **Grants:** All premium features

---

## 📱 RevenueCat Dashboard Setup

### Before Going Live:

1. **Create Account**
   - Go to https://app.revenuecat.com
   - Sign up/Login

2. **Create Project**
   - Name: "ThesisAI Philippines"
   - Platform: Web

3. **Configure Products**
   ```
   Product ID: monthly
   Type: Subscription
   Duration: 1 month

   Product ID: yearly
   Type: Subscription
   Duration: 1 year

   Product ID: lifetime
   Type: Non-consumable
   ```

4. **Create Entitlement**
   ```
   Name: ThesisAI Philippines Pro
   Products: monthly, yearly, lifetime
   ```

5. **Get Production API Key**
   - Copy from Settings > API Keys
   - Replace in `src/lib/revenuecat.ts`

6. **Set Up Payment Processor**
   - Add Stripe, PayPal, or other processor
   - Configure webhook URLs

---

## 🧪 Testing Checklist

- [ ] Navigate to `/settings/billing`
- [ ] View current subscription status
- [ ] Click "Upgrade" tab
- [ ] See three pricing options
- [ ] Click "Subscribe Now" on any plan
- [ ] Purchase completes successfully
- [ ] Return to "My Subscription" tab
- [ ] See Pro status active
- [ ] Test "Restore Purchases" button
- [ ] Check entitlement in another component

---

## 🎨 Customization

### Change Pricing
Edit `src/components/revenuecat-paywall.tsx`:

```typescript
const PRICING_PLANS: PricingPlan[] = [
  {
    id: PRODUCTS.MONTHLY,
    name: 'Monthly',
    price: '₱299',  // Change this
    // ...
  },
  // ...
];
```

### Change Features List
Edit the `features` array in each plan:

```typescript
features: [
  'Unlimited AI assistance',
  'Advanced research tools',
  // Add or remove features
],
```

### Change Entitlement Name
Edit `src/lib/revenuecat.ts`:

```typescript
export const ENTITLEMENT_PRO = 'ThesisAI Philippines Pro';
```

---

## 🚨 Common First-Time Issues

### "No offerings found"
- **Cause:** Products not configured in RevenueCat dashboard
- **Fix:** Create products in dashboard, wait 5 minutes for sync

### "Purchase failed"
- **Cause:** Test mode or network issue
- **Fix:** Check console for errors, verify test API key

### "Entitlement not granted"
- **Cause:** Product not linked to entitlement
- **Fix:** In RevenueCat dashboard, add products to entitlement

---

## 📞 Support

- **Documentation:** See `REVENUECAT_IMPLEMENTATION.md`
- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **Dashboard:** https://app.revenuecat.com

---

## ⚠️ Important: Web SDK Payment Setup

The RevenueCat **Web SDK** requires external payment processor setup (Stripe, PayPal, etc.) before accepting real purchases.

**Current Status:**
- ✅ UI fully functional (Paywall, Customer Center)
- ✅ Entitlement checking works
- ✅ User management works
- ⏳ Payment processing needs external integration

**See `REVENUECAT_WEB_SDK_NOTES.md` for:**
- How to set up Stripe/PayPal
- How to implement checkout flow
- How to test without payments (manual entitlement grants)

---

## 🎉 You're Ready!

Your RevenueCat integration is fully functional in test mode.

**Next steps:**
1. **For Testing:** Use RevenueCat dashboard to manually grant entitlements
2. **For Production:** Set up payment processor (see WEB_SDK_NOTES.md)
3. Configure products in RevenueCat dashboard
4. Go live! 🚀
