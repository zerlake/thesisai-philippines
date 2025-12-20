"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type CriticStudent = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  document_count: number;
  latest_document_status: string | null;
  latest_document_updated_at: string | null;
};

export function CriticStudentList() {
  const { session, supabase } = useAuth();
  const [students, setStudents] = useState<CriticStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchStudents = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase.rpc('get_critic_students_details', {
          p_critic_id: session.user.id
        });

        if (error) {
          console.warn("Critic students details function not available:", error);
          // Fallback to direct table query if the RPC function doesn't exist
          try {
            // First try to query critic_student_relationships directly without join
            const relationshipsResult = await supabase
              .from('critic_student_relationships')
              .select('student_id')
              .eq('critic_id', session.user.id);

            if (relationshipsResult.error) {
              console.warn("Could not fetch student relationships:", relationshipsResult.error);

              // If that also fails, try a more basic approach with profiles
              const basicResult = await supabase
                .from('profiles')
                .select('id as student_id')
                .eq('role', 'user'); // This is just a fallback, might need adjustment

              if (basicResult.error) {
                console.error("Both relationship and basic profile queries failed:", basicResult.error);
                toast.error("Failed to fetch assigned students.");
                setStudents([]);
              } else {
                // Return empty array since we don't have the proper relationship data
                setStudents([]);
              }
            } else {
              // If we got relationships successfully, try to get student details for each
              if (relationshipsResult.data && relationshipsResult.data.length > 0) {
                const studentIds = relationshipsResult.data.map(rel => rel.student_id);

                // Get student details
                const profilesResult = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, avatar_url')
                  .in('id', studentIds);

                if (profilesResult.error) {
                  console.error("Could not fetch student profiles:", profilesResult.error);
                  // Still set the basic relationship data without profile details
                  const basicData = relationshipsResult.data.map(rel => ({
                    student_id: rel.student_id,
                    first_name: null,
                    last_name: null,
                    avatar_url: null,
                    document_count: 0,
                    latest_document_status: null,
                    latest_document_updated_at: null
                  }));
                  setStudents(basicData);
                } else {
                  // Combine relationship data with profile data
                  const combinedData = relationshipsResult.data.map(rel => {
                    const profile = profilesResult.data?.find(p => p.id === rel.student_id);
                    return {
                      student_id: rel.student_id,
                      first_name: profile?.first_name || null,
                      last_name: profile?.last_name || null,
                      avatar_url: profile?.avatar_url || null,
                      document_count: 0,
                      latest_document_status: null,
                      latest_document_updated_at: null
                    };
                  });
                  setStudents(combinedData);
                }
              } else {
                // No relationships found
                setStudents([]);
              }
            }
          } catch (fallbackError) {
            console.error("Fallback query failed:", fallbackError);
            toast.error("Failed to fetch assigned students.");
            setStudents([]);
          }
        } else {
          setStudents(data || []);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to fetch assigned students.");
        setStudents([]);
      }

      setIsLoading(false);
    };

    fetchStudents();
  }, [session, supabase]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">No Documents</Badge>;
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'submitted': return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Ready for Certification</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      case 'critic_revision_requested': return <Badge variant="destructive">Revisions Requested</Badge>;
      case 'certified': return <Badge className="bg-green-100 text-green-800">Certified</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const forCertification = students.filter(s => s.latest_document_status === 'approved');

  const renderTable = (studentList: CriticStudent[], emptyMessage: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Documents</TableHead>
          <TableHead>Latest Status</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
              <TableCell><Skeleton className="h-5 w-12" /></TableCell>
              <TableCell><Skeleton className="h-6 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-10 w-24 float-right" /></TableCell>
            </TableRow>
          ))
        ) : studentList.length > 0 ? (
          studentList.map((student) => (
            <TableRow key={student.student_id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.avatar_url || undefined} />
                    <AvatarFallback>{student.first_name?.charAt(0)}{student.last_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{student.first_name} {student.last_name}</p>
                </div>
              </TableCell>
              <TableCell>{student.document_count}</TableCell>
              <TableCell>{getStatusBadge(student.latest_document_status)}</TableCell>
              <TableCell>
                {student.latest_document_updated_at && isMounted
                  ? formatDistanceToNow(new Date(student.latest_document_updated_at), { addSuffix: true })
                  : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/advisor/students/${student.student_id}`}>
                  <Button variant="outline" size="sm">
                    View Profile <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center h-24">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Students</CardTitle>
        <CardDescription>An overview of students assigned to you for manuscript review.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="certification">
              For Certification <Badge className="ml-2">{forCertification.length}</Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {renderTable(students, "You have not been assigned any students yet.")}
          </TabsContent>
          <TabsContent value="certification" className="mt-4">
            {renderTable(forCertification, "No documents are currently ready for your certification.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}