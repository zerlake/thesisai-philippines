'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPhaseById, getPhaseNavigation } from '@/lib/thesis-phases';
import { getIcon } from '@/lib/icon-resolver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Zap,
  Clock,
  Target,
  CheckCircle,
  Bot,
  Lock
} from 'lucide-react';
import ThesisFinalizer from '@/components/ThesisFinalizer';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { saveDraftToDatabase } from './save-draft';

export default function ThesisFinalizerPhase() {
  const router = useRouter();
  const phase = getPhaseById('finalizer'); // Static phase ID for this page
  const navigation = getPhaseNavigation('finalizer'); // Static navigation for this page
  const { profile, isLoading, session, supabase } = useAuth();
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && profile) {
      // Check if user has premium/pro status OR is an admin
      // Premium access includes: Pro + Advisor, Pro Complete (Pro alone is not sufficient)
      // Admin users get access to all premium features for development/testing purposes
      const hasPremium = profile.subscription_status === 'active' ||
                        profile.plan_type === 'premium' ||
                        profile.plan === 'pro_plus_advisor' ||
                        profile.plan === 'pro_complete' ||
                        profile.is_pro_user === true ||
                        profile.role === 'admin';
      setIsPremiumUser(hasPremium);
      setLoading(false);
    } else if (!isLoading) {
      // No profile means not logged in
      setLoading(false);
    }
  }, [profile, isLoading]);

  const handleSaveToTextEditor = async (finalDraft: string, openWithEditor: boolean = false) => {
    if (!session) {
      toast.error('You must be logged in to save drafts');
      return;
    }

    try {
      const userId = session.user.id;
      console.log('Client: Saving draft for user:', userId);

      // Call server action to save draft
      const result = await saveDraftToDatabase(userId, finalDraft);

      if (result.error) {
        console.error('Error from server:', result.error);
        toast.error(result.error);
        return;
      }

      if (!result.id) {
        toast.error('Failed to save draft');
        return;
      }

      console.log('Client: Received document ID:', result.id);
      toast.success('Draft saved! Redirecting to editor...');
      
      // Redirect to the draft editor after a short delay
      setTimeout(() => {
        router.push(`/drafts/${result.id}`);
      }, 800);
    } catch (err: any) {
      console.error('Error saving draft:', err?.message || err);
      toast.error(err?.message || 'Failed to save draft to editor');
    }
  };

  if (!phase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Phase Not Found</CardTitle>
            <CardDescription>Could not find the requested thesis phase.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/thesis-phases">Back to Thesis Phases</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Checking your subscription status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If not a premium user, show upgrade message
  if (!isPremiumUser) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/thesis-phases"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Phases
                </Link>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>/</span>
                  <span>{phase.phase}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Thesis Finalizer Pro
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              This premium feature is available exclusively for Premium and Pro subscribers
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Lock className="h-6 w-6 text-primary" />
                Premium Access Required
              </CardTitle>
              <CardDescription>
                Unlock advanced thesis finalization with our multi-agent AI system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Multi-Agent Processing</h4>
                    <p className="text-sm text-muted-foreground">Six specialized AI agents work in parallel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Chapter Integration</h4>
                    <p className="text-sm text-muted-foreground">Seamlessly integrate all chapters with consistent style</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Quality Assurance</h4>
                    <p className="text-sm text-muted-foreground">Final polish with grammar and academic tone improvements</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/pricing">
                    Upgrade to Premium
                  </Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Already a Premium user? <Link href="/login" className="text-primary hover:underline">Log in</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Premium user - show the full Thesis Finalizer Pro page
  const Icon = getIcon(phase.icon);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/thesis-phases"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                All Phases
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>/</span>
                <span>{phase.phase}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {navigation.previous && (
                <Button variant="outline" asChild>
                  <Link href={`/thesis-phases/${navigation.previous.id}`}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Link>
                </Button>
              )}
              {navigation.next && (
                <Button asChild>
                  <Link href={`/thesis-phases/${navigation.next.id}`}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className={`rounded-lg p-3 bg-gradient-to-r ${phase.color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="font-mono">
                  Phase {phase.phaseNumber}
                </Badge>
                <h1 className="text-4xl font-bold text-foreground">
                  {phase.title}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl">
                {phase.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tools Available</p>
                  <p className="text-2xl font-bold">{phase.toolsCount} tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phase Goal</p>
                  <p className="text-lg font-semibold">Final Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Time</p>
                  <p className="text-lg font-semibold">{phase.estimatedDuration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tool Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Thesis Finalizer Pro Tool
                </CardTitle>
                <CardDescription>
                  Upload all your thesis chapters and let our multi-agent AI system polish them into a cohesive final draft
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThesisFinalizer onSave={handleSaveToTextEditor} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Chapters</h4>
                      <p className="text-sm text-muted-foreground">Upload all your thesis chapters (minimum 3)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Multi-Agent Processing</h4>
                      <p className="text-sm text-muted-foreground">Six specialized AI agents work in parallel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Integration & Polish</h4>
                      <p className="text-sm text-muted-foreground">Final draft with improved flow and consistency</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Improved chapter flow and coherence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Consistent academic style and formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Validated citations and references</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Enhanced clarity and academic tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Time-saving automation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Phase Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phase.features.map((feature) => {
              const FeatureIcon = getIcon(feature.icon);
              return (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FeatureIcon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-border">
          {navigation.previous ? (
            <Button variant="outline" asChild>
              <Link href={`/thesis-phases/${navigation.previous.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Phase
              </Link>
            </Button>
          ) : (
            <div></div>
          )}
          {navigation.next ? (
            <Button asChild>
              <Link href={`/thesis-phases/${navigation.next.id}`}>
                Next Phase
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard">
                Return to Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}