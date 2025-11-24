import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TextQuote, Languages, SpellCheck, ChevronDown, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { usePuterContext } from '@/contexts/puter-context';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { AIError, AuthenticationError, ValidationError } from '@/lib/errors';

type WritingTone = 'formal' | 'professional' | 'conversational' | 'academic';
type TargetAudience = 'academic' | 'professional' | 'general' | 'expert';
type ComplexityLevel = 'advanced' | 'intermediate' | 'beginner';

interface PuterAIToolsProps {
  editor: any; // Tiptap editor instance
  session: any; // Supabase session
}

interface AdvancedOptions {
  tone: WritingTone;
  audience: TargetAudience;
  complexity: ComplexityLevel;
}

export function PuterAITools({ editor, session }: PuterAIToolsProps) {
  const { puterReady, isAuthenticated, signIn, checkAuth } = usePuterContext();
  const [isProcessing, setIsProcessing] = useState({
    improve: false,
    summarize: false,
    rewrite: false
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [options, setOptions] = useState<AdvancedOptions>({
    tone: 'academic',
    audience: 'academic',
    complexity: 'intermediate'
  });

  useEffect(() => {
    // Dependency on session.user to satisfy react-hooks/exhaustive-deps
    if (!session?.user) {
      return;
    }
  }, [session?.user]);

  const getToneInstruction = (tone: WritingTone): string => {
    const toneMap: Record<WritingTone, string> = {
      formal: 'Use formal, professional language with sophisticated vocabulary.',
      professional: 'Use professional language suitable for business or academic contexts.',
      conversational: 'Use conversational, accessible language that is easy to understand.',
      academic: 'Use academic language appropriate for scholarly writing.'
    };
    return toneMap[tone];
  };

  const getAudienceInstruction = (audience: TargetAudience): string => {
    const audienceMap: Record<TargetAudience, string> = {
      academic: 'Tailor the content for academic readers with subject matter expertise.',
      professional: 'Tailor the content for professional readers in the relevant field.',
      general: 'Tailor the content for a general audience without specialized knowledge.',
      expert: 'Tailor the content for expert specialists in the field.'
    };
    return audienceMap[audience];
  };

  const getComplexityInstruction = (complexity: ComplexityLevel): string => {
    const complexityMap: Record<ComplexityLevel, string> = {
      advanced: 'Use advanced vocabulary and complex sentence structures.',
      intermediate: 'Use moderately sophisticated vocabulary and varied sentence structures.',
      beginner: 'Use simple, clear language and straightforward sentence structures.'
    };
    return complexityMap[complexity];
  };

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

      const systemPrompt = `You are an expert academic editor. Your task is to revise the following text to improve its clarity, conciseness, and overall quality.
- Correct any grammatical errors.
- Rephrase awkward sentences.
- Do not change the core meaning of the text.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the improved text, with no additional comments or explanations.`;

      const prompt = `${systemPrompt}\n\nHere is the text to improve:\n\n---\n\n${originalText}`;

      const improvedText = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 2000 });

      // Update editor with improved text
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

      const systemPrompt = `You are an expert academic editor. Your task is to create a concise summary of the provided text.
- Keep the core meaning and important information.
- Make it significantly shorter while preserving key points.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the summarized text, with no additional comments or explanations.`;
      
      const prompt = `${systemPrompt}\n\nHere is the text to summarize:\n\n---\n\n${originalText}`;

      const summarizedText = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 1000 });

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

      let systemContent = '';
      switch (mode) {
        case 'formal':
          systemContent = `You are an expert academic editor. Your task is to rewrite the following text to make it more formal and suitable for academic work.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the rewritten text, with no additional comments or explanations.`;
          break;
        case 'simple':
          systemContent = `You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the simplified text, with no additional comments or explanations.`;
          break;
        case 'expand':
          systemContent = `You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be longer but proportional to the original.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the expanded text, with no additional comments or explanations.`;
          break;
        case 'standard':
        default:
          systemContent = `You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning.
- ${getToneInstruction(options.tone)}
- ${getAudienceInstruction(options.audience)}
- ${getComplexityInstruction(options.complexity)}
- Return only the paraphrased text, with no additional comments or explanations.`;
      }

      const prompt = `${systemContent}\n\nHere is the text to rewrite:\n\n---\n\n${originalText}`;

      const rewrittenText = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 2000 });

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

  const AdvancedOptionsDialog = () => (
    <Dialog open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced AI Options
          </DialogTitle>
          <DialogDescription>
            Customize the AI tools for your writing style and audience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Writing Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {(['formal', 'professional', 'conversational', 'academic'] as WritingTone[]).map(tone => (
                <button
                  key={tone}
                  onClick={() => setOptions({ ...options, tone })}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    options.tone === tone
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Audience Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {(['academic', 'professional', 'general', 'expert'] as TargetAudience[]).map(audience => (
                <button
                  key={audience}
                  onClick={() => setOptions({ ...options, audience })}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    options.audience === audience
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {audience.charAt(0).toUpperCase() + audience.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Language Complexity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as ComplexityLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => setOptions({ ...options, complexity: level })}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    options.complexity === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setShowAdvancedOptions(false)}
            className="w-full"
            variant="default"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

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
    <div className="flex gap-2 items-center">
      <div className="flex gap-1 flex-1">
        <Button
          size="sm"
          onClick={handleImproveText}
          disabled={isProcessing.improve || !editor}
          variant="ghost"
          title="Enhance clarity, grammar, and flow"
        >
          <SpellCheck className="w-4 h-4 mr-2" />
          {isProcessing.improve ? "Improving..." : "Improve"}
        </Button>
        <Button
          size="sm"
          onClick={handleSummarizeText}
          disabled={isProcessing.summarize || !editor}
          variant="ghost"
          title="Create a concise summary"
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
              title="Rewrite with different wording"
            >
              <Languages className="w-4 h-4 mr-2" />
              {isProcessing.rewrite ? "Rewriting..." : "Rewrite"}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => handleRewriteText('standard')}>
              📝 Paraphrase
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleRewriteText('formal')}>
              📋 Make More Formal
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleRewriteText('simple')}>
              ✨ Simplify
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleRewriteText('expand')}>
              📚 Expand & Elaborate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Advanced Options Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowAdvancedOptions(true)}
        title="Customize tone, audience, and complexity"
      >
        <Settings className="w-4 h-4" />
      </Button>

      <AdvancedOptionsDialog />
    </div>
  );
}