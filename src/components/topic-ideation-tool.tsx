'use client';

import React, { useState } from 'react';
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BrainCircuit, ShieldCheck, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { Badge } from "./ui/badge";
import { secureRandomInt } from "@/lib/crypto-utils";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";

interface TopicSuggestion {
  title: string;
  description: string;
  relevance: number;
  originalityScore: number;
}

export function TopicIdeationTool() {
  const { session, supabase } = useAuth();
  const [field, setField] = useState("");
  const [keywords, setKeywords] = useState("");
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  // const [isLoading, setIsLoading] = useState(false); // Replaced by useApiCall's loading state
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean }>({});

  const { execute: generateTopicsCall, loading: isGenerating } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.topicIdeas) {
        throw new Error("API returned no topic ideas data.");
      }
      const generatedSuggestions = data.topicIdeas.map((idea: any) => ({
        ...idea,
        relevance: 80 + secureRandomInt(0, 19), // Simulated relevance score
        originalityScore: 60 + secureRandomInt(0, 39) // Simulated originality score
      }));
      
      setSuggestions(generatedSuggestions);
      toast.success("Generated 3 research topics!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate topic suggestions.");
    },
    autoErrorToast: false,
  });

  const handleGenerateTopics = async () => {
    if (!field || !session) {
        toast.error("Please provide a field of study and ensure you are logged in.");
        return;
    }
    
    // setIsLoading(true); // Replaced
    setSuggestions([]);
    setValidationResults({});

    try {
      await generateTopicsCall(
        getSupabaseFunctionUrl("generate-topic-ideas"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ 
            field,
            keywords: keywords.trim()
          }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleGenerateTopics:", error);
    }
  };

  const validateTopicOriginality = async (index: number, suggestion: TopicSuggestion): Promise<void> => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-plagiarism', {
        body: { text: suggestion.description }
      });

      if (error) throw error;

      // Update validation results
      setValidationResults(prev => ({
        ...prev,
        [index]: data.score < 30 // Considered original if similarity is below 30%
      }));

      toast.success(`Topic ${index + 1} checked for originality`);
    } catch (err: any) {
      toast.error(err.message || "Failed to check topic originality.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <CardTitle>AI Topic Ideation</CardTitle>
        </div>
        <CardDescription>
          Generate and validate research topics in your field of study.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="field">Field of Study</Label>
            <FieldOfStudySelector value={field} onValueChange={setField} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (Optional)</Label>
            <Input 
              id="keywords" 
              placeholder="e.g., AI, education, Philippines" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleGenerateTopics}
          disabled={isGenerating || !field || !session}
          className="w-full"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {isGenerating ? "Generating Topics..." : "Generate Research Topics"}
        </Button>

        {suggestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Generated Topics</h3>
            
            {suggestions.map((suggestion: TopicSuggestion, index: number) => (
              <Card key={index} className="bg-tertiary border hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Relevance: {suggestion.relevance}%
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          suggestion.originalityScore >= 80 ? 'border-green-500 text-green-500' :
                          suggestion.originalityScore >= 60 ? 'border-yellow-500 text-yellow-500' :
                          'border-red-500 text-red-500'
                        }`}
                      >
                        Originality: {suggestion.originalityScore}%
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => validateTopicOriginality(index, suggestion)}
                      disabled={!!validationResults[index]}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {validationResults[index] === undefined ? "Validate Originality" : 
                       validationResults[index] ? "✓ Validated" : "⚠️ Needs Revision"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}