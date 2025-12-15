"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { DashboardNotificationSettings } from "./dashboard-notification-settings";
import { thesisChecklist, type ChecklistPhase } from "../lib/checklist-items";
import { Progress } from "./ui/progress";
import { PendingReviewsCard } from "./pending-reviews-card";
import { AdvisorRequestsCard } from "./advisor-requests-card";
import { AtRiskStudentsCard } from "./at-risk-students-card";
import { AdvisorPlanCard } from "./advisor-plan-card";
import { BugReportAlert } from "./bug-report-alert";
import { AdvisorWorkloadCard } from "./advisor-workload-card";
import { FeedbackTurnaroundCard } from "./feedback-turnaround-card";
import { StudentProgressOverviewChart } from "./student-progress-overview-chart";

const totalChecklistItems = thesisChecklist.flatMap((phase: ChecklistPhase) => phase.items).length;

type Student = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  documents: { count: number }[];
  progress: number;
};

type SortConfig = {
  key: keyof Student | 'doc_count';
  direction: 'ascending' | 'descending';
};

export function AdvisorDashboard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({ studentCount: 0, approvedDocs: 0, pendingReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'last_name', direction: 'ascending' });

  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'doc_count') {
          aValue = a.documents[0]?.count || 0;
          bValue = b.documents[0]?.count || 0;
        } else if (sortConfig.key === 'progress') {
          aValue = a.progress;
          bValue = b.progress;
        } else {
          aValue = a[sortConfig.key as keyof Student] || '';
          bValue = b[sortConfig.key as keyof Student] || '';
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue.toLowerCase() < bValue.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue.toLowerCase() > bValue.toLowerCase()) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [students, sortConfig]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="w-4 h-4 ml-2" /> : <ArrowDown className="w-4 h-4 ml-2" />;
  };

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      const { data: relationships, error: relError } = await supabase
        .from('advisor_student_relationships')
        .select('student_id')
        .eq('advisor_id', user.id);

      if (relError) {
        toast.error("Failed to fetch student relationships.");
        setIsLoading(false);
        return;
      }

      if (relationships && relationships.length > 0) {
        const studentIds = relationships.map((r: { student_id: string }) => r.student_id);
        
        const { data: studentProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, documents(count)')
          .in('id', studentIds);

        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist_progress')
          .select('user_id')
          .in('user_id', studentIds);

        if (profileError || checklistError) {
          toast.error("Failed to fetch student data.");
        } else {
          const progressCounts = (checklistData || []).reduce((acc: { [key: string]: number }, item: { user_id: string }) => {
            acc[item.user_id] = (acc[item.user_id] || 0) + 1;
            return acc;
          }, {});

          const studentsWithProgress = (studentProfiles || []).map((student: any) => ({
            ...student,
            progress: totalChecklistItems > 0 ? ((progressCounts[student.id] || 0) / totalChecklistItems) * 100 : 0,
          }));
          // @ts-ignore
          setStudents(studentsWithProgress);
        }

        const { count: pendingCount, error: pendingError } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .in('user_id', studentIds)
          .eq('review_status', 'submitted');

        if (pendingError) {
          toast.error("Failed to fetch document stats.");
        } else {
          setStats({
            studentCount: studentIds.length,
            approvedDocs: 0, // This can be enhanced later
            pendingReviews: pendingCount || 0,
          });
        }
      } else {
        setStudents([]);
        setStats({ studentCount: 0, approvedDocs: 0, pendingReviews: 0 });
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [user, supabase]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advisor Dashboard</h1>
          <p className="text-muted-foreground">Monitor and guide your assigned students.</p>
        </div>
        <DashboardNotificationSettings userRole="advisor" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AdvisorWorkloadCard studentCount={stats.studentCount} pendingReviews={stats.pendingReviews} />
        <FeedbackTurnaroundCard />
        <AdvisorPlanCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingReviewsCard />
        <div className="space-y-6">
          <AtRiskStudentsCard />
          <AdvisorRequestsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
              <CardDescription>An overview of your assigned thesis students.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('last_name')}>
                        Student {getSortIcon('last_name')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('doc_count')}>
                        Documents {getSortIcon('doc_count')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('progress')}>
                        Progress {getSortIcon('progress')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><div className="flex items-center gap-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-8" /></div></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-10 w-24 float-right" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedStudents.length > 0 ? (
                    sortedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.avatar_url || undefined} />
                              <AvatarFallback>{student.first_name?.charAt(0)}{student.last_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.first_name} {student.last_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{student.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.documents[0]?.count || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="w-24" />
                            <span className="text-xs text-muted-foreground">{Math.round(student.progress)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/advisor/students/${student.id}`}>
                            <Button variant="outline" size="sm">
                              View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        You have not been assigned any students yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <StudentProgressOverviewChart students={students} />
        </div>
      </div>
      <BugReportAlert />
    </div>
  );
}