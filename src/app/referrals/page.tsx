'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  PiggyBank, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  CreditCard,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getReferralCode, getReferralHistory, getUserPayouts } from '@/actions/referrals';
import { formatCurrency, getReferralStatusText, getReferralStatusColor, getTierName } from '@/utils/referral';
import { ReferralHistoryItem, Payout } from '@/types/referral';

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralUrl, setReferralUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    tier: 1
  });
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadReferralData = async () => {
      try {
        setLoading(true);
        
        // Get referral code
        const code = await getReferralCode();
        setReferralCode(code);
        setReferralUrl(`${window.location.origin}/register?ref=${code}`);
        
        // Get referral history
        const history = await getReferralHistory();
        setReferralHistory(history);
        
        // Get payouts
        const userPayouts = await getUserPayouts();
        setPayouts(userPayouts);
        
        // Calculate stats
        const totalReferrals = history.filter(r => r.status !== 'rejected').length;
        const totalEarnings = history
          .filter(r => r.status === 'paid')
          .reduce((sum, referral) => sum + referral.commission_amount, 0);
        
        const pendingPayouts = userPayouts
          .filter(p => p.status === 'pending')
          .reduce((sum, payout) => sum + payout.amount, 0);
        
        const tier = Math.min(5, Math.floor(totalReferrals / 5) + 1); // Basic tier calculation
        
        setReferralStats({
          totalReferrals,
          totalEarnings,
          pendingPayouts,
          tier
        });
      } catch (error) {
        toast({
          title: 'Error loading referral data',
          description: 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Gift className="w-8 h-8 text-primary" />
                Earn Credits with ThesisAI Philippines
              </CardTitle>
              <CardDescription>
                Invite your classmates and friends to join ThesisAI and earn credits that can be used towards your subscription.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg py-1 px-3">
              {getTierName(referralStats.tier)} Tier
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Referrals</p>
                  <p className="text-3xl font-bold text-blue-900">{referralStats.totalReferrals}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Earnings</p>
                  <p className="text-3xl font-bold text-green-900">{formatCurrency(referralStats.totalEarnings)}</p>
                </div>
                <PiggyBank className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Pending Payouts</p>
                  <p className="text-3xl font-bold text-purple-900">{formatCurrency(referralStats.pendingPayouts)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Referral Code</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 bg-muted p-4 rounded-lg font-mono text-lg">
                {referralCode || 'Loading...'}
              </div>
              <Button onClick={copyToClipboard} disabled={!referralCode}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Share this code with friends to earn referral credits when they sign up!
            </div>
          </div>

          {/* Referral Program Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <Users className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Student Referral</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Earn ₱150 when a friend signs up with your referral code and activates a paid subscription.
              </p>
            </div>
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <Trophy className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Advisor Recruitment</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Earn ₱500+ per advisor you recruit (tiered bonuses based on your referral tier).
              </p>
            </div>
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <Target className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Critic Recruitment</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Earn ₱800 per critic you bring to the platform, with additional quality bonuses.
              </p>
            </div>
          </div>

          {/* Referral Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Referral History</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Referred User</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-muted-foreground">
                          No referral history yet. Start sharing your referral code!
                        </td>
                      </tr>
                    ) : (
                      referralHistory.map((referral) => (
                        <tr key={referral.id} className="border-t">
                          <td className="p-3">
                            {referral.referred_first_name} {referral.referred_last_name}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary">
                              {referral.event_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3">{formatCurrency(referral.commission_amount)}</td>
                          <td className="p-3">
                            <Badge className={getReferralStatusColor(referral.status)}>
                              {getReferralStatusText(referral.status)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value="payouts">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Method</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-muted-foreground">
                          No payouts yet. Your earned credits will appear here once processed.
                        </td>
                      </tr>
                    ) : (
                      payouts.map((payout) => (
                        <tr key={payout.id} className="border-t">
                          <td className="p-3">
                            <Badge variant="secondary">
                              {payout.payout_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3">{formatCurrency(payout.amount)}</td>
                          <td className="p-3">
                            {payout.payout_method.toUpperCase()}
                          </td>
                          <td className="p-3">
                            <Badge className={getReferralStatusColor(payout.status)}>
                              {getReferralStatusText(payout.status)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {payout.created_at ? new Date(payout.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center py-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Referral Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}