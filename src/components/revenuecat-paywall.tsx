"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Crown, Zap, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useRevenueCat } from '@/contexts/revenuecat-context';
import { toast } from 'sonner';
import { PRODUCTS } from '@/lib/revenuecat';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: PRODUCTS.MONTHLY,
    name: 'Monthly',
    description: 'Perfect for trying out',
    price: '₱299',
    period: 'per month',
    features: [
      'Unlimited AI assistance',
      'Advanced research tools',
      'Premium templates',
      'Priority support',
      'All future updates',
    ],
  },
  {
    id: PRODUCTS.YEARLY,
    name: 'Yearly',
    description: 'Best value',
    price: '₱2,999',
    period: 'per year',
    popular: true,
    savings: 'Save 17%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Extended cloud storage',
      'Advanced analytics',
      'Exclusive webinars',
    ],
  },
  {
    id: PRODUCTS.LIFETIME,
    name: 'Lifetime',
    description: 'One-time payment',
    price: '₱9,999',
    period: 'forever',
    savings: 'Best Deal',
    features: [
      'Everything in Yearly',
      'Lifetime access',
      'No recurring fees',
      'Priority feature requests',
      'VIP support',
    ],
  },
];

export function RevenueCatPaywall() {
  const { purchase, isLoading, error, offerings } = useRevenueCat();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(PRODUCTS.YEARLY);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (productId: string) => {
    try {
      setIsPurchasing(true);
      setSelectedPlan(productId);

      toast.loading('Initiating purchase...', { id: 'purchase' });

      await purchase(productId);

      toast.success('Purchase successful! Welcome to ThesisAI Pro!', { id: 'purchase' });
    } catch (err) {
      console.error('Purchase error:', err);

      // Check if it's the "not implemented" error
      if (err instanceof Error && err.message.includes('not fully implemented')) {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Payment Setup Required</p>
            <p className="text-sm">
              To accept payments, please configure your payment processor (Stripe, PayPal, etc.)
              in the RevenueCat dashboard.
            </p>
          </div>,
          { id: 'purchase', duration: 8000 }
        );
      } else {
        toast.error(
          err instanceof Error ? err.message : 'Purchase failed. Please try again.',
          { id: 'purchase' }
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Upgrade to ThesisAI Pro</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Unlock all premium features and supercharge your research
        </p>
      </div>

      {/* Setup Notice for Development */}
      {process.env.NODE_ENV === 'development' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> The Web SDK requires payment processor setup
            (Stripe, PayPal, etc.) in RevenueCat dashboard before accepting real purchases.
            Currently showing UI preview.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isProcessing = isPurchasing && isSelected;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-primary shadow-lg scale-105'
                  : isSelected
                  ? 'border-2 border-primary'
                  : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period.split(' ')[1]}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {plan.savings}
                    </Badge>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isProcessing || (isPurchasing && !isSelected)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {plan.id === PRODUCTS.LIFETIME ? 'Buy Lifetime Access' : 'Subscribe Now'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust Indicators */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="grid gap-6 md:grid-cols-3 text-center">
          <div className="space-y-1">
            <Check className="w-6 h-6 mx-auto text-green-600" />
            <p className="font-semibold">Cancel Anytime</p>
            <p className="text-sm text-muted-foreground">No long-term commitment</p>
          </div>
          <div className="space-y-1">
            <Check className="w-6 h-6 mx-auto text-green-600" />
            <p className="font-semibold">Secure Payment</p>
            <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
          </div>
          <div className="space-y-1">
            <Check className="w-6 h-6 mx-auto text-green-600" />
            <p className="font-semibold">Money-Back Guarantee</p>
            <p className="text-sm text-muted-foreground">30-day refund policy</p>
          </div>
        </div>
      </div>

      {/* Offerings Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && offerings && (
        <Alert>
          <AlertDescription>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold">
                RevenueCat Offerings (Debug)
              </summary>
              <pre className="mt-2 overflow-auto">
                {JSON.stringify(offerings, null, 2)}
              </pre>
            </details>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
