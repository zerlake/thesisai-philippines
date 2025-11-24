"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Loader2, X, Check } from "lucide-react";
;
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [verificationData, setVerificationData] = useState<Map<string, VerificationStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        // Fetch payout requests
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
      } catch (error) {
        console.error("Error fetching payout requests:", error);
        toast.error("Failed to fetch payout requests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, supabase]);

  const handlePayoutResponse = async (requestId: string, action: 'approve' | 'decline') => {
    if (!session) return;
    setIsResponding(requestId);
    try {
      const { error } = await supabase.functions.invoke('manage-payout-request', { 
        body: { request_id: requestId, action } 
      });
      if (error) throw new Error(error.message);
      setPayouts(payouts.filter(p => p.id !== requestId));
      toast.success(`Payout request ${action === 'approve' ? 'processed' : 'declined'}.`);
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setIsResponding(null); 
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payout Requests</h1>
        <p className="text-muted-foreground">Process or decline user requests to cash out their credit balance.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Payout Requests</CardTitle>
          <CardDescription>Process or decline user requests to cash out their credit balance.</CardDescription>
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
                        onClick={() => handlePayoutResponse(payout.id, 'decline')} 
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
                  <TableCell colSpan={6} className="text-center h-24">No pending payout requests.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}