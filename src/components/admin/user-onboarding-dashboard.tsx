"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  PlusCircle, 
  Search, 
  Filter,
  Eye,
  Edit,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { DocumentationMetricsChart } from "./documentation-metrics-chart";

// Mock data types (would come from your backend)
interface DocumentationItem {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft" | "archived";
  lastUpdated: string;
  views: number;
  engagementRate: number;
  feedbackScore: number;
  relatedFAQs: number;
  searchTerms: string[];
}

interface FAQItem {
  id: string;
  question: string;
  category: string;
  views: number;
  searchVolume: number;
  lastUpdated: string;
  resolved: boolean;
}

interface UserGuideItem {
  id: string;
  title: string;
  section: string;
  completionRate: number;
  timeSpent: number; // in minutes
  usersCompleted: number;
  lastUpdated: string;
}

interface AnalyticsMetrics {
  totalDocs: number;
  totalViews: number;
  avgEngagement: number;
  totalFAQs: number;
  searchSuccessRate: number;
  avgFeedbackScore: number;
}

const mockDocumentationData: DocumentationItem[] = [
  {
    id: "1",
    title: "Getting Started Guide",
    category: "Getting Started",
    status: "published",
    lastUpdated: "2024-12-15",
    views: 1245,
    engagementRate: 85.5,
    feedbackScore: 4.7,
    relatedFAQs: 12,
    searchTerms: ["setup", "start", "beginner", "introduction"]
  },
  {
    id: "2",
    title: "AI Tools Usage Guide",
    category: "AI Features",
    status: "published",
    lastUpdated: "2024-12-10",
    views: 987,
    engagementRate: 78.2,
    feedbackScore: 4.3,
    relatedFAQs: 8,
    searchTerms: ["ai", "tools", "usage", "features"]
  },
  {
    id: "3",
    title: "University-Specific Formatting",
    category: "Formatting",
    status: "published",
    lastUpdated: "2024-12-05",
    views: 765,
    engagementRate: 82.1,
    feedbackScore: 4.6,
    relatedFAQs: 15,
    searchTerms: ["format", "university", "up", "dlsu", "ust"]
  },
  {
    id: "4",
    title: "Advisor Collaboration",
    category: "Collaboration",
    status: "draft",
    lastUpdated: "2024-11-28",
    views: 0,
    engagementRate: 0,
    feedbackScore: 0,
    relatedFAQs: 0,
    searchTerms: ["advisor", "collaboration", "feedback"]
  },
  {
    id: "5",
    title: "Citation Management",
    category: "Academic Tools",
    status: "published",
    lastUpdated: "2024-12-12",
    views: 1123,
    engagementRate: 89.3,
    feedbackScore: 4.8,
    relatedFAQs: 10,
    searchTerms: ["citation", "reference", "academic", "apa"]
  }
];

const mockFAQData: FAQItem[] = [
  {
    id: "1",
    question: "How do I format my thesis according to UP guidelines?",
    category: "University Formatting",
    views: 456,
    searchVolume: 234,
    lastUpdated: "2024-12-14",
    resolved: true
  },
  {
    id: "2",
    question: "What AI tools are available for research?",
    category: "AI Features",
    views: 389,
    searchVolume: 198,
    lastUpdated: "2024-12-10",
    resolved: true
  },
  {
    id: "3",
    question: "How do I connect with my advisor?",
    category: "Collaboration",
    views: 298,
    searchVolume: 156,
    lastUpdated: "2024-12-05",
    resolved: true
  },
  {
    id: "4",
    question: "Why is my document not saving?",
    category: "Technical Support",
    views: 187,
    searchVolume: 98,
    lastUpdated: "2024-11-29",
    resolved: false
  },
  {
    id: "5",
    question: "Can I collaborate with classmates?",
    category: "Collaboration",
    views: 321,
    searchVolume: 201,
    lastUpdated: "2024-12-11",
    resolved: true
  }
];

const mockUserGuideData: UserGuideItem[] = [
  {
    id: "1",
    title: "Dashboard Navigation",
    section: "Getting Started",
    completionRate: 78,
    timeSpent: 5,
    usersCompleted: 845,
    lastUpdated: "2024-12-15"
  },
  {
    id: "2",
    title: "Using AI Writing Tools",
    section: "AI Features",
    completionRate: 65,
    timeSpent: 8,
    usersCompleted: 698,
    lastUpdated: "2024-12-12"
  },
  {
    id: "3",
    title: "Managing Documents",
    section: "Workspace Tools",
    completionRate: 82,
    timeSpent: 6,
    usersCompleted: 789,
    lastUpdated: "2024-12-10"
  },
  {
    id: "4",
    title: "Academic Integrity Guidelines",
    section: "Academic Standards",
    completionRate: 91,
    timeSpent: 12,
    usersCompleted: 923,
    lastUpdated: "2024-12-08"
  },
  {
    id: "5",
    title: "Advisor Communication",
    section: "Collaboration",
    completionRate: 70,
    timeSpent: 7,
    usersCompleted: 623,
    lastUpdated: "2024-12-05"
  }
];

const mockMetrics: AnalyticsMetrics = {
  totalDocs: 575,
  totalViews: 24589,
  avgEngagement: 82.4,
  totalFAQs: 72,
  searchSuccessRate: 89.2,
  avgFeedbackScore: 4.5
};

export function UserOnboardingDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(mockMetrics);
  const [docs, setDocs] = useState<DocumentationItem[]>(mockDocumentationData);
  const [faqs, setFaqs] = useState<FAQItem[]>(mockFAQData);
  const [guides, setGuides] = useState<UserGuideItem[]>(mockUserGuideData);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // In a real implementation, this would fetch from your API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setMetrics(mockMetrics);
        setDocs(mockDocumentationData);
        setFaqs(mockFAQData);
        setGuides(mockUserGuideData);
      } catch (error) {
        console.error("Error loading onboarding data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDocs = docs.filter(doc => {
    const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || doc.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setMetrics(mockMetrics);
      setDocs(mockDocumentationData);
      setFaqs(mockFAQData);
      setGuides(mockUserGuideData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Onboarding Analytics</h1>
          <p className="text-muted-foreground">
            Monitor and manage documentation, guides, and user onboarding metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Guide
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentation</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocs}</div>
            <p className="text-xs text-muted-foreground">Files in knowledge base</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Documentation views this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">Average session engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Documentation Performance</CardTitle>
            <CardDescription>Views and engagement by documentation type</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentationMetricsChart data={docs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key onboarding metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">FAQ Search Success</span>
              <Badge variant="secondary">{metrics.searchSuccessRate}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Average Feedback</span>
              <Badge variant="secondary">{metrics.avgFeedbackScore}/5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total FAQs</span>
              <Badge variant="secondary">{metrics.totalFAQs}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Guides</span>
              <Badge variant="secondary">{guides.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different onboarding content */}
      <Tabs defaultValue="docs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Documentation Files</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Getting Started">Getting Started</option>
                <option value="AI Features">AI Features</option>
                <option value="Formatting">Formatting</option>
                <option value="Collaboration">Collaboration</option>
                <option value="Academic Tools">Academic Tools</option>
              </select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Engagement</th>
                      <th className="text-left py-3 px-4">Feedback</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{doc.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{doc.category}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={doc.status === 'published' ? 'default' : 
                                   doc.status === 'draft' ? 'secondary' : 'destructive'}
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{doc.views.toLocaleString()}</td>
                        <td className="py-3 px-4">{doc.engagementRate}%</td>
                        <td className="py-3 px-4">{doc.feedbackScore}/5</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredDocs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No documentation found matching your filters
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Question</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Search Vol.</th>
                      <th className="text-left py-3 px-4">Resolved</th>
                      <th className="text-left py-3 px-4">Last Updated</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq) => (
                      <tr key={faq.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{faq.question}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{faq.category}</Badge>
                        </td>
                        <td className="py-3 px-4">{faq.views}</td>
                        <td className="py-3 px-4">{faq.searchVolume}</td>
                        <td className="py-3 px-4">
                          {faq.resolved ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                        </td>
                        <td className="py-3 px-4">{faq.lastUpdated}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Guides</h2>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Guide
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Section</th>
                      <th className="text-left py-3 px-4">Completion</th>
                      <th className="text-left py-3 px-4">Time Spent</th>
                      <th className="text-left py-3 px-4">Users</th>
                      <th className="text-left py-3 px-4">Last Updated</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guides.map((guide) => (
                      <tr key={guide.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{guide.title}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{guide.section}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${guide.completionRate}%` }}
                              ></div>
                            </div>
                            <span>{guide.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{guide.timeSpent} min</td>
                        <td className="py-3 px-4">{guide.usersCompleted.toLocaleString()}</td>
                        <td className="py-3 px-4">{guide.lastUpdated}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Performance Summary</CardTitle>
              <CardDescription>Key metrics and trends for user onboarding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Documentation Engagement</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Top viewed document</span>
                      <span className="font-medium">{docs[0]?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most engaging</span>
                      <span className="font-medium">{docs.reduce((prev, current) => (prev.engagementRate > current.engagementRate) ? prev : current, docs[0])?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lowest engagement</span>
                      <span className="font-medium">{docs.reduce((prev, current) => (prev.engagementRate < current.engagementRate) ? prev : current, docs[0])?.title || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">FAQ Effectiveness</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Most searched</span>
                      <span className="font-medium">{faqs[0]?.question?.substring(0, 30) + '...' || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unresolved issues</span>
                      <span className="font-medium">{faqs.filter(f => !f.resolved).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search success rate</span>
                      <span className="font-medium">{metrics.searchSuccessRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">User Guide Completion</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Most completed guide</span>
                      <span className="font-medium">{guides.reduce((prev, current) => (prev.completionRate > current.completionRate) ? prev : current, guides[0])?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Least completed</span>
                      <span className="font-medium">{guides.reduce((prev, current) => (prev.completionRate < current.completionRate) ? prev : current, guides[0])?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. completion rate</span>
                      <span className="font-medium">{Math.round(guides.reduce((sum, g) => sum + g.completionRate, 0) / guides.length)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}