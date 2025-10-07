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

type Critic = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type PendingRequest = {
  id: string;
  critic_email: string;
  status: string;
};

export function CriticManagement() {
  const { session, supabase, profile, refreshProfile } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const [critic, setCritic] = useState<Critic | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [externalCritic, setExternalCritic] = useState(profile?.external_critic_name || "");
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [externalName, setExternalName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCriticData = async () => {
      if (!user) return;
      setIsLoading(true);

      // Check for an active relationship
      const { data: relData } = await supabase
        .from("critic_student_relationships")
        .select("profiles:critic_id(id, first_name, last_name, avatar_url)")
        .eq("student_id", user.id)
        .single();
      
      if (relData) {
        // @ts-ignore
        setCritic(relData.profiles);
      } else {
        // If no relationship, check for a pending request
        const { data: reqData } = await supabase
          .from("critic_requests")
          .select("id, critic_email, status")
          .eq("student_id", user.id)
          .eq("status", "pending")
          .single();
        setPendingRequest(reqData);
      }
      
      setExternalCritic(profile?.external_critic_name || "");
      setIsLoading(false);
    };

    fetchCriticData();
  }, [user, supabase, profile]);

  const handleSendRequest = async () => {
    if (!inviteEmail || !session) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('manage-critic-request', {
        body: { action: 'create', critic_email: inviteEmail }
      });
      if (error) throw new Error(error.message);
      toast.success("Critic request sent!");
      setPendingRequest({ id: 'temp', critic_email: inviteEmail, status: 'pending' });
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetExternalCritic = async () => {
    if (!externalName || !user) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ external_critic_name: externalName })
      .eq('id', user.id);
    
    if (error) {
      toast.error("Failed to set external critic.");
    } else {
      toast.success("External critic saved.");
      setExternalCritic(externalName);
      await refreshProfile();
    }
    setIsSubmitting(false);
  };

  const handleRemoveCritic = async () => {
    if (!user) return;
    setIsSubmitting(true);
    if (critic) { // Remove online critic
      const { error } = await supabase.from('critic_student_relationships').delete().eq('student_id', user.id);
      if (error) toast.error("Failed to remove critic.");
      else {
        toast.success("Critic removed.");
        setCritic(null);
      }
    } else if (externalCritic) { // Remove external critic
      const { error } = await supabase.from('profiles').update({ external_critic_name: null }).eq('id', user.id);
      if (error) toast.error("Failed to remove critic.");
      else {
        toast.success("Critic removed.");
        setExternalCritic("");
        await refreshProfile();
      }
    } else if (pendingRequest) { // Cancel pending request
      const { error } = await supabase.from('critic_requests').delete().eq('id', pendingRequest.id);
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

  if (critic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Manuscript Critic</CardTitle>
          <CardDescription>You are connected with the following critic.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={critic.avatar_url || undefined} />
              <AvatarFallback>{critic.first_name?.charAt(0)}{critic.last_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{critic.first_name} {critic.last_name}</p>
              <p className="text-sm text-muted-foreground">Connected on ThesisAI</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleRemoveCritic} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (externalCritic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Manuscript Critic</CardTitle>
          <CardDescription>You have designated an external critic.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{externalCritic}</p>
              <p className="text-sm text-muted-foreground">External Critic</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleRemoveCritic} disabled={isSubmitting}>
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
          <CardTitle>My Manuscript Critic</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Request Pending</AlertTitle>
            <AlertDescription>
              An invitation has been sent to <span className="font-semibold">{pendingRequest.critic_email}</span>. You will be notified when they respond.
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleRemoveCritic} disabled={isSubmitting}>
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
        <CardTitle>Connect with Your Manuscript Critic</CardTitle>
        <CardDescription>Choose how you want to work with your manuscript critic for final review.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="online">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online">Invite to ThesisAI</TabsTrigger>
            <TabsTrigger value="offline">Work Externally</TabsTrigger>
          </TabsList>
          <TabsContent value="online" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Send an invitation to your critic if they are registered on ThesisAI. This allows them to review and certify your document on the platform.</p>
            <div className="space-y-2">
              <Label htmlFor="critic-email">Critic&apos;s Email</Label>
              <Input id="critic-email" type="email" placeholder="critic@university.edu" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <Button onClick={handleSendRequest} disabled={isSubmitting || !inviteEmail}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Request
            </Button>
          </TabsContent>
          <TabsContent value="offline" className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">If your critic is not on ThesisAI, you can designate them here. You will be able to export your work for them to review offline.</p>
            <div className="space-y-2">
              <Label htmlFor="critic-name">Critic&apos;s Name</Label>
              <Input id="critic-name" placeholder="e.g., Dr. Maria Santos" value={externalName} onChange={e => setExternalName(e.target.value)} />
            </div>
            <Button onClick={handleSetExternalCritic} disabled={isSubmitting || !externalName}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <User className="w-4 h-4 mr-2" />}
              Set External Critic
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}