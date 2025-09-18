"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type PendingReview = {
  id: string;
  title: string | null;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export function PendingReviewsCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPendingReviews = async () => {
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
        
        const { data: pendingDocs, error: docError } = await supabase
          .from('documents')
          .select('id, title, updated_at, profiles(first_name, last_name)')
          .in('user_id', studentIds)
          .eq('review_status', 'submitted')
          .order('updated_at', { ascending: true });

        if (docError) {
          toast.error("Failed to fetch documents pending review.");
        } else {
          // @ts-ignore
          setReviews(pendingDocs || []);
        }
      }
      
      setIsLoading(false);
    };

    fetchPendingReviews();
  }, [user, supabase]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Reviews
        </CardTitle>
        <CardDescription>Documents from your students that are waiting for your feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Document Title</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-10 w-24 float-right" /></TableCell>
                </TableRow>
              ))
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {review.profiles?.first_name} {review.profiles?.last_name}
                  </TableCell>
                  <TableCell>{review.title || "Untitled Document"}</TableCell>
                  <TableCell>{isMounted && formatDistanceToNow(new Date(review.updated_at), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/drafts/${review.id}`}>
                      <Button variant="outline" size="sm">
                        Review Document <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  You have no documents to review. Great job!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}