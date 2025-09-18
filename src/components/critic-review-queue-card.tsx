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

type ReviewQueueItem = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  document_id: string;
  document_title: string | null;
  approved_at: string;
};

export function CriticReviewQueueCard() {
  const { session, supabase } = useAuth();
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchQueue = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_students_for_critic_review', {
        p_critic_id: session.user.id
      });

      if (error) {
        toast.error("Failed to load review queue.");
        console.error(error);
      } else {
        setQueue(data || []);
      }
      setIsLoading(false);
    };

    fetchQueue();
  }, [session, supabase]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Review & Certification Queue
        </CardTitle>
        <CardDescription>Documents approved by advisors and ready for your final review.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Document Title</TableHead>
              <TableHead>Ready Since</TableHead>
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
            ) : queue.length > 0 ? (
              queue.map((item) => (
                <TableRow key={item.document_id}>
                  <TableCell className="font-medium">
                    {item.first_name} {item.last_name}
                  </TableCell>
                  <TableCell>{item.document_title || "Untitled Document"}</TableCell>
                  <TableCell>{isMounted && formatDistanceToNow(new Date(item.approved_at), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/drafts/${item.document_id}`}>
                      <Button variant="outline" size="sm">
                        Review & Certify <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Your review queue is empty. Well done!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}