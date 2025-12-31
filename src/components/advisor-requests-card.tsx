"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

type Request = {
  id: string;
  status: string;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export function AdvisorRequestsCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching requests for advisor email:", user.email);
        
        const { data: requests, error: requestsError } = await supabase
          .from("advisor_requests")
          .select("id, status, student_id")
          .eq("advisor_email", user.email)
          .eq("status", "pending");

        if (requestsError) {
          // Check if this is an empty error object (common with RLS policies blocking access)
          const isEmptyError = !requestsError.code && !requestsError.message;

          // Handle RLS blocking access (expected for non-advisors) - fail silently
          if (isEmptyError) {
            setRequests([]);
            setIsLoading(false);
            return;
          }

          // Handle specific error codes
          if (requestsError.code === 'PGRST116') {
            // No rows found - this is fine, just empty
            setRequests([]);
          } else if (requestsError.code === '42501' || (requestsError.message &&
              (requestsError.message.includes('permission') || requestsError.message.includes('denied')))) {
            // Permission denied - user doesn't have advisor access
            setRequests([]);
          } else {
            // Actual error - log and show toast
            console.error("Fetch requests error:", requestsError);
            toast.error("Failed to fetch student requests.");
          }
          setIsLoading(false);
          return;
        }

        console.log("Requests fetched:", requests);

        // Fetch student profiles for each request
        if (requests && requests.length > 0) {
          const studentIds = requests.map((r: any) => r.student_id);
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", studentIds);

          if (profilesError) {
            console.error("Fetch profiles error:", profilesError);
            toast.error("Failed to fetch student profiles.");
            setIsLoading(false);
            return;
          }

          // Merge requests with profiles
          const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          const enrichedRequests = requests.map((req: any) => ({
            id: req.id,
            status: req.status,
            student_id: req.student_id,
            profiles: profileMap[req.student_id] || { id: req.student_id, first_name: "Unknown", last_name: "User" }
          }));

          // @ts-ignore
          setRequests(enrichedRequests);
        } else {
          console.log("No pending requests found");
          setRequests([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch student requests.");
      }
      setIsLoading(false);
    };

    fetchRequests();
  }, [user, supabase]);

  const handleResponse = async (requestId: string, action: 'accept' | 'decline') => {
    setIsResponding(requestId);
    try {
      const { error } = await supabase.functions.invoke('manage-advisor-request', {
        body: { action, request_id: requestId }
      });
      if (error) throw new Error(error.message);
      toast.success(`Request has been ${action}ed.`);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err: any) {
      toast.error(err.message || "Failed to respond to request.");
    } finally {
      setIsResponding(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Student Requests
        </CardTitle>
        <CardDescription>
          Students who have requested you as their advisor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-2 rounded-md bg-tertiary">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {req.profiles?.first_name?.charAt(0)}
                      {req.profiles?.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">{req.profiles?.first_name} {req.profiles?.last_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleResponse(req.id, 'decline')} disabled={!!isResponding}>
                    {isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" onClick={() => handleResponse(req.id, 'accept')} disabled={!!isResponding}>
                    {isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            You have no pending student requests.
          </p>
        )}
      </CardContent>
    </Card>
  );
}