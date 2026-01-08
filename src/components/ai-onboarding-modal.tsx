'use client';

import { useEffect, useState } from 'react';
import { usePuterContext } from '@/contexts/puter-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Zap, Brain, BarChart3, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export function AIOnboardingModal() {
  const { isAuthenticated, signIn } = usePuterContext();
  const [isOpen, setIsOpen] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Show modal on first visit if not authenticated
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('aiOnboardingShown');
    setHasSeenOnboarding(!!hasSeenModal);

    if (!hasSeenModal && !isAuthenticated) {
      // Delay to let page load naturally
      const showTimer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('aiOnboardingShown', 'true');
      }, 1500);

      return () => clearTimeout(showTimer);
    }
  }, [isAuthenticated]);

  // Auto-hide modal after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 8000);
      setAutoHideTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    setIsOpen(false);
  };

  const handleConnectAI = async () => {
    try {
      await signIn();
      toast.success('AI successfully connected!');
      handleClose();
    } catch (error) {
      toast.error('Failed to connect AI: ' + (error as Error).message);
    }
  };

  if (!isOpen || isAuthenticated) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto shadow-2xl animate-in slide-in-from-bottom-4 zoom-in-95">
          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Connect AI</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Unlock powerful AI features across all tools
                </CardDescription>
              </div>
              <button
                onClick={handleClose}
                className="mt-1 p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features List */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Wand2 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Writing Assistant</p>
                  <p className="text-xs text-muted-foreground">Improve, rewrite, and perfect your content</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Smart Analysis</p>
                  <p className="text-xs text-muted-foreground">Get AI-powered insights on your research</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Enhanced Tools</p>
                  <p className="text-xs text-muted-foreground">AI support in all research and writing tools</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleConnectAI}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Connect AI Now
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                I'll do it later
              </Button>
            </div>

            {/* Timer indicator */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse animation-delay-100" />
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse animation-delay-200" />
              </div>
              <span>This message closes automatically</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
