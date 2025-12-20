"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type InstitutionRequest = { 
  id: string; 
  name: string; 
  created_at: string; 
  profiles: { first_name: string | null; last_name: string | null; } | null; 
};

export default function AdminInstitutionsPage() {
  const { session, supabase } = useAuth();
  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const requestsRes = await supabase
          .from("institution_requests")
          .select("*, profiles:requested_by(first_name, last_name)")
          .eq("status", "pending");

        if (requestsRes.error) {
          toast.error("Failed to fetch institution requests.");
          throw new Error(requestsRes.error.message);
        }
        
        setRequests(requestsRes.data as InstitutionRequest[] || []);
      } catch (error) {
        console.error("Error fetching institution requests:", error);
        toast.error("Failed to fetch institution requests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, supabase]);

  const handleRequestResponse = async (requestId: string, action: 'approve' | 'decline') => {
    if (!session) return;
    setIsResponding(requestId);
    try {
      const { error } = await supabase.functions.invoke('manage-institution-request', { 
        body: { request_id: requestId, action } 
      });
      if (error) throw new Error(error.message);
      setRequests(requests.filter(r => r.id !== requestId));
      toast.success(`Institution request ${action}d.`);
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setIsResponding(null); 
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Institution Requests</h1>
        <p className="text-muted-foreground">Approve or decline new institution submissions.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Institution Requests</CardTitle>
          <CardDescription>Approve or decline new institution submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 1 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell>{req.profiles?.first_name} {req.profiles?.last_name}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleRequestResponse(req.id, 'decline')} 
                        disabled={isResponding === req.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleRequestResponse(req.id, 'approve')} 
                        disabled={isResponding === req.id}
                      >
                        {isResponding === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No pending requests.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}