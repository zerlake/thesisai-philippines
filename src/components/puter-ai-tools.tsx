import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TextQuote, Languages, SpellCheck } from 'lucide-react';
import { toast } from 'sonner';
import { usePuterContext } from '@/contexts/puter-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AIError, AuthenticationError, ValidationError } from '@/lib/errors';
import { puterAIFacade } from '@/lib/puter-ai-facade';

interface PuterAIToolsProps {
  editor: any; // Tiptap editor instance
  session: any; // Supabase session
}

export function PuterAITools({ editor, session }: PuterAIToolsProps) {
  const { puterReady, isAuthenticated, signIn, checkAuth } = usePuterContext();
  const [isProcessing, setIsProcessing] = useState({
    improve: false,
    summarize: false,
    rewrite: false
  });

  useEffect(() => {
    // Dependency on session.user to satisfy react-hooks/exhaustive-deps
    if (!session?.user) {
      return;
    }
  }, [session?.user]);

  const checkEditorAndAuth = async () => {
    if (!editor) {
      throw new ValidationError("Editor not available.");
    }

    if (!puterReady || typeof window === 'undefined' || !window.puter || !window.puter.ai) {
      throw new AIError("AI features are not available. Please wait for Puter to load.");
    }

    if (!isAuthenticated) {
      const confirmed = window.confirm("AI tools require authentication with Puter. Would you like to sign in now?");
      if (confirmed) {
        try {
          await signIn();
          await new Promise(resolve => setTimeout(resolve, 500));
          const updatedAuthStatus = await checkAuth();
          if (!updatedAuthStatus) {
            throw new AuthenticationError("Puter authentication failed. Please try again.");
          }
        } catch (error) {
          throw new AuthenticationError(`Puter sign-in failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // User chose not to sign in. We can just return false without an error.
        return false;
      }
    }

    if (!session) {
      throw new AuthenticationError("You must be logged in to use this feature.");
    }

    return true;
  };

  const handleImproveText = async () => {
    try {
      const canProceed = await checkEditorAndAuth();
      if (!canProceed) return;

      const { from, to } = editor.state.selection;
      let originalText = editor.state.doc.textBetween(from, to);

      if (!originalText) {
        toast.info("Please select some text to improve.");
        return;
      }

      const MAX_TEXT_LENGTH = 8000;
      if (originalText.length > MAX_TEXT_LENGTH) {
        originalText = originalText.substring(0, MAX_TEXT_LENGTH);
        toast.info("The selected text was truncated to fit within the AI's context limit.");
      }

      setIsProcessing(prev => ({ ...prev, improve: true }));

      const response = await puterAIFacade.call(
        'improve-writing',
        { text: originalText },
        session?.user ? { functions: { invoke: async () => ({}) } } : undefined,
        { timeout: 30000, retries: 2 }
      );

      if (!response.success) {
        throw new AIError(response.error || 'Failed to improve text');
      }

      const improvedText = response.data?.improved || response.data?.response;
      if (!improvedText?.trim()) {
        throw new AIError("AI returned an empty response");
      }

      editor.chain().focus().deleteRange({ from, to }).insertContent(improvedText).run();
      toast.success("Text improved with AI!");

    } catch (error: any) {
      const message = error instanceof AIError ? error.message : 
                      error instanceof AuthenticationError ? error.message :
                      error instanceof ValidationError ? error.message :
                      error?.message || 'Failed to improve text';
      toast.error(message);
    } finally {
      setIsProcessing(prev => ({ ...prev, improve: false }));
    }
  };

  const handleSummarizeText = async () => {
    try {
      const canProceed = await checkEditorAndAuth();
      if (!canProceed) return;

      const { from, to } = editor.state.selection;
      let originalText = editor.state.doc.textBetween(from, to);

      if (!originalText) {
        toast.info("Please select some text to summarize.");
        return;
      }

      const MAX_TEXT_LENGTH = 8000;
      if (originalText.length > MAX_TEXT_LENGTH) {
        originalText = originalText.substring(0, MAX_TEXT_LENGTH);
        toast.info("The selected text was truncated to fit within the AI's context limit.");
      }

      setIsProcessing(prev => ({ ...prev, summarize: true }));

      const response = await puterAIFacade.call(
        'summarize-text',
        { text: originalText },
        session?.user ? { functions: { invoke: async () => ({}) } } : undefined,
        { timeout: 30000, retries: 2 }
      );

      if (!response.success) {
        throw new AIError(response.error || 'Failed to summarize text');
      }

      const summarizedText = response.data?.summary || response.data?.response;
      if (!summarizedText?.trim()) {
        throw new AIError("AI returned an empty response");
      }

      editor.chain().focus().deleteRange({ from, to }).insertContent(summarizedText).run();
      toast.success("Text summarized with AI!");

    } catch (error: any) {
      const message = error instanceof AIError ? error.message : 
                      error instanceof AuthenticationError ? error.message :
                      error instanceof ValidationError ? error.message :
                      error?.message || 'Failed to summarize text';
      toast.error(message);
    } finally {
      setIsProcessing(prev => ({ ...prev, summarize: false }));
    }
  };

  const handleRewriteText = async (mode: string) => {
    try {
      const canProceed = await checkEditorAndAuth();
      if (!canProceed) return;

      const { from, to } = editor.state.selection;
      let originalText = editor.state.doc.textBetween(from, to);

      if (!originalText) {
        toast.info("Please select some text to rewrite.");
        return;
      }

      const MAX_TEXT_LENGTH = 8000;
      if (originalText.length > MAX_TEXT_LENGTH) {
        originalText = originalText.substring(0, MAX_TEXT_LENGTH);
        toast.info("The selected text was truncated to fit within the AI's context limit.");
      }

      setIsProcessing(prev => ({ ...prev, rewrite: true }));

      const response = await puterAIFacade.call(
        'improve-writing',
        { text: originalText },
        session?.user ? { functions: { invoke: async () => ({}) } } : undefined,
        { timeout: 30000, retries: 2 }
      );

      if (!response.success) {
        throw new AIError(response.error || 'Failed to rewrite text');
      }

      const rewrittenText = response.data?.improved || response.data?.response;
      if (!rewrittenText?.trim()) {
        throw new AIError("AI returned an empty response");
      }

      editor.chain().focus().deleteRange({ from, to }).insertContent(rewrittenText).run();
      toast.success("Text rewritten successfully!");

    } catch (error: any) {
      const message = error instanceof AIError ? error.message : 
                      error instanceof AuthenticationError ? error.message :
                      error instanceof ValidationError ? error.message :
                      error?.message || 'Failed to rewrite text';
      toast.error(message);
    } finally {
      setIsProcessing(prev => ({ ...prev, rewrite: false }));
    }
  };

  if (!puterReady) {
    return (
      <div className="flex items-center px-4 text-sm text-muted-foreground">
        Loading AI tools...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center px-4 text-sm text-muted-foreground">
        <Button onClick={signIn} size="sm" variant="outline">
          Sign in to use AI tools
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        onClick={handleImproveText}
        disabled={isProcessing.improve || !editor}
        variant="ghost"
      >
        <SpellCheck className="w-4 h-4 mr-2" />
        {isProcessing.improve ? "Fixing..." : "Fix Grammar"}
      </Button>
      <Button
        size="sm"
        onClick={handleSummarizeText}
        disabled={isProcessing.summarize || !editor}
        variant="ghost"
      >
        <TextQuote className="w-4 h-4 mr-2" />
        {isProcessing.summarize ? "Summarizing..." : "Summarize"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            disabled={isProcessing.rewrite || !editor} 
            variant="ghost"
          >
            <Languages className="w-4 h-4 mr-2" />
            {isProcessing.rewrite ? "Rewriting..." : "Rewrite"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => handleRewriteText('standard')}>
            Paraphrase
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleRewriteText('formal')}>
            Make More Formal
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleRewriteText('simple')}>
            Simplify
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleRewriteText('expand')}>
            Expand
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}