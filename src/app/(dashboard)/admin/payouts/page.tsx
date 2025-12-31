"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertTriangle, Loader2, X, Check } from "lucide-react";
import { logAuditEvent, AuditAction } from "@/lib/audit-logger";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getMockDataEnabled, setGlobalMockDataEnabled } from "@/lib/mock-referral-data";

type PayoutRequest = { 
  id: string; 
  amount: number; 
  payout_method: string; 
  payout_details: string; 
  created_at: string; 
  user_id: string; 
  profiles: { first_name: string | null; last_name: string | null; } | null; 
};

type VerificationStatus = { 
  is_verified: boolean; 
  checks: { [key: string]: boolean }; 
  details: string; 
};

export default function AdminPayoutsPage() {
  const { session, supabase } = useAuth();
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [verificationData, setVerificationData] = useState<Map<string, VerificationStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionRequestId, setRejectionRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Handle mock data toggle
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    setGlobalMockDataEnabled(newValue);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('mock-data-toggle'));

    // Show toast notification
    if (newValue) {
      toast('Mock Data Enabled', {
        description: 'Using sample data for payout management development and testing'
      });
    } else {
      toast('Mock Data Disabled', {
        description: 'Using real data from production database'
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        if (useMockData) {
          // Use mock data
          const mockPayouts: PayoutRequest[] = [
            {
              id: 'mock-payout-1',
              amount: 1500,
              payout_method: 'gcash',
              payout_details: '09171234567',
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              user_id: 'user-123',
              profiles: { first_name: 'Juan', last_name: 'Dela Cruz' }
            },
            {
              id: 'mock-payout-2',
              amount: 2000,
              payout_method: 'bank',
              payout_details: 'BDO Savings Account ending in 1234',
              created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              user_id: 'user-456',
              profiles: { first_name: 'Maria', last_name: 'Santos' }
            },
            {
              id: 'mock-payout-3',
              amount: 750,
              payout_method: 'paypal',
              payout_details: 'maria.santos@example.com',
              created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              user_id: 'user-789',
              profiles: { first_name: 'Pedro', last_name: 'Garcia' }
            }
          ];
          setPayouts(mockPayouts);

          // Mock verification data
          const mockVerificationData = new Map<string, VerificationStatus>();
          mockPayouts.forEach(payout => {
            mockVerificationData.set(payout.id, {
              is_verified: Math.random() > 0.3, // 70% chance of being verified
              checks: {
                has_document: Math.random() > 0.2,
                min_word_count: Math.random() > 0.1,
                doc_maturity: Math.random() > 0.15,
                meaningful_activity: Math.random() > 0.25,
                ran_originality_check: Math.random() > 0.1,
                advisor_interaction: Math.random() > 0.3
              },
              details: 'Mock verification status'
            });
          });
          setVerificationData(mockVerificationData);
        } else {
          // Fetch real payout requests from database
          const payoutsRes = await supabase
            .from("payout_requests")
            .select("*, user_id, profiles:user_id(first_name, last_name)")
            .eq("status", "pending");

          if (payoutsRes.error) {
            toast.error("Failed to fetch payout requests.");
            throw new Error(payoutsRes.error.message);
          }

          const fetchedPayouts = payoutsRes.data as PayoutRequest[] || [];
          setPayouts(fetchedPayouts);

          // Fetch verification status for each payout
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
        }
      } catch (error) {
        console.error("Error fetching payout requests:", error);
        toast.error("Failed to fetch payout requests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, supabase, useMockData]);

  const handlePayoutResponse = async (requestId: string, action: 'approve' | 'decline', rejectionReason?: string) => {
    if (!session) return;
    setIsResponding(requestId);
    try {
      const payoutRequest = payouts.find(p => p.id === requestId);
      if (!payoutRequest) {
        throw new Error('Payout request not found');
      }

      if (useMockData) {
        // Handle mock data response
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Log audit event for payout approval/rejection
        await logAuditEvent(
          action === 'approve' ? AuditAction.PAYOUT_APPROVED : AuditAction.PAYOUT_REJECTED,
          {
            userId: session.user.id,
            resourceType: 'payout_request',
            resourceId: requestId,
            severity: action === 'approve' ? 'info' : 'warning',
            details: {
              amount: payoutRequest.amount,
              payout_method: payoutRequest.payout_method,
              payout_details: payoutRequest.payout_details,
              target_user_id: payoutRequest.user_id,
              user_name: `${payoutRequest.profiles?.first_name} ${payoutRequest.profiles?.last_name}`,
              ...(action === 'decline' && { rejection_reason: rejectionReason || 'General review' })
            }
          }
        );

        setPayouts(payouts.filter(p => p.id !== requestId));
        toast.success(`Payout request ${action === 'approve' ? 'approved' : 'rejected'} (mock data).`);
      } else {
        // Handle real data response
        const { error } = await supabase.functions.invoke('manage-payout-request', {
          body: {
            request_id: requestId,
            action,
            ...(action === 'decline' && { rejection_reason: rejectionReason || 'General review' })
          }
        });
        if (error) throw new Error(error.message);

        // Log audit event for payout approval/rejection
        await logAuditEvent(
          action === 'approve' ? AuditAction.PAYOUT_APPROVED : AuditAction.PAYOUT_REJECTED,
          {
            userId: session.user.id,
            resourceType: 'payout_request',
            resourceId: requestId,
            severity: action === 'approve' ? 'info' : 'warning',
            details: {
              amount: payoutRequest.amount,
              payout_method: payoutRequest.payout_method,
              payout_details: payoutRequest.payout_details,
              target_user_id: payoutRequest.user_id,
              user_name: `${payoutRequest.profiles?.first_name} ${payoutRequest.profiles?.last_name}`,
              ...(action === 'decline' && { rejection_reason: rejectionReason || 'General review' })
            }
          }
        );

        setPayouts(payouts.filter(p => p.id !== requestId));
        toast.success(`Payout request ${action === 'approve' ? 'approved' : 'rejected'}.`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResponding(null);
    }
  };

  const handleRejectionClick = (requestId: string) => {
    setRejectionRequestId(requestId);
    setRejectionReason(''); // Reset reason
    setRejectionModalOpen(true);
  };

  const handleConfirmRejection = () => {
    if (rejectionRequestId) {
      handlePayoutResponse(rejectionRequestId, 'decline', rejectionReason);
      setRejectionModalOpen(false);
      setRejectionRequestId(null);
      setRejectionReason('');
    }
  };

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
            {status.is_verified ? 
              <CheckCircle className="w-5 h-5 text-green-500" /> : 
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            }
          </TooltipTrigger>
          <TooltipContent>
            <ul className="space-y-1 text-xs">
              {checks.map(check => (
                <li key={check.label} className="flex items-center gap-2">
                  {check.passed ? 
                    <Check className="w-4 h-4 text-green-500" /> : 
                    <X className="w-4 h-4 text-red-500" />
                  }
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payout Requests</h1>
          <p className="text-muted-foreground">Process or decline user requests to cash out their credit balance.</p>
        </div>

        {/* Mock Data Toggle Button */}
        <button
          onClick={handleToggleMockData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${useMockData ? 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200' : 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'}`}
          title={useMockData ? 'Disable mock data' : 'Enable mock data'}
        >
          <svg className={`w-5 h-5 ${useMockData ? 'text-amber-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {useMockData ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <span className="text-sm font-semibold">
            {useMockData ? 'Mock Data' : 'Live Data'}
          </span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payout Requests</CardTitle>
          <CardDescription>
            Process or decline user requests to cash out their credit balance.
            {useMockData && ' Using mock data for development and testing.'}
          </CardDescription>
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
                Array.from({ length: 1 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : payouts.length > 0 ? (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {payout.profiles?.first_name} {payout.profiles?.last_name}
                    </TableCell>
                    <TableCell className="font-medium">₱{Number(payout.amount).toFixed(2)}</TableCell>
                    <TableCell>{payout.payout_method}</TableCell>
                    <TableCell>{payout.payout_details}</TableCell>
                    <TableCell>
                      <VerificationTooltip status={verificationData.get(payout.id)} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectionClick(payout.id)}
                        disabled={isResponding === payout.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePayoutResponse(payout.id, 'approve')}
                        disabled={isResponding === payout.id}
                      >
                        {isResponding === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {useMockData ? 'No mock payout requests available.' : 'No pending payout requests.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rejection Reason Modal */}
      <AlertDialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this payout request. The user will be notified with this information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason
            </label>
            <Input
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionModalOpen(false);
              setRejectionReason('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRejection}>
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}