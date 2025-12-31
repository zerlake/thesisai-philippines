"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  FileBarChart,
  FileSpreadsheet,
  FileCode,
  FileJson,
  Table as TableIcon,
  AlignLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Printer,
  Share2,
  Archive,
  Settings,
  Plus,
  Activity,
  Target,
  Award,
  MessageSquare,
  Mail,
  User,
  Shield,
  FileSignature,
  Star
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, Line, LineChart } from "recharts";

interface Report {
  id: string;
  title: string;
  description: string;
  type: "compliance" | "analytics" | "progress" | "activity" | "feedback" | "submission";
  category: "student" | "advisor" | "institution" | "system";
  status: "generated" | "processing" | "failed";
  createdAt: string;
  updatedAt: string;
  size: string;
  generatedBy: string;
  downloadUrl: string;
  dataPoints: number;
  filtersApplied: string[];
  exportFormats: ("pdf" | "excel" | "csv" | "json" | "docx")[];
  isFavorite: boolean;
}

interface ComplianceReport {
  id: string;
  title: string;
  description: string;
  institution: string;
  department: string;
  period: string;
  generatedDate: string;
  status: "completed" | "in-progress" | "pending";
  compliancePercentage: number;
  issuesFound: number;
  recommendations: number;
  responsibleAdvisor: string;
  nextReviewDate: string;
  downloadUrl: string;
  data: {
    thesisSubmissions: number;
    completedReviews: number;
    pendingReviews: number;
    overdueSubmissions: number;
    plagiarismIssues: number;
    formatCompliance: number;
    advisorResponsiveness: number;
  };
}

