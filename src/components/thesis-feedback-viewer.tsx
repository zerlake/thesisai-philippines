// src/components/thesis-feedback-viewer.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  CircleAlert, 
  FileText, 
  Lightbulb, 
  LoaderCircle, 
  Target,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { ThesisFeedback, FeedbackSuggestion } from '@/lib/ai/feedback/thesis-feedback-engine';
import { thesisFeedbackService } from '@/services/thesis-feedback-service';

interface ThesisFeedbackViewerProps {
  documentId: string;
  content: string;
  section?: string;
  title?: string;
  onFeedbackReceived?: (feedback: ThesisFeedback) => void;
}

export function ThesisFeedbackViewer({ 
  documentId, 
  content, 
  section = 'General',
  title = 'Thesis Section',
  onFeedbackReceived 
}: ThesisFeedbackViewerProps) {
  const [feedback, setFeedback] = useState<ThesisFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContent, setShowContent] = useState(false);

  // Generate feedback when component mounts or content changes
  useEffect(() => {
    if (content && content.trim().length > 50) {
      generateFeedback();
    }
  }, [content]);

  const generateFeedback = async () => {
    if (!content || content.trim().length <= 50) {
      setError('Content too short for analysis (minimum 50 characters)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const feedbackResult = await thesisFeedbackService.submitForFeedback({
        documentId,
        content,
        section,
        title,
      });
      
      setFeedback(feedbackResult);
      onFeedbackReceived?.(feedbackResult);
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError('Failed to generate feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <CircleAlert className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Analyzing your thesis content for feedback...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center text-destructive">
            <CircleAlert className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <Button 
            className="mt-4" 
            onClick={generateFeedback}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Feedback Available</h3>
          <p className="text-muted-foreground mb-4">
            Submit your thesis content to receive AI-powered feedback and improvement suggestions
          </p>
          <Button onClick={generateFeedback} disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate Feedback'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const summary = thesisFeedbackService.getFeedbackSummary(feedback);
  const prioritizedSuggestions = thesisFeedbackService.getPrioritizedRecommendations(feedback);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Thesis Feedback & Improvement Suggestions
            </CardTitle>
            <CardDescription>
              AI-powered analysis of "{title}" section
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={generateFeedback} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Regenerate'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm font-medium">Score: </span>
            <span className="text-lg font-bold ml-1">{feedback.overallScore}/100</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm">Strengths: {feedback.strengths.length}</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm">Issues: {summary.totalSuggestions}</span>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={feedback.overallScore} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{feedback.overallFeedback}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feedback.strengths.slice(0, 5).map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                  {feedback.strengths.length > 5 && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-2"
                      onClick={() => setShowContent(!showContent)}
                    >
                      {showContent ? 'Show less' : `Show all ${feedback.strengths.length} strengths`}
                    </Button>
                  )}
                  {showContent && (
                    <ul className="space-y-2 mt-2">
                      {feedback.strengths.slice(5).map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Key Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical Issues</span>
                      <Badge variant="destructive">{summary.criticalIssues}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Priority</span>
                      <Badge variant="default">{summary.highPriorityIssues}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Issues</span>
                      <Badge variant="secondary">{summary.totalSuggestions}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Improvement Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center my-2">
                    {thesisFeedbackService.calculateImprovementPotential(feedback)}%
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Based on strength-to-issue ratio
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="space-y-6 mt-4">
            <h3 className="text-lg font-medium">Priority Suggestions</h3>
            <div className="space-y-4">
              {prioritizedSuggestions.length > 0 ? (
                prioritizedSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getSeverityIcon(suggestion.severity)}
                          {suggestion.title}
                        </CardTitle>
                        <Badge className={getSeverityColor(suggestion.severity)}>
                          {suggestion.severity}
                        </Badge>
                      </div>
                      <CardDescription>
                        {suggestion.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{suggestion.description}</p>
                      {suggestion.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Suggestions:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {suggestion.suggestions.map((sug, idx) => (
                              <li key={idx} className="text-sm">{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Issues Found</h3>
                    <p className="text-muted-foreground">
                      Great work! No significant issues were identified in this section.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6 mt-4">
            <h3 className="text-lg font-medium">Detailed Analysis</h3>
            <div className="grid gap-4">
              {feedback.categories.map((category) => {
                // Get all suggestions for this category
                const categorySuggestions = feedback.suggestions.filter(s => s.category === category.id);
                
                // Calculate average severity for this category
                let avgSeverity = 0;
                if (categorySuggestions.length > 0) {
                  const severityScores: number[] = categorySuggestions.map(s => {
                    switch (s.severity) {
                      case 'critical': return 4;
                      case 'high': return 3;
                      case 'medium': return 2;
                      case 'low': return 1;
                      default: return 0;
                    }
                  });
                  avgSeverity = severityScores.reduce((a, b) => a + b, 0) / severityScores.length;
                }
                
                return (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        <Badge variant="outline">
                          {categorySuggestions.length} issues
                        </Badge>
                      </div>
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Focus Area</span>
                          <span>{Math.round(avgSeverity * 25)}%</span>
                        </div>
                        <Progress value={avgSeverity * 25} />
                      </div>
                      
                      {categorySuggestions.length > 0 ? (
                        <div className="space-y-2">
                          {categorySuggestions.slice(0, 2).map((suggestion) => (
                            <div key={suggestion.id} className="text-sm">
                              <p className="font-medium">{suggestion.title}</p>
                              <p className="text-muted-foreground">{suggestion.description}</p>
                            </div>
                          ))}
                          {categorySuggestions.length > 2 && (
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-xs"
                              onClick={() => setShowContent(!showContent)}
                            >
                              {showContent ? 'Show less' : `Show all ${categorySuggestions.length} items`}
                            </Button>
                          )}
                          {showContent && categorySuggestions.length > 2 && (
                            <div className="space-y-2 mt-2">
                              {categorySuggestions.slice(2).map((suggestion) => (
                                <div key={suggestion.id} className="text-sm">
                                  <p className="font-medium">{suggestion.title}</p>
                                  <p className="text-muted-foreground">{suggestion.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No specific issues identified</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6 mt-4">
            <h3 className="text-lg font-medium">Improvement Recommendations</h3>
            <div className="space-y-4">
              {feedback.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {feedback.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Recommendations</h3>
                    <p className="text-muted-foreground">
                      The section is well-written with no major areas for improvement.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}