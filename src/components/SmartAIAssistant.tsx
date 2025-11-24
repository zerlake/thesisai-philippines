import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateSecureId } from '@/lib/crypto-utils';
import { 
  Lightbulb, 
  FileText, 
  MessageSquare, 
  Target, 
  AlertTriangle, 
  Loader2,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { type Editor } from '@tiptap/react';
import { Separator } from '@/components/ui/separator';

interface SmartAIAssistantProps {
  editor: Editor | null;
  documentContent: string;
  documentId: string;
}

interface WritingSuggestion {
  id: string;
  type: 'suggestion' | 'correction' | 'enhancement';
  originalText: string;
  suggestedText: string;
  reason: string;
  position: number;
}

interface ToneAnalysis {
  tone: string;
  confidence: number;
  suggestions: string[];
}

interface GrammarIssue {
  id: string;
  text: string;
  suggestion: string;
  rule: string;
  position: number;
}

export function SmartAIAssistant({
  editor,
  documentContent,
  documentId,
}: SmartAIAssistantProps) {
  const { session, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [_selectedSuggestion, _setSelectedSuggestion] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const callAIFunction = useCallback(async (functionName: string, body: object) => {
    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return null;
    }

    try {
      // For now, simulate the AI function calls with mock data
      // In a real implementation, these would call the actual Supabase functions
      switch (functionName) {
        case 'get-writing-suggestions':
          // Simulate some writing suggestions based on common issues
          return {
            suggestions: [
              {
                id: generateSecureId().substr(0, 9),
                type: 'enhancement',
                originalText: documentContent.substring(0, 50),
                suggestedText: documentContent.substring(0, 40) + ' [enhanced text]',
                reason: 'Improve clarity and academic tone'
              }
            ]
          };
        case 'check-grammar':
          // Simulate grammar checking
          return {
            issues: [
              {
                id: generateSecureId().substr(0, 9),
                text: 'This is an example',
                suggestion: 'This is an example of correct grammar',
                rule: 'Add descriptive language',
                position: 0
              }
            ]
          };
        case 'analyze-tone':
          return {
            tone: 'Academic Formal',
            confidence: 0.85,
            suggestions: [
              'Consider using more passive voice for objectivity',
              'Maintain consistent academic terminology',
              'Ensure all statements are properly supported by citations'
            ]
          };
        case 'process-custom-prompt':
          return {
            result: 'This is a simulated response to your custom prompt. In the full implementation, this would connect to an AI service.'
          };
        case 'rewrite-text':
          return {
            rewrittenText: 'This text has been rewritten with improved clarity and academic tone.'
          };
        default:
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: body
          });

          if (error) {
            throw new Error(error.message || `Failed to call ${functionName}.`);
          }
          return data;
      }
    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error);
      // For now, return mock data to allow UI to continue working
      if (functionName === 'get-writing-suggestions') {
        return { suggestions: [] };
      } else if (functionName === 'check-grammar') {
        return { issues: [] };
      } else if (functionName === 'analyze-tone') {
        return {
          tone: 'Academic',
          confidence: 0.7,
          suggestions: ['Maintain formal academic language throughout']
        };
      } else if (functionName === 'process-custom-prompt') {
        return { result: 'Sample AI response would appear here.' };
      } else if (functionName === 'rewrite-text') {
        return { rewrittenText: 'Improved version of the selected text.' };
      }
      return null;
      }
      }, [session, documentContent, supabase.functions]);

  const analyzeDocument = useCallback(async () => {
    if (!documentContent || !editor) return;
    
    setIsLoading(true);
    
    // Get writing suggestions
    const suggestionsData = await callAIFunction('get-writing-suggestions', {
      text: documentContent,
      documentId
    });
    
    if (suggestionsData && suggestionsData.suggestions) {
      setSuggestions(suggestionsData.suggestions.map((s: any) => ({
        id: s.id || generateSecureId().substr(0, 9),
        type: s.type || 'suggestion',
        originalText: s.originalText,
        suggestedText: s.suggestedText,
        reason: s.reason,
        position: s.position || 0
      })));
    }
    
    // Get grammar issues
    const grammarData = await callAIFunction('check-grammar', {
      text: documentContent
    });
    
    if (grammarData && grammarData.issues) {
      setGrammarIssues(grammarData.issues.map((g: any) => ({
        id: g.id || generateSecureId().substr(0, 9),
        text: g.text,
        suggestion: g.suggestion,
        rule: g.rule,
        position: g.position || 0
      })));
    }
    
    // Get tone analysis
    const toneData = await callAIFunction('analyze-tone', {
      text: documentContent
    });
    
    if (toneData && toneData.tone) {
      setToneAnalysis({
        tone: toneData.tone,
        confidence: toneData.confidence || 0,
        suggestions: toneData.suggestions || []
      });
    }
    
    setIsLoading(false);
  }, [documentContent, editor, callAIFunction, documentId]);

  useEffect(() => {
    // Only analyze if the document has content and it's been a while since last analysis
    if (documentContent && documentContent.length > 50) {
      const timer = setTimeout(() => {
        if (activeTab === 'suggestions') {
          analyzeDocument();
        }
      }, 1000); // Debounce the analysis to avoid too many calls
      
      return () => clearTimeout(timer);
    }
  }, [documentContent, activeTab, analyzeDocument]);

  const applySuggestion = (suggestion: WritingSuggestion) => {
    if (!editor) return;
    
    // Find the position in the document and replace the text
    // This is a simplified implementation - a real one would need to track positions more carefully
    const content = editor.getHTML();
    const newContent = content.replace(suggestion.originalText, suggestion.suggestedText);
    editor.commands.setContent(newContent);
    
    toast.success('Suggestion applied!');
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const applyGrammarCorrection = (issue: GrammarIssue) => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const newContent = content.replace(issue.text, issue.suggestion);
    editor.commands.setContent(newContent);
    
    toast.success('Grammar correction applied!');
    setGrammarIssues(prev => prev.filter(g => g.id !== issue.id));
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || !editor) return;
    
    setIsLoading(true);
    const data = await callAIFunction('process-custom-prompt', {
      text: documentContent,
      prompt: customPrompt
    });
    
    if (data && data.result) {
      // Insert the result at the current cursor position
      editor.commands.insertContent(data.result);
      toast.success('Response added to document!');
      setCustomPrompt('');
    }
    
    setIsLoading(false);
  };

  const handleRewriteSelection = async () => {
    if (!editor) return;
    
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');
    
    if (!selectedText.trim()) {
      toast.error('Please select some text to rewrite');
      return;
    }
    
    setIsLoading(true);
    const data = await callAIFunction('rewrite-text', {
      text: selectedText
    });
    
    if (data && data.rewrittenText) {
      editor.commands.insertContent(data.rewrittenText);
      toast.success('Text rewritten!');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle>Smart AI Assistant</CardTitle>
        </div>
        <CardDescription>Advanced writing assistance for your thesis</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="pt-4 space-y-4 max-h-96 overflow-y-auto">
            {isLoading && activeTab === 'suggestions' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="ml-2">Analyzing your document...</span>
              </div>
            )}
            
            {!isLoading && suggestions.length === 0 && grammarIssues.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="w-10 h-10 mx-auto mb-2" />
                <p>No suggestions at the moment</p>
                <p className="text-xs mt-1">Keep writing to see AI-powered suggestions</p>
              </div>
            )}
            
            {suggestions.map((suggestion) => (
              <Alert key={suggestion.id} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <AlertTitle className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Suggestion</span>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                      <div>
                        <p className="font-medium">Original:</p>
                        <p className="text-sm bg-secondary p-2 rounded">{suggestion.originalText}</p>
                      </div>
                      <div>
                        <p className="font-medium">Suggested:</p>
                        <p className="text-sm bg-primary/10 p-2 rounded">{suggestion.suggestedText}</p>
                      </div>
                      <p className="text-xs italic">{suggestion.reason}</p>
                    </AlertDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
            
            {grammarIssues.map((issue) => (
              <Alert key={issue.id} className="p-3 border-destructive">
                <div className="flex justify-between items-start">
                  <div>
                    <AlertTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span>Grammar Issue</span>
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                      <div>
                        <p className="font-medium">Issue:</p>
                        <p className="text-sm bg-destructive/10 p-2 rounded">{issue.text}</p>
                      </div>
                      <div>
                        <p className="font-medium">Correction:</p>
                        <p className="text-sm bg-primary/10 p-2 rounded">{issue.suggestion}</p>
                      </div>
                      <p className="text-xs italic">{issue.rule}</p>
                    </AlertDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => applyGrammarCorrection(issue)}
                    >
                      Fix
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </TabsContent>
          
          <TabsContent value="analysis" className="pt-4 space-y-4">
            {toneAnalysis ? (
              <div className="space-y-4">
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertTitle>Tone Analysis</AlertTitle>
                  <AlertDescription>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium">{toneAnalysis.tone}</span>
                      <span className="text-sm">{Math.round(toneAnalysis.confidence * 100)}% confidence</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {toneAnalysis.suggestions.map((s, i) => (
                        <p key={i} className="text-sm">• {s}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2">
                  <Label>Document Statistics</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-secondary p-2 rounded">Words: {documentContent.split(/\s+/).filter(Boolean).length}</div>
                    <div className="bg-secondary p-2 rounded">Characters: {documentContent.length}</div>
                    <div className="bg-secondary p-2 rounded">Sentences: {documentContent.split(/[.!?]+/).filter(s => s.trim()).length}</div>
                    <div className="bg-secondary p-2 rounded">Paragraphs: {documentContent.split(/\n\s*\n/).filter(p => p.trim()).length}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p>Analyzing document...</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tools" className="pt-4 space-y-4">
            <div className="space-y-3">
              <Label>Custom AI Prompt</Label>
              <Input
                placeholder="Ask AI to rewrite, summarize, or enhance..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
              />
              <Button 
                className="w-full" 
                onClick={handleCustomPrompt}
                disabled={isLoading || !customPrompt.trim()}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                <span className="ml-2">Send to AI</span>
              </Button>
            </div>
            
            <Separator />
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleRewriteSelection}
              disabled={isLoading}
            >
              <Target className="w-4 h-4" />
              <span className="ml-2">Rewrite Selected Text</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={analyzeDocument}
              disabled={isLoading}
            >
              <Search className="w-4 h-4" />
              <span className="ml-2">Re-analyze Document</span>
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}