"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { StudentChecklist } from "./student-checklist";
import { Badge } from "./ui/badge";
import { MilestoneTracker } from "./milestone-tracker";

type Document = {
  id: string;
  title: string | null;
  updated_at: string;
  content: string | null;
  review_status: string;
};

type StudentProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  documents: Document[];
};

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user || !studentId) return;

    const fetchStudentDetails = async () => {
      setIsLoading(true);

      const { data: relationship, error: relError } = await supabase
        .from('advisor_student_relationships')
        .select('student_id')
        .eq('advisor_id', user.id)
        .eq('student_id', studentId)
        .single();

      if (relError || !relationship) {
        toast.error("You are not authorized to view this student's details.");
        router.push('/advisor');
        return;
      }

      const { data: studentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, documents (id, title, updated_at, content, review_status)')
        .eq('id', studentId)
        .single();

      if (profileError) {
        toast.error("Failed to fetch student details.");
        router.push('/advisor');
      } else {
        // @ts-ignore
        setStudent(studentProfile);
      }
      setIsLoading(false);
    };

    fetchStudentDetails();
  }, [user, studentId, supabase, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }
  if (!student) { return <p>Student not found.</p>; }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'submitted': return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/advisor')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={student.avatar_url || undefined} />
          <AvatarFallback className="text-3xl">
            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{student.first_name} {student.last_name}</h1>
          <p className="text-muted-foreground font-mono text-sm">{student.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MilestoneTracker studentId={studentId} />
        <StudentChecklist studentId={studentId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Documents</CardTitle>
          <CardDescription>All documents created by this student.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.documents && student.documents.length > 0 ? (
                student.documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title || "Untitled Document"}</TableCell>
                    <TableCell>{getStatusBadge(doc.review_status)}</TableCell>
                    <TableCell>{isMounted && formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/drafts/${doc.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    This student has not created any documents yet.
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