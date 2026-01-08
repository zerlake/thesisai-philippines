'use client';

import { Button } from './ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Plan = 'free' | 'pro' | 'pro_advisor' | 'pro_complete';

interface UpgradeButtonProps {
  plan?: Plan | null;
}

export function UpgradeButton({ plan }: UpgradeButtonProps) {
  // Pro Complete doesn't need upgrade button
  if (plan === 'pro_complete') {
    return null;
  }

  // If no plan or free/pro/pro_advisor, show upgrade button
  const getUpgradeContent = () => {
    switch (plan) {
      case 'free':
        return {
          buttonText: 'Upgrade to Pro',
          dialogTitle: 'Upgrade to Pro',
          description: 'Unlock advanced AI tools and chapter agents for your thesis research.',
          benefits: [
            'Advanced AI writing assistance',
            'Chapter agents for each thesis phase',
            'Enhanced research tools',
            'Priority support',
          ],
          ctaText: 'View Pro Plans',
        };
      case 'pro':
        return {
          buttonText: 'Upgrade to Pro+Advisor',
          dialogTitle: 'Upgrade to Pro+Advisor',
          description: 'Get direct messaging with advisors, comment tracking, and premium support.',
          benefits: [
            'Direct advisor messaging',
            'Advisor comment tracking',
            'Real-time feedback notifications',
            'Thesis Finalizer Pro',
            'Premium advisor collaboration',
          ],
          ctaText: 'View Pro+Advisor Plan',
        };
      case 'pro_advisor':
        return {
          buttonText: 'Upgrade to Pro Complete',
          dialogTitle: 'Upgrade to Pro Complete',
          description: 'Get everything in Pro+Advisor plus critic access and advanced features.',
          benefits: [
            'Everything in Pro+Advisor',
            'Critic manuscript review',
            'Advanced consistency checks',
            'Full collaboration suite',
            'Dedicated account manager',
          ],
          ctaText: 'View Pro Complete Plan',
        };
      default:
        return {
          buttonText: 'Upgrade',
          dialogTitle: 'Upgrade Your Plan',
          description: 'Unlock more features and accelerate your thesis research.',
          benefits: [
            'Advanced AI tools',
            'Enhanced collaboration',
            'Priority support',
          ],
          ctaText: 'View Plans',
        };
    }
  };

  const content = getUpgradeContent();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          size="sm"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">{content.buttonText}</span>
          <span className="sm:hidden">Upgrade</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            {content.dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="space-y-3 py-4">
          <p className="text-sm font-semibold text-foreground">What you'll get:</p>
          <ul className="space-y-2">
            {content.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <Link href="/pricing" className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {content.ctaText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
