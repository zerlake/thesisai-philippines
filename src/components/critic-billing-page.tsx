'use client';

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "./stat-card";
import { CheckCircle, Hourglass } from "lucide-react";

type CriticReview = {
  id: string;
  created_at: string;
  fee: number;
  payment_status: 'paid' | 'unpaid';
  documents: { title: string | null } | null;
  student: { first_name: string | null; last_name: string | null; } | null;
};

export function CriticBillingPage() {
  const { session, supabase } = useAuth();
  const [reviews, setReviews] = useState<CriticReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchBillingData = async () => {
      setIsLoading(true);

      try {
        // Try the original query first
        const { data: directData, error: directError } = await supabase
          .from("critic_reviews")
          .select("*, documents(title), student:student_id(first_name, last_name)")
          .eq("critic_id", session.user.id)
          .order("created_at", { ascending: false });

        if (directError) {
          console.warn("Direct critic_reviews query failed, trying simpler approach:", directError);

          // Fallback: Query critic_reviews without joins first
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("critic_reviews")
            .select("*")
            .eq("critic_id", session.user.id)
            .order("created_at", { ascending: false });

          if (reviewsError) {
            console.error("Could not access critic_reviews table:", reviewsError);
            toast.error("Failed to load billing information due to database access issues.");
            setReviews([]);
          } else {
            // If we got basic reviews data, try to fetch related documents and students separately
            if (reviewsData && reviewsData.length > 0) {
              const enhancedReviews = [];

              for (const review of reviewsData) {
                // Fetch document info
                let documentInfo = null;
                if (review.document_id) { // Assuming there's a document_id field
                  const { data: docData, error: docError } = await supabase
                    .from("thesis_documents")
                    .select("title")
                    .eq("id", review.document_id)
                    .single();

                  if (!docError) {
                    documentInfo = docData;
                  }
                }

                // Fetch student info
                let studentInfo = null;
                if (review.student_id) {
                  const { data: studentData, error: studentError } = await supabase
                    .from("profiles")
                    .select("first_name, last_name")
                    .eq("id", review.student_id)
                    .single();

                  if (!studentError) {
                    studentInfo = studentData;
                  }
                }

                enhancedReviews.push({
                  ...review,
                  documents: documentInfo,
                  student: studentInfo
                });
              }

              setReviews(enhancedReviews as CriticReview[]);
            } else {
              setReviews([]);
            }
          }
        } else {
          // If the original query worked, use the data
          setReviews(directData as CriticReview[]);
        }
      } catch (error: any) {
        console.error("Unexpected error in billing data fetch:", error);
        toast.error("Failed to load billing information.");
        setReviews([]);
      }

      setIsLoading(false);
    };

    fetchBillingData();
  }, [session, supabase]);

  const stats = useMemo(() => {
    return reviews.reduce((acc, review) => {
      if (review.payment_status === 'paid') {
        acc.totalEarned += review.fee;
      } else {
        acc.totalUnpaid += review.fee;
      }
      return acc;
    }, { totalEarned: 0, totalUnpaid: 0 });
  }, [reviews]);

  const handleStatusChange = async (reviewId: string, newStatus: 'paid' | 'unpaid') => {
    setIsUpdating(reviewId);
    const { error } = await supabase
      .from("critic_reviews")
      .update({ payment_status: newStatus })
      .eq("id", reviewId);

    if (error) {
      toast.error("Failed to update payment status.");
    } else {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, payment_status: newStatus } : r));
      toast.success("Payment status updated.");
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Track your earnings and manage payment statuses for your reviews.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard title="Total Earned (Paid)" value={`₱${stats.totalEarned.toFixed(2)}`} icon={CheckCircle} />
        <StatCard title="Pending (Unpaid)" value={`₱${stats.totalUnpaid.toFixed(2)}`} icon={Hourglass} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
          <CardDescription>A log of all your completed reviews and their payment status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead className="text-right">Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{isMounted && format(new Date(review.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{review.student?.first_name} {review.student?.last_name}</TableCell>
                    <TableCell>{review.documents?.title || "Untitled Document"}</TableCell>
                    <TableCell>₱{review.fee.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={review.payment_status}
                        onValueChange={(value) => handleStatusChange(review.id, value as 'paid' | 'unpaid')}
                        disabled={isUpdating === review.id}
                      >
                        <SelectTrigger className="w-[120px] float-right">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid"><Badge className="bg-yellow-100 text-yellow-800">Unpaid</Badge></SelectItem>
                          <SelectItem value="paid"><Badge className="bg-green-100 text-green-800">Paid</Badge></SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    You have not completed any reviews yet.
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