const ReportingSuite = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      title: "Student Progress Report",
      description: "Comprehensive overview of student thesis progress",
      type: "progress",
      category: "student",
      status: "generated",
      createdAt: "2024-12-20",
      updatedAt: "2024-12-20",
      size: "2.4 MB",
      generatedBy: "Dr. Juan Dela Cruz",
      downloadUrl: "/reports/student-progress-2024-12-20.pdf",
      dataPoints: 1245,
      filtersApplied: ["active-students", "thesis-phase", "advisor"],
      exportFormats: ["pdf", "excel", "csv"],
      isFavorite: true
    },
    {
      id: "2",
      title: "Advisor Performance Report",
      description: "Evaluation of advisor feedback quality and responsiveness",
      type: "analytics",
      category: "advisor",
      status: "generated",
      createdAt: "2024-12-18",
      updatedAt: "2024-12-18",
      size: "1.8 MB",
      generatedBy: "System Admin",
      downloadUrl: "/reports/advisor-performance-2024-12-18.pdf",
      dataPoints: 892,
      filtersApplied: ["response-time", "feedback-quality", "student-satisfaction"],
      exportFormats: ["pdf", "excel", "json"],
      isFavorite: false
    },
    {
      id: "3",
      title: "Institutional Compliance Report",
      description: "Compliance with thesis submission requirements",
      type: "compliance",
      category: "institution",
      status: "generated",
      createdAt: "2024-12-15",
      updatedAt: "2024-12-15",
      size: "3.2 MB",
      generatedBy: "System Admin",
      downloadUrl: "/reports/institutional-compliance-2024-12-15.pdf",
      dataPoints: 2100,
      filtersApplied: ["format-compliance", "plagiarism-check", "advisor-approval"],
      exportFormats: ["pdf", "excel", "csv", "json"],
      isFavorite: true
    },
    {
      id: "4",
      title: "Weekly Activity Report",
      description: "Student and advisor activity summary for the week",
      type: "activity",
      category: "system",
      status: "generated",
      createdAt: "2024-12-22",
      updatedAt: "2024-12-22",
      size: "1.1 MB",
      generatedBy: "System Admin",
      downloadUrl: "/reports/weekly-activity-2024-12-22.pdf",
      dataPoints: 654,
      filtersApplied: ["date-range", "activity-type"],
      exportFormats: ["pdf", "excel"],
      isFavorite: false
    },
    {
      id: "5",
      title: "Feedback Analysis Report",
      description: "Analysis of feedback patterns and effectiveness",
      type: "analytics",
      category: "advisor",
      status: "processing",
      createdAt: "2024-12-22",
      updatedAt: "2024-12-22",
      size: "0.8 MB",
      generatedBy: "Dr. Maria Santos",
      downloadUrl: "",
      dataPoints: 0,
      filtersApplied: ["feedback-type", "advisor", "student-response"],
      exportFormats: ["pdf", "excel", "csv"],
      isFavorite: false
    }
  ]);
  
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([
    {
      id: "c1",
      title: "Thesis Format Compliance",
      description: "Compliance with institutional thesis formatting requirements",
      institution: "University of the Philippines",
      department: "Computer Science",
      period: "Q4 2024",
      generatedDate: "2024-12-20",
      status: "completed",
      compliancePercentage: 94,
      issuesFound: 12,
      recommendations: 8,
      responsibleAdvisor: "Dr. Juan Dela Cruz",
      nextReviewDate: "2025-01-20",
      downloadUrl: "/reports/thesis-format-compliance-2024-12-20.pdf",
      data: {
        thesisSubmissions: 120,
        completedReviews: 115,
        pendingReviews: 5,
        overdueSubmissions: 2,
        plagiarismIssues: 3,
        formatCompliance: 113,
        advisorResponsiveness: 96
      }
    },
    {
      id: "c2",
      title: "Advisor Review Compliance",
      description: "Adherence to review timelines and quality standards",
      institution: "Ateneo de Manila University",
      department: "Engineering",
      period: "Q4 2024",
      generatedDate: "2024-12-18",
      status: "completed",
      compliancePercentage: 87,
      issuesFound: 23,
      recommendations: 15,
      responsibleAdvisor: "Dr. Ana Reyes",
      nextReviewDate: "2025-01-18",
      downloadUrl: "/reports/advisor-review-compliance-2024-12-18.pdf",
      data: {
        thesisSubmissions: 85,
        completedReviews: 78,
        pendingReviews: 7,
        overdueSubmissions: 5,
        plagiarismIssues: 1,
        formatCompliance: 82,
        advisorResponsiveness: 89
      }
    },
    {
      id: "c3",
      title: "Plagiarism Detection Compliance",
      description: "Compliance with originality requirements",
      institution: "De La Salle University",
      department: "Business",
      period: "Q4 2024",
      generatedDate: "2024-12-15",
      status: "in-progress",
      compliancePercentage: 78,
      issuesFound: 35,
      recommendations: 28,
      responsibleAdvisor: "Dr. Carlos Gomez",
      nextReviewDate: "2025-01-15",
      downloadUrl: "/reports/plagiarism-compliance-2024-12-15.pdf",
      data: {
        thesisSubmissions: 150,
        completedReviews: 110,
        pendingReviews: 40,
        overdueSubmissions: 12,
        plagiarismIssues: 33,
        formatCompliance: 145,
        advisorResponsiveness: 82
      }
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<"reports" | "compliance" | "analytics">("reports");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31"
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedComplianceReport, setSelectedComplianceReport] = useState<ComplianceReport | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const filteredComplianceReports = complianceReports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case "compliance":
        return <Badge variant="default">Compliance</Badge>;
      case "analytics":
        return <Badge className="bg-purple-500">Analytics</Badge>;
      case "progress":
        return <Badge className="bg-blue-500">Progress</Badge>;
      case "activity":
        return <Badge className="bg-green-500">Activity</Badge>;
      case "feedback":
        return <Badge className="bg-yellow-500">Feedback</Badge>;
      case "submission":
        return <Badge variant="outline">Submission</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "student":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Student</Badge>;
      case "advisor":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Advisor</Badge>;
      case "institution":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Institution</Badge>;
      case "system":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">System</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "generated":
        return <Badge className="bg-green-500">Generated</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateReport = (reportType: string) => {
    // Simulate report generation
    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: `New ${reportType} Report`,
      description: `Automatically generated ${reportType} report`,
      type: reportType as any,
      category: "system",
      status: "processing",
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      size: "0.1 MB",
      generatedBy: "System",
      downloadUrl: "",
      dataPoints: 0,
      filtersApplied: [],
      exportFormats: ["pdf", "excel"],
      isFavorite: false
    };

    setReports([newReport, ...reports]);
    
    // Simulate processing time
    setTimeout(() => {
      setReports(reports.map(rep => 
        rep.id === newReport.id 
          ? { 
              ...rep, 
              status: "generated", 
              size: "1.2 MB", 
              dataPoints: Math.floor(Math.random() * 1000) + 500,
              downloadUrl: `/reports/generated-${newReport.id}.pdf`
            } 
          : rep
      ));
    }, 3000);
  };

  const toggleFavorite = (reportId: string) => {
    setReports(reports.map(rep => 
      rep.id === reportId ? { ...rep, isFavorite: !rep.isFavorite } : rep
    ));
  };

  // Mock data for charts
  const studentProgressData = [
    { name: "Proposal", value: 15 },
    { name: "Research", value: 25 },
    { name: "Writing", value: 35 },
    { name: "Defense", value: 20 },
    { name: "Completed", value: 5 }
  ];

  const advisorPerformanceData = [
    { advisor: "Dr. Santos", responsiveness: 95, feedbackQuality: 4.8, studentSatisfaction: 4.7 },
    { advisor: "Dr. Dela Cruz", responsiveness: 88, feedbackQuality: 4.5, studentSatisfaction: 4.6 },
    { advisor: "Dr. Reyes", responsiveness: 92, feedbackQuality: 4.7, studentSatisfaction: 4.8 },
    { advisor: "Dr. Gomez", responsiveness: 85, feedbackQuality: 4.3, studentSatisfaction: 4.2 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reporting Suite</h2>
          <p className="text-muted-foreground">
            Generate compliance reports and analytics with export capabilities
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Reporting Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <FileSignature className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Report Library</CardTitle>
                <CardDescription>
                  {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} available
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="submission">Submission</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="advisor">Advisor</SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => generateReport("custom")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedReport?.id === report.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    {/* Top row - Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{report.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{report.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(report.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(report.id);
                          }}
                        >
                          {report.isFavorite ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getReportTypeBadge(report.type)}
                      {getCategoryBadge(report.category)}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{report.dataPoints}</div>
                        <div className="text-xs text-muted-foreground">Data Points</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(report.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">Generated</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{report.size}</div>
                        <div className="text-xs text-muted-foreground">Size</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Print</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredReports.length === 0 && (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No reports found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No reports match your search." : "No reports have been generated yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => generateReport("progress")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>
                  Monitor institutional and academic compliance
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search compliance reports..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => generateReport("compliance")}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  New Compliance Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                {filteredComplianceReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedComplianceReport(report)}
                  >
                    {/* Top row - Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg flex-shrink-0">
                          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{report.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{report.description}</div>
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{report.institution}</Badge>
                      <Badge variant="outline" className="text-xs">{report.department}</Badge>
                      <Badge variant="secondary" className="text-xs">{report.period}</Badge>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{report.compliancePercentage}%</div>
                        <div className="text-xs text-muted-foreground">Compliance</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{report.issuesFound}</div>
                        <div className="text-xs text-muted-foreground">Issues</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{report.recommendations}</div>
                        <div className="text-xs text-muted-foreground">Recommendations</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(report.nextReviewDate)}</div>
                        <div className="text-xs text-muted-foreground">Next Review</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Issues</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredComplianceReports.length === 0 && (
                  <div className="text-center py-10">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No compliance reports found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No compliance reports match your search." : "No compliance reports have been generated yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => generateReport("compliance")}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Generate Compliance Report
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Overview</CardTitle>
                  <CardDescription>
                    Distribution of students across thesis phases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    proposal: { label: "Proposal" },
                    research: { label: "Research" },
                    writing: { label: "Writing" },
                    defense: { label: "Defense" },
                    completed: { label: "Completed" }
                  }} className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentProgressData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {studentProgressData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Advisor Performance Metrics</CardTitle>
                  <CardDescription>
                    Performance comparison across advisors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    responsiveness: { label: "Responsiveness" },
                    feedbackQuality: { label: "Feedback Quality" },
                    studentSatisfaction: { label: "Student Satisfaction" }
                  }} className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={advisorPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="advisor" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="responsiveness" name="Responsiveness (%)" fill="#8884d8" />
                        <Bar dataKey="feedbackQuality" name="Feedback Quality (5)" fill="#82ca9d" />
                        <Bar dataKey="studentSatisfaction" name="Student Satisfaction (5)" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>
                    At-a-glance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Students</span>
                      <span className="text-sm font-medium">245</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active Theses</span>
                      <span className="text-sm font-medium">187</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Completion Time</span>
                      <span className="text-sm font-medium">14.2 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Advisor Response Time</span>
                      <span className="text-sm font-medium">18.4 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Compliance Rate</span>
                      <span className="text-sm font-medium">92.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Feedback Quality</span>
                      <span className="text-sm font-medium">4.6/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Download reports in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as Excel
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TableIcon className="h-4 w-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileCode className="h-4 w-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileJson className="h-4 w-4 mr-2" />
                      Export as JSON Schema
                    </Button>
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule Report Generation</CardTitle>
                  <CardDescription>
                    Automate regular report generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select>
                        <SelectTrigger id="reportType">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student-progress">Student Progress</SelectItem>
                          <SelectItem value="advisor-performance">Advisor Performance</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="activity">Activity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="delivery">Delivery Method</Label>
                      <Select>
                        <SelectTrigger id="delivery">
                          <SelectValue placeholder="Select delivery method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="download">Download Only</SelectItem>
                          <SelectItem value="email">Email Delivery</SelectItem>
                          <SelectItem value="both">Both Download & Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Panel */}
      {(selectedReport || selectedComplianceReport) && (
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>
              {selectedReport?.title || selectedComplianceReport?.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Report Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span>{selectedReport.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{getReportTypeBadge(selectedReport.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{getCategoryBadge(selectedReport.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(selectedReport.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Generated:</span>
                        <span>{formatDate(selectedReport.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{selectedReport.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Points:</span>
                        <span>{selectedReport.dataPoints}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Generated By</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedReport.generatedBy}&backgroundColor=b6e6ff&fontSize=32`} alt={selectedReport.generatedBy} />
                        <AvatarFallback>{selectedReport.generatedBy.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedReport.generatedBy}</div>
                        <div className="text-sm text-muted-foreground">System Generated</div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-2">Filters Applied</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.filtersApplied.map((filter, index) => (
                        <Badge key={index} variant="secondary">{filter}</Badge>
                      ))}
                    </div>
                    
                    <h3 className="font-medium mt-4 mb-2">Export Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.exportFormats.map((format, index) => (
                        <Badge key={index} variant="outline">{format.toUpperCase()}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Report
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
            
            {selectedComplianceReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Institution</h3>
                    <p className="text-sm">{selectedComplianceReport.institution}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Department</h3>
                    <p className="text-sm">{selectedComplianceReport.department}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Period</h3>
                    <p className="text-sm">{selectedComplianceReport.period}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedComplianceReport.compliancePercentage}%</div>
                    <div className="text-sm text-muted-foreground">Compliance Rate</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedComplianceReport.issuesFound}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedComplianceReport.recommendations}</div>
                    <div className="text-sm text-muted-foreground">Recommendations</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatDate(selectedComplianceReport.nextReviewDate)}</div>
                    <div className="text-sm text-muted-foreground">Next Review</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Detailed Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.thesisSubmissions}</div>
                      <div className="text-sm text-muted-foreground">Thesis Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.completedReviews}</div>
                      <div className="text-sm text-muted-foreground">Completed Reviews</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.pendingReviews}</div>
                      <div className="text-sm text-muted-foreground">Pending Reviews</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.overdueSubmissions}</div>
                      <div className="text-sm text-muted-foreground">Overdue Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.plagiarismIssues}</div>
                      <div className="text-sm text-muted-foreground">Plagiarism Issues</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.formatCompliance}</div>
                      <div className="text-sm text-muted-foreground">Format Compliance</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{selectedComplianceReport.data.advisorResponsiveness}%</div>
                      <div className="text-sm text-muted-foreground">Advisor Responsiveness</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Issues
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportingSuite;