"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { format } from "date-fns";
import { getMockDataEnabled } from "@/lib/mock-referral-data";

interface ThesisProject {
  id: string;
  title: string;
  subtitle?: string;
  abstract?: string;
  keywords?: string[];
  language: string;
  status: string;
  progress_percentage?: number;
  academic_year?: string;
  semester?: string;
  defense_date?: string;
  defense_result?: string;
  grade?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  advisor?: {
    id: string;
    profile: {
      full_name: string;
      email: string;
    };
  };
}

const STATUS_COLORS: Record<string, string> = {
  initiated: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-purple-100 text-purple-800',
  revisions: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  submitted: 'bg-teal-100 text-teal-800',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-slate-100 text-slate-800',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { session } = useAuth();
  const [project, setProject] = useState<ThesisProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData] = useState(getMockDataEnabled());

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Mock data
        const mockProject: ThesisProject = {
          id: projectId,
          title: 'Machine Learning Applications in Agricultural Pest Detection',
          subtitle: 'A Computer Vision Approach',
          abstract: 'This research explores the application of machine learning techniques, specifically convolutional neural networks (CNNs), for automated pest detection in agricultural settings. The study aims to develop a cost-effective solution for early pest identification to minimize crop damage and reduce pesticide usage.',
          keywords: ['Machine Learning', 'Computer Vision', 'Agriculture', 'Pest Detection', 'CNN'],
          language: 'en',
          status: 'in_progress',
          progress_percentage: 65,
          academic_year: '2024-2025',
          semester: '1st',
          defense_date: '2025-04-15',
          created_at: new Date('2024-09-01').toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: '1',
            full_name: 'Juan Dela Cruz',
            email: 'juan@example.com'
          },
          advisor: {
            id: 'adv1',
            profile: {
              full_name: 'Dr. Maria Santos',
              email: 'maria.santos@university.edu.ph'
            }
          }
        };
        setProject(mockProject);
      } else {
        // Fetch from API
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          throw new Error('No active session');
        }

        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'x-user-id': currentSession.user.id
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const data = await response.json();
        setProject(data.data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
          'x-user-id': currentSession.user.id
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-12 bg-muted rounded w-2/3 mb-2" />
          <div className="h-6 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <Button onClick={() => router.push('/projects')}>
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Title Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
              {project.subtitle && (
                <CardDescription className="text-lg">{project.subtitle}</CardDescription>
              )}
            </div>
            <Badge className={STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-800'}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {project.progress_percentage !== undefined && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{project.progress_percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {project.user && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Student</p>
                  <p className="text-sm text-muted-foreground">{project.user.full_name}</p>
                </div>
              </div>
            )}
            {project.advisor && (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Advisor</p>
                  <p className="text-sm text-muted-foreground">{project.advisor.profile.full_name}</p>
                </div>
              </div>
            )}
            {project.academic_year && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Academic Year</p>
                  <p className="text-sm text-muted-foreground">
                    {project.academic_year} - {project.semester} Sem
                  </p>
                </div>
              </div>
            )}
            {project.defense_date && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Defense Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(project.defense_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Abstract */}
          {project.abstract && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Abstract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{project.abstract}</p>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {project.keywords && project.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Defense Information */}
          {(project.defense_result || project.grade) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Defense Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.defense_result && (
                  <div>
                    <p className="text-sm font-medium mb-1">Result</p>
                    <Badge variant="outline">{project.defense_result.replace('_', ' ')}</Badge>
                  </div>
                )}
                {project.grade && (
                  <div>
                    <p className="text-sm font-medium mb-1">Grade</p>
                    <p className="text-2xl font-bold">{project.grade.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{project.language.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{format(new Date(project.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Documents</h3>
              <p className="text-muted-foreground text-center mb-4">
                Document management coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Timeline</h3>
              <p className="text-muted-foreground text-center mb-4">
                Project timeline coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Feedback</h3>
              <p className="text-muted-foreground text-center mb-4">
                Advisor feedback coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
