"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface ProjectFormData {
  title: string;
  subtitle: string;
  abstract: string;
  keywords: string;
  language: string;
  academicYear: string;
  semester: string;
  status: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    subtitle: '',
    abstract: '',
    keywords: '',
    language: 'en',
    academicYear: '',
    semester: '1st',
    status: 'initiated'
  });

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
        status: formData.status
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession.access_token}`,
          'x-user-id': currentSession.user.id
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create project');
      }

      const result = await response.json();
      toast.success('Project created successfully');
      router.push(`/projects/${result.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Thesis Project</CardTitle>
          <CardDescription>Fill in the details to start your new research project</CardDescription>
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
                Separate multiple keywords with commas (e.g., Machine Learning, AI, Research)
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
              <p className="text-xs text-muted-foreground">
                Format: YYYY-YYYY (e.g., 2024-2025)
              </p>
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
              <Label htmlFor="status">Initial Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="initiated">Initiated</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Project
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
