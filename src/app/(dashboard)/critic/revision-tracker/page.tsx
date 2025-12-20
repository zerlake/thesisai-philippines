'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  History,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Eye,
  MessageSquare,
  ArrowRight,
  User,
  GitCompare,
} from "lucide-react";

type RevisionItem = {
  id: string;
  studentName: string;
  documentTitle: string;
  version: number;
  status: 'pending' | 'reviewed' | 'approved' | 'needs_changes';
  submittedAt: string;
  changes: string[];
  previousFeedback?: string;
};

const mockRevisions: RevisionItem[] = [
  {
    id: '1',
    studentName: 'Maria Santos',
    documentTitle: 'Impact of Social Media on Academic Performance',
    version: 3,
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    changes: ['Revised methodology section', 'Added 5 new citations', 'Expanded discussion of limitations'],
    previousFeedback: 'Please strengthen the methodology section with more detail on sampling procedures.'
  },
  {
    id: '2',
    studentName: 'Juan Dela Cruz',
    documentTitle: 'E-Learning Effectiveness in Philippine Universities',
    version: 2,
    status: 'needs_changes',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    changes: ['Updated literature review', 'Fixed citation formatting'],
    previousFeedback: 'Literature review needs more recent sources (2020-2024).'
  },
  {
    id: '3',
    studentName: 'Ana Reyes',
    documentTitle: 'Financial Literacy Among Filipino Youth',
    version: 4,
    status: 'approved',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    changes: ['Final proofreading corrections', 'Table formatting updates'],
  },
  {
    id: '4',
    studentName: 'Pedro Garcia',
    documentTitle: 'Sustainable Agriculture Practices',
    version: 1,
    status: 'reviewed',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    changes: ['Initial submission'],
  },
];

export default function RevisionTrackerPage() {
  const authContext = useAuth();
  const [revisions] = useState<RevisionItem[]>(mockRevisions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!authContext) return <BrandedLoader />;
  const { session, profile, isLoading } = authContext;
  if (!isLoading && (!session || profile?.role !== 'critic')) redirect('/login');
  if (isLoading) return <BrandedLoader />;

  const filteredRevisions = revisions.filter(rev => {
    const matchesSearch = rev.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rev.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || rev.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-500/20 text-blue-500"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-purple-500/20 text-purple-500"><Eye className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'needs_changes':
        return <Badge className="bg-yellow-500/20 text-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Needs Changes</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = {
    pending: revisions.filter(r => r.status === 'pending').length,
    reviewed: revisions.filter(r => r.status === 'reviewed').length,
    approved: revisions.filter(r => r.status === 'approved').length,
    needsChanges: revisions.filter(r => r.status === 'needs_changes').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8" />
          Revision Tracker
        </h1>
        <p className="text-muted-foreground">
          Track and manage document revisions across all your students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterStatus('pending')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
              <Clock className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterStatus('reviewed')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-500">{stats.reviewed}</div>
                <div className="text-sm text-muted-foreground">Reviewed</div>
              </div>
              <Eye className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterStatus('needs_changes')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-500">{stats.needsChanges}</div>
                <div className="text-sm text-muted-foreground">Needs Changes</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterStatus('approved')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or document title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>
          All
        </Button>
      </div>

      {/* Revisions List */}
      <Card>
        <CardHeader>
          <CardTitle>Revision History</CardTitle>
          <CardDescription>Click on a revision to view details and provide feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredRevisions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No revisions found</p>
                </div>
              ) : (
                filteredRevisions.map((revision) => (
                  <div key={revision.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{revision.studentName}</span>
                          {getStatusBadge(revision.status)}
                        </div>
                        <h4 className="font-medium mb-1">{revision.documentTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <GitCompare className="h-3 w-3" />
                            Version {revision.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(revision.submittedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Changes in this revision:</p>
                          <ul className="text-sm list-disc list-inside">
                            {revision.changes.map((change, index) => (
                              <li key={index}>{change}</li>
                            ))}
                          </ul>
                        </div>
                        {revision.previousFeedback && (
                          <div className="mt-3 p-2 bg-yellow-500/10 rounded text-sm">
                            <span className="font-medium">Previous feedback: </span>
                            {revision.previousFeedback}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
