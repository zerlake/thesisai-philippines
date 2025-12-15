"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Crown,
  Calendar,
  CreditCard,
  RefreshCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useRevenueCat, useSubscription } from '@/contexts/revenuecat-context';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function RevenueCatCustomerCenter() {
  const { customerInfo, restore, isLoading, error } = useRevenueCat();
  const subscription = useSubscription();
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      toast.loading('Restoring purchases...', { id: 'restore' });

      await restore();

      toast.success('Purchases restored successfully!', { id: 'restore' });
    } catch (err) {
      console.error('Restore error:', err);
      toast.error('Failed to restore purchases. Please try again.', { id: 'restore' });
    } finally {
      setIsRestoring(false);
    }
  };

  // Format expiration date
  const formatExpirationDate = (date: string | Date | null) => {
    if (!date) return 'N/A';
    try {
      return format(date instanceof Date ? date : new Date(date), 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  // Get subscription type label
  const getSubscriptionTypeLabel = (productId: string | null) => {
    if (!productId) return 'N/A';
    if (productId.includes('monthly')) return 'Monthly Subscription';
    if (productId.includes('yearly')) return 'Annual Subscription';
    if (productId.includes('lifetime')) return 'Lifetime Access';
    return productId;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading subscription details...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pro Status Card */}
      {subscription.isActive ? (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                <CardTitle>ThesisAI Pro</CardTitle>
              </div>
              <Badge className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            <CardDescription>
              You have access to all premium features
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Subscription Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Plan Type</span>
                </div>
                <p className="font-semibold">
                  {getSubscriptionTypeLabel(subscription.productId)}
                </p>
              </div>

              {!subscription.isLifetime && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Renewal Date</span>
                  </div>
                  <p className="font-semibold">
                    {formatExpirationDate(subscription.expirationDate)}
                  </p>
                  {subscription.willRenew && (
                    <p className="text-xs text-muted-foreground">
                      Auto-renews on this date
                    </p>
                  )}
                </div>
              )}

              {subscription.isLifetime && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>Access</span>
                  </div>
                  <p className="font-semibold">Lifetime</p>
                  <p className="text-xs text-muted-foreground">
                    No expiration date
                  </p>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {!subscription.isLifetime && !subscription.willRenew && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will not renew. You'll have access until{' '}
                  {formatExpirationDate(subscription.expirationDate)}.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Restore Purchases
                  </>
                )}
              </Button>

              {/* Link to manage subscription (would open app store/play store) */}
              {!subscription.isLifetime && (
                <Button variant="outline" asChild>
                  <a
                    href="https://revenuecat.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Manage Subscription
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>
              You're currently using the free version of ThesisAI
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro to unlock all premium features and get unlimited access to AI-powered research tools.
            </p>

            <Button
              variant="outline"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Restore Purchases
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Customer Info Debug (Development only) */}
      {process.env.NODE_ENV === 'development' && customerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer Info (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold mb-2">
                View Raw Customer Info
              </summary>
              <pre className="overflow-auto bg-muted p-2 rounded">
                {JSON.stringify(customerInfo, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
