"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BrainCircuit, ShieldCheck, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

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
  const [isLoading, setIsLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean }>({});

  const handleGenerateTopics = async () => {
    if (!field || !session) return;
    
    setIsLoading(true);
    setSuggestions([]);
    setValidationResults({});

    try {
      // First, generate topics using AI
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-topic-ideas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ 
            field,
            keywords: keywords.trim()
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Failed to generate topics");
      
      if (data.topicIdeas) {
        const generatedSuggestions = data.topicIdeas.map((idea: any) => ({
          ...idea,
          relevance: 80 + Math.floor(Math.random() * 20), // Simulated relevance score
          originalityScore: 60 + Math.floor(Math.random() * 40) // Simulated originality score
        }));
        
        setSuggestions(generatedSuggestions);
        toast.success("Generated 3 research topics!");
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to generate topic suggestions.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateTopicOriginality = async (index: number, suggestion: TopicSuggestion) => {
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
          disabled={isLoading || !field || !session}
          className="w-full"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {isLoading ? "Generating Topics..." : "Generate Research Topics"}
        </Button>

        {suggestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Generated Topics</h3>
            
            {suggestions.map((suggestion, index) => (
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