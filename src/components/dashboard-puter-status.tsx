'use client';

import { useEffect, useState } from 'react';
import { usePuterContext } from '@/contexts/puter-context';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react';

export function DashboardPuterStatus() {
  const { puterReady, isAuthenticated, puterUser, loading, initializePuter, signIn, signOut } = usePuterContext();
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize Puter SDK on mount
  useEffect(() => {
    const initPuter = async () => {
      if (!puterReady && !isInitializing) {
        setIsInitializing(true);
        try {
          await initializePuter();
        } catch (error) {
          console.error('Failed to initialize Puter:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initPuter();
  }, [puterReady, initializePuter, isInitializing]);

  const handleSignIn = async () => {
    try {
      await signIn();
      toast.success('Successfully signed in to Puter');
    } catch (error) {
      toast.error('Failed to sign in: ' + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out from Puter');
    } catch (error) {
      toast.error('Failed to sign out: ' + (error as Error).message);
    }
  };

  if (!puterReady || isInitializing || loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Initializing AI...</span>
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            AI Connected
          </span>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="gap-2"
          title={`Signed in as ${puterUser?.username || puterUser?.name || 'User'}`}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <AlertCircle className="w-4 h-4" />
      <span>Connect AI</span>
    </Button>
  );
}
