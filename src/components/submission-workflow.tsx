"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar,
  MessageSquare,
  GitBranch,
  FileClock,
  User,
  Users,
  Target,
  FileCheck,
  FileQuestion,
  FileSignature,
  FileWarning,
  FileArchive,
  Settings,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Archive,
  Unarchive,
  ExternalLink,
  History,
  Info,
  ArrowUpDown,
  RotateCcw
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface DocumentVersion {
  id: string;
  versionNumber: string;
  fileName: string;
  filePath: string;
  fileSize: string;
  uploadDate: string;
  uploader: {
    id: string;
    name: string;
    role: "student" | "advisor" | "admin";
  };
  status: "submitted" | "under-review" | "approved" | "rejected" | "revisions-required" | "published";
  feedback?: string;
  reviewer?: {
    id: string;
    name: string;
    role: "advisor" | "critic" | "admin";
  };
  reviewDate?: string;
  revisionNotes?: string;
  isCurrent: boolean;
}

interface Submission {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  thesisPhase: "proposal" | "chapter-1" | "chapter-2" | "chapter-3" | "chapter-4" | "chapter-5" | "defense-presentation" | "final";
  status: "draft" | "submitted" | "under-review" | "approved" | "rejected" | "revisions-required" | "published";
  submissionDate: string;
  lastUpdated: string;
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  currentVersion: string;
  documentType: "thesis" | "proposal" | "chapter" | "presentation" | "other";
  plagiarismCheck: "pending" | "passed" | "failed";
  plagiarismScore?: number;
  originalityScore?: number;
  advisorFeedback: string;
  advisorNotes: string;
  nextSteps: string;
  deadline: string;
  isUrgent: boolean;
  tags: string[];
  versions: DocumentVersion[];
  isArchived: boolean;
}

