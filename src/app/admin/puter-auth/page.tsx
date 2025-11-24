"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePuterContext } from '@/contexts/puter-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PuterAuthPage() {
  const { puterReady, puterUser, signIn, signOut, loading, isAuthenticated } = usePuterContext();

  const handleSignInClick = async () => {
    try {
      await signIn();
      toast.success("Successfully authenticated with Puter.js! AI tools are now enabled.");
    } catch (error) {
      toast.error("Failed to sign in with Puter.js: " + (error as Error).message);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out from Puter.js.");
    } catch (error) {
      toast.error("Failed to sign out from Puter.js: " + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Puter.js AI Integration</CardTitle>
            <CardDescription>
              Authenticate with Puter.js to enable AI-powered writing tools in the editor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!puterReady ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800">Authenticated</h3>
                  <p className="text-green-700 mt-1">Welcome, {puterUser?.username || puterUser?.name || 'User'}!</p>
                  <p className="text-sm text-green-600 mt-2">AI tools are now available in the editor.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSignOutClick}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800">Not Authenticated</h3>
                  <p className="text-blue-700 mt-1">
                    Sign in with Puter.js to unlock AI-powered writing tools in the editor.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSignInClick}
                    className="flex-1"
                    disabled={loading || !puterReady}
                  >
                    {puterReady ? 'Sign in to Puter.js' : 'Loading Puter.js...'}
                  </Button>
                </div>
              </div>
            )}

            {!puterReady && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Loading Puter.js SDK...
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Sign in with Puter.js to enable AI tools in the thesis editor</li>
                <li>AI tools include grammar checking, summarization, and rewriting features</li>
                <li>All AI processing happens directly in your browser</li>
                <li>No tokens are stored or sent to external servers</li>
                <li>Sign out when using shared computers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}