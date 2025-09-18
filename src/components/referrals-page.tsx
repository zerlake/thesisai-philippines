"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Copy, Gift, PiggyBank, Send, ArrowRight, ArrowLeft, Loader2, Banknote, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { format } from "date-fns";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

type Earning = {
  id: string;
  amount_earned: number;
  tier: number;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null; } | null;
};

type Transfer = {
  id: string;
  amount: number;
  created_at: string;
  sender: { first_name: string | null; last_name: string | null; } | null;
  recipient: { first_name: string | null; last_name: string | null; } | null;
  sender_id: string;
};

type PayoutRequest = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  payout_method: string;
};

export function ReferralsPage() {
  const { profile, supabase, session, refreshProfile } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [transferEmail, setTransferEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("GCash");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && profile?.referral_code) {
      setReferralLink(`${window.location.origin}/register?ref=${profile.referral_code}`);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      setIsLoading(true);
      
      const earningsPromise = supabase.from("referral_earnings").select("*, profiles:referred_user_id(first_name, last_name)").eq("referrer_id", profile.id).order("created_at", { ascending: false });
      const transfersPromise = supabase.from("credit_transfers").select("*, sender:sender_id(first_name, last_name), recipient:recipient_id(first_name, last_name)").or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`).order("created_at", { ascending: false });
      const payoutsPromise = supabase.from("payout_requests").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });

      const [earningsResult, transfersResult, payoutsResult] = await Promise.all([earningsPromise, transfersPromise, payoutsPromise]);

      if (earningsResult.error) toast.error("Failed to load referral earnings."); else setEarnings(earningsResult.data as Earning[]);
      if (transfersResult.error) toast.error("Failed to load transfer history."); else setTransfers(transfersResult.data as Transfer[]);
      if (payoutsResult.error) toast.error("Failed to load payout history."); else setPayouts(payoutsResult.data as PayoutRequest[]);

      setIsLoading(false);
    };
    fetchData();
  }, [profile, supabase]);

  const handleCopy = (textToCopy: string, message: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success(message);
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (!transferEmail || !amount || amount <= 0) { toast.error("Please enter a valid email and amount."); return; }
    if (!session || !profile) { toast.error("You must be logged in to perform a transfer."); return; }
    if (amount > (profile.credit_balance || 0)) { toast.error("Insufficient credit balance."); return; }

    setIsTransferring(true);
    try {
      const { error } = await supabase.functions.invoke('transfer-credit', { body: { recipient_email: transferEmail, amount } });
      if (error) throw new Error(error.message);
      toast.success(`Successfully sent ₱${amount.toFixed(2)} to ${transferEmail}!`);
      setTransferEmail("");
      setTransferAmount("");
      await refreshProfile();
      // Manually add to transfers list for immediate UI update
      setTransfers(prev => [{ id: 'temp', amount, created_at: new Date().toISOString(), sender_id: profile.id, sender: { first_name: profile.first_name, last_name: profile.last_name }, recipient: { first_name: 'User', last_name: '' } }, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Transfer failed.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount);
    if (!payoutDetails || !amount || amount < 500) { toast.error("Please enter valid details and an amount of at least ₱500."); return; }
    if (amount > (profile?.credit_balance || 0)) { toast.error("Insufficient credit balance."); return; }
    if (!session) return;

    setIsRequestingPayout(true);
    try {
      const { error } = await supabase.functions.invoke('request-payout', { body: { amount, method: payoutMethod, details: payoutDetails } });
      if (error) throw new Error(error.message);
      toast.success("Payout request submitted successfully!");
      setPayoutAmount("");
      setPayoutDetails("");
      await refreshProfile();
      // Manually add to payouts list for immediate UI update
      setPayouts(prev => [{ id: 'temp', amount, status: 'pending', created_at: new Date().toISOString(), payout_method: payoutMethod }, ...prev]);
    } catch (err: any) {
      toast.error(err.message || "Payout request failed.");
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processed': return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
      case 'declined': return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Referrals & Credits</CardTitle>
          <CardDescription>Share your code, earn credits, and cash out your earnings.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Your Referral Hub</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-tertiary rounded-lg space-y-2">
                <div>
                  <Label>Your Referral Code</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold">{profile?.referral_code}</span>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(profile?.referral_code || '', "Referral code copied!")}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div>
                  <Label>Your Referral Link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={referralLink} readOnly />
                    <Button variant="outline" size="icon" onClick={() => handleCopy(referralLink, "Referral link copied!")}><LinkIcon className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-tertiary rounded-lg space-y-1">
                <Label>Available Credit Balance</Label>
                <p className="text-3xl font-bold">₱{Number(profile?.credit_balance || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="p-4 bg-tertiary rounded-lg space-y-3">
              <Label>Send Credits to a Friend</Label>
              <Input type="email" placeholder="Recipient's Email" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} />
              <Input type="number" placeholder="Amount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
              <Button onClick={handleTransfer} disabled={isTransferring} className="w-full">
                {isTransferring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Request Payout</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Minimum payout is ₱500. Payouts are processed manually within 3-5 business days.</p>
            <Input type="number" placeholder="Amount (e.g., 500)" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} />
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="GCash">GCash</SelectItem><SelectItem value="PayPal">PayPal</SelectItem></SelectContent>
            </Select>
            <Input placeholder={payoutMethod === 'GCash' ? "Your GCash Number" : "Your PayPal Email"} value={payoutDetails} onChange={e => setPayoutDetails(e.target.value)} />
            <p className="text-xs text-muted-foreground">A minimum balance of ₱200.00 must be maintained after the payout.</p>
            <Button onClick={handlePayoutRequest} disabled={isRequestingPayout} className="w-full">
              {isRequestingPayout ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Earnings History</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>From</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={2}><Skeleton className="h-10 w-full" /></TableCell></TableRow> : earnings.length > 0 ? earnings.map(e => (<TableRow key={e.id}><TableCell>{e.profiles?.first_name ? `${e.profiles.first_name} ${e.profiles.last_name?.charAt(0)}.` : 'A new user'} <span className="text-muted-foreground">(Tier {e.tier})</span></TableCell><TableCell className="text-right font-medium text-green-600">+₱{Number(e.amount_earned).toFixed(2)}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={2} className="text-center h-24">No earnings yet.</TableCell></TableRow>}</TableBody></Table></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transfer History</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Transaction</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={2}><Skeleton className="h-10 w-full" /></TableCell></TableRow> : transfers.length > 0 ? transfers.map(t => (<TableRow key={t.id}><TableCell>{t.sender_id === profile?.id ? <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-red-500" /> Sent to {t.recipient?.first_name || 'a user'}</div> : <div className="flex items-center gap-2"><ArrowLeft className="w-4 h-4 text-green-500" /> Received from {t.sender?.first_name || 'a user'}</div>}</TableCell><TableCell className="text-right font-medium">₱{Number(t.amount).toFixed(2)}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={2} className="text-center h-24">No transfers yet.</TableCell></TableRow>}</TableBody></Table></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader><TableBody>{isLoading ? <TableRow><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow> : payouts.length > 0 ? payouts.map(p => (<TableRow key={p.id}><TableCell>{isMounted && format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell><TableCell className="font-medium">₱{Number(p.amount).toFixed(2)}</TableCell><TableCell className="text-right">{getStatusBadge(p.status)}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={3} className="text-center h-24">No payout requests yet.</TableCell></TableRow>}</TableBody></Table></CardContent>
        </Card>
      </div>
    </div>
  );
}