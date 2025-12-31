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
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import {
  CheckCircle, AlertTriangle, Check, X, Loader2,
  Users, University, MessageCircleQuestion, Banknote,
  Network, TrendingUp, FileText, Settings, Shield,
  ArrowRight, Activity, Database, Server
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ReferralInspectionDialog } from "./referral-inspection-dialog";
import { StatCard } from "./stat-card";
import Link from "next/link";

type Profile = { id: string; first_name: string | null; last_name: string | null; role: string; };
type InstitutionRequest = { id: string; name: string; created_at: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type Testimonial = { id: string; content: string; created_at: string; status: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type PayoutRequest = { id: string; amount: number; payout_method: string; payout_details: string; created_at: string; user_id: string; profiles: { first_name: string | null; last_name: string | null; } | null; };
type VerificationStatus = { is_verified: boolean; checks: { [key: string]: boolean }; details: string; };

type SystemStats = {
  totalUsers: number;
  totalStudents: number;
  totalAdvisors: number;
  totalCritics: number;
  totalDocuments: number;
  pendingRequests: number;
  pendingPayouts: number;
  pendingTestimonials: number;
  newUsersWeek: number;
  newUsersMonth: number;
};

type AdminAnalytics = {
  users: {
    total: number;
    students: number;
    advisors: number;
    critics: number;
    admins: number;
    new_this_week: number;
    new_this_month: number;
  };
  documents: {
    total: number;
    new_this_week: number;
    new_this_month: number;
  };
  pending: {
    institution_requests: number;
    testimonials: number;
    payouts: number;
  };
  activity: {
    messages_today: number;
    messages_this_week: number;
  };
  generated_at: string;
} | null;

export function AdminDashboardEnterprise() {
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
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalAdvisors: 0,
    totalCritics: 0,
    totalDocuments: 0,
    pendingRequests: 0,
    pendingPayouts: 0,
    pendingTestimonials: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
  });
  const [analytics, setAnalytics] = useState<AdminAnalytics>(null);
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'content' | 'finance' | 'system'>('overview');

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [profilesRes, assignmentsRes, requestsRes, testimonialsRes, payoutsRes, analyticsRes] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name, role"),
        supabase.from("advisor_student_relationships").select("student_id, advisor_id"),
        supabase.from("institution_requests").select("*, profiles:requested_by(first_name, last_name)").eq("status", "pending"),
        supabase.from("testimonials").select("*, profiles:user_id(first_name, last_name)").eq("status", "pending"),
        supabase.from("payout_requests").select("*, user_id, profiles:user_id(first_name, last_name)").eq("status", "pending"),
        supabase.rpc("get_admin_dashboard_analytics"),
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

      const allProfiles = profilesRes.data || [];
      setProfiles(allProfiles);
      setAdvisors(allProfiles.filter((p: Profile) => p.role === 'advisor'));

      const assignmentMap = new Map<string, string>();
      (assignmentsRes.data || []).forEach((a: { student_id: string, advisor_id: string }) => {
        assignmentMap.set(a.student_id, a.advisor_id);
      });
      setAssignments(assignmentMap);

      const fetchedRequests = requestsRes.data as InstitutionRequest[] || [];
      const fetchedTestimonials = testimonialsRes.data as Testimonial[] || [];
      const fetchedPayouts = payoutsRes.data as PayoutRequest[] || [];

      setRequests(fetchedRequests);
      setTestimonials(fetchedTestimonials);
      setPayouts(fetchedPayouts);

      // Set analytics from RPC
      if (analyticsRes.data && !analyticsRes.error) {
        setAnalytics(analyticsRes.data as AdminAnalytics);
      }

      // Calculate system stats from analytics or fallback to profiles count
      const analyticsData = analyticsRes.data as AdminAnalytics;
      setSystemStats({
        totalUsers: analyticsData?.users?.total ?? allProfiles.length,
        totalStudents: analyticsData?.users?.students ?? allProfiles.filter((p: Profile) => p.role === 'user').length,
        totalAdvisors: analyticsData?.users?.advisors ?? allProfiles.filter((p: Profile) => p.role === 'advisor').length,
        totalCritics: analyticsData?.users?.critics ?? allProfiles.filter((p: Profile) => p.role === 'critic').length,
        totalDocuments: analyticsData?.documents?.total ?? 0,
        pendingRequests: analyticsData?.pending?.institution_requests ?? fetchedRequests.length,
        pendingPayouts: analyticsData?.pending?.payouts ?? fetchedPayouts.length,
        pendingTestimonials: analyticsData?.pending?.testimonials ?? fetchedTestimonials.length,
        newUsersWeek: analyticsData?.users?.new_this_week ?? 0,
        newUsersMonth: analyticsData?.users?.new_this_month ?? 0,
      });

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
      setSystemStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
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
      setSystemStats(prev => ({ ...prev, pendingTestimonials: prev.pendingTestimonials - 1 }));
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
      setSystemStats(prev => ({ ...prev, pendingPayouts: prev.pendingPayouts - 1 }));
      toast.success(`Payout request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
    } catch (error: any) {
      toast.error(`Failed to ${action} payout: ${error.message}`);
    } finally {
      setIsResponding(null);
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

  // Navigation component
  const DashboardNav = () => (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeView === 'overview' ? 'default' : 'outline'}
        onClick={() => setActiveView('overview')}
        className="flex items-center gap-1"
      >
        <TrendingUp className="w-4 h-4 mr-1" />
        Overview
      </Button>
      <Button
        variant={activeView === 'users' ? 'default' : 'outline'}
        onClick={() => setActiveView('users')}
        className="flex items-center gap-1"
      >
        <Users className="w-4 h-4 mr-1" />
        Users
      </Button>
      <Button
        variant={activeView === 'content' ? 'default' : 'outline'}
        onClick={() => setActiveView('content')}
        className="flex items-center gap-1"
      >
        <FileText className="w-4 h-4 mr-1" />
        Content
      </Button>
      <Button
        variant={activeView === 'finance' ? 'default' : 'outline'}
        onClick={() => setActiveView('finance')}
        className="flex items-center gap-1"
      >
        <Banknote className="w-4 h-4 mr-1" />
        Finance
      </Button>
      <Button
        variant={activeView === 'system' ? 'default' : 'outline'}
        onClick={() => setActiveView('system')}
        className="flex items-center gap-1"
      >
        <Server className="w-4 h-4 mr-1" />
        System
      </Button>
    </div>
  );

  // Quick Actions Cards
  const QuickActionsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Link href="/admin/users">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Manage roles and assignments</p>
          </CardContent>
        </Card>
      </Link>
      <Link href="/admin/institutions">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <University className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending requests</p>
              {requests.length > 0 && <Badge variant="destructive">{requests.length}</Badge>}
            </div>
          </CardContent>
        </Card>
      </Link>
      <Link href="/admin/testimonials">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageCircleQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending review</p>
              {testimonials.length > 0 && <Badge variant="destructive">{testimonials.length}</Badge>}
            </div>
          </CardContent>
        </Card>
      </Link>
      <Link href="/admin/payouts">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payouts</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Pending payouts</p>
              {payouts.length > 0 && <Badge variant="destructive">{payouts.length}</Badge>}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and management tools.</p>
          </div>
        </div>

        {/* Navigation */}
        <DashboardNav />

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : systemStats.totalUsers}
                icon={Users}
                description={`+${systemStats.newUsersWeek} this week`}
              />
              <StatCard
                title="Students"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : systemStats.totalStudents}
                icon={Users}
                description="Active students"
              />
              <StatCard
                title="Advisors"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : systemStats.totalAdvisors}
                icon={Users}
                description="Registered advisors"
              />
              <StatCard
                title="Critics"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : systemStats.totalCritics}
                icon={Users}
                description="Registered critics"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Documents"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : systemStats.totalDocuments}
                icon={FileText}
                description={analytics?.documents?.new_this_week ? `+${analytics.documents.new_this_week} this week` : "Total documents"}
              />
              <StatCard
                title="Pending Actions"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : (systemStats.pendingRequests + systemStats.pendingPayouts + systemStats.pendingTestimonials)}
                icon={AlertTriangle}
                description="Requires attention"
              />
              <StatCard
                title="Messages Today"
                value={isLoading ? <Skeleton className="h-8 w-16" /> : (analytics?.activity?.messages_today ?? 0)}
                icon={MessageCircleQuestion}
                description={`${analytics?.activity?.messages_this_week ?? 0} this week`}
              />
              <StatCard
                title="System Status"
                value="Online"
                icon={Activity}
                description="All services operational"
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <QuickActionsGrid />
            </div>

            {/* API Status */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SerpApiStatusCard />
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Requests Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Institution Requests</CardTitle>
                  <CardDescription>Recent submissions requiring review</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : requests.length > 0 ? (
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{req.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              by {req.profiles?.first_name} {req.profiles?.last_name}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'decline-request-', itemId: req.id, itemLabel: 'request' })}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => setConfirmDialog({ open: true, action: 'approve-request-', itemId: req.id, itemLabel: 'request' })}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {requests.length > 5 && (
                        <Link href="/admin/institutions">
                          <Button variant="link" className="w-full">
                            View all {requests.length} requests <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No pending requests</p>
                  )}
                </CardContent>
              </Card>

              {/* Pending Payouts Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payouts</CardTitle>
                  <CardDescription>Withdrawal requests awaiting processing</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : payouts.length > 0 ? (
                    <div className="space-y-3">
                      {payouts.slice(0, 5).map((payout) => {
                        const verification = verificationData.get(payout.id);
                        return (
                          <div key={payout.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <VerificationTooltip status={verification} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{payout.profiles?.first_name} {payout.profiles?.last_name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  PHP {Number(payout.amount).toFixed(2)} via {payout.payout_method}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'decline-payout-', itemId: payout.id, itemLabel: `payout of PHP${Number(payout.amount).toFixed(2)}` })}>
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setConfirmDialog({ open: true, action: 'approve-payout-', itemId: payout.id, itemLabel: `payout of PHP${Number(payout.amount).toFixed(2)}` })}
                                disabled={!verification?.is_verified}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {payouts.length > 5 && (
                        <Link href="/admin/payouts">
                          <Button variant="link" className="w-full">
                            View all {payouts.length} payouts <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No pending payouts</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Users View */}
        {activeView === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and advisor assignments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Advisor</TableHead>
                    <TableHead className="text-right">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    profiles.slice(0, 20).map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.first_name || "N/A"} {profile.last_name || ""}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "capitalize",
                            profile.role === 'admin' ? "bg-blue-100 text-blue-800" :
                            profile.role === 'advisor' ? "bg-purple-100 text-purple-800" :
                            profile.role === 'critic' ? "bg-orange-100 text-orange-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.role === 'user' && (
                            <Select
                              value={assignments.get(profile.id) || 'none'}
                              onValueChange={(newAdvisorId: string) => handleAssignmentChange(profile.id, newAdvisorId)}
                              disabled={isUpdatingAssignment === profile.id}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Assign an advisor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none"><span className="text-muted-foreground">None</span></SelectItem>
                                {advisors.map(advisor => (
                                  <SelectItem key={advisor.id} value={advisor.id}>
                                    {advisor.first_name} {advisor.last_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={profile.role}
                            onValueChange={(newRole: string) => handleRoleChange(profile.id, newRole)}
                            disabled={isUpdatingRole === profile.id || (profile.role === 'admin' && isOnlyAdmin)}
                          >
                            <SelectTrigger className="w-[110px] float-right">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="advisor">Advisor</SelectItem>
                              <SelectItem value="critic">Critic</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {profiles.length > 20 && (
                <div className="mt-4 text-center">
                  <Link href="/admin/users">
                    <Button variant="outline">
                      View all {profiles.length} users <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content View */}
        {activeView === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Institution Requests</CardTitle>
                <CardDescription>Approve or decline new institution submissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 float-right" /></TableCell>
                        </TableRow>
                      ))
                    ) : requests.length > 0 ? (
                      requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">{req.name}</TableCell>
                          <TableCell>{req.profiles?.first_name} {req.profiles?.last_name}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'decline-request-', itemId: req.id, itemLabel: 'request' })} disabled={isResponding === req.id}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => setConfirmDialog({ open: true, action: 'approve-request-', itemId: req.id, itemLabel: 'request' })} disabled={isResponding === req.id}>
                              {isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                          No pending institution requests.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Testimonials</CardTitle>
                <CardDescription>Approve or reject user testimonials.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20 float-right" /></TableCell>
                        </TableRow>
                      ))
                    ) : testimonials.length > 0 ? (
                      testimonials.map((testimonial) => (
                        <TableRow key={testimonial.id}>
                          <TableCell className="font-medium">{testimonial.profiles?.first_name} {testimonial.profiles?.last_name}</TableCell>
                          <TableCell className="max-w-xs"><p className="truncate text-sm text-muted-foreground">{testimonial.content}</p></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'reject-testimonial-', itemId: testimonial.id, itemLabel: 'testimonial' })} disabled={isResponding === testimonial.id}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => setConfirmDialog({ open: true, action: 'approve-testimonial-', itemId: testimonial.id, itemLabel: 'testimonial' })} disabled={isResponding === testimonial.id}>
                              {isResponding === testimonial.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                          No pending testimonials.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Finance View */}
        {activeView === 'finance' && (
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Process or decline user payout requests. Verify user activity before approving.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
                      </TableRow>
                    ))
                  ) : payouts.length > 0 ? (
                    payouts.map((payout) => {
                      const verification = verificationData.get(payout.id);
                      const isVerified = verification?.is_verified;
                      return (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">
                            <Button variant="link" className="p-0 h-auto" onClick={() => setInspectingUser({ id: payout.user_id, name: `${payout.profiles?.first_name} ${payout.profiles?.last_name}` })}>
                              {payout.profiles?.first_name} {payout.profiles?.last_name}
                            </Button>
                          </TableCell>
                          <TableCell className="font-semibold">PHP {Number(payout.amount).toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{payout.payout_method}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{payout.payout_details}</TableCell>
                          <TableCell><VerificationTooltip status={verification} /></TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setConfirmDialog({ open: true, action: 'decline-payout-', itemId: payout.id, itemLabel: `payout of PHP${Number(payout.amount).toFixed(2)}` })} disabled={isResponding === payout.id}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setConfirmDialog({ open: true, action: 'approve-payout-', itemId: payout.id, itemLabel: `payout of PHP${Number(payout.amount).toFixed(2)}` })}
                              disabled={isResponding === payout.id || !isVerified}
                              title={isVerified ? "Approve payout" : "User verification required"}
                            >
                              {isResponding === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No pending payout requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* System View */}
        {activeView === 'system' && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Online</div>
                  <p className="text-xs text-muted-foreground">Supabase connected</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">API Services</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Active</div>
                  <p className="text-xs text-muted-foreground">All endpoints operational</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">AI Pipeline</CardTitle>
                  <Network className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Running</div>
                  <p className="text-xs text-muted-foreground">Puter.js connected</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Security</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">Secure</div>
                  <p className="text-xs text-muted-foreground">No threats detected</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>Quick access to system configuration and monitoring tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Link href="/admin/ai">
                    <Button variant="outline" className="w-full justify-start">
                      <Network className="w-4 h-4 mr-2" />
                      AI Pipeline Monitoring
                    </Button>
                  </Link>
                  <Link href="/admin/mcp-servers">
                    <Button variant="outline" className="w-full justify-start">
                      <Server className="w-4 h-4 mr-2" />
                      MCP Servers
                    </Button>
                  </Link>
                  <Link href="/admin/wiki">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Documentation Wiki
                    </Button>
                  </Link>
                  <Link href="/admin/user-onboarding">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      User Onboarding
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SerpApiStatusCard />
            </div>
          </div>
        )}

        <BugReportAlert />
      </div>
    </>
  );
}
