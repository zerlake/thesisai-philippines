"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Settings, Zap, BookOpen, Target } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type FocusArea = 'structure' | 'clarity' | 'evidence' | 'tone' | 'grammar' | 'all';
type FeedbackStyle = 'constructive' | 'detailed' | 'quick' | 'developmental';
type SuggestionType = 'immediate' | 'substantial' | 'both';

export default function AdvisorSuggestionEngine() {
  const { session } = useAuth();
  const [studentText, setStudentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Advisor Preferences
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(['all']);
  const [feedbackStyle, setFeedbackStyle] = useState<FeedbackStyle>('constructive');
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('both');
  const [emphasisLevel, setEmphasisLevel] = useState<'light' | 'moderate' | 'intensive'>('moderate');
  const [includeResources, setIncludeResources] = useState(true);
  const [includePraisePoints, setIncludePraisePoints] = useState(true);
  
  // Results
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string>("");
  const [suggestionType2, setSuggestionType2] = useState<string>("");

  const getFocusAreaDescription = (area: FocusArea): string => {
    const descriptions: Record<FocusArea, string> = {
      structure: 'Organization, flow, and document structure',
      clarity: 'Writing clarity, readability, and comprehension',
      evidence: 'Research depth, citations, and supporting evidence',
      tone: 'Academic tone, voice, and formality level',
      grammar: 'Grammar, punctuation, and mechanical errors',
      all: 'Comprehensive review of all areas'
    };
    return descriptions[area];
  };

  const getFeedbackStyleDescription = (style: FeedbackStyle): string => {
    const descriptions: Record<FeedbackStyle, string> = {
      constructive: 'Balanced approach with strengths and growth areas',
      detailed: 'In-depth analysis with specific examples and explanations',
      quick: 'Concise, bullet-point feedback for busy schedules',
      developmental: 'Growth-focused with mentoring and learning suggestions'
    };
    return descriptions[style];
  };

  const toggleFocusArea = (area: FocusArea) => {
    if (area === 'all') {
      setFocusAreas(focusAreas.includes('all') ? [] : ['all']);
    } else {
      const newAreas = focusAreas.filter(a => a !== 'all');
      if (newAreas.includes(area)) {
        setFocusAreas(newAreas.filter(a => a !== area));
      } else {
        setFocusAreas([...newAreas, area]);
      }
    }
  };

  const generateSuggestions = async () => {
    if (!studentText.trim()) {
      toast.error("Please paste the student's text to review.");
      return;
    }

    if (!session) {
      toast.error("You must be logged in to generate suggestions.");
      return;
    }

    setIsLoading(true);
    try {
      const focusAreasText = focusAreas.includes('all') 
        ? 'comprehensive review of all areas'
        : focusAreas.map(a => getFocusAreaDescription(a as FocusArea)).join(', ');

      const emphasisText = {
        light: 'minimal, only critical issues',
        moderate: 'balanced, addressing key areas',
        intensive: 'thorough, detailed for every aspect'
      }[emphasisLevel];

      const prompt = `You are an expert academic advisor providing personalized feedback to a student.

ADVISOR PREFERENCES:
- Focus Areas: ${focusAreasText}
- Feedback Style: ${getFeedbackStyleDescription(feedbackStyle)}
- Suggestion Type: ${suggestionType === 'immediate' ? 'Quick fixes only' : suggestionType === 'substantial' ? 'Major revisions only' : 'Both quick fixes and substantial changes'}
- Emphasis Level: ${emphasisText}
${includePraisePoints ? '- Include specific praise points for strengths' : ''}
${includeResources ? '- Suggest resources or references for improvement' : ''}

FEEDBACK FORMAT:
Your role is to be a supportive mentor. Provide structured feedback that helps the student improve.

${suggestionType !== 'substantial' ? `
QUICK FIXES (issues that can be fixed immediately):
- List 2-3 quick wins (typos, phrasing, formatting)
- Keep these brief and actionable
` : ''}

${suggestionType !== 'immediate' ? `
SUBSTANTIAL IMPROVEMENTS (areas needing deeper work):
- Identify 3-4 major areas for development
- Explain why each matters
- Provide specific guidance on how to improve
${includeResources ? '- Suggest resources or examples when helpful' : ''}
` : ''}

${includePraisePoints ? `
WHAT'S WORKING WELL:
- Highlight 2-3 specific strengths
- Explain why these are valuable
` : ''}

NEXT STEPS:
- Suggest a priority order for revisions
- Encourage the student's effort and progress

TONE: Use ${feedbackStyle === 'developmental' ? 'a mentoring tone' : feedbackStyle === 'detailed' ? 'an analytical tone' : feedbackStyle === 'quick' ? 'a direct tone' : 'a balanced and supportive tone'}. Be honest but encouraging.

STUDENT'S TEXT:
"${studentText}"

Provide structured feedback:`;

      const result = await callPuterAI(prompt, {
        temperature: 0.7,
        max_tokens: 3000,
        timeout: 45000
      });

      setGeneratedSuggestions(result);
      setSuggestionType2('Customized Advisor Suggestions');
      toast.success("Suggestions generated successfully!");
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to generate suggestions';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copySuggestions = () => {
    navigator.clipboard.writeText(generatedSuggestions);
    toast.success("Suggestions copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advisor Suggestion Engine</h1>
        <p className="text-muted-foreground mt-2">Customize your feedback style and generate personalized suggestions for students</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Student Text Input */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Student Text
              </CardTitle>
              <CardDescription>Paste the student's work here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste student's text or document excerpt..."
                value={studentText}
                onChange={(e) => setStudentText(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button
                onClick={generateSuggestions}
                disabled={isLoading || !studentText.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right: Advisor Preferences */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Your Feedback Preferences
              </CardTitle>
              <CardDescription>Customize how suggestions are generated</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="style">Feedback Style</TabsTrigger>
                  <TabsTrigger value="focus">Focus Areas</TabsTrigger>
                  <TabsTrigger value="options">Advanced</TabsTrigger>
                </TabsList>

                {/* Feedback Style Tab */}
                <TabsContent value="style" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>How would you like to provide feedback?</Label>
                    <Select value={feedbackStyle} onValueChange={(value) => setFeedbackStyle(value as FeedbackStyle)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="constructive">Constructive & Balanced</SelectItem>
                        <SelectItem value="detailed">Detailed & Analytical</SelectItem>
                        <SelectItem value="quick">Quick & Concise</SelectItem>
                        <SelectItem value="developmental">Developmental & Mentoring</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">{getFeedbackStyleDescription(feedbackStyle)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>What type of suggestions to prioritize?</Label>
                    <Select value={suggestionType} onValueChange={(value) => setSuggestionType(value as SuggestionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate Fixes Only</SelectItem>
                        <SelectItem value="substantial">Substantial Improvements Only</SelectItem>
                        <SelectItem value="both">Both Quick Fixes & Substantial Changes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>How thorough should feedback be?</Label>
                    <Select value={emphasisLevel} onValueChange={(value) => setEmphasisLevel(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Touch (minimal issues only)</SelectItem>
                        <SelectItem value="moderate">Moderate (key areas)</SelectItem>
                        <SelectItem value="intensive">Intensive (detailed for every aspect)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Focus Areas Tab */}
                <TabsContent value="focus" className="space-y-4 mt-4">
                  <Label>Which areas should be the focus?</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all"
                        checked={focusAreas.includes('all')}
                        onCheckedChange={() => toggleFocusArea('all')}
                      />
                      <label htmlFor="all" className="text-sm font-medium cursor-pointer">All Areas (Comprehensive)</label>
                    </div>
                    
                    <div className="pl-4 space-y-3 border-l-2 border-muted">
                      {['structure', 'clarity', 'evidence', 'tone', 'grammar'].map((area) => (
                        <div key={area} className="flex items-start space-x-2">
                          <Checkbox
                            id={area}
                            checked={focusAreas.includes(area as FocusArea)}
                            onCheckedChange={() => toggleFocusArea(area as FocusArea)}
                            disabled={focusAreas.includes('all')}
                          />
                          <div className="flex-1">
                            <label htmlFor={area} className="text-sm font-medium cursor-pointer capitalize">{area}</label>
                            <p className="text-xs text-muted-foreground">{getFocusAreaDescription(area as FocusArea)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Options Tab */}
                <TabsContent value="options" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="praise"
                        checked={includePraisePoints}
                        onCheckedChange={(checked) => setIncludePraisePoints(checked as boolean)}
                      />
                      <label htmlFor="praise" className="text-sm font-medium cursor-pointer">Include Praise Points</label>
                      <p className="text-xs text-muted-foreground ml-auto">Highlight what's working well</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="resources"
                        checked={includeResources}
                        onCheckedChange={(checked) => setIncludeResources(checked as boolean)}
                      />
                      <label htmlFor="resources" className="text-sm font-medium cursor-pointer">Include Resources</label>
                      <p className="text-xs text-muted-foreground ml-auto">Suggest helpful references</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                    <p className="text-blue-900 dark:text-blue-100">
                      <strong>Tip:</strong> These preferences will be saved for your future suggestions, allowing you to maintain consistency in your feedback approach.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Suggestions */}
      {generatedSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {suggestionType2}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copySuggestions}
              >
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
              {generatedSuggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
