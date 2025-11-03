"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  Calendar,
  Target,
  Zap,
  BarChart3,
  BookOpen,
  Globe,
  Library,
  Users,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import Link from "next/link";

// Types for our dashboard data
type OriginalitySummary = {
  overallScore: number;
  webScore: number;
  internalScore: number;
  thesisDbScore: number;
  totalChecks: number;
  flaggedDocuments: number;
  lastCheckDate: string | null;
};

type RecentCheck = {
  id: string;
  documentTitle: string;
  similarityScore: number;
  checkType: "web" | "internal" | "thesis";
  date: string;
};

type TrendData = {
  date: string;
  webScore: number;
  internalScore: number;
  thesisDbScore: number;
};

type FieldDistribution = {
  field: string;
  count: number;
  avgSimilarity: number;
};

export function OriginalityVerificationDashboard() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<OriginalitySummary | null>(null);
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [fieldDistribution, setFieldDistribution] = useState<FieldDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock summary data
      const mockSummary: OriginalitySummary = {
        overallScore: 87,
        webScore: 92,
        internalScore: 78,
        thesisDbScore: 85,
        totalChecks: 24,
        flaggedDocuments: 3,
        lastCheckDate: new Date().toISOString(),
      };
      
      // Mock recent checks
      const mockRecentChecks: RecentCheck[] = [
        {
          id: "1",
          documentTitle: "Impact of AI on Education",
          similarityScore: 8,
          checkType: "web",
          date: "2024-01-15",
        },
        {
          id: "2",
          documentTitle: "Machine Learning Applications",
          similarityScore: 12,
          checkType: "thesis",
          date: "2024-01-12",
        },
        {
          id: "3",
          documentTitle: "Blockchain Security Analysis",
          similarityScore: 5,
          checkType: "internal",
          date: "2024-01-10",
        },
        {
          id: "4",
          documentTitle: "Sustainable Urban Planning",
          similarityScore: 15,
          checkType: "web",
          date: "2024-01-08",
        },
        {
          id: "5",
          documentTitle: "Social Media Psychology",
          similarityScore: 22,
          checkType: "thesis",
          date: "2024-01-05",
        },
      ];
      
      // Mock trend data
      const mockTrendData: TrendData[] = [
        { date: "Jan 1", webScore: 85, internalScore: 80, thesisDbScore: 82 },
        { date: "Jan 8", webScore: 88, internalScore: 75, thesisDbScore: 85 },
        { date: "Jan 15", webScore: 92, internalScore: 78, thesisDbScore: 85 },
        { date: "Jan 22", webScore: 89, internalScore: 82, thesisDbScore: 87 },
        { date: "Jan 29", webScore: 92, internalScore: 78, thesisDbScore: 85 },
      ];
      
      // Mock field distribution
      const mockFieldDistribution: FieldDistribution[] = [
        { field: "Computer Science", count: 8, avgSimilarity: 12 },
        { field: "Education", count: 6, avgSimilarity: 8 },
        { field: "Psychology", count: 5, avgSimilarity: 15 },
        { field: "Business", count: 4, avgSimilarity: 10 },
        { field: "Engineering", count: 3, avgSimilarity: 18 },
      ];
      
      setSummary(mockSummary);
      setRecentChecks(mockRecentChecks);
      setTrendData(mockTrendData);
      setFieldDistribution(mockFieldDistribution);
      
      setIsLoading(false);
    };
    
    initializeDashboard();
  }, []);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Get badge color based on score
  const getBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  // Get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Originality Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Field Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary?.overallScore || 0)}`}>
                  {summary?.overallScore || 0}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <Progress 
              value={summary?.overallScore || 0} 
              className="mt-2" 
              indicatorClassName={getProgressColor(summary?.overallScore || 0)} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Web Checks</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary?.webScore || 0)}`}>
                  {summary?.webScore || 0}%
                </p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
            <Progress 
              value={summary?.webScore || 0} 
              className="mt-2" 
              indicatorClassName={getProgressColor(summary?.webScore || 0)} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Internal Checks</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary?.internalScore || 0)}`}>
                  {summary?.internalScore || 0}%
                </p>
              </div>
              <Library className="w-8 h-8 text-purple-500" />
            </div>
            <Progress 
              value={summary?.internalScore || 0} 
              className="mt-2" 
              indicatorClassName={getProgressColor(summary?.internalScore || 0)} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thesis DB Checks</p>
                <p className={`text-2xl font-bold ${getScoreColor(summary?.thesisDbScore || 0)}`}>
                  {summary?.thesisDbScore || 0}%
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-500" />
            </div>
            <Progress 
              value={summary?.thesisDbScore || 0} 
              className="mt-2" 
              indicatorClassName={getProgressColor(summary?.thesisDbScore || 0)} 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Checks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Originality Checks
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/originality-check">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Similarity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.documentTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {check.checkType === "web" && <Globe className="w-3 h-3 mr-1" />}
                        {check.checkType === "internal" && <Library className="w-3 h-3 mr-1" />}
                        {check.checkType === "thesis" && <GraduationCap className="w-3 h-3 mr-1" />}
                        {check.checkType.charAt(0).toUpperCase() + check.checkType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className={getBadgeColor(100 - check.similarityScore)}
                      >
                        {check.similarityScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>{check.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Field Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Field Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fieldDistribution.map((field, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{field.field}</span>
                    <span className="text-sm text-muted-foreground">
                      {field.count} checks
                    </span>
                  </div>
                  <Progress 
                    value={field.avgSimilarity} 
                    className="h-2" 
                    indicatorClassName={getProgressColor(100 - field.avgSimilarity)} 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{field.avgSimilarity}% avg similarity</span>
                    <span>{Math.round((field.avgSimilarity / 100) * field.count)} flagged</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Originality Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2">Trend Analysis Visualization</p>
              <p className="text-sm text-muted-foreground">
                Shows your originality scores over time across different check types
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-500" />
              <h3 className="font-semibold">Identify Research Gaps</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Discover unexplored areas in your field with our research gap analysis tool.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/originality-check#gaps">
                Analyze Gaps
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-green-500" />
              <h3 className="font-semibold">Historical Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Understand topic trends over time to position your research effectively.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/originality-check#historical">
                View Trends
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-purple-500" />
              <h3 className="font-semibold">Quick Check</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Run an immediate originality check on your current document.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/originality-check">
                Check Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}