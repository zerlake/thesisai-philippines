"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
;
;
;

type Profile = { id: string; first_name: string | null; last_name: string | null; role: string; };

export default function AdminUsersPage() {
  const { session, supabase } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [advisors, setAdvisors] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState<string | null>(null);
  const [_isMounted, _setIsMounted] = useState(false);

  useEffect(() => { _setIsMounted(true); }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const [profilesRes, assignmentsRes] = await Promise.all([
          supabase.from("profiles").select("id, first_name, last_name, role"),
          supabase.from("advisor_student_relationships").select("student_id, advisor_id"),
        ]);

        if (profilesRes.error || assignmentsRes.error) {
          toast.error("Failed to fetch data.");
          throw new Error(profilesRes.error?.message || assignmentsRes.error?.message);
        }
        
        setProfiles(profilesRes.data || []);
        setAdvisors((profilesRes.data || []).filter((p: Profile) => p.role === 'advisor'));
        const assignmentMap = new Map<string, string>();
        (assignmentsRes.data || []).forEach((a: { student_id: string, advisor_id: string }) => { 
          assignmentMap.set(a.student_id, a.advisor_id); 
        });
        setAssignments(assignmentMap);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, supabase]);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!session) return;
    setIsUpdatingRole(targetUserId);
    try {
      const { error } = await supabase.functions.invoke('update-user-role', { body: { targetUserId, newRole } });
      if (error) throw new Error(error.message);
      setProfiles(profiles.map(p => p.id === targetUserId ? { ...p, role: newRole } : p));
      toast.success("User role updated successfully.");
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setIsUpdatingRole(null); 
    }
  };

  const handleAssignmentChange = async (studentId: string, newAdvisorId: string) => {
    if (!session) return;
    setIsUpdatingAssignment(studentId);
    try {
      const { error } = await supabase.functions.invoke('manage-advisor-assignment', { body: { student_id: studentId, advisor_id: newAdvisorId === 'none' ? null : newAdvisorId } });
      if (error) throw new Error(error.message);
      setAssignments(prev => { 
        const newMap = new Map(prev); 
        if (newAdvisorId === 'none') newMap.delete(studentId); 
        else newMap.set(studentId, newAdvisorId); 
        return newMap; 
      });
      toast.success("Student assignment updated.");
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setIsUpdatingAssignment(null); 
    }
  };

  const isOnlyAdmin = profiles.filter(p => p.role === 'admin').length === 1;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and advisor assignments.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user roles and advisor assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Advisor</TableHead>
                <TableHead className="text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.first_name || "N/A"} {profile.last_name || ""}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize", 
                        profile.role === 'admin' ? "bg-blue-100 text-blue-800" : 
                        profile.role === 'advisor' ? "bg-purple-100 text-purple-800" : 
                        "bg-gray-100 text-gray-800"
                      )}>
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.role === 'user' && (
                        <Select 
                          value={assignments.get(profile.id) || 'none'} 
                          onValueChange={(newAdvisorId: string) => handleAssignmentChange(profile.id, newAdvisorId)} 
                          disabled={isUpdatingAssignment === profile.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Assign an advisor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">None</span>
                            </SelectItem>
                            {advisors.map(advisor => (
                              <SelectItem key={advisor.id} value={advisor.id}>
                                {advisor.first_name} {advisor.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        value={profile.role} 
                        onValueChange={(newRole: string) => handleRoleChange(profile.id, newRole)} 
                        disabled={isUpdatingRole === profile.id || (profile.role === 'admin' && isOnlyAdmin)}>
                        <SelectTrigger className="w-[110px] float-right">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="advisor">Advisor</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}