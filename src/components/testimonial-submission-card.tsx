"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

export function TestimonialSubmissionCard() {
  const { session, supabase } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !session) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("testimonials").insert({
      user_id: session.user.id,
      content: content.trim(),
    });

    if (error) {
      toast.error("Failed to submit your feedback. Please try again.");
      console.error(error);
    } else {
      toast.success("Thank you for your feedback!");
      setSubmitted(true);
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-green-600" />
            <span>Feedback Submitted!</span>
          </CardTitle>
          <CardDescription>
            Thank you for sharing your experience. Your feedback helps us improve ThesisAI for everyone.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary" />
          <span>Share Your Experience</span>
        </CardTitle>
        <CardDescription>
          Has ThesisAI helped you? We'd love to hear about it! Your feedback may be featured on our landing page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., This tool was a lifesaver for my literature review..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}