'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Banknote } from "lucide-react";

type CriticReview = {
  id: string;
  created_at: string;
  fee: number;
  payment_status: 'paid' | 'unpaid';
  documents: { title: string | null } | null;
  critic: { first_name: string | null; last_name: string | null; } | null;
};

export function StudentCriticBillingHistory() {
  const { session, supabase } = useAuth();
  const [reviews, setReviews] = useState<CriticReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchBillingData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("critic_reviews")
        .select("*, documents(title), critic:critic_id(first_name, last_name)")
        .eq("student_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load critic billing history.");
        console.error(error);
      } else {
        setReviews(data as CriticReview[]);
      }
      setIsLoading(false);
    };
    fetchBillingData();
  }, [session, supabase]);

  const getStatusBadge = (status: 'paid' | 'unpaid'): React.ReactNode => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Critic Review Fees</CardTitle>
        <CardDescription>A history of fees for manuscript reviews by your critic. Please settle any unpaid fees directly with them.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Critic</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead className="text-right">Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20 float-right" /></TableCell>
                </TableRow>
              ))
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{isMounted && format(new Date(review.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{review.critic?.first_name} {review.critic?.last_name}</TableCell>
                  <TableCell>{review.documents?.title || "Untitled Document"}</TableCell>
                  <TableCell>₱{review.fee.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(review.payment_status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  You have no billing history with a critic yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}