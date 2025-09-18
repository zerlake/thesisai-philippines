"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Gift, Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

export function AdvisorPlanCard() {
  const { profile, session, supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!profile || profile.role !== 'advisor') {
    return null;
  }

  const freeSlots = profile.free_student_slots || 0;

  const handleInvite = async () => {
    if (!email.trim() || !session) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke('advisor-invite-student', {
        body: { student_email: email }
      });

      if (error) throw new Error(error.message);

      toast.success("Invitation sent successfully!", {
        description: "The student has been added to your list and will be notified.",
      });
      setEmail("");
      window.location.reload();

    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Advisor Plan
        </CardTitle>
        <CardDescription>
          Your advisor account is free. Use your free slots to connect with students on any plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-4xl font-bold">{freeSlots}</p>
          <p className="text-sm text-muted-foreground">
            Free student slot{freeSlots !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-medium mb-2">Invite a Student</p>
          <p className="text-xs text-muted-foreground mb-2">
            Using a free slot allows you to connect with a student on the Free plan. If you run out of slots, you can still connect with students who have a 'Pro + Advisor' plan.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="student@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleInvite} disabled={isLoading || !email.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}