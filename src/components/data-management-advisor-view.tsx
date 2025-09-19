"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";

type StudentWithDmp = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  dmp_status: string | null;
  dmp_updated_at: string | null;
};

export function DataManagementAdvisorView() {
  const { session, supabase } = useAuth();
  const [students, setStudents] = useState<StudentWithDmp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchStudents = async () => {
      setIsLoading(true);
      // This would be a great place for an RPC function in a real app
      // For now, we'll fetch relationships then DMPs
      const { data: rels, error: relsError } = await supabase
        .from("advisor_student_relationships")
        .select("student_id")
        .eq("advisor_id", session.user.id);

      if (relsError) {
        toast.error("Failed to fetch students.");
        setIsLoading(false);
        return;
      }

      const studentIds = rels.map(r => r.student_id);
      if (studentIds.length === 0) {
        setIsLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", studentIds);

      const { data: dmps, error: dmpsError } = await supabase
        .from("data_management_plans")
        .select("student_id, status, updated_at")
        .in("student_id", studentIds);

      if (profilesError || dmpsError) {
        toast.error("Failed to load student DMP data.");
      } else {
        const dmpMap = new Map(dmps.map(d => [d.student_id, { status: d.status, updated_at: d.updated_at }]));
        const combinedData = profiles.map(p => ({
          ...p,
          dmp_status: dmpMap.get(p.id)?.status || 'Not Started',
          dmp_updated_at: dmpMap.get(p.id)?.updated_at || null,
        }));
        setStudents(combinedData);
      }
      setIsLoading(false);
    };
    fetchStudents();
  }, [session, supabase]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'pending_review': return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Data Management Plans</CardTitle>
          <CardDescription>Review and approve the DMPs for your assigned students.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Last Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-6 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell className="text-right"><Skeleton className="h-10 w-24 float-right" /></TableCell></TableRow>)
              : students.length > 0 ? students.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                  <TableCell>{getStatusBadge(s.dmp_status)}</TableCell>
                  <TableCell>{s.dmp_updated_at && isMounted ? formatDistanceToNow(new Date(s.dmp_updated_at), { addSuffix: true }) : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/data-management/${s.id}`}>
                      <Button variant="outline" size="sm" disabled={s.dmp_status === 'Not Started'}>
                        View / Review <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No students assigned.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}