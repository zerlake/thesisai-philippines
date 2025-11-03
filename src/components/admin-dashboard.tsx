"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "../lib/utils";
import { BugReportAlert } from "./bug-report-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Check, Loader2, X, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ReferralInspectionDialog } from "./referral-inspection-dialog";

type Profile = { id: string; first_name: string | null; last_name: string | null; role: string; };
type InstitutionRequest = { id: string; name: string; created_at: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type Testimonial = { id: string; content: string; created_at: string; status: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type PayoutRequest = { id: string; amount: number; payout_method: string; payout_details: string; created_at: string; user_id: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type VerificationStatus = { is_verified: boolean; checks: { [key: string]: boolean }; details: string; };

export function AdminDashboard() {
  const { session, supabase } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [advisors, setAdvisors] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Map<string, string>>(new Map());
  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [verificationData, setVerificationData] = useState<Map<string, VerificationStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState<string | null>(null);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [inspectingUser, setInspectingUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch data separately to avoid complex join issues
      const [profilesRes, assignmentsRes, requestsRes, testimonialsRes, payoutsRes] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, role"),
        supabase.from("advisor_student_relationships").select("student_id, advisor_id"),
        supabase.from("institution_requests").select("*").eq("status", "pending"), // Separate request query
        supabase.from("testimonials").select("*, profiles:user_id(first_name, last_name)").eq("status", "pending"),
        supabase.from("payout_requests").select("*, user_id, profiles:user_id(first_name, last_name)").eq("status", "pending")
      ]);

      if (profilesRes.error || assignmentsRes.error || requestsRes.error || testimonialsRes.error || payoutsRes.error) {
        toast.error("Failed to fetch some dashboard data.");
      }
      
      setProfiles(profilesRes.data || []);
      setAdvisors((profilesRes.data || []).filter((p: Profile) => p.role === 'advisor'));
      const assignmentMap = new Map<string, string>();
      (assignmentsRes.data || []).forEach((a: { student_id: string, advisor_id: string }) => { assignmentMap.set(a.student_id, a.advisor_id); });
      setAssignments(assignmentMap);
      
      // Process requests and fetch related profiles separately to avoid join issues
      const requests = requestsRes.data as InstitutionRequest[] || [];
      if (requests.length > 0) {
        // Get unique requester IDs
        const userIds = Array.from(new Set(requests.map(r => r.requested_by).filter(Boolean) as string[]));
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", userIds);
          
          if (profilesError) {
            console.error("Error fetching requester profiles:", profilesError);
            // Set requests without profile data if profile fetch fails
            setRequests(requests.map(req => ({ ...req, profiles: null })));
          } else {
            // Create a map of profiles by ID for efficient lookup
            const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);
            // Add profile data to each request
            setRequests(requests.map(req => ({
              ...req,
              profiles: req.requested_by ? profileMap.get(req.requested_by) || null : null
            })));
          }
        } else {
          // No user IDs to fetch, just set the requests
          setRequests(requests);
        }
      } else {
        // No requests to process
        setRequests([]);
      }
      
      setTestimonials(testimonialsRes.data as Testimonial[] || []);
      const fetchedPayouts = payoutsRes.data as PayoutRequest[] || [];
      setPayouts(fetchedPayouts);

      if (fetchedPayouts.length > 0) {
        const verificationPromises = fetchedPayouts.map(p => 
          supabase.rpc('get_payout_verification_status', { p_user_id: p.user_id })
        );
        const verificationResults = await Promise.all(verificationPromises);
        const newVerificationData = new Map<string, VerificationStatus>();
        verificationResults.forEach((res: any, index: number) => {
          if (!res.error) {
            newVerificationData.set(fetchedPayouts[index].id, res.data);
          }
        });
        setVerificationData(newVerificationData);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [supabase]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!session) return;
    setIsUpdatingRole(targetUserId);
    try {
      const { error } = await supabase.functions.invoke('update-user-role', { body: { targetUserId, newRole } });
      if (error) throw new Error(error.message);
      setProfiles(profiles.map(p => p.id === targetUserId ? { ...p, role: newRole } : p));
      toast.success("User role updated successfully.");
    } catch (error: any) { toast.error(error.message); } finally { setIsUpdatingRole(null); }
  };

  const handleAssignmentChange = async (studentId: string, newAdvisorId: string) => {
    if (!session) return;
    setIsUpdatingAssignment(studentId);
    try {
      const { error } = await supabase.functions.invoke('manage-advisor-assignment', { body: { student_id: studentId, advisor_id: newAdvisorId === 'none' ? null : newAdvisorId } });
      if (error) throw new Error(error.message);
      setAssignments(prev => { const newMap = new Map(prev); if (newAdvisorId === 'none') newMap.delete(studentId); else newMap.set(studentId, newAdvisorId); return newMap; });
      toast.success("Student assignment updated.");
    } catch (error: any) { toast.error(error.message); } finally { setIsUpdatingAssignment(null); }
  };

  const handleRequestResponse = async (requestId: string, action: 'approve' | 'decline') => {
    if (!session) return;
    setIsResponding(requestId);
    try {
      const { error } = await supabase.functions.invoke('manage-institution-request', { body: { request_id: requestId, action } });
      if (error) throw new Error(error.message);
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(`Institution request ${action}d.`);
    } catch (error: any) { toast.error(error.message); } finally { setIsResponding(null); }
  };

  const handleTestimonialResponse = async (testimonialId: string, newStatus: 'approved' | 'rejected') => {
    if (!session) return;
    setIsResponding(testimonialId);
    try {
      const { error } = await supabase.from('testimonials').update({ status: newStatus }).eq('id', testimonialId);
      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== testimonialId));
      toast.success(`Testimonial ${newStatus}.`);
    } catch (error: any) { toast.error(error.message); } finally { setIsResponding(null); }
  };

  const handlePayoutResponse = async (requestId: string, action: 'approve' | 'decline') => {
    if (!session) return;
    setIsResponding(requestId);
    try {
      const { error } = await supabase.functions.invoke('manage-payout-request', { body: { request_id: requestId, action } });
      if (error) throw new Error(error.message);
      setPayouts(payouts.filter(p => p.id !== requestId));
      toast.success(`Payout request ${action === 'approve' ? 'processed' : 'declined'}.`);
    } catch (error: any) { toast.error(error.message); } finally { setIsResponding(null); }
  };

  const isOnlyAdmin = profiles.filter(p => p.role === 'admin').length === 1;

  const VerificationTooltip = ({ status }: { status: VerificationStatus | undefined }) => {
    if (!status) return <Skeleton className="h-5 w-5 rounded-full" />;
    const checks = [
      { label: "Has Document", passed: status.checks.has_document },
      { label: "Min. 1,000 Words", passed: status.checks.min_word_count },
      { label: "Document > 7 Days Old", passed: status.checks.doc_maturity },
      { label: "Meaningful Activity", passed: status.checks.meaningful_activity },
      { label: "Ran Originality Check", passed: status.checks.ran_originality_check },
      { label: "Advisor Interaction", passed: status.checks.advisor_interaction },
    ];
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {status.is_verified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          </TooltipTrigger>
          <TooltipContent>
            <ul className="space-y-1 text-xs">
              {checks.map(check => (
                <li key={check.label} className="flex items-center gap-2">
                  {check.passed ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                  <span>{check.label}</span>
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {inspectingUser && (
        <ReferralInspectionDialog
          userId={inspectingUser.id}
          userName={inspectingUser.name}
          open={!!inspectingUser}
          onOpenChange={() => setInspectingUser(null)}
        />
      )}
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">System overview and user management.</p></div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="institutions">Institution Requests <Badge className="ml-2">{requests.length}</Badge></TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials <Badge className="ml-2">{testimonials.length}</Badge></TabsTrigger>
            <TabsTrigger value="payouts">Payout Requests <Badge className="ml-2">{payouts.length}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="users"><Card><CardHeader><CardTitle>All Users</CardTitle><CardDescription>Manage user roles and advisor assignments.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Assigned Advisor</TableHead><TableHead className="text-right">Change Role</TableHead></TableRow></TableHeader><TableBody>{isLoading ? Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-12" /></TableCell><TableCell><Skeleton className="h-8 w-32" /></TableCell><TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell></TableRow>)) : profiles.map((profile) => (<TableRow key={profile.id}><TableCell>{profile.first_name || "N/A"} {profile.last_name || ""}</TableCell><TableCell><Badge variant="outline" className={cn("capitalize", profile.role === 'admin' ? "bg-blue-100 text-blue-800" : profile.role === 'advisor' ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800")}>{profile.role}</Badge></TableCell><TableCell>{profile.role === 'user' && (<Select value={assignments.get(profile.id) || 'none'} onValueChange={(newAdvisorId: string) => handleAssignmentChange(profile.id, newAdvisorId)} disabled={isUpdatingAssignment === profile.id}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Assign an advisor" /></SelectTrigger><SelectContent><SelectItem value="none"><span className="text-muted-foreground">None</span></SelectItem>{advisors.map(advisor => (<SelectItem key={advisor.id} value={advisor.id}>{advisor.first_name} {advisor.last_name}</SelectItem>))}</SelectContent></Select>)}</TableCell><TableCell className="text-right"><Select value={profile.role} onValueChange={(newRole: string) => handleRoleChange(profile.id, newRole)} disabled={isUpdatingRole === profile.id || (profile.role === 'admin' && isOnlyAdmin)}><SelectTrigger className="w-[110px] float-right"><SelectValue placeholder="Change role" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="advisor">Advisor</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>
          <TabsContent value="institutions"><Card><CardHeader><CardTitle>Pending Institution Requests</CardTitle><CardDescription>Approve or decline new institution submissions.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Institution Name</TableHead><TableHead>Requested By</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading ? Array.from({ length: 1 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-48" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell></TableRow>)) : requests.length > 0 ? requests.map((req) => (<TableRow key={req.id}><TableCell className="font-medium">{req.name}</TableCell><TableCell>{req.profiles?.first_name} {req.profiles?.last_name}</TableCell><TableCell>{isMounted && formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</TableCell><TableCell className="text-right space-x-2"><Button size="sm" variant="outline" onClick={() => handleRequestResponse(req.id, 'decline')} disabled={isResponding === req.id}><X className="w-4 h-4" /></Button><Button size="sm" onClick={() => handleRequestResponse(req.id, 'approve')} disabled={isResponding === req.id}>{isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button></TableCell></TableRow>)) : <TableRow><TableCell colSpan={4} className="text-center h-24">No pending requests.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
          <TabsContent value="testimonials"><Card><CardHeader><CardTitle>Pending Testimonials</CardTitle><CardDescription>Approve or reject user-submitted testimonials for the landing page.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Testimonial</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading ? Array.from({ length: 1 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-48" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell></TableRow>)) : testimonials.length > 0 ? testimonials.map((testimonial) => (<TableRow key={testimonial.id}><TableCell>{testimonial.profiles?.first_name} {testimonial.profiles?.last_name}</TableCell><TableCell className="max-w-sm"><p className="truncate">{testimonial.content}</p></TableCell><TableCell>{isMounted && formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}</TableCell><TableCell className="text-right space-x-2"><Button size="sm" variant="outline" onClick={() => handleTestimonialResponse(testimonial.id, 'rejected')} disabled={isResponding === testimonial.id}><X className="w-4 h-4" /></Button><Button size="sm" onClick={() => handleTestimonialResponse(testimonial.id, 'approved')} disabled={isResponding === testimonial.id}>{isResponding === testimonial.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button></TableCell></TableRow>)) : <TableRow><TableCell colSpan={4} className="text-center h-24">No pending testimonials.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
          <TabsContent value="payouts"><Card><CardHeader><CardTitle>Pending Payout Requests</CardTitle><CardDescription>Process or decline user requests to cash out their credit balance.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Details</TableHead><TableHead>Verification</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{isLoading ? Array.from({ length: 1 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-16" /></TableCell><TableCell><Skeleton className="h-5 w-16" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-5" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell></TableRow>)) : payouts.length > 0 ? payouts.map((payout) => (<TableRow key={payout.id}><TableCell><Button variant="link" className="p-0 h-auto" onClick={() => setInspectingUser({ id: payout.user_id, name: `${payout.profiles?.first_name} ${payout.profiles?.last_name}` })}>{payout.profiles?.first_name} {payout.profiles?.last_name}</Button></TableCell><TableCell className="font-medium">₱{Number(payout.amount).toFixed(2)}</TableCell><TableCell>{payout.payout_method}</TableCell><TableCell>{payout.payout_details}</TableCell><TableCell><VerificationTooltip status={verificationData.get(payout.id)} /></TableCell><TableCell className="text-right space-x-2"><Button size="sm" variant="outline" onClick={() => handlePayoutResponse(payout.id, 'decline')} disabled={isResponding === payout.id}><X className="w-4 h-4" /></Button><Button size="sm" onClick={() => handlePayoutResponse(payout.id, 'approve')} disabled={isResponding === payout.id}>{isResponding === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</Button></TableCell></TableRow>)) : <TableRow><TableCell colSpan={6} className="text-center h-24">No pending payout requests.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
        </Tabs>
        <BugReportAlert />
      </div>
    </>
  );
}