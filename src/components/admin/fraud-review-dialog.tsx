'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminFlagReferralFraud, adminDismissRiskAssessment } from '@/actions/referral-dashboard-metrics';
import { toast } from 'sonner';
import type { RiskDashboardItem } from '@/types/referral';

interface FraudReviewDialogProps {
  riskItem: RiskDashboardItem;
  onReviewComplete: () => void;
}

export function FraudReviewDialog({ riskItem, onReviewComplete }: FraudReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [decision, setDecision] = useState<'confirm' | 'dismiss'>('confirm');
  const [notes, setNotes] = useState('');

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-green-600 text-white';
    }
  };

  const handleConfirm = async () => {
    try {
      if (decision === 'confirm') {
        await adminFlagReferralFraud(riskItem.referral_event_id, notes || 'Fraud confirmed by admin review');
        toast.success('Referral flagged as fraudulent and reversed');
      } else {
        await adminDismissRiskAssessment(riskItem.id, notes || 'Risk dismissed after review');
        toast.success('Risk assessment dismissed');
      }
      setIsOpen(false);
      setNotes('');
      onReviewComplete();
    } catch (error) {
      toast.error('Failed to complete review: ' + (error as Error).message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Review
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fraud Risk Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Risk Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded">
            <div>
              <Label className="text-xs text-muted-foreground">Risk Score</Label>
              <div className="text-3xl font-bold text-red-600">{riskItem.risk_score}/100</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Risk Level</Label>
              <Badge className={`text-white ${getRiskBadgeColor(riskItem.risk_level)}`}>
                {riskItem.risk_level.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Referral Details */}
          <div className="space-y-3 p-4 bg-muted rounded">
            <h3 className="font-semibold mb-3">Referral Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs">Referral ID</Label>
                <p className="font-mono">{riskItem.referral_event_id}</p>
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <p>{riskItem.event_type}</p>
              </div>
              <div>
                <Label className="text-xs">Amount</Label>
                <p className="font-semibold">₱{riskItem.commission_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <Label className="text-xs">Created</Label>
                <p>{new Date(riskItem.referral_created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-xs">Referrer</Label>
                <p>{riskItem.referrer_first_name} {riskItem.referrer_last_name}</p>
                <p className="text-xs text-muted-foreground">{riskItem.referrer_email}</p>
              </div>
              <div>
                <Label className="text-xs">Total Referrals</Label>
                <p>{riskItem.referrer_total_referrals}</p>
              </div>
              <div>
                <Label className="text-xs">Total Earnings</Label>
                <p className="font-semibold">₱{riskItem.referrer_total_earnings?.toLocaleString('en-PH') || '0'}</p>
              </div>
            </div>
          </div>

          {/* Risk Flags */}
          {riskItem.flags && riskItem.flags.length > 0 && (
            <div className="space-y-3 p-4 bg-muted rounded">
              <h3 className="font-semibold mb-3">Detected Risk Flags</h3>
              <div className="flex flex-wrap gap-2">
                {riskItem.flags.map((flag) => (
                  <Badge key={flag} variant="outline">
                    {flag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Auto Action Taken */}
          {riskItem.auto_action_taken && riskItem.auto_action_taken !== 'none' && (
            <div className="space-y-3 p-4 bg-muted rounded">
              <h3 className="font-semibold mb-3">Automated Action</h3>
              <div className="flex items-center gap-3">
                <Badge variant={riskItem.auto_action_taken === 'auto_reject' ? 'destructive' : 'secondary'}>
                  {riskItem.auto_action_taken.replace(/_/g, ' ').toUpperCase()}
                </Badge>
                {riskItem.auto_action_at && (
                  <span className="text-sm text-muted-foreground">
                    at {new Date(riskItem.auto_action_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Review Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decision">Review Decision</Label>
              <Select value={decision} onValueChange={(v) => setDecision(v as any)}>
                <SelectTrigger id="decision">
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">Confirm Fraud</SelectItem>
                  <SelectItem value="dismiss">Dismiss Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter review notes explaining your decision..."
                rows={4}
              />
            </div>
          </div>

          {/* Warnings */}
          {decision === 'confirm' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Confirming fraud will:
              </p>
              <ul className="list-disc list-inside text-sm text-red-800 ml-4">
                <li>Reject the referral and cancel any pending payouts</li>
                <li>Reverse any earned commissions from the ledger</li>
                <li>Flag the user account for review</li>
                <li>Log this action in the audit trail</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={decision === 'confirm' && !notes}>
            {decision === 'confirm' ? 'Confirm Fraud' : 'Dismiss Risk'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