const SubmissionWorkflow = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: "1",
      title: "Thesis Proposal - Impact of Social Media",
      description: "Research proposal on social media effects on academic performance",
      studentId: "student-1",
      studentName: "Maria Santos",
      studentEmail: "maria.santos@up.edu.ph",
      department: "Computer Science",
      thesisPhase: "proposal",
      status: "under-review",
      submissionDate: "2024-12-20",
      lastUpdated: "2024-12-22",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      currentVersion: "v2.1",
      documentType: "proposal",
      plagiarismCheck: "passed",
      plagiarismScore: 94,
      originalityScore: 94,
      advisorFeedback: "Good introduction but needs stronger research questions",
      advisorNotes: "Student needs to refine research methodology",
      nextSteps: "Revise research questions and methodology section",
      deadline: "2025-01-05",
      isUrgent: false,
      tags: ["proposal", "research-methodology", "literature-review"],
      versions: [
        {
          id: "v1",
          versionNumber: "v1.0",
          fileName: "thesis-proposal-v1.pdf",
          filePath: "/uploads/proposal-v1.pdf",
          fileSize: "1.2 MB",
          uploadDate: "2024-12-15",
          uploader: {
            id: "student-1",
            name: "Maria Santos",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v2",
          versionNumber: "v2.0",
          fileName: "thesis-proposal-v2.pdf",
          filePath: "/uploads/proposal-v2.pdf",
          fileSize: "1.4 MB",
          uploadDate: "2024-12-18",
          uploader: {
            id: "student-1",
            name: "Maria Santos",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v3",
          versionNumber: "v2.1",
          fileName: "thesis-proposal-v2.1.pdf",
          filePath: "/uploads/proposal-v2.1.pdf",
          fileSize: "1.5 MB",
          uploadDate: "2024-12-20",
          uploader: {
            id: "student-1",
            name: "Maria Santos",
            role: "student"
          },
          status: "under-review",
          feedback: "Good introduction but needs stronger research questions",
          reviewer: {
            id: "advisor-1",
            name: "Dr. Juan Dela Cruz",
            role: "advisor"
          },
          reviewDate: "2024-12-21",
          isCurrent: true
        }
      ],
      isArchived: false
    },
    {
      id: "2",
      title: "Chapter 2 - Literature Review",
      description: "Comprehensive literature review on economic impacts of climate change",
      studentId: "student-2",
      studentName: "Juan Dela Cruz",
      studentEmail: "juan.dc@up.edu.ph",
      department: "Economics",
      thesisPhase: "chapter-2",
      status: "revisions-required",
      submissionDate: "2024-12-18",
      lastUpdated: "2024-12-21",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      currentVersion: "v1.2",
      documentType: "chapter",
      plagiarismCheck: "pending",
      advisorFeedback: "Needs more recent sources from 2023-2024",
      advisorNotes: "Literature review needs expansion with recent studies",
      nextSteps: "Add recent publications and improve synthesis",
      deadline: "2025-01-10",
      isUrgent: true,
      tags: ["literature-review", "economics", "climate-change"],
      versions: [
        {
          id: "v1",
          versionNumber: "v1.0",
          fileName: "chapter2-lit-review-v1.pdf",
          filePath: "/uploads/chapter2-v1.pdf",
          fileSize: "2.1 MB",
          uploadDate: "2024-12-15",
          uploader: {
            id: "student-2",
            name: "Juan Dela Cruz",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v2",
          versionNumber: "v1.1",
          fileName: "chapter2-lit-review-v1.1.pdf",
          filePath: "/uploads/chapter2-v1.1.pdf",
          fileSize: "2.3 MB",
          uploadDate: "2024-12-17",
          uploader: {
            id: "student-2",
            name: "Juan Dela Cruz",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v3",
          versionNumber: "v1.2",
          fileName: "chapter2-lit-review-v1.2.pdf",
          filePath: "/uploads/chapter2-v1.2.pdf",
          fileSize: "2.4 MB",
          uploadDate: "2024-12-18",
          uploader: {
            id: "student-2",
            name: "Juan Dela Cruz",
            role: "student"
          },
          status: "revisions-required",
          feedback: "Needs more recent sources from 2023-2024",
          reviewer: {
            id: "advisor-1",
            name: "Dr. Juan Dela Cruz",
            role: "advisor"
          },
          reviewDate: "2024-12-21",
          revisionNotes: "Add recent publications, improve synthesis",
          isCurrent: true
        }
      ],
      isArchived: false
    },
    {
      id: "3",
      title: "Final Thesis Submission",
      description: "Complete thesis document for defense",
      studentId: "student-4",
      studentName: "Carlos Gomez",
      studentEmail: "carlos.gomez@up.edu.ph",
      department: "Agricultural Sciences",
      thesisPhase: "final",
      status: "approved",
      submissionDate: "2024-11-30",
      lastUpdated: "2024-12-15",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      currentVersion: "v3.0",
      documentType: "thesis",
      plagiarismCheck: "passed",
      plagiarismScore: 97,
      originalityScore: 97,
      advisorFeedback: "Excellent work throughout the thesis process",
      advisorNotes: "Ready for defense",
      nextSteps: "Schedule final defense",
      deadline: "2024-12-20",
      isUrgent: false,
      tags: ["final", "thesis", "defense-ready"],
      versions: [
        {
          id: "v1",
          versionNumber: "v1.0",
          fileName: "thesis-final-v1.pdf",
          filePath: "/uploads/thesis-v1.pdf",
          fileSize: "3.2 MB",
          uploadDate: "2024-11-15",
          uploader: {
            id: "student-4",
            name: "Carlos Gomez",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v2",
          versionNumber: "v2.0",
          fileName: "thesis-final-v2.pdf",
          filePath: "/uploads/thesis-v2.pdf",
          fileSize: "3.5 MB",
          uploadDate: "2024-11-25",
          uploader: {
            id: "student-4",
            name: "Carlos Gomez",
            role: "student"
          },
          status: "submitted",
          isCurrent: false
        },
        {
          id: "v3",
          versionNumber: "v3.0",
          fileName: "thesis-final-v3.pdf",
          filePath: "/uploads/thesis-v3.pdf",
          fileSize: "3.7 MB",
          uploadDate: "2024-11-30",
          uploader: {
            id: "student-4",
            name: "Carlos Gomez",
            role: "student"
          },
          status: "approved",
          feedback: "Excellent work throughout the thesis process",
          reviewer: {
            id: "advisor-1",
            name: "Dr. Juan Dela Cruz",
            role: "advisor"
          },
          reviewDate: "2024-12-15",
          isCurrent: true
        }
      ],
      isArchived: false
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<"submissions" | "versions" | "workflow">("submissions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    title: "",
    description: "",
    studentName: "",
    studentEmail: "",
    thesisPhase: "proposal" as "proposal" | "chapter-1" | "chapter-2" | "chapter-3" | "chapter-4" | "chapter-5" | "defense-presentation" | "final",
    documentType: "thesis" as "thesis" | "proposal" | "chapter" | "presentation" | "other",
    tags: "",
    file: null as File | null
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    const matchesPhase = phaseFilter === "all" || submission.thesisPhase === phaseFilter;
    const matchesType = typeFilter === "all" || submission.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPhase && matchesType;
  });

  const handleUploadSubmission = () => {
    if (!newSubmission.title || !newSubmission.studentName || !newSubmission.studentEmail || !newSubmission.file) return;

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      title: newSubmission.title,
      description: newSubmission.description,
      studentId: `student-${Date.now()}`,
      studentName: newSubmission.studentName,
      studentEmail: newSubmission.studentEmail,
      department: "Computer Science", // Would come from profile
      thesisPhase: newSubmission.thesisPhase,
      status: "submitted",
      submissionDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      advisorId: "advisor-1", // Current advisor
      advisorName: "Dr. Juan Dela Cruz", // Current advisor
      advisorEmail: "juan.dc@thesisai.ph",
      currentVersion: "v1.0",
      documentType: newSubmission.documentType,
      plagiarismCheck: "pending",
      advisorFeedback: "",
      advisorNotes: "",
      nextSteps: "",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
      isUrgent: false,
      tags: newSubmission.tags.split(',').map(tag => tag.trim()),
      versions: [{
        id: `ver-${Date.now()}`,
        versionNumber: "v1.0",
        fileName: newSubmission.file.name,
        filePath: "", // Would be the actual file path after upload
        fileSize: `${(newSubmission.file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploader: {
          id: `student-${Date.now()}`,
          name: newSubmission.studentName,
          role: "student"
        },
        status: "submitted",
        isCurrent: true
      }],
      isArchived: false
    };

    setSubmissions([submission, ...submissions]);
    setNewSubmission({
      title: "",
      description: "",
      studentName: "",
      studentEmail: "",
      thesisPhase: "proposal",
      documentType: "thesis",
      tags: "",
      file: null
    });
    setShowUploadDialog(false);
  };

  const handleUpdateStatus = (submissionId: string, newStatus: Submission["status"]) => {
    setSubmissions(submissions.map(sub => 
      sub.id === submissionId 
        ? { 
            ...sub, 
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0],
            versions: sub.versions.map(ver => 
              ver.isCurrent 
                ? { ...ver, status: newStatus } 
                : ver
            )
          } 
        : sub
    ));
    
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission({
        ...selectedSubmission,
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
        versions: selectedSubmission.versions.map(ver => 
          ver.isCurrent 
            ? { ...ver, status: newStatus } 
            : ver
        )
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case "under-review":
        return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "revisions-required":
        return <Badge className="bg-orange-500">Revisions Required</Badge>;
      case "published":
        return <Badge className="bg-purple-500">Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "proposal":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Proposal</Badge>;
      case "chapter-1":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Chapter 1</Badge>;
      case "chapter-2":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Chapter 2</Badge>;
      case "chapter-3":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Chapter 3</Badge>;
      case "chapter-4":
        return <Badge variant="outline" className="bg-pink-100 text-pink-800">Chapter 4</Badge>;
      case "chapter-5":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Chapter 5</Badge>;
      case "defense-presentation":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Defense</Badge>;
      case "final":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Final</Badge>;
      default:
        return <Badge variant="outline">{phase}</Badge>;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    switch (type) {
      case "thesis":
        return <Badge variant="outline">Thesis</Badge>;
      case "proposal":
        return <Badge className="bg-blue-100 text-blue-800">Proposal</Badge>;
      case "chapter":
        return <Badge className="bg-green-100 text-green-800">Chapter</Badge>;
      case "presentation":
        return <Badge className="bg-purple-100 text-purple-800">Presentation</Badge>;
      case "other":
        return <Badge variant="outline">Other</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPlagiarismBadge = (status: string, score?: number) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-500">{score}% Match</Badge>;
      case "failed":
        return <Badge variant="destructive">{score}% Match</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h2 className="text-2xl font-bold tracking-tight">Submission Workflow</h2>
          <p className="text-muted-foreground">
            Manage document submissions, track status, and maintain version history
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Submission Assistant: Active</span>
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
                <CardTitle>Document Submissions</CardTitle>
                <CardDescription>
                  {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="revisions-required">Revisions Required</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="chapter-1">Chapter 1</SelectItem>
                    <SelectItem value="chapter-2">Chapter 2</SelectItem>
                    <SelectItem value="chapter-3">Chapter 3</SelectItem>
                    <SelectItem value="chapter-4">Chapter 4</SelectItem>
                    <SelectItem value="chapter-5">Chapter 5</SelectItem>
                    <SelectItem value="defense-presentation">Defense</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  New Submission
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    {/* Top row - Title and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${submission.studentName}&backgroundColor=b6e6ff&fontSize=32`} alt={submission.studentName} />
                          <AvatarFallback>{submission.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{submission.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{submission.studentName} • {submission.department}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {getStatusBadge(submission.status)}
                        {getPlagiarismBadge(submission.plagiarismCheck, submission.plagiarismScore)}
                        {submission.isUrgent && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            URGENT
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {getDocumentTypeBadge(submission.documentType)}
                      {getPhaseBadge(submission.thesisPhase)}
                      <Badge variant="outline">v{submission.currentVersion}</Badge>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(submission.submissionDate)}</div>
                        <div className="text-xs text-muted-foreground">Submitted</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{submission.plagiarismScore}%</div>
                        <div className="text-xs text-muted-foreground">Originality</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{submission.tags.length}</div>
                        <div className="text-xs text-muted-foreground">Tags</div>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(submission.id, "approved")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(submission.id, "revisions-required")}>
                            <FileText className="h-4 w-4 mr-2" />
                            Request Revisions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(submission.id, "rejected")}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Feedback
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSubmissions(submissions.filter(s => s.id !== submission.id))}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No submissions found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No submissions match your search." : "No submissions have been made yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowUploadDialog(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Version History Section */}
          {selectedSubmission && (
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>
                  Complete history of document versions and reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSubmission.versions
                    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                    .map((version) => (
                      <div key={version.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <GitBranch className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{version.fileName}</h3>
                              <Badge variant={version.isCurrent ? "default" : "outline"}>
                                {version.isCurrent ? "Current" : "Archived"}
                              </Badge>
                              {getStatusBadge(version.status)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Version {version.versionNumber} • {version.fileSize} • Uploaded {formatDate(version.uploadDate)} by {version.uploader.name}
                            </div>
                            {version.reviewer && (
                              <div className="text-sm text-muted-foreground mt-1">
                                Reviewed by {version.reviewer.name} on {formatDate(version.reviewDate!)}
                              </div>
                            )}
                            {version.feedback && (
                              <div className="mt-2 p-3 bg-muted rounded-lg">
                                <div className="font-medium text-sm">Feedback:</div>
                                <div className="text-sm">{version.feedback}</div>
                              </div>
                            )}
                            {version.revisionNotes && (
                              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="font-medium text-sm">Revision Notes:</div>
                                <div className="text-sm">{version.revisionNotes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Submission Details */}
        <div className="w-full lg:w-80 space-y-6">
          {selectedSubmission ? (
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
                <CardDescription>
                  {selectedSubmission.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Student Information</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedSubmission.studentName}&backgroundColor=b6e6ff&fontSize=32`} alt={selectedSubmission.studentName} />
                        <AvatarFallback>{selectedSubmission.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedSubmission.studentName}</div>
                        <div className="text-sm text-muted-foreground">{selectedSubmission.studentEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Document Status</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedSubmission.status)}
                      {getPhaseBadge(selectedSubmission.thesisPhase)}
                      {getDocumentTypeBadge(selectedSubmission.documentType)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Submitted</Label>
                      <div className="font-medium">{formatDate(selectedSubmission.submissionDate)}</div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Updated</Label>
                      <div className="font-medium">{formatDate(selectedSubmission.lastUpdated)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Version</Label>
                    <div className="font-medium">{selectedSubmission.currentVersion}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">File Size</Label>
                    <div className="font-medium">
                      {selectedSubmission.versions.find(v => v.isCurrent)?.fileSize || "N/A"}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Plagiarism Check</Label>
                    <div className="font-medium">
                      {getPlagiarismBadge(selectedSubmission.plagiarismCheck, selectedSubmission.plagiarismScore)}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Advisor</Label>
                    <div className="font-medium">{selectedSubmission.advisorName}</div>
                    <div className="text-sm text-muted-foreground">{selectedSubmission.advisorEmail}</div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Advisor Feedback</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {selectedSubmission.advisorFeedback || "No feedback provided yet"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Advisor Notes</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        {selectedSubmission.advisorNotes || "No notes added yet"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Next Steps</h3>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        {selectedSubmission.nextSteps || "No next steps specified"}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedSubmission.id, "approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Submission
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedSubmission.id, "revisions-required")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Request Revisions
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedSubmission.id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Submission
                    </Button>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Notify Student
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submission Workflow</CardTitle>
                <CardDescription>
                  Efficiently manage document submissions and reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Clear Status Indicators</div>
                      <div className="text-sm text-muted-foreground">Visual indicators for each submission status</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <History className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Version History</div>
                      <div className="text-sm text-muted-foreground">Complete tracking of all document versions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Feedback Management</div>
                      <div className="text-sm text-muted-foreground">Structured feedback for each submission</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Target className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">Workflow Automation</div>
                      <div className="text-sm text-muted-foreground">Automated transitions between statuses</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button className="w-full" onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit New Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plagiarism Check Card */}
          <Card>
            <CardHeader>
              <CardTitle>Plagiarism Check</CardTitle>
              <CardDescription>
                AI-powered originality verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Overall Score</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">94%</div>
                    <div className="text-xs text-green-600">Original Content</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-medium text-red-800">6%</div>
                    <div className="text-xs text-red-600">Matched Sources</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last checked: {selectedSubmission ? formatDate(selectedSubmission.lastUpdated) : "Just now"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Submission Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit New Document</DialogTitle>
            <DialogDescription>
              Upload a new thesis document for review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="submissionTitle">Document Title</Label>
              <Input
                id="submissionTitle"
                value={newSubmission.title}
                onChange={(e) => setNewSubmission({...newSubmission, title: e.target.value})}
                placeholder="Enter document title"
              />
            </div>
            
            <div>
              <Label htmlFor="submissionDesc">Description</Label>
              <Input
                id="submissionDesc"
                value={newSubmission.description}
                onChange={(e) => setNewSubmission({...newSubmission, description: e.target.value})}
                placeholder="Brief description of the document"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={newSubmission.studentName}
                  onChange={(e) => setNewSubmission({...newSubmission, studentName: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Student Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newSubmission.studentEmail}
                  onChange={(e) => setNewSubmission({...newSubmission, studentEmail: e.target.value})}
                  placeholder="Enter student email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thesisPhase">Thesis Phase</Label>
                <Select value={newSubmission.thesisPhase} onValueChange={(value) => setNewSubmission({...newSubmission, thesisPhase: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="chapter-1">Chapter 1</SelectItem>
                    <SelectItem value="chapter-2">Chapter 2</SelectItem>
                    <SelectItem value="chapter-3">Chapter 3</SelectItem>
                    <SelectItem value="chapter-4">Chapter 4</SelectItem>
                    <SelectItem value="chapter-5">Chapter 5</SelectItem>
                    <SelectItem value="defense-presentation">Defense Presentation</SelectItem>
                    <SelectItem value="final">Final Submission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select value={newSubmission.documentType} onValueChange={(value) => setNewSubmission({...newSubmission, documentType: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thesis">Thesis</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="chapter">Chapter</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newSubmission.tags}
                onChange={(e) => setNewSubmission({...newSubmission, tags: e.target.value})}
                placeholder="e.g., research-methodology, literature-review"
              />
            </div>
            
            <div>
              <Label htmlFor="fileUpload">Document File</Label>
              <Input
                id="fileUpload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setNewSubmission({...newSubmission, file: e.target.files?.[0] || null})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmission} disabled={!newSubmission.title || !newSubmission.studentName || !newSubmission.studentEmail || !newSubmission.file}>
              <Upload className="h-4 w-4 mr-2" />
              Submit Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionWorkflow;