"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  FileText,
  Download,
  Upload,
  Search,
  Mail,
  Calendar,
  FileEdit,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Share,
  Star,
  Scale,
  CheckCircle,
  BookText,
  FileSignature,
  BarChart3
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "guides" | "templates" | "forms" | "tutorials" | "policies" | "checklists" | "rubrics";
  type: "pdf" | "docx" | "xlsx" | "pptx" | "link" | "video";
  size: string;
  uploadDate: string;
  downloads: number;
  rating: number;
  tags: string[];
  featured: boolean;
  isBookmarked: boolean;
  isShared: boolean;
  author: string;
  version: string;
  status: "active" | "deprecated" | "draft";
}

const AdvisorResourceHub = () => {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "Thesis Defense Preparation Guide",
      description: "Step-by-step guide for preparing students for thesis defense",
      category: "guides",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "2024-12-15",
      downloads: 124,
      rating: 4.8,
      tags: ["defense", "preparation", "guide"],
      featured: true,
      isBookmarked: false,
      isShared: true,
      author: "Dr. Juan Dela Cruz",
      version: "v2.3",
      status: "active"
    },
    {
      id: "2",
      title: "Feedback Template Library",
      description: "Collection of standardized feedback templates for different thesis sections",
      category: "templates",
      type: "docx",
      size: "1.8 MB",
      uploadDate: "2024-12-10",
      downloads: 89,
      rating: 4.7,
      tags: ["feedback", "templates", "evaluation"],
      featured: true,
      isBookmarked: true,
      isShared: true,
      author: "ThesisAI Team",
      version: "v1.5",
      status: "active"
    },
    {
      id: "3",
      title: "Research Methodology Evaluation Rubric",
      description: "Comprehensive rubric for evaluating research methodology sections",
      category: "rubrics",
      type: "xlsx",
      size: "0.5 MB",
      uploadDate: "2024-12-05",
      downloads: 156,
      rating: 4.9,
      tags: ["rubric", "methodology", "evaluation"],
      featured: true,
      isBookmarked: false,
      isShared: true,
      author: "Dr. Maria Santos",
      version: "v3.1",
      status: "active"
    },
    {
      id: "4",
      title: "Weekly Advisory Meeting Template",
      description: "Structured template for conducting weekly advisory meetings",
      category: "templates",
      type: "docx",
      size: "0.3 MB",
      uploadDate: "2024-12-01",
      downloads: 203,
      rating: 4.6,
      tags: ["meetings", "template", "advisory"],
      featured: false,
      isBookmarked: true,
      isShared: true,
      author: "Dr. Ana Reyes",
      version: "v1.2",
      status: "active"
    },
    {
      id: "5",
      title: "Institutional Thesis Requirements Checklist",
      description: "Comprehensive checklist of institutional thesis requirements",
      category: "checklists",
      type: "pdf",
      size: "0.7 MB",
      uploadDate: "2024-11-28",
      downloads: 178,
      rating: 4.5,
      tags: ["checklist", "requirements", "compliance"],
      featured: false,
      isBookmarked: false,
      isShared: true,
      author: "UP Academic Office",
      version: "v2.0",
      status: "active"
    },
    {
      id: "6",
      title: "Academic Integrity Violations Guide",
      description: "How to identify and address academic integrity violations",
      category: "guides",
      type: "pdf",
      size: "1.2 MB",
      uploadDate: "2024-11-25",
      downloads: 95,
      rating: 4.7,
      tags: ["integrity", "violations", "ethics"],
      featured: true,
      isBookmarked: false,
      isShared: true,
      author: "Dr. Carlos Gomez",
      version: "v1.8",
      status: "active"
    },
    {
      id: "7",
      title: "Literature Review Evaluation Criteria",
      description: "Criteria for evaluating the quality of literature reviews",
      category: "rubrics",
      type: "xlsx",
      size: "0.4 MB",
      uploadDate: "2024-11-20",
      downloads: 142,
      rating: 4.6,
      tags: ["literature", "review", "criteria"],
      featured: false,
      isBookmarked: true,
      isShared: true,
      author: "Dr. Isabel Lim",
      version: "v2.2",
      status: "active"
    },
    {
      id: "8",
      title: "Online Advisory Meeting Best Practices",
      description: "Best practices for conducting effective online advisory meetings",
      category: "guides",
      type: "pdf",
      size: "0.9 MB",
      uploadDate: "2024-11-15",
      downloads: 118,
      rating: 4.4,
      tags: ["online", "meetings", "best-practices"],
      featured: false,
      isBookmarked: false,
      isShared: true,
      author: "ThesisAI Editorial Board",
      version: "v1.3",
      status: "active"
    }
  ]);

  const [activeTab, setActiveTab] = useState<"library" | "bookmarks" | "recent">("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("downloads");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "guides" as "guides" | "templates" | "forms" | "tutorials" | "policies" | "checklists" | "rubrics",
    type: "pdf" as "pdf" | "docx" | "xlsx" | "pptx" | "link" | "video",
    file: null as File | null,
    tags: ""
  });

  const handleUploadResource = () => {
    if (!newResource.title || !newResource.description || !newResource.file) return;

    const resource: Resource = {
      id: `res-${Date.now()}`,
      title: newResource.title,
      description: newResource.description,
      category: newResource.category,
      type: newResource.type,
      size: `${(newResource.file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
      rating: 0,
      tags: newResource.tags.split(',').map(tag => tag.trim()),
      featured: false,
      isBookmarked: false,
      isShared: true,
      author: "Dr. Juan Dela Cruz", // Current advisor
      version: "v1.0",
      status: "active"
    };

    setResources([resource, ...resources]);
    setNewResource({
      title: "",
      description: "",
      category: "guides",
      type: "pdf",
      file: null,
      tags: ""
    });
    setShowUploadDialog(false);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter;
    const matchesType = typeFilter === "all" || resource.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case "downloads":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "date":
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const bookmarkResource = (resourceId: string) => {
    setResources(resources.map(res =>
      res.id === resourceId ? { ...res, isBookmarked: !res.isBookmarked } : res
    ));
  };

  const shareResource = (resourceId: string) => {
    setResources(resources.map(res =>
      res.id === resourceId ? { ...res, isShared: !res.isShared } : res
    ));
  };

  const toggleFeatured = (resourceId: string) => {
    setResources(resources.map(res =>
      res.id === resourceId ? { ...res, featured: !res.featured } : res
    ));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "docx":
        return <FileEdit className="h-5 w-5" />;
      case "xlsx":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "pptx":
        return <FileImage className="h-5 w-5" />;
      case "link":
        return <ExternalLink className="h-5 w-5" />;
      case "video":
        return <FileVideo className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "guides":
        return <Badge variant="default">Guides</Badge>;
      case "templates":
        return <Badge className="bg-blue-500">Templates</Badge>;
      case "forms":
        return <Badge className="bg-green-500">Forms</Badge>;
      case "tutorials":
        return <Badge className="bg-purple-500">Tutorials</Badge>;
      case "policies":
        return <Badge variant="outline">Policies</Badge>;
      case "checklists":
        return <Badge className="bg-yellow-500">Checklists</Badge>;
      case "rubrics":
        return <Badge className="bg-red-500">Rubrics</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advisor Resource Hub</h2>
          <p className="text-muted-foreground">
            Quick-access guides, templates, and tools for thesis advisors
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Resource Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Resource Library</CardTitle>
                <CardDescription>
                  {sortedResources.length} resource{sortedResources.length !== 1 ? 's' : ''} available
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="guides">Guides</SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="tutorials">Tutorials</SelectItem>
                    <SelectItem value="policies">Policies</SelectItem>
                    <SelectItem value="checklists">Checklists</SelectItem>
                    <SelectItem value="rubrics">Rubrics</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="downloads">Most Downloads</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="date">Newest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resource
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload New Resource</DialogTitle>
                      <DialogDescription>
                        Add a new guide, template, or tool to the resource library
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="resourceTitle">Title</Label>
                        <Input
                          id="resourceTitle"
                          value={newResource.title}
                          onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                          placeholder="Enter resource title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="resourceDesc">Description</Label>
                        <Input
                          id="resourceDesc"
                          value={newResource.description}
                          onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                          placeholder="Brief description of the resource"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="resourceCategory">Category</Label>
                          <Select value={newResource.category} onValueChange={(value) => setNewResource({...newResource, category: value as any})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guides">Guides</SelectItem>
                              <SelectItem value="templates">Templates</SelectItem>
                              <SelectItem value="forms">Forms</SelectItem>
                              <SelectItem value="tutorials">Tutorials</SelectItem>
                              <SelectItem value="policies">Policies</SelectItem>
                              <SelectItem value="checklists">Checklists</SelectItem>
                              <SelectItem value="rubrics">Rubrics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="resourceType">Type</Label>
                          <Select value={newResource.type} onValueChange={(value) => setNewResource({...newResource, type: value as any})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                              <SelectItem value="docx">Word Document</SelectItem>
                              <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                              <SelectItem value="pptx">PowerPoint</SelectItem>
                              <SelectItem value="link">External Link</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="resourceFile">File</Label>
                        <Input
                          id="resourceFile"
                          type="file"
                          accept=".pdf,.docx,.xlsx,.pptx,.zip"
                          onChange={(e) => setNewResource({...newResource, file: e.target.files?.[0] || null})}
                        />
                      </div>

                      <div>
                        <Label htmlFor="resourceTags">Tags (comma separated)</Label>
                        <Input
                          id="resourceTags"
                          value={newResource.tags}
                          onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                          placeholder="e.g., defense, methodology, feedback"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadResource} disabled={!newResource.title || !newResource.description || !newResource.file}>
                        Upload Resource
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedResource?.id === resource.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{resource.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getCategoryBadge(resource.category)}
                            {resource.featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            bookmarkResource(resource.id);
                          }}
                        >
                          <Star className={`h-4 w-4 ${resource.isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareResource(resource.id);
                          }}
                        >
                          <Share className={`h-4 w-4 ${resource.isShared ? 'text-blue-500' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{resource.description}</p>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{resource.size}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{formatDate(resource.uploadDate)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {getStars(resource.rating)}
                        <span className="text-xs ml-1">{resource.rating}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                        <Badge variant="outline">{resource.type.toUpperCase()}</Badge>
                      </div>

                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {resource.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{resource.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sortedResources.length === 0 && (
                <div className="text-center py-10">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No resources found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "No resources match your search." : "No resources have been added yet."}
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setShowUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resource
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Resource Details & Actions */}
        <div className="w-full lg:w-80 space-y-6">
          {selectedResource ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getResourceIcon(selectedResource.type)}
                      {selectedResource.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedResource.author}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(selectedResource.id)}
                  >
                    {selectedResource.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedResource.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm">Category</h3>
                      <div className="mt-1">{getCategoryBadge(selectedResource.category)}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Type</h3>
                      <div className="mt-1">
                        <Badge variant="outline">{selectedResource.type.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm">Downloads</h3>
                      <p className="text-lg font-medium">{selectedResource.downloads}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Rating</h3>
                      <div className="flex items-center gap-1">
                        {getStars(selectedResource.rating)}
                        <span className="ml-1">{selectedResource.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm">File Size</h3>
                    <p className="text-sm">{selectedResource.size}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm">Upload Date</h3>
                    <p className="text-sm">{formatDate(selectedResource.uploadDate)}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm">Version</h3>
                    <p className="text-sm">{selectedResource.version}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm">Tags</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedResource.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download Resource
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Share with Students
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" onClick={() => bookmarkResource(selectedResource.id)}>
                      <Star className={`h-4 w-4 mr-2 ${selectedResource.isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {selectedResource.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    </Button>
                    <Button variant="outline" onClick={() => shareResource(selectedResource.id)}>
                      <Share className="h-4 w-4 mr-2" />
                      {selectedResource.isShared ? 'Unshare' : 'Share Resource'}
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-medium text-sm">Actions</h3>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>
                  Frequently used advisor resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/feedback/templates">
                      <FileText className="h-4 w-4 mr-2" />
                      Feedback Templates
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/rubrics">
                      <Scale className="h-4 w-4 mr-2" />
                      Evaluation Rubrics
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/checklists">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Thesis Checklists
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/guides">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Advisor Guides
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/meetings/schedule">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Performance Analytics
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/advisor/communication">
                      <Mail className="h-4 w-4 mr-2" />
                      Broadcast Messages
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Resource Categories</CardTitle>
              <CardDescription>
                Browse by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/guides">
                    <BookText className="h-4 w-4 mr-2" />
                    Guides & Tutorials
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/templates">
                    <FileText className="h-4 w-4 mr-2" />
                    Templates
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/rubrics">
                    <Scale className="h-4 w-4 mr-2" />
                    Evaluation Rubrics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/checklists">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Checklists
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/policies">
                    <FileSignature className="h-4 w-4 mr-2" />
                    Policies
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/advisor/resources/forms">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Forms
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured Resources</CardTitle>
              <CardDescription>
                Highly recommended by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resources
                  .filter(r => r.featured)
                  .slice(0, 3)
                  .map((resource) => (
                    <div key={resource.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{resource.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{resource.category}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStars(resource.rating)}
                        <span className="text-xs ml-1">{resource.rating}</span>
                      </div>
                    </div>
                  ))}

                {resources.filter(r => r.featured).length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No featured resources yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvisorResourceHub;
