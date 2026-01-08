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
      try {
        setIsLoading(true);
        const { data, error } = await supabase.rpc('get_at_risk_students_for_advisor', {
          p_advisor_id: user.id
        });

        if (error) {
          // Provide a user-friendly error message while logging detailed info for debugging
          // Check if the error is specifically about advisor_profiles table not existing
          const isAdvisorProfilesNotFoundError = error?.message?.includes('advisor_profiles') &&
                                                 error?.message?.includes('does not exist');

          // Check if the error is specifically about the academic_milestones table not existing
          const isAcademicMilestonesNotFoundError = error?.message?.includes('academic_milestones') &&
                                                     error?.message?.includes('does not exist');

          let userErrorMessage = "Failed to fetch at-risk students. Please try again later.";
          if (isAdvisorProfilesNotFoundError) {
            userErrorMessage = "Advisor profiles feature is not fully set up. Contact admin to resolve.";
          } else if (isAcademicMilestonesNotFoundError) {
            userErrorMessage = "Academic milestones feature is not available yet. Contact admin to set up the academic_milestones table.";
          }

          toast.error(userErrorMessage);

          // Log the error in a way that handles empty error objects
          const errorKeys = error ? Object.keys(error) : [];
          const hasErrorDetails = error && errorKeys.length > 0;

          let errorDetails;
          if (hasErrorDetails) {
            errorDetails = {
              message: error?.message || 'No error message',
              details: error,
              code: error?.code,
              status: error?.status,
              keys: errorKeys
            };
          } else {
            // Use JSON.stringify to see the actual content of the error object
            const errorString = error ? JSON.stringify(error) : 'null';
            errorDetails = `Empty or null error object received from Supabase: ${errorString}`;
          }

          // Log error details without showing the empty object directly
          if (typeof errorDetails === 'string') {
            console.error("Error fetching at-risk students:", errorDetails);
          } else {
            // If errorDetails is an object, log its properties individually to avoid showing {}
            console.error("Error fetching at-risk students - Message:", errorDetails.message);
            if (errorDetails.code) console.error("Error Code:", errorDetails.code);
            if (errorDetails.status) console.error("Status:", errorDetails.status);
            if (errorDetails.keys) console.error("Available keys:", errorDetails.keys);
          }

          // Still set an empty array to ensure the UI doesn't break
          setStudents([]);
        } else {
          setStudents(data || []);
        }
      } catch (err) {
        toast.error("An unexpected error occurred while fetching at-risk students.");
        console.error("Unexpected error fetching at-risk students:", err);
        setStudents([]); // Ensure we reset to an empty array on unexpected errors
      } finally {
        setIsLoading(false);
      }
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