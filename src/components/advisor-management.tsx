"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, UserPlus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

type Advisor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type PendingRequest = {
  id: string;
  advisor_email: string;
  status: string;
};

export function AdvisorManagement() {
  const { session, supabase, profile, refreshProfile } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [externalAdvisor, setExternalAdvisor] = useState(profile?.external_advisor_name || "");
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [externalName, setExternalName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdvisorData = async () => {
      if (!user) return;
      setIsLoading(true);

      // Check for an active relationship
      const { data: relData } = await supabase
        .from("advisor_student_relationships")
        .select("profiles:advisor_id(id, first_name, last_name, avatar_url)")
        .eq("student_id", user.id)
        .single();
      
      if (relData) {
        // @ts-ignore
        setAdvisor(relData.profiles);
      } else {
        // If no relationship, check for a pending request
        const { data: reqData } = await supabase
          .from("advisor_requests")
          .select("id, advisor_email, status")
          .eq("student_id", user.id)
          .eq("status", "pending")
          .single();
        setPendingRequest(reqData);
      }
      
      setExternalAdvisor(profile?.external_advisor_name || "");
      setIsLoading(false);
    };

    fetchAdvisorData();
  }, [user, supabase, profile]);

  const handleSendRequest = async () => {
    if (!inviteEmail) return;
    
    if (profile?.plan !== 'pro_plus_advisor') {
      toast.error("Please upgrade to the 'Pro + Advisor' plan to invite an advisor.", {
          description: "You can manage your plan in the Billing settings.",
          action: {
              label: "Go to Billing",
              onClick: () => router.push('/settings/billing'),
          },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('manage-advisor-request', {
        body: { action: 'create', advisor_email: inviteEmail }
      });
      if (error) throw new Error(error.message);
      toast.success("Advisor request sent!");
      // Manually update state to show pending request
      setPendingRequest({ id: 'temp', advisor_email: inviteEmail, status: 'pending' });
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetExternalAdvisor = async () => {
    if (!externalName || !user) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ external_advisor_name: externalName })
      .eq('id', user.id);
    
    if (error) {
      toast.error("Failed to set external advisor.");
    } else {
      toast.success("External advisor saved.");
      setExternalAdvisor(externalName);
      await refreshProfile();
    }
    setIsSubmitting(false);
  };

  const handleRemoveAdvisor = async () => {
    if (!user) return;
    setIsSubmitting(true);
    if (advisor) { // Remove online advisor
      const { error } = await supabase.from('advisor_student_relationships').delete().eq('student_id', user.id);
      if (error) toast.error("Failed to remove advisor.");
      else {
        toast.success("Advisor removed.");
        setAdvisor(null);
      }
    } else if (externalAdvisor) { // Remove external advisor
      const { error } = await supabase.from('profiles').update({ external_advisor_name: null }).eq('id', user.id);
      if (error) toast.error("Failed to remove advisor.");
      else {
        toast.success("Advisor removed.");
        setExternalAdvisor("");
        await refreshProfile();
      }
    } else if (pendingRequest) { // Cancel pending request
      const { error } = await supabase.from('advisor_requests').delete().eq('id', pendingRequest.id);
      if (error) toast.error("Failed to cancel request.");
      else {
        toast.success("Request cancelled.");
        setPendingRequest(null);
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (advisor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Advisor</CardTitle>
          <CardDescription>You are connected with the following advisor.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={advisor.avatar_url || undefined} />
              <AvatarFallback>{advisor.first_name?.charAt(0)}{advisor.last_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{advisor.first_name} {advisor.last_name}</p>
              <p className="text-sm text-muted-foreground">Connected on ThesisAI</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleRemoveAdvisor} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (externalAdvisor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Advisor</CardTitle>
          <CardDescription>You have designated an external advisor.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{externalAdvisor}</p>
              <p className="text-sm text-muted-foreground">External Advisor</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleRemoveAdvisor} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (pendingRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Advisor</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Request Pending</AlertTitle>
            <AlertDescription>
              An invitation has been sent to <span className="font-semibold">{pendingRequest.advisor_email}</span>. You will be notified when they respond.
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRemoveAdvisor} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            {isSubmitting ? "Cancelling..." : "Cancel Request"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect with Your Advisor</CardTitle>
        <CardDescription>Choose how you want to work with your thesis advisor.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="online">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online">Invite to ThesisAI</TabsTrigger>
            <TabsTrigger value="offline">Work Externally</TabsTrigger>
          </TabsList>
          <TabsContent value="online" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Send an invitation to your advisor if they are registered on ThesisAI. This requires the <strong>Pro + Advisor</strong> plan.</p>
            <div className="space-y-2">
              <Label htmlFor="advisor-email">Advisor&apos;s Email</Label>
              <Input id="advisor-email" type="email" placeholder="advisor@university.edu" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <Button onClick={handleSendRequest} disabled={isSubmitting || !inviteEmail}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Request
            </Button>
          </TabsContent>
          <TabsContent value="offline" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">If your advisor is not on ThesisAI, you can designate them here. You will be able to export your work for them to review offline.</p>
            <div className="space-y-2">
              <Label htmlFor="advisor-name">Advisor&apos;s Name</Label>
              <Input id="advisor-name" placeholder="e.g., Dr. Juan Dela Cruz" value={externalName} onChange={e => setExternalName(e.target.value)} />
            </div>
            <Button onClick={handleSetExternalAdvisor} disabled={isSubmitting || !externalName}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
              Set External Advisor
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}