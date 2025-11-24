'use client';

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { MessageSquare, Save, Send } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

const defaultDmpData = {
  irbStatus: "Not Started",
  privacyCompliance: false,
  consentMethod: "",
  anonymizationPlan: "",
  storageLocation: "",
  backupFrequency: "Weekly",
  accessPermissions: "",
  sharingPlan: "",
  embargoPeriod: "None",
  archiveRepository: "",
};

export function StudentDmpForm() {
  const { session, supabase } = useAuth();
  const [dmp, setDmp] = useState<any>(null);
  const [dmpData, setDmpData] = useState(defaultDmpData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    const fetchDmp = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("data_management_plans")
        .select("*")
        .eq("student_id", session.user.id)
        .single();
      
      if (data) {
        setDmp(data);
        setDmpData({ ...defaultDmpData, ...data.dmp_data });
      } else if (error && error.code !== 'PGRST116') {
        toast.error("Failed to load your Data Management Plan.");
      }
      setIsLoading(false);
    };
    fetchDmp();
  }, [session, supabase]);

  const handleSave = async (newStatus?: string) => {
    if (!session) return;
    setIsSaving(true);
    
    const statusToUpdate = newStatus || dmp?.status || 'draft';

    const { error } = await supabase
      .from("data_management_plans")
      .upsert({
        student_id: session.user.id,
        dmp_data: dmpData,
        status: statusToUpdate,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id' });

    if (error) {
      toast.error("Failed to save your DMP.");
    } else {
      toast.success(`DMP ${newStatus ? 'submitted' : 'saved'} successfully!`);
      if (newStatus) {
        setDmp((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
    setIsSaving(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'pending_review': return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Data Management Plan (DMP)</CardTitle>
              <CardDescription>Outline how you will handle your research data from collection to archiving.</CardDescription>
            </div>
            {dmp?.status && getStatusBadge(dmp.status)}
          </div>
        </CardHeader>
      </Card>

      {dmp?.status === 'needs_revision' && dmp.advisor_comments && (
        <Alert variant="destructive">
          <MessageSquare className="h-4 w-4" />
          <AlertTitle>Advisor Feedback</AlertTitle>
          <AlertDescription>{dmp.advisor_comments}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="compliance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance & Ethics</TabsTrigger>
          <TabsTrigger value="handling">Data Handling & Security</TabsTrigger>
          <TabsTrigger value="sharing">Sharing & Archiving</TabsTrigger>
        </TabsList>
        <TabsContent value="compliance" asChild>
          <Card className="mt-4"><CardContent className="pt-6 space-y-4">
            <div className="space-y-2"><Label>IRB/Ethics Board Approval Status</Label><Select value={dmpData.irbStatus} onValueChange={(v) => setDmpData({...dmpData, irbStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Not Started">Not Started</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Not Applicable">Not Applicable</SelectItem></SelectContent></Select></div>
            <div className="flex items-center space-x-2"><Switch id="privacy" checked={dmpData.privacyCompliance} onCheckedChange={(c) => setDmpData({...dmpData, privacyCompliance: c})} /><Label htmlFor="privacy">My data handling complies with the PH Data Privacy Act of 2012.</Label></div>
            <div className="space-y-2"><Label>Consent Method</Label><Input placeholder="e.g., Signed paper forms, Online checkbox" value={dmpData.consentMethod} onChange={(e) => setDmpData({...dmpData, consentMethod: e.target.value})} /></div>
            <div className="space-y-2"><Label>Data Anonymization Plan</Label><Textarea placeholder="Describe how you will remove personally identifiable information (PII)..." value={dmpData.anonymizationPlan} onChange={(e) => setDmpData({...dmpData, anonymizationPlan: e.target.value})} /></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="handling" asChild>
          <Card className="mt-4"><CardContent className="pt-6 space-y-4">
            <div className="space-y-2"><Label>Primary Storage Location</Label><Input placeholder="e.g., Encrypted Google Drive, University Secure Server" value={dmpData.storageLocation} onChange={(e) => setDmpData({...dmpData, storageLocation: e.target.value})} /></div>
            <div className="space-y-2"><Label>Backup Frequency</Label><Select value={dmpData.backupFrequency} onValueChange={(v) => setDmpData({...dmpData, backupFrequency: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Access Permissions</Label><Textarea placeholder="Describe who will have access to the raw data (e.g., myself, my advisor)..." value={dmpData.accessPermissions} onChange={(e) => setDmpData({...dmpData, accessPermissions: e.target.value})} /></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="sharing" asChild>
          <Card className="mt-4"><CardContent className="pt-6 space-y-4">
            <div className="space-y-2"><Label>Data Sharing Plan</Label><Textarea placeholder="Describe if and how you plan to share your data after the project is complete..." value={dmpData.sharingPlan} onChange={(e) => setDmpData({...dmpData, sharingPlan: e.target.value})} /></div>
            <div className="space-y-2"><Label>Embargo Period</Label><Select value={dmpData.embargoPeriod} onValueChange={(v) => setDmpData({...dmpData, embargoPeriod: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="6 Months">6 Months</SelectItem><SelectItem value="1 Year">1 Year</SelectItem><SelectItem value="2 Years">2 Years</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Long-term Archive Repository</Label><Input placeholder="e.g., University Data Repository, Zenodo, Harvard Dataverse" value={dmpData.archiveRepository} onChange={(e) => setDmpData({...dmpData, archiveRepository: e.target.value})} /></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => handleSave()} disabled={isSaving}><Save className="w-4 h-4 mr-2" />{isSaving ? 'Saving...' : 'Save Draft'}</Button>
        <Button onClick={() => handleSave('pending_review')} disabled={isSaving}><Send className="w-4 h-4 mr-2" />{isSaving ? 'Submitting...' : 'Submit for Review'}</Button>
      </div>
    </div>
  );
}