'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { formatDistanceToNow, format } from "date-fns";
import {
  FileCheck,
  Search,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  Filter,
} from "lucide-react";

type ReviewRecord = {
  id: string;
  studentName: string;
  documentTitle: string;
  reviewedAt: string;
  decision: 'approved' | 'revision_required' | 'rejected';
  reviewTime: number; // in minutes
  feedbackLength: number; // word count
  certificateIssued: boolean;
};

const mockHistory: ReviewRecord[] = [
  {
    id: '1',
    studentName: 'Maria Santos',
    documentTitle: 'Impact of Social Media on Academic Performance',
    reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'approved',
    reviewTime: 45,
    feedbackLength: 350,
    certificateIssued: true
  },
  {
    id: '2',
    studentName: 'Juan Dela Cruz',
    documentTitle: 'E-Learning Effectiveness in Philippine Universities',
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'revision_required',
    reviewTime: 60,
    feedbackLength: 520,
    certificateIssued: false
  },
  {
    id: '3',
    studentName: 'Ana Reyes',
    documentTitle: 'Financial Literacy Among Filipino Youth',
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'approved',
    reviewTime: 35,
    feedbackLength: 280,
    certificateIssued: true
  },
  {
    id: '4',
    studentName: 'Pedro Garcia',
    documentTitle: 'Sustainable Agriculture Practices in Mindanao',
    reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'revision_required',
    reviewTime: 55,
    feedbackLength: 480,
    certificateIssued: false
  },
  {
    id: '5',
    studentName: 'Rosa Martinez',
    documentTitle: 'Mental Health Awareness in Philippine Schools',
    reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'approved',
    reviewTime: 40,
    feedbackLength: 310,
    certificateIssued: true
  },
  {
    id: '6',
    studentName: 'Carlos Tan',
    documentTitle: 'Cryptocurrency Adoption in Small Businesses',
    reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    decision: 'rejected',
    reviewTime: 30,
    feedbackLength: 420,
    certificateIssued: false
  },
];

export default function ReviewHistoryPage() {
  const authContext = useAuth();
  const [history] = useState<ReviewRecord[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDecision, setFilterDecision] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  if (!authContext) return <BrandedLoader />;
  const { session, profile, isLoading } = authContext;
  if (!isLoading && (!session || profile?.role !== 'critic')) redirect('/login');
  if (isLoading) return <BrandedLoader />;

  const filteredHistory = history
    .filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterDecision === 'all' || record.decision === filterDecision;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime();
      if (sortBy === 'time') return b.reviewTime - a.reviewTime;
      return 0;
    });

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'revision_required':
        return <Badge className="bg-yellow-500/20 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Revision Required</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{decision}</Badge>;
    }
  };

  const stats = {
    total: history.length,
    approved: history.filter(r => r.decision === 'approved').length,
    revisionRequired: history.filter(r => r.decision === 'revision_required').length,
    rejected: history.filter(r => r.decision === 'rejected').length,
    avgReviewTime: Math.round(history.reduce((acc, r) => acc + r.reviewTime, 0) / history.length),
    certificatesIssued: history.filter(r => r.certificateIssued).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileCheck className="h-8 w-8" />
            Review History
          </h1>
          <p className="text-muted-foreground">
            Complete history of all your manuscript reviews
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.revisionRequired}</div>
            <div className="text-xs text-muted-foreground">Revisions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{stats.avgReviewTime}m</div>
            <div className="text-xs text-muted-foreground">Avg. Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.certificatesIssued}</div>
            <div className="text-xs text-muted-foreground">Certificates</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDecision} onValueChange={setFilterDecision}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by decision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="revision_required">Revision Required</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="time">Review Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Review Records</CardTitle>
          <CardDescription>Showing {filteredHistory.length} of {history.length} reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reviews found</p>
                </div>
              ) : (
                filteredHistory.map((record) => (
                  <div key={record.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{record.studentName}</span>
                          {getDecisionBadge(record.decision)}
                          {record.certificateIssued && (
                            <Badge variant="outline" className="text-blue-500">
                              <FileCheck className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm mb-2">{record.documentTitle}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(record.reviewedAt), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.reviewTime} min review
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {record.feedbackLength} words feedback
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
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
