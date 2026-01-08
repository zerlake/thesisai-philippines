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
import { SerpApiStatusCard } from "./serpapi-status-card";
import { BugReportAlert } from "./bug-report-alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { CheckCircle, AlertTriangle, Check, X, Loader2, Bot, Monitor, Cpu, Settings, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ReferralInspectionDialog } from "./referral-inspection-dialog";
import { PaperSearchAdmin } from "./admin/paper-search-admin";
import { UserOnboardingDashboard } from "./admin/user-onboarding-dashboard";

type Profile = { id: string; first_name: string | null; last_name: string | null; role: string; };
type InstitutionRequest = { id: string; name: string; created_at: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type Testimonial = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  full_name?: string;
  course?: string;
  institution?: string;
  profiles: { first_name: string | null; last_name: string | null; } | null;
};
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
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; itemId: string; itemLabel: string } | null>(null);
  const [serenaStatus, setSerenaStatus] = useState({
    status: 'disconnected' as 'disconnected' | 'connected' | 'connecting',
    server: 'Serena MCP Server',
    model: 'Puter AI',
    lastChecked: new Date().toISOString(),
    error: null as string | null
  });
  const [isCheckingSerenaStatus, setIsCheckingSerenaStatus] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [profilesRes, assignmentsRes, requestsRes, testimonialsRes, payoutsRes] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, role"),
        supabase.from("advisor_student_relationships").select("student_id, advisor_id"),
        supabase.from("institution_requests").select("*, profiles:requested_by(first_name, last_name)").eq("status", "pending"),
        supabase.from("testimonials").select("*, profiles:user_id(first_name, last_name)").eq("status", "pending"),
        supabase.from("payout_requests").select("*, user_id, profiles:user_id(first_name, last_name)").eq("status", "pending")
      ]);

      if (profilesRes.error || assignmentsRes.error || requestsRes.error || testimonialsRes.error || payoutsRes.error) {
        const failedItems = [
          profilesRes.error && "user profiles",
          assignmentsRes.error && "advisor assignments",
          requestsRes.error && "institution requests",
          testimonialsRes.error && "testimonials",
          payoutsRes.error && "payout requests"
        ].filter(Boolean).join(", ");
        toast.error(`Failed to fetch dashboard data: ${failedItems || "unknown error"}`);
      }
      
      setProfiles(profilesRes.data || []);
      setAdvisors((profilesRes.data || []).filter((p: Profile) => p.role === 'advisor'));
      const assignmentMap = new Map<string, string>();
      (assignmentsRes.data || []).forEach((a: { student_id: string, advisor_id: string }) => { assignmentMap.set(a.student_id, a.advisor_id); });
      setAssignments(assignmentMap);
      setRequests(requestsRes.data as InstitutionRequest[] || []);
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
    setConfirmDialog(null);
    try {
      const { error } = await supabase.functions.invoke('manage-institution-request', { body: { request_id: requestId, action } });
      if (error) throw new Error(error.message);
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(`Institution request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
    } catch (error: any) { 
      toast.error(`Failed to ${action} request: ${error.message}`); 
    } finally { 
      setIsResponding(null); 
    }
  };

  const handleTestimonialResponse = async (testimonialId: string, newStatus: 'approved' | 'rejected') => {
    if (!session) return;
    setIsResponding(testimonialId);
    setConfirmDialog(null);
    try {
      const { error } = await supabase.from('testimonials').update({ status: newStatus }).eq('id', testimonialId);
      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== testimonialId));
      toast.success(`Testimonial ${newStatus} successfully.`);
    } catch (error: any) { 
      toast.error(`Failed to ${newStatus} testimonial: ${error.message}`); 
    } finally { 
      setIsResponding(null); 
    }
  };

  const handlePayoutResponse = async (requestId: string, action: 'approve' | 'decline') => {
    if (!session) return;
    setIsResponding(requestId);
    setConfirmDialog(null);
    try {
      const { error } = await supabase.functions.invoke('manage-payout-request', { body: { request_id: requestId, action } });
      if (error) throw new Error(error.message);
      setPayouts(payouts.filter(p => p.id !== requestId));
      toast.success(`Payout request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
    } catch (error: any) { 
      toast.error(`Failed to ${action} payout: ${error.message}`); 
    } finally { 
      setIsResponding(null); 
    }
  };

  const checkSerenaStatus = async () => {
    try {
      setIsCheckingSerenaStatus(true);
      const response = await fetch('/api/mcp/serena-status', { method: 'GET' });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSerenaStatus({
        status: data.status || 'disconnected',
        server: data.server || 'Serena MCP Server',
        model: data.model || 'claude-3-sonnet',
        lastChecked: data.lastChecked || new Date().toISOString(),
        error: null
      });
    } catch (error) {
      console.error('Error checking Serena status:', error);
      setSerenaStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Status check failed'
      }));
    } finally {
      setIsCheckingSerenaStatus(false);
    }
  };

  const connectToSerena = async () => {
    try {
      setSerenaStatus(prev => ({ ...prev, status: 'connecting', error: null }));
      
      const response = await fetch('/api/mcp/serena-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSerenaStatus({
          status: 'connected',
          server: data.server || 'Serena MCP Server',
          model: data.model || 'claude-3-sonnet',
          lastChecked: new Date().toISOString(),
          error: null
        });
        toast.success('Connected to Serena MCP Server');
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Error connecting to Serena:', error);
      setSerenaStatus(prev => ({
        ...prev,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
      toast.error(error instanceof Error ? error.message : 'Failed to connect to Serena');
    }
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

  const ConfirmDialog = () => {
    if (!confirmDialog) return null;
    
    const { action, itemId, itemLabel } = confirmDialog;
    const isDestructive = action.includes('decline') || action.includes('reject');
    
    const handleConfirm = async () => {
      if (action.startsWith('approve-request-')) {
        await handleRequestResponse(itemId, 'approve');
      } else if (action.startsWith('decline-request-')) {
        await handleRequestResponse(itemId, 'decline');
      } else if (action.startsWith('approve-testimonial-')) {
        await handleTestimonialResponse(itemId, 'approved');
      } else if (action.startsWith('reject-testimonial-')) {
        await handleTestimonialResponse(itemId, 'rejected');
      } else if (action.startsWith('approve-payout-')) {
        await handlePayoutResponse(itemId, 'approve');
      } else if (action.startsWith('decline-payout-')) {
        await handlePayoutResponse(itemId, 'decline');
      }
    };
    
    return (
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {action.includes('decline') || action.includes('reject') 
                ? `Are you sure you want to decline this ${itemLabel}? This action cannot be undone.`
                : `Are you sure you want to approve this ${itemLabel}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={cn(isDestructive && "bg-red-600 hover:bg-red-700")}
            >
              {isDestructive ? 'Decline' : 'Approve'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

   return (
     <>
       <ConfirmDialog />
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><SerpApiStatusCard /></div>
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="institutions">Institution Requests <Badge className="ml-2">{requests.length}</Badge></TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials <Badge className="ml-2">{testimonials.length}</Badge></TabsTrigger>
            <TabsTrigger value="payouts">Payout Requests <Badge className="ml-2">{payouts.length}</Badge></TabsTrigger>
            <TabsTrigger value="paper-search">Paper Search</TabsTrigger>
            <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
            <TabsTrigger value="onboarding">User Onboarding</TabsTrigger>
          </TabsList>
          <TabsContent value="users"><Card><CardHeader><CardTitle>All Users</CardTitle><CardDescription>Manage user roles and advisor assignments.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Assigned Advisor</TableHead><TableHead className="text-right">Change Role</TableHead></TableRow></TableHeader><TableBody>{isLoading ? Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-12" /></TableCell><TableCell><Skeleton className="h-8 w-32" /></TableCell><TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell></TableRow>)) : profiles.map((profile) => (<TableRow key={profile.id}><TableCell>{profile.first_name || "N/A"} {profile.last_name || ""}</TableCell><TableCell><Badge variant="outline" className={cn("capitalize", profile.role === 'admin' ? "bg-blue-100 text-blue-800" : profile.role === 'advisor' ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800")}>{profile.role}</Badge></TableCell><TableCell>{profile.role === 'user' && (<Select value={assignments.get(profile.id) || 'none'} onValueChange={(newAdvisorId: string) => handleAssignmentChange(profile.id, newAdvisorId)} disabled={isUpdatingAssignment === profile.id}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Assign an advisor" /></SelectTrigger><SelectContent><SelectItem value="none"><span className="text-muted-foreground">None</span></SelectItem>{advisors.map(advisor => (<SelectItem key={advisor.id} value={advisor.id}>{advisor.first_name} {advisor.last_name}</SelectItem>))}</SelectContent></Select>)}</TableCell><TableCell className="text-right"><Select value={profile.role} onValueChange={(newRole: string) => handleRoleChange(profile.id, newRole)} disabled={isUpdatingRole === profile.id || (profile.role === 'admin' && isOnlyAdmin)}><SelectTrigger className="w-[110px] float-right"><SelectValue placeholder="Change role" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="advisor">Advisor</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select></TableCell></TableRow>))}</TableBody></Table></CardContent></Card></TabsContent>
          <TabsContent value="institutions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Institution Requests</CardTitle>
                <CardDescription>Approve or decline new institution submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead>Institution Name</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array.from({ length: 1 }).map((_, i) => (
                      <TableRow key={i} className="hover:bg-slate-800/50">
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                      </TableRow>
                    )) : requests.length > 0 ? requests.map((req, idx) => (
                      <TableRow key={req.id} className={cn("border-b transition-colors", idx % 2 === 0 ? "bg-slate-900/30" : "hover:bg-slate-800/50")}>
                        <TableCell className="font-medium">{req.name}</TableCell>
                        <TableCell>{req.profiles?.first_name} {req.profiles?.last_name}</TableCell>
                        <TableCell className="text-muted-foreground">{isMounted && formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'decline-request-', itemId: req.id, itemLabel: 'request' })} disabled={isResponding === req.id} title="Decline request">
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => setConfirmDialog({ open: true, action: 'approve-request-', itemId: req.id, itemLabel: 'request' })} disabled={isResponding === req.id} title="Approve request">
                            {isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No pending requests. All institution requests have been processed.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>Pending Testimonials</CardTitle>
                <CardDescription>Approve or reject user-submitted testimonials for the landing page.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Testimonial</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array.from({ length: 1 }).map((_, i) => (
                      <TableRow key={i} className="hover:bg-slate-800/50">
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                      </TableRow>
                    )) : testimonials.length > 0 ? testimonials.map((testimonial, idx) => (
                      <TableRow key={testimonial.id} className={cn("border-b transition-colors", idx % 2 === 0 ? "bg-slate-900/30" : "hover:bg-slate-800/50")}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{testimonial.full_name || `${testimonial.profiles?.first_name} ${testimonial.profiles?.last_name}`}</span>
                            {testimonial.profiles?.first_name && testimonial.full_name && (
                               <span className="text-xs text-muted-foreground">Auth: {testimonial.profiles.first_name}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{testimonial.institution || '-'}</span>
                            <span className="text-muted-foreground">{testimonial.course || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-sm"><p className="truncate text-sm text-muted-foreground">{testimonial.content}</p></TableCell>
                        <TableCell className="text-muted-foreground">{isMounted && formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'reject-testimonial-', itemId: testimonial.id, itemLabel: 'testimonial' })} disabled={isResponding === testimonial.id} title="Reject testimonial">
                            <X className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => setConfirmDialog({ open: true, action: 'approve-testimonial-', itemId: testimonial.id, itemLabel: 'testimonial' })} disabled={isResponding === testimonial.id} title="Approve testimonial">
                            {isResponding === testimonial.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No pending testimonials. Check back when users submit new testimonials.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payout Requests</CardTitle>
                <CardDescription>Process or decline user requests to cash out their credit balance. Verify user activity before approving.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? Array.from({ length: 1 }).map((_, i) => (
                      <TableRow key={i} className="hover:bg-slate-800/50">
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                      </TableRow>
                    )) : payouts.length > 0 ? payouts.map((payout, idx) => {
                      const verification = verificationData.get(payout.id);
                      const isVerified = verification?.is_verified;
                      return (
                        <TableRow key={payout.id} className={cn("border-b transition-colors", idx % 2 === 0 ? "bg-slate-900/30" : "hover:bg-slate-800/50")}>
                          <TableCell className="font-medium">
                            <Button variant="link" className="p-0 h-auto" onClick={() => setInspectingUser({ id: payout.user_id, name: `${payout.profiles?.first_name} ${payout.profiles?.last_name}` })}>
                              {payout.profiles?.first_name} {payout.profiles?.last_name}
                            </Button>
                          </TableCell>
                          <TableCell className="font-semibold">₱{Number(payout.amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{payout.payout_method}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{payout.payout_details}</TableCell>
                          <TableCell><VerificationTooltip status={verification} /></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setConfirmDialog({ open: true, action: 'decline-payout-', itemId: payout.id, itemLabel: `payout of ₱${Number(payout.amount).toFixed(2)}` })} 
                              disabled={isResponding === payout.id} 
                              title="Decline payout"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => setConfirmDialog({ open: true, action: 'approve-payout-', itemId: payout.id, itemLabel: `payout of ₱${Number(payout.amount).toFixed(2)}` })} 
                              disabled={isResponding === payout.id || !isVerified}
                              title={isVerified ? "Approve payout" : "User verification required"}
                            >
                              {isResponding === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No pending payout requests. Users will appear here when they request to cash out credits.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="paper-search">
            <PaperSearchAdmin />
          </TabsContent>
          <TabsContent value="mcp">
            <div className="space-y-6">
              {/* Serena MCP Server */}
              {isMounted && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bot className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Serena MCP Server
                        <Badge variant="outline">Production</Badge>
                      </CardTitle>
                      <CardDescription>
                        AI-powered model context protocol server for thesis analysis
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={checkSerenaStatus} 
                      variant="outline" 
                      className="flex items-center gap-2"
                      disabled={isCheckingSerenaStatus}
                    >
                      {isCheckingSerenaStatus ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                    <Button 
                      onClick={connectToSerena} 
                      variant={serenaStatus.status === 'connected' ? "default" : "outline"} 
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {serenaStatus.status === 'connecting' ? 'Connecting...' : 
                       serenaStatus.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4" />
                        Status
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Connection status: 
                        <span className={
                          serenaStatus.status === 'connected' ? 'text-green-500 ml-1' : 
                          serenaStatus.status === 'connecting' ? 'text-yellow-500 ml-1' : 
                          'text-red-500 ml-1'
                        }>
                          {serenaStatus.status.charAt(0).toUpperCase() + serenaStatus.status.slice(1)}
                        </span>
                      </p>
                      {serenaStatus.error && (
                        <p className="text-sm text-red-500 mt-1">{serenaStatus.error}</p>
                      )}
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Cpu className="h-4 w-4" />
                        Model
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {serenaStatus.model}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4" />
                        Server
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {serenaStatus.server}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <p className="text-sm text-muted-foreground">
                      Serena MCP Server provides orchestrated AI workflows for thesis analysis, research gap identification, and document processing. Currently using model: <code className="bg-background px-1 rounded">{serenaStatus.model}</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Quick Access Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
                  <CardDescription>Access MCP demo pages and tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 flex-wrap">
                    <Button onClick={() => window.location.href = '/mcp-demo'} variant="default">MCP Demo</Button>
                    <Button onClick={() => window.location.href = '/ai-tools'} variant="default">AI Tools</Button>
                    <Button onClick={() => window.location.href = '/admin/mcp-servers'} variant="outline">Manage MCP Servers</Button>
                    <Button onClick={() => window.open('https://mcp-spec.io/', '_blank')} variant="outline">MCP Specification</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Composio Playground */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bot className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Composio Playground
                        <Badge variant="outline">MCP Server</Badge>
                      </CardTitle>
                      <CardDescription>
                        AI agent workflow tools via Model Context Protocol
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="onboarding">
            <div className="p-6">
              <UserOnboardingDashboard />
            </div>
          </TabsContent>
        </Tabs>
        <BugReportAlert />
      </div>
    </>
  );
}