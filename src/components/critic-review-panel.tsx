"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, Loader2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface CriticReviewPanelProps {
  documentId: string;
  onReviewSubmit: () => void;
}

export function CriticReviewPanel({ documentId, onReviewSubmit }: CriticReviewPanelProps) {
  const { session, supabase } = useAuth();
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState<"certify" | "revise" | null>(null);

  const handleSubmitReview = async (newStatus: "certified" | "critic_revision_requested") => {
    if (!session || !documentId) return;
    if (!comments && newStatus === 'critic_revision_requested') {
      toast.error("Please provide comments when requesting revisions.");
      return;
    }

    setIsLoading(newStatus === 'certified' ? 'certify' : 'revise');

    try {
      const { error } = await supabase.rpc('submit_critic_review', {
        p_document_id: documentId,
        p_new_status: newStatus,
        p_comments: comments,
      });

      if (error) throw error;

      toast.success(`Document has been ${newStatus === 'certified' ? 'certified' : 'sent back for revision'}.`);
      onReviewSubmit();
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
        <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Critic Review</CardTitle>
        <CardDescription>Provide feedback and certify the document or request revisions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="review-comments">Comments (Optional for Certification)</Label>
          <Textarea
            id="review-comments"
            placeholder="Provide your overall feedback here..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={8}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSubmitReview("critic_revision_requested")}
            disabled={!!isLoading}
          >
            {isLoading === 'revise' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
            Request Revisions
          </Button>
          <Button
            className="w-full"
            onClick={() => handleSubmitReview("certified")}
            disabled={!!isLoading}
          >
            {isLoading === 'certify' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Certify Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}