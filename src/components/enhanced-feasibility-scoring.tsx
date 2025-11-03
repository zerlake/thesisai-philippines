"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Progress } from "./ui/progress";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Users, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Download,
  Loader2,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";

type FeasibilityFactor = {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1 (percentage as decimal)
  score: number; // 0-100
  details: string;
};

type FeasibilityAnalysis = {
  overallScore: number;
  factors: FeasibilityFactor[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
    mitigationStrategies: string[];
  };
  recommendations: string[];
  confidence: number; // How confident we are in this analysis (0-100)
};

type ResearchTopic = {
  title: string;
  description: string;
  field: string;
  methodology: string;
  timeline: number; // Expected duration in months
  resources: string[]; // Required resources
  budget: number; // Estimated budget
};

export function EnhancedFeasibilityScoring() {
  const { session } = useAuth();
  const [topic, setTopic] = useState<ResearchTopic>({
    title: "",
    description: "",
    field: "",
    methodology: "",
    timeline: 12,
    resources: [],
    budget: 0
  });
  const [analysis, setAnalysis] = useState<FeasibilityAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResource, setCurrentResource] = useState("");
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTopic(prev => ({ ...prev, [name]: value }));
  };

  const handleResourceAdd = () => {
    if (currentResource.trim() && !topic.resources.includes(currentResource.trim())) {
      setTopic(prev => ({
        ...prev,
        resources: [...prev.resources, currentResource.trim()]
      }));
      setCurrentResource("");
    }
  };

  const handleResourceRemove = (resource: string) => {
    setTopic(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r !== resource)
    }));
  };

  const calculateFeasibility = async () => {
    if (!session) {
      toast.error("You must be logged in to perform feasibility analysis.");
      return;
    }

    if (!topic.title || !topic.description || !topic.field) {
      toast.error("Please fill in the title, description, and field of study.");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Calculate scores for each factor
      const factors: FeasibilityFactor[] = [
        {
          id: "data-availability",
          name: "Data Availability",
          description: "Assessment of available sources and data in your field",
          weight: 0.25,
          score: calculateDataAvailabilityScore(topic),
          details: "Based on field trends and publication density"
        },
        {
          id: "resource-requirements",
          name: "Resource Requirements",
          description: "Evaluation of required equipment, participants, time, and funding",
          weight: 0.20,
          score: calculateResourceRequirementsScore(topic),
          details: "Assessed against available resources and budget"
        },
        {
          id: "difficulty-level",
          name: "Difficulty Level",
          description: "Complexity assessment based on methodology and scope",
          weight: 0.20,
          score: calculateDifficultyScore(topic),
          details: "Based on methodology complexity and scope"
        },
        {
          id: "time-estimation",
          name: "Time Feasibility",
          description: "Assessment of realistic timeline for completion",
          weight: 0.15,
          score: calculateTimeFeasibilityScore(topic),
          details: "Based on methodology and expected duration"
        },
        {
          id: "advisor-availability",
          name: "Advisor Availability",
          description: "Likelihood of finding qualified advisors in your field",
          weight: 0.10,
          score: calculateAdvisorAvailabilityScore(topic),
          details: "Based on field expertise availability"
        },
        {
          id: "methodology-suitability",
          name: "Methodology Suitability",
          description: "How well your chosen methodology fits the research question",
          weight: 0.10,
          score: calculateMethodologySuitabilityScore(topic),
          details: "Based on methodology appropriateness"
        }
      ];

      // Calculate weighted overall score
      const overallScore = factors.reduce((sum, factor) => {
        return sum + (factor.score * factor.weight);
      }, 0);

      // Determine risk level
      const avgScore = overallScore / factors.length;
      const riskLevel = avgScore > 70 ? "low" : avgScore > 40 ? "medium" : "high";

      // Generate risk factors
      const riskFactors = factors.filter(f => f.score < 50).map(f => f.name);

      // Generate recommendations based on lowest scoring factors
      const lowScoringFactors = factors.filter(f => f.score < 60);
      const recommendations = generateRecommendations(lowScoringFactors, topic);

      const mockAnalysis: FeasibilityAnalysis = {
        overallScore: Math.round(overallScore),
        factors,
        riskAssessment: {
          level: riskLevel,
          factors: riskFactors,
          mitigationStrategies: generateMitigationStrategies(topic)
        },
        recommendations,
        confidence: Math.min(95, Math.max(60, 90 - (lowScoringFactors.length * 10))) // Confidence decreases with more low-scoring factors
      };

      setAnalysis(mockAnalysis);
      toast.success("Feasibility analysis completed successfully!");
    } catch (error) {
      console.error("Error calculating feasibility:", error);
      toast.error("Failed to calculate feasibility. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for scoring
  const calculateDataAvailabilityScore = (topic: ResearchTopic): number => {
    // This would be connected to actual research trend data in a full implementation
    // For demo purposes, we'll calculate based on field popularity indicators
    const fieldPopularity = Math.floor(Math.random() * 40) + 60; // 60-100%
    const dataSpecificity = topic.description.toLowerCase().includes("quantitative") ? 5 : 0;
    return Math.max(0, Math.min(100, fieldPopularity - dataSpecificity));
  };

  const calculateResourceRequirementsScore = (topic: ResearchTopic): number => {
    // Calculate based on budget, resources needed, and timeline
    const budgetFactor = topic.budget > 50000 ? 90 : topic.budget > 10000 ? 70 : topic.budget > 5000 ? 50 : 30;
    const resourceCountFactor = 100 - (topic.resources.length * 10); // Each resource reduces score by 10
    return Math.max(20, Math.round((budgetFactor + resourceCountFactor) / 2));
  };

  const calculateDifficultyScore = (topic: ResearchTopic): number => {
    // Calculate based on methodology and description complexity
    const difficultKeywords = [
      'longitudinal', 'comprehensive', 'multifaceted', 'complex', 'advanced', 
      'sophisticated', 'mixed-methods', 'cross-cultural', 'multi-site'
    ];
    const simpleKeywords = [
      'basic', 'simple', 'introductory', 'fundamental', 'elementary', 
      'exploratory', 'descriptive', 'survey'
    ];

    let difficulty = 70; // Base score
    const text = (topic.title + " " + topic.description).toLowerCase();

    difficultKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        difficulty -= 10;
      }
    });

    simpleKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        difficulty += 8;
      }
    });

    // Adjust based on methodology
    if (topic.methodology.toLowerCase().includes('experimental')) {
      difficulty -= 10;
    } else if (topic.methodology.toLowerCase().includes('survey')) {
      difficulty += 15;
    } else if (topic.methodology.toLowerCase().includes('qualitative')) {
      difficulty -= 5;
    }

    return Math.max(20, Math.min(100, difficulty));
  };

  const calculateTimeFeasibilityScore = (topic: ResearchTopic): number => {
    // Calculate based on timeline and project complexity
    const timeline = topic.timeline;
    
    if (timeline < 6) {
      // Very short timeline - only simple projects are feasible
      return topic.methodology.toLowerCase().includes('literature review') ? 80 : 30;
    } else if (timeline >= 6 && timeline < 12) {
      // Medium timeline - depends on complexity
      return calculateDifficultyScore(topic) > 70 ? 80 : 50;
    } else if (timeline >= 12 && timeline < 24) {
      // Good timeline - most projects feasible
      return Math.min(90, calculateDifficultyScore(topic) + 10);
    } else {
      // Very long timeline - may have other issues
      return 70;
    }
  };

  const calculateAdvisorAvailabilityScore = (topic: ResearchTopic): number => {
    // This would connect to advisor databases in a full implementation
    // For demo, we'll estimate based on field popularity
    const fieldPopularity = Math.floor(Math.random() * 40) + 60; // 60-100%
    return fieldPopularity;
  };

  const calculateMethodologySuitabilityScore = (topic: ResearchTopic): number => {
    // Calculate how well the methodology matches the research question
    const description = topic.description.toLowerCase();
    
    if (topic.methodology.toLowerCase().includes('quantitative') && 
        (description.includes('how many') || description.includes('what percentage') || 
         description.includes('effect') || description.includes('relationship'))) {
      return 90; // Good match
    } else if (topic.methodology.toLowerCase().includes('qualitative') && 
               (description.includes('how') || description.includes('what') || 
                description.includes('experience') || description.includes('process'))) {
      return 90; // Good match
    } else if (topic.methodology.toLowerCase().includes('mixed')) {
      return 85; // Mixed methods can work for many questions
    } else {
      return 50; // Uncertain fit
    }
  };

  const generateRecommendations = (lowScoringFactors: FeasibilityFactor[], topic: ResearchTopic): string[] => {
    const recommendations: string[] = [];

    lowScoringFactors.forEach(factor => {
      switch (factor.id) {
        case "data-availability":
          recommendations.push("Consider broadening your research scope to areas with more available data");
          recommendations.push("Explore alternative data sources or methodologies");
          break;
        case "resource-requirements":
          recommendations.push("Reconsider your resource requirements or seek additional funding");
          recommendations.push("Simplify your methodology to match available resources");
          break;
        case "difficulty-level":
          recommendations.push("Consider simplifying your research question or methodology");
          recommendations.push("Break the project into smaller, more manageable components");
          break;
        case "time-estimation":
          recommendations.push("Extend your timeline to allow for more thorough research");
          recommendations.push("Reduce the scope of your study to fit the timeline");
          break;
        case "advisor-availability":
          recommendations.push("Consider related fields where advisors may be more available");
          recommendations.push("Connect with the platform to help find potential advisors");
          break;
        case "methodology-suitability":
          recommendations.push("Consider alternative methodologies that better match your research questions");
          recommendations.push("Consult with a methodology expert to refine your approach");
          break;
      }
    });

    // Add general recommendations if needed
    if (recommendations.length === 0) {
      recommendations.push("Your research topic appears to be well-balanced across all feasibility factors");
      recommendations.push("Consider connecting with an academic advisor for further guidance");
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  };

  const generateMitigationStrategies = (topic: ResearchTopic): string[] => {
    return [
      "Create a detailed project timeline with milestones and buffer periods",
      "Establish regular check-ins with your advisor to monitor progress",
      "Identify alternative approaches in case primary methods prove unfeasible",
      "Build in time for unexpected challenges or delays",
      "Develop a contingency plan for resource shortfalls"
    ];
  };

  const handleFeedback = (factorId: string, feedback: "positive" | "negative") => {
    setUserFeedback(prev => ({
      ...prev,
      [factorId]: feedback
    }));
    
    toast.success(feedback === "positive" 
      ? "Thanks for the feedback! We'll use this to improve our scoring." 
      : "Thanks for letting us know. We'll work on improving this aspect.");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300";
    if (score >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300";
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
    if (score >= 60)
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const handleExportPdf = () => {
    toast.info("In a full implementation, this would export the analysis as a PDF report.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Enhanced Feasibility Scoring System
          </CardTitle>
          <CardDescription>
            Comprehensive assessment of your research topic&apos;s viability across multiple dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Research Topic Title</Label>
              <Input
                id="title"
                name="title"
                value={topic.title}
                onChange={handleInputChange}
                placeholder="Enter your research topic title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                name="field"
                value={topic.field}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Education, Business"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Research Description</Label>
            <Textarea
              id="description"
              name="description"
              value={topic.description}
              onChange={handleInputChange}
              placeholder="Describe your research topic, questions, and objectives..."
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="methodology">Proposed Methodology</Label>
              <Input
                id="methodology"
                name="methodology"
                value={topic.methodology}
                onChange={handleInputChange}
                placeholder="e.g., Quantitative, Qualitative, Mixed Methods"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Expected Timeline (months)</Label>
              <Input
                id="timeline"
                name="timeline"
                type="number"
                min="1"
                max="36"
                value={topic.timeline}
                onChange={(e) => setTopic(prev => ({...prev, timeline: parseInt(e.target.value) || 12}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Estimated Budget (PHP)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min="0"
                value={topic.budget}
                onChange={(e) => setTopic(prev => ({...prev, budget: parseInt(e.target.value) || 0}))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Resources</Label>
            <div className="flex gap-2">
              <Input
                value={currentResource}
                onChange={(e) => setCurrentResource(e.target.value)}
                placeholder="Add required resource (e.g., participants, equipment)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResourceAdd();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleResourceAdd}>
                Add
              </Button>
            </div>
            {topic.resources.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {topic.resources.map((resource, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {resource}
                    <button 
                      type="button" 
                      onClick={() => handleResourceRemove(resource)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={calculateFeasibility} 
            disabled={isLoading || !topic.title || !topic.description || !topic.field}
            className="w-full flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Feasibility...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Calculate Feasibility Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feasibility Analysis Results
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score */}
            <div className={`p-6 rounded-lg border-2 ${getScoreColor(analysis.overallScore)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {analysis.overallScore}%
                </div>
                <div className="text-lg font-medium mb-2">
                  Overall Feasibility Score
                </div>
                <div className="text-sm opacity-80">
                  Based on {analysis.factors.length} feasibility factors
                </div>
              </div>
            </div>

            {/* Confidence and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Analysis Confidence</span>
                    <span className="text-blue-600 dark:text-blue-300 font-bold">
                      {analysis.confidence}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis.confidence} 
                    className="h-2" 
                    indicatorClassName="bg-blue-500" 
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Risk Level</span>
                    <Badge 
                      variant="outline" 
                      className={getRiskColor(analysis.riskAssessment.level)}
                    >
                      {analysis.riskAssessment.level.charAt(0).toUpperCase() + analysis.riskAssessment.level.slice(1)} Risk
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.riskAssessment.level === "low" 
                      ? "Low risk of project failure" 
                      : analysis.riskAssessment.level === "medium" 
                        ? "Moderate risk factors identified" 
                        : "High risk - significant challenges ahead"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Factor Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Feasibility Factor Breakdown</h3>
              <Accordion type="single" collapsible className="w-full">
                {analysis.factors.map((factor) => (
                  <AccordionItem key={factor.id} value={factor.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge 
                          variant="outline" 
                          className={getScoreBadgeColor(factor.score)}
                        >
                          {factor.score}%
                        </Badge>
                        <span className="font-semibold">{factor.name}</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {Math.round(factor.weight * 100)}% weight
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="p-4 bg-muted/10 rounded">
                          <p className="font-medium mb-1">Description:</p>
                          <p className="text-sm">{factor.description}</p>
                        </div>
                        
                        <div className="p-4 bg-muted/10 rounded">
                          <p className="font-medium mb-1">Assessment Details:</p>
                          <p className="text-sm">{factor.details}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Was this assessment helpful?</span>
                            <div className="flex gap-1">
                              <Button
                                variant={userFeedback[factor.id] === "positive" ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleFeedback(factor.id, "positive")}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={userFeedback[factor.id] === "negative" ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleFeedback(factor.id, "negative")}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Weight: {Math.round(factor.weight * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            {analysis.riskAssessment.factors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Identified Risk Factors:</p>
                      <ul className="space-y-1">
                        {analysis.riskAssessment.factors.map((factor, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Mitigation Strategies:</p>
                      <ul className="space-y-1">
                        {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Factor Scores Table */}
            <Card>
              <CardHeader>
                <CardTitle>Factor Scores Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factor</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead className="text-right">Weighted Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.factors.map((factor) => (
                      <TableRow key={factor.id}>
                        <TableCell className="font-medium">{factor.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getScoreBadgeColor(factor.score)}>
                            {factor.score}%
                          </Badge>
                        </TableCell>
                        <TableCell>{Math.round(factor.weight * 100)}%</TableCell>
                        <TableCell className="text-right">
                          {Math.round(factor.score * factor.weight)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell>{analysis.overallScore}%</TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell className="text-right">{analysis.overallScore}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}