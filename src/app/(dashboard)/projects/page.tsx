"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  Calendar,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2
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
  status: 'initiated' | 'draft' | 'in_review' | 'in_progress' | 'revisions' | 'approved' | 'submitted' | 'published' | 'archived';
  progress_percentage?: number;
  academic_year?: string;
  semester?: '1st' | '2nd' | 'summer';
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
    };
  };
}

const STATUS_COLORS = {
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

const STATUS_LABELS = {
  initiated: 'Initiated',
  draft: 'Draft',
  in_review: 'In Review',
  in_progress: 'In Progress',
  revisions: 'Revisions',
  approved: 'Approved',
  submitted: 'Submitted',
  published: 'Published',
  archived: 'Archived',
};

export default function ProjectsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [projects, setProjects] = useState<ThesisProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());

  useEffect(() => {
    loadProjects();
  }, [useMockData]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Mock data
        const mockProjects: ThesisProject[] = [
          {
            id: '1',
            title: 'Machine Learning Applications in Agricultural Pest Detection',
            subtitle: 'A Computer Vision Approach',
            status: 'in_progress',
            progress_percentage: 65,
            academic_year: '2024-2025',
            semester: '1st',
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
                full_name: 'Dr. Maria Santos'
              }
            }
          },
          {
            id: '2',
            title: 'Blockchain Technology for Supply Chain Management',
            status: 'draft',
            progress_percentage: 25,
            academic_year: '2024-2025',
            semester: '1st',
            created_at: new Date('2024-10-15').toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: '1',
              full_name: 'Juan Dela Cruz',
              email: 'juan@example.com'
            }
          },
          {
            id: '3',
            title: 'Impact of Remote Learning on Student Performance',
            status: 'approved',
            progress_percentage: 95,
            academic_year: '2023-2024',
            semester: '2nd',
            created_at: new Date('2023-08-20').toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: '1',
              full_name: 'Juan Dela Cruz',
              email: 'juan@example.com'
            },
            advisor: {
              id: 'adv2',
              profile: {
                full_name: 'Prof. Ricardo Reyes'
              }
            }
          }
        ];
        setProjects(mockProjects);
      } else {
        // Fetch from API
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          throw new Error('No active session');
        }

        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${currentSession.access_token}`,
            'x-user-id': currentSession.user.id
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    router.push('/projects/new');
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

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
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thesis Projects</h1>
          <p className="text-muted-foreground">Manage your thesis and research projects</p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first thesis project'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={handleCreateProject}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {project.title}
                    </CardTitle>
                    {project.subtitle && (
                      <CardDescription className="line-clamp-1">
                        {project.subtitle}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={STATUS_COLORS[project.status]}>
                    {STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.progress_percentage !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  {project.academic_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{project.academic_year} - {project.semester} Semester</span>
                    </div>
                  )}
                  {project.advisor && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Advisor: {project.advisor.profile.full_name}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewProject(project.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
