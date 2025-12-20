'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import {
  Inbox,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  AlertTriangle
} from "lucide-react";

type ReviewQueueItem = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  document_id: string;
  document_title: string | null;
  approved_at: string;
  status: string;
  priority: 'high' | 'medium' | 'low';
  days_waiting: number;
};

export default function ReviewQueuePage() {
  const authContext = useAuth();
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [filteredQueue, setFilteredQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading: authLoading, supabase } = authContext;

  useEffect(() => {
    if (!authLoading && (!session || profile?.role !== 'critic')) {
      redirect('/login');
    }
  }, [session, profile, authLoading]);

  useEffect(() => {
    if (!session) return;

    const fetchQueue = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase.rpc('get_students_for_critic_review', {
          p_critic_id: session.user.id
        });

        if (error) {
          // Fallback with mock data for demonstration
          const mockQueue: ReviewQueueItem[] = [
            {
              student_id: '1',
              first_name: 'Maria',
              last_name: 'Santos',
              document_id: 'doc1',
              document_title: 'Impact of AI on Philippine Higher Education',
              approved_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'approved',
              priority: 'high',
              days_waiting: 6
            },
            {
              student_id: '2',
              first_name: 'Juan',
              last_name: 'Dela Cruz',
              document_id: 'doc2',
              document_title: 'Sustainable Tourism Development Framework',
              approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'approved',
              priority: 'medium',
              days_waiting: 3
            },
            {
              student_id: '3',
              first_name: 'Ana',
              last_name: 'Reyes',
              document_id: 'doc3',
              document_title: 'Digital Marketing Strategies for SMEs',
              approved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'approved',
              priority: 'low',
              days_waiting: 1
            },
          ];
          setQueue(mockQueue);
          setFilteredQueue(mockQueue);
        } else {
          const queueWithPriority = (data || []).map((item: any, idx: number) => {
            const daysWaiting = Math.floor((Date.now() - new Date(item.approved_at).getTime()) / (24 * 60 * 60 * 1000));
            return {
              ...item,
              priority: daysWaiting > 5 ? 'high' : daysWaiting > 2 ? 'medium' : 'low',
              days_waiting: daysWaiting,
              status: 'approved'
            };
          });
          setQueue(queueWithPriority);
          setFilteredQueue(queueWithPriority);
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
      }

      setIsLoading(false);
    };

    fetchQueue();
  }, [session, supabase]);

  useEffect(() => {
    let filtered = queue;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.document_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    setFilteredQueue(filtered);
  }, [searchTerm, priorityFilter, queue]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return <BrandedLoader />;
  }

  const highPriorityCount = queue.filter(q => q.priority === 'high').length;
  const mediumPriorityCount = queue.filter(q => q.priority === 'medium').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Inbox className="h-8 w-8" />
            Review Queue
          </h1>
          <p className="text-muted-foreground">
            {queue.length} manuscripts awaiting your review and certification
          </p>
        </div>
        {highPriorityCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">{highPriorityCount} urgent reviews</span>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">{queue.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-500">{highPriorityCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-500">{mediumPriorityCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Normal</p>
                <p className="text-2xl font-bold text-green-500">{queue.length - highPriorityCount - mediumPriorityCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or document title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">Urgent Only</SelectItem>
                <SelectItem value="medium">Medium Only</SelectItem>
                <SelectItem value="low">Normal Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manuscripts Queue</CardTitle>
          <CardDescription>Click on a manuscript to begin your review</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Document Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Waiting Time</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueue.length > 0 ? (
                filteredQueue.map((item) => (
                  <TableRow key={item.document_id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={item.avatar_url || undefined} />
                          <AvatarFallback>
                            {item.first_name?.charAt(0)}{item.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{item.first_name} {item.last_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate">{item.document_title || "Untitled Document"}</p>
                    </TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell>
                      <span className={item.days_waiting > 5 ? 'text-red-500 font-medium' : ''}>
                        {item.days_waiting} days
                      </span>
                    </TableCell>
                    <TableCell>
                      {isMounted && formatDistanceToNow(new Date(item.approved_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/drafts/${item.document_id}`}>
                        <Button size="sm">
                          Start Review <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium">All caught up!</h3>
                    <p className="text-muted-foreground">No manuscripts match your filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
