"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { getMockDataEnabled } from "@/lib/mock-referral-data";

interface ProjectFormData {
  title: string;
  subtitle: string;
  abstract: string;
  keywords: string;
  language: string;
  academicYear: string;
  semester: string;
  status: string;
  progressPercentage: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useMockData] = useState(getMockDataEnabled());
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    subtitle: '',
    abstract: '',
    keywords: '',
    language: 'en',
    academicYear: '',
    semester: '1st',
    status: 'initiated',
    progressPercentage: '0'
  });

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Mock data
        const mockProject = {
          title: 'Machine Learning Applications in Agricultural Pest Detection',
          subtitle: 'A Computer Vision Approach',
          abstract: 'This research explores the application of machine learning techniques...',
          keywords: ['Machine Learning', 'Computer Vision', 'Agriculture', 'Pest Detection', 'CNN'],
          language: 'en',
          status: 'in_progress',
          progress_percentage: 65,
          academic_year: '2024-2025',
          semester: '1st'
        };

        setFormData({
          title: mockProject.title,
          subtitle: mockProject.subtitle || '',
          abstract: mockProject.abstract || '',
          keywords: mockProject.keywords?.join(', ') || '',
          language: mockProject.language,
          academicYear: mockProject.academic_year || '',
          semester: mockProject.semester || '1st',
          status: mockProject.status,
          progressPercentage: mockProject.progress_percentage?.toString() || '0'
        });
      } else {
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
          throw new Error('Failed to fetch project');
        }

        const result = await response.json();
        const project = result.data;

        setFormData({
          title: project.title || '',
          subtitle: project.subtitle || '',
          abstract: project.abstract || '',
          keywords: project.keywords?.join(', ') || '',
          language: project.language || 'en',
          academicYear: project.academic_year || '',
          semester: project.semester || '1st',
          status: project.status || 'initiated',
          progressPercentage: project.progress_percentage?.toString() || '0'
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }

    const progressNum = parseInt(formData.progressPercentage);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    setIsSubmitting(true);
    try {
      const { createBrowserClient } = await import('@/lib/supabase/client');
      const supabase = createBrowserClient();
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error('No active session');
      }

      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        abstract: formData.abstract.trim() || undefined,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : undefined,
        language: formData.language,
        academicYear: formData.academicYear || undefined,
        semester: formData.semester || undefined,
        status: formData.status,
        progressPercentage: progressNum
      };

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
          'x-user-id': currentSession.user.id
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update project');
      }

      toast.success('Project updated successfully');
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-10 bg-muted rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Thesis Project</CardTitle>
          <CardDescription>Update your project details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter your thesis title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                placeholder="Optional subtitle"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                maxLength={300}
              />
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <Label htmlFor="abstract">Abstract</Label>
              <Textarea
                id="abstract"
                placeholder="Provide a brief summary of your research"
                value={formData.abstract}
                onChange={(e) => handleChange('abstract', e.target.value)}
                rows={6}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.abstract.length}/5000 characters
              </p>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="Enter keywords separated by commas"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple keywords with commas
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="en">English</option>
                <option value="fil">Filipino</option>
                <option value="ceb">Cebuano</option>
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g., 2024-2025"
                value={formData.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                pattern="\d{4}-\d{4}"
              />
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="summer">Summer</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="initiated">Initiated</option>
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="in_progress">In Progress</option>
                <option value="revisions">Revisions</option>
                <option value="approved">Approved</option>
                <option value="submitted">Submitted</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Progress Percentage */}
            <div className="space-y-2">
              <Label htmlFor="progressPercentage">Progress (%)</Label>
              <Input
                id="progressPercentage"
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={formData.progressPercentage}
                onChange={(e) => handleChange('progressPercentage', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Current progress: {formData.progressPercentage}%
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
