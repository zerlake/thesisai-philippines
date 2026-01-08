'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Plan = 'free' | 'pro' | 'pro_advisor' | 'pro_complete';

interface MessagingFeatureGateProps {
  plan?: Plan | null;
  children?: React.ReactNode;
}

export function MessagingFeatureGate({ plan, children }: MessagingFeatureGateProps) {
  // Messaging is only available for pro_advisor and pro_complete plans
  const isMessagingEnabled = plan === 'pro_advisor' || plan === 'pro_complete';
  
  // Show nothing for free subscribers
  if (plan === 'free') {
    return null;
  }

  // Show upgrade prompt for pro subscribers
  if (plan === 'pro') {
    return (
      <Card className="lg:col-span-3 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Messages & Conversations</span>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Premium messaging with advisors and critics
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white dark:bg-background border border-amber-200 dark:border-amber-900">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Premium Feature
                </h3>
                <p className="text-sm text-muted-foreground">
                  Real-time messaging with your thesis advisor and critics is only available in <span className="font-semibold text-foreground">Pro+Advisor</span> and <span className="font-semibold text-foreground">Pro Complete</span> plans.
                </p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock:
                </p>
                <ul className="text-sm space-y-2 ml-4">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Direct messaging with advisors and critics
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Real-time notifications for feedback
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Message history and search
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href="/pricing" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Plan
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For pro_advisor and pro_complete, show the messaging feature
  if (isMessagingEnabled) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Messages & Conversations</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Chat with your advisor, critic, and other collaborators
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            {children}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: show nothing (shouldn't reach here)
  return null;
}
