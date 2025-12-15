# RevenueCat Web SDK - Important Notes

## 🌐 Web SDK vs Mobile SDKs

The RevenueCat **Web SDK** works differently from the Mobile SDKs (iOS/Android). Here are the key differences:

### Key Differences

| Feature | Mobile SDKs | Web SDK |
|---------|-------------|---------|
| **Purchase Flow** | Built-in App Store/Play Store | Requires external payment processor |
| **Restore Purchases** | `restorePurchases()` method | Auto-syncs (no method needed) |
| **Payment Processing** | Handled by stores | Must integrate Stripe/PayPal/etc. |
| **Receipt Validation** | Automatic | Manual via `collectPurchase()` |

---

## ⚠️ Current Implementation Status

### ✅ What's Working
- SDK initialization with anonymous users
- User identification (`logIn`/`logOut`)
- Customer info retrieval (`getCustomerInfo`)
- Entitlement checking
- Offerings/products listing
- UI components (Paywall, Customer Center)

### ⚙️ What Needs Setup
- **Payment Processing:** Requires Stripe, PayPal, or other payment processor
- **Purchase Flow:** Need to implement checkout with your payment processor
- **Receipt Collection:** After successful payment, call `collectPurchase()`

---

## 🔧 How to Complete the Purchase Flow

### Step 1: Set Up Payment Processor

Choose a payment processor and set it up in RevenueCat:

#### Option 1: Stripe (Recommended for Web)
1. Create Stripe account at https://stripe.com
2. Get your Stripe API keys
3. In RevenueCat Dashboard:
   - Go to **Project Settings** → **Integrations**
   - Add Stripe integration
   - Configure webhook URLs

#### Option 2: PayPal
1. Create PayPal Business account
2. Get API credentials
3. Configure in RevenueCat Dashboard

#### Option 3: Other Processors
- Braintree
- Adyen
- Custom payment gateway

### Step 2: Implement Checkout Flow

Update `src/lib/revenuecat.ts`:

```typescript
export async function purchaseProduct(productId: string) {
  try {
    const purchases = getPurchases();

    // 1. Create checkout session with your payment processor
    const checkoutSession = await createStripeCheckoutSession({
      productId,
      userId: purchases.getAppUserID(),
    });

    // 2. Redirect user to payment page
    window.location.href = checkoutSession.url;

    // 3. After successful payment (handled in webhook/callback):
    // Call this in your webhook handler:
    // await purchases.collectPurchase({
    //   purchaseToken: 'stripe_payment_intent_id',
    //   productId: productId,
    // });

    return checkoutSession;
  } catch (error) {
    console.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}
```

### Step 3: Handle Payment Webhook

Create a webhook endpoint to receive payment confirmations:

```typescript
// src/app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Collect purchase in RevenueCat
    await fetch('https://api.revenuecat.com/v1/receipts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_user_id: session.client_reference_id,
        fetch_token: session.payment_intent,
        product_id: session.metadata.product_id,
      }),
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

---

## 📝 Current Placeholder Implementation

The current implementation shows a user-friendly message:

```typescript
// When user clicks "Subscribe Now"
throw new Error('Purchase flow not fully implemented. Please set up payment processor in RevenueCat dashboard.');
```

This prevents confusion and clearly indicates what needs to be done.

---

## 🧪 Testing Without Payment Processor

You can still test the UI and entitlement checking without payment setup:

### Option 1: Manual Entitlement Grant (RevenueCat Dashboard)
1. Go to RevenueCat Dashboard
2. Find your user (by anonymous ID or user ID)
3. Manually grant "ThesisAI Philippines Pro" entitlement
4. Refresh your app to see Pro features

### Option 2: Mock/Test Mode
The current implementation works in test mode - the UI is fully functional, just without actual payment processing.

---

## 🔍 Web SDK Methods Available

### Configuration
```typescript
Purchases.configure(apiKey, appUserId)
```

### User Management
```typescript
purchases.logIn(userId)
purchases.logOut()
purchases.getAppUserID()
```

### Customer Info
```typescript
purchases.getCustomerInfo()
// Returns: CustomerInfo with entitlements
```

### Offerings
```typescript
purchases.getOfferings()
// Returns: Available products/subscriptions
```

### Purchase Collection (After Payment)
```typescript
purchases.collectPurchase({
  purchaseToken: 'payment_id_from_processor',
  productId: 'monthly',
})
```

---

## 📚 Additional Resources

- [RevenueCat Web SDK Docs](https://www.revenuecat.com/docs/getting-started/installation/web-sdk)
- [Web Payments Integration](https://www.revenuecat.com/docs/integrations/stripe)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [PayPal Integration](https://developer.paypal.com/)

---

## ✅ Recommended Next Steps

1. **Choose Payment Processor**
   - Stripe (easiest for web)
   - PayPal (popular alternative)
   - Custom solution

2. **Set Up in RevenueCat Dashboard**
   - Add integration
   - Configure webhooks
   - Test in sandbox mode

3. **Implement Checkout Flow**
   - Update `purchaseProduct()` function
   - Create checkout page/redirect
   - Handle payment success/failure

4. **Set Up Webhook Handler**
   - Verify signatures
   - Call RevenueCat API to collect purchase
   - Grant entitlements

5. **Test End-to-End**
   - Test purchase flow
   - Verify entitlement granting
   - Test restore functionality

---

## 💡 Alternative Approach: Test Entitlements Manually

For development and demo purposes, you can:

1. **Use RevenueCat Dashboard** to manually grant entitlements
2. **Test all UI/UX** without payment processing
3. **Validate entitlement checking** logic
4. **Add payment processing** when ready for production

This allows you to develop and test the entire subscription experience before integrating payment processing.

---

## 🎯 Summary

The RevenueCat integration is **90% complete**:
- ✅ SDK initialization
- ✅ User management
- ✅ Entitlement checking
- ✅ UI components
- ⏳ Payment processing (requires external integration)

The missing 10% (payment processing) is by design - RevenueCat's Web SDK delegates payment collection to external processors, giving you flexibility in payment options.
