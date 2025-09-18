"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { AlertCircle, ArrowRight, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

type AtRiskStudent = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  overdue_milestone_count: number;
};

export function AtRiskStudentsCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAtRiskStudents = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_at_risk_students_for_advisor', {
        p_advisor_id: user.id
      });

      if (error) {
        toast.error("Failed to fetch at-risk students.");
        console.error(error);
      } else {
        setStudents(data || []);
      }
      setIsLoading(false);
    };

    fetchAtRiskStudents();
  }, [user, supabase]);

  const handleSendReminder = async (studentId: string) => {
    if (!session) return;
    setIsSendingReminder(studentId);
    try {
      const { error } = await supabase.functions.invoke('send-reminder-notification', {
        body: { student_id: studentId }
      });
      if (error) throw new Error(error.message);
      toast.success("Reminder sent to the student.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reminder.");
    } finally {
      setIsSendingReminder(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          At-Risk Students
        </CardTitle>
        <CardDescription>Students with one or more overdue milestones.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-3">
            {students.map(student => (
              <div key={student.student_id} className="flex items-center justify-between p-2 rounded-md bg-tertiary">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.avatar_url || undefined} />
                    <AvatarFallback>
                      {student.first_name?.charAt(0)}
                      {student.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{student.first_name} {student.last_name}</p>
                    <Badge variant="destructive">{student.overdue_milestone_count} Overdue</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => handleSendReminder(student.student_id)}
                    disabled={isSendingReminder === student.student_id}
                    title="Send Reminder"
                  >
                    {isSendingReminder === student.student_id 
                      ? <Loader2 className="w-4 h-4 animate-spin" /> 
                      : <Send className="w-4 h-4" />}
                  </Button>
                  <Link href={`/advisor/students/${student.student_id}`}>
                    <Button size="sm" variant="ghost">
                      View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No students are currently at risk. Everyone is on track!
          </p>
        )}
      </CardContent>
    </Card>
  );
}