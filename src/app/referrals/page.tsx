import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, PiggyBank, Users, Share2 } from "lucide-react";
import Link from "next/link";

export default function ReferralsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary" />
            Earn Credits with ThesisAI Philippines
          </CardTitle>
          <CardDescription>
            Invite your classmates and friends to join ThesisAI and earn credits that can be used towards your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <Users className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Invite Your Classmates</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Share your unique referral link with other students working on their thesis or dissertation.
              </p>
            </div>
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <PiggyBank className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Earn Credit Balance</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You earn ₱50 when they sign up, ₱25 for each friend they refer (up to 3 levels), and ₱75 when they upgrade to Pro.
              </p>
            </div>
            <div className="text-center p-6 bg-tertiary rounded-lg">
              <Share2 className="mx-auto w-12 h-12 mb-4 text-primary" />
              <h3 className="font-bold text-lg">Get Rewarded</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Use your earned credits to pay for your own subscription or transfer them to help a peer.
              </p>
            </div>
          </div>
          
          <div className="text-center py-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Link href="/register">
                Start Earning Now
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}