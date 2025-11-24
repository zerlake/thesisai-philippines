"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, FileText } from "lucide-react";

type StudentDocument = {
  id: string;
  title: string | null;
  review_status: string;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export function AdvisorDraftsView() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStudentDocuments = async () => {
      setIsLoading(true);

      const { data: relationships, error: relError } = await supabase
        .from('advisor_student_relationships')
        .select('student_id')
        .eq('advisor_id', user.id);

      if (relError) {
        toast.error("Failed to fetch your students.");
        setIsLoading(false);
        return;
      }

      if (relationships && relationships.length > 0) {
        const studentIds = relationships.map(r => r.student_id);
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('id, title, review_status, updated_at, profiles(first_name, last_name)')
          .in('user_id', studentIds)
          .order('updated_at', { ascending: false });

        if (docsError) {
          toast.error("Failed to fetch student documents.");
        } else {
          // @ts-ignore
          setDocuments(docs || []);
        }
      }
      setIsLoading(false);
    };

    fetchStudentDocuments();
  }, [user, supabase]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'submitted': return <Badge className="bg-blue-100 text-blue-800">Submitted for Review</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Documents</h1>
        <p className="text-muted-foreground">
          View and manage all documents from your assigned students.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title || "Untitled Document"}</TableCell>
                    <TableCell>{doc.profiles?.first_name} {doc.profiles?.last_name}</TableCell>
                    <TableCell>{getStatusBadge(doc.review_status)}</TableCell>
                    <TableCell>{isMounted && formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/drafts/${doc.id}`}>
                        <Button variant="outline" size="sm">
                          View Document <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Student Documents Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      When your students create documents, they will appear here.
                    </p>
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