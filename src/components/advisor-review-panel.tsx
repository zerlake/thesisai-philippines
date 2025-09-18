"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Loader2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface AdvisorReviewPanelProps {
  documentId: string;
  onReviewSubmit: () => void;
}

export function AdvisorReviewPanel({ documentId, onReviewSubmit }: AdvisorReviewPanelProps) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState<"approve" | "revise" | null>(null);

  const handleSubmitReview = async (newStatus: "approved" | "needs_revision") => {
    if (!user || !documentId) return;
    if (!comments && newStatus === 'needs_revision') {
      toast.error("Please provide comments when requesting revisions.");
      return;
    }

    setIsLoading(newStatus === 'approved' ? 'approve' : 'revise');

    // Transaction to ensure both updates succeed or fail together
    try {
      const { error } = await supabase.rpc('submit_document_review', {
        p_document_id: documentId,
        p_advisor_id: user.id,
        p_comments: comments,
        p_new_status: newStatus
      });

      if (error) throw error;

      toast.success(`Document has been ${newStatus === 'approved' ? 'approved' : 'sent back for revision'}.`);
      onReviewSubmit(); // Callback to refresh parent component state
      setComments("");

    } catch (error: any) {
      toast.error("Failed to submit review.");
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Advisor Review</CardTitle>
        <CardDescription>Provide feedback and set the document status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-comments">Comments</Label>
          <Textarea
            id="review-comments"
            placeholder="e.g., Great work on the introduction, but please expand on the methodology section..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={8}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSubmitReview("needs_revision")}
            disabled={!!isLoading}
          >
            {isLoading === 'revise' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
            Request Revisions
          </Button>
          <Button
            className="w-full"
            onClick={() => handleSubmitReview("approved")}
            disabled={!!isLoading}
          >
            {isLoading === 'approve' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}