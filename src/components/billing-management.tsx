"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, UserCheck, PiggyBank, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

const plans = [
  {
    name: "Free",
    price: "₱0",
    description: "Perfect for getting started and exploring core features.",
    features: [
      "3 Documents",
      "Basic AI Assistance",
      "10 Originality Checks per month",
      "Standard Support",
    ],
    planId: 'free',
  },
  {
    name: "Pro",
    price: "₱499",
    description: "Unlock the full power of ThesisAI for serious researchers.",
    features: [
      "Unlimited Documents",
      "Advanced AI Assistance",
      "Unlimited Originality Checks",
      "Priority Support",
    ],
    planId: 'pro',
  },
  {
    name: "Pro + Advisor",
    price: "₱799",
    description: "All Pro features, plus seamless collaboration with your advisor.",
    features: [
      "All features from Pro",
      "Connect with one online advisor",
      "Share documents for feedback",
      "Track milestones with your advisor",
    ],
    planId: 'pro_plus_advisor',
  },
];

export function BillingManagement() {
  const { profile, session, supabase, refreshProfile } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const currentPlan = profile?.plan || 'free';
  const creditBalance = Number(profile?.credit_balance || 0);

  const handleUpgrade = async (planId: string) => {
    if (!session) {
      toast.error("You must be logged in to upgrade.");
      return;
    }
    setIsUpgrading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-coinbase-charge', {
        body: { planId }
      });

      if (error) {
        let detailedMessage = error.message;
        if (error.context && typeof error.context.json === 'function') {
          try {
            const errorBody = await error.context.json();
            if (errorBody.error) detailedMessage = errorBody.error;
          } catch (e) {
            console.error("Failed to parse JSON from edge function error response", e);
          }
        }
        throw new Error(detailedMessage);
      }
      if (data.error) throw new Error(data.error);

      if (data.success) {
        toast.success(data.message);
        await refreshProfile();
      } else if (data.hosted_url) {
        window.location.href = data.hosted_url;
      }

    } catch (err: any) {
      toast.error(err.message || "Failed to start upgrade process.");
    } finally {
      setIsUpgrading(null);
    }
  };

  const showComingSoonToast = (method: string) => {
    toast.info(`${method} payments are coming soon!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing & Plan</CardTitle>
          <CardDescription>
            Manage your subscription and view your current plan details.
          </CardDescription>
        </CardHeader>
      </Card>

      {creditBalance > 0 && (
        <Alert>
          <PiggyBank className="h-4 w-4" />
          <AlertTitle>You have ₱{creditBalance.toFixed(2)} in referral credits!</AlertTitle>
          <AlertDescription>
            This amount will be automatically applied to your next subscription payment.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col", currentPlan === plan.planId && "border-primary")}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-4xl font-bold">{plan.price}<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-4 w-4 text-green-500 mt-1 flex-shrink-0" /> <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentPlan === plan.planId ? (
                <Button disabled className="w-full">Current Plan</Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full" disabled={!!isUpgrading}>
                      {isUpgrading === plan.planId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (plan.planId === 'pro_plus_advisor' ? <UserCheck className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />)}
                      {isUpgrading === plan.planId ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuLabel>Choose Payment Method</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => handleUpgrade(plan.planId)}>
                      Pay with Crypto (Coinbase)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => showComingSoonToast('Paddle')}>
                      Pay with Paddle <Badge variant="outline" className="ml-auto">Soon</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => showComingSoonToast('GCash')}>
                      Pay with GCash <Badge variant="outline" className="ml-auto">Soon</Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => showComingSoonToast('SeaBank')}>
                      Pay with SeaBank <Badge variant="outline" className="ml-auto">Soon</Badge>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}