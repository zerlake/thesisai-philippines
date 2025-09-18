"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type FeedbackDoc = {
  id: string;
  title: string | null;
};

export function AdvisorFeedbackCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [feedbackDocs, setFeedbackDocs] = useState<FeedbackDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFeedback = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("id, title")
        .eq("user_id", user.id)
        .eq("review_status", "needs_revision")
        .order("updated_at", { ascending: false });

      if (error) {
        // Silently fail, not a critical component
        console.error("Failed to fetch feedback docs:", error);
      } else {
        setFeedbackDocs(data || []);
      }
      setIsLoading(false);
    };

    fetchFeedback();
  }, [user, supabase]);

  if (isLoading || feedbackDocs.length === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-6 h-6" />
          <span>Advisor Feedback</span>
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          You have {feedbackDocs.length} document{feedbackDocs.length > 1 ? 's' : ''} that need revision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {feedbackDocs.map(doc => (
          <Link href={`/drafts/${doc.id}`} key={doc.id}>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/40">
              <p className="font-medium">{doc.title || "Untitled Document"}</p>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}