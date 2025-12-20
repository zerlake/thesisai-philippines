'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
import {
  FilePenLine,
  Plus,
  Copy,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  FileText,
  Star
} from "lucide-react";

type FeedbackTemplate = {
  id: string;
  title: string;
  category: 'positive' | 'revision' | 'general' | 'certification';
  content: string;
  usage_count: number;
  is_favorite: boolean;
};

const defaultTemplates: FeedbackTemplate[] = [
  {
    id: '1',
    title: 'Excellent Research Quality',
    category: 'positive',
    content: 'Your research demonstrates excellent quality in methodology and analysis. The findings are well-supported by evidence, and the conclusions are appropriately drawn from the data. The literature review shows comprehensive coverage of relevant sources.',
    usage_count: 45,
    is_favorite: true,
  },
  {
    id: '2',
    title: 'Citation Format Corrections',
    category: 'revision',
    content: 'Please review the citation format throughout your manuscript. Several in-text citations do not match the reference list entries. Ensure all citations follow APA 7th edition format consistently. Specific issues found:\n\n1. Page numbers missing for direct quotes\n2. Inconsistent author name formatting\n3. Missing DOIs for journal articles',
    usage_count: 89,
    is_favorite: true,
  },
  {
    id: '3',
    title: 'Methodology Clarification Needed',
    category: 'revision',
    content: 'The methodology section requires additional detail:\n\n1. Please describe the sampling procedure more explicitly\n2. Include justification for the sample size\n3. Add details about data collection instruments\n4. Clarify the data analysis procedures used\n\nThese additions will strengthen the replicability of your research.',
    usage_count: 67,
    is_favorite: false,
  },
  {
    id: '4',
    title: 'Ready for Certification',
    category: 'certification',
    content: 'Congratulations! Your thesis manuscript has met all required academic standards and is approved for certification. The document demonstrates:\n\n- Sound research methodology\n- Comprehensive literature review\n- Appropriate data analysis\n- Clear and logical presentation\n- Proper citation format\n\nYou may proceed with the final submission process.',
    usage_count: 34,
    is_favorite: true,
  },
  {
    id: '5',
    title: 'Discussion Section Enhancement',
    category: 'revision',
    content: 'The discussion section would benefit from:\n\n1. Stronger connection between findings and research questions\n2. More explicit comparison with existing literature\n3. Clearer explanation of practical implications\n4. Acknowledgment of study limitations\n5. Suggestions for future research directions',
    usage_count: 52,
    is_favorite: false,
  },
  {
    id: '6',
    title: 'Statistical Analysis Feedback',
    category: 'general',
    content: 'Regarding the statistical analysis:\n\n- The choice of statistical tests is appropriate for your research design\n- Please include effect sizes along with p-values\n- Consider adding confidence intervals for key findings\n- Ensure tables are formatted according to APA guidelines\n- Double-check all reported statistics for accuracy',
    usage_count: 28,
    is_favorite: false,
  },
];

export default function FeedbackTemplatesPage() {
  const authContext = useAuth();
  const [templates, setTemplates] = useState<FeedbackTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<FeedbackTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: '', category: 'general', content: '' });

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copied to clipboard!");
  };

  const handleToggleFavorite = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, is_favorite: !t.is_favorite } : t
    ));
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    const template: FeedbackTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      category: newTemplate.category as FeedbackTemplate['category'],
      content: newTemplate.content,
      usage_count: 0,
      is_favorite: false,
    };

    setTemplates([template, ...templates]);
    setNewTemplate({ title: '', category: 'general', content: '' });
    setIsCreateDialogOpen(false);
    toast.success("Template created successfully!");
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'positive':
        return <Badge className="bg-green-500/20 text-green-400">Positive</Badge>;
      case 'revision':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Revision</Badge>;
      case 'certification':
        return <Badge className="bg-blue-500/20 text-blue-400">Certification</Badge>;
      default:
        return <Badge variant="secondary">General</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FilePenLine className="h-8 w-8" />
            Feedback Templates
          </h1>
          <p className="text-muted-foreground">
            Pre-written feedback responses for common review scenarios
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable feedback template for your reviews
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Citation Format Corrections"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full p-2 rounded-md border bg-background"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="positive">Positive Feedback</option>
                  <option value="revision">Revision Request</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your feedback template here..."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="positive">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Positive
                </TabsTrigger>
                <TabsTrigger value="revision">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Revision
                </TabsTrigger>
                <TabsTrigger value="certification">
                  <FileText className="mr-1 h-3 w-3" />
                  Certification
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(template.category)}
                    <span className="text-xs text-muted-foreground">
                      Used {template.usage_count} times
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFavorite(template.id)}
                >
                  <Star className={`h-4 w-4 ${template.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-4">
                {template.content}
              </p>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleCopyTemplate(template.content)}
              >
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(template)}
              >
                <BookOpen className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <FilePenLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {getCategoryBadge(selectedTemplate.category)}
                <span className="text-xs text-muted-foreground">
                  Used {selectedTemplate.usage_count} times
                </span>
              </div>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                {selectedTemplate.content}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => handleCopyTemplate(selectedTemplate.content)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
