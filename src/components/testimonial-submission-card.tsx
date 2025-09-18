"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function TestimonialSubmissionCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("testimonials")
      .insert({ user_id: user.id, content });

    if (error) {
      toast.error("Failed to submit testimonial. You may have already submitted one.");
    } else {
      toast.success("Thank you for your feedback!");
      setContent("");
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Enjoying ThesisAI? Help us by sharing a testimonial about your experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Textarea
          placeholder="Tell us what you think..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}