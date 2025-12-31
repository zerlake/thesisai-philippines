"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Users,
  UserPlus,
  UserX,
  UserCheck,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Relationship {
  id: string;
  student_id: string;
  advisor_id?: string;
  critic_id?: string;
  student_name: string;
  student_email: string;
  status: 'pending' | 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at: string;
}

export function RelationshipManagement() {
  const { profile, supabase } = useAuth();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [filteredRelationships, setFilteredRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newRelationshipEmail, setNewRelationshipEmail] = useState("");
  const [relationshipType, setRelationshipType] = useState<"advisor" | "critic">("advisor");

  // Load relationships
  useEffect(() => {
    if (!profile) return;
    
    const loadRelationships = async () => {
      setIsLoading(true);
      try {
        let query;
        
        if (profile.role === 'advisor') {
          // Load advisor-student relationships where current user is the advisor
          query = supabase
            .from('advisor_student_relationships')
            .select(`
              id,
              student_id,
              advisor_id,
              status,
              created_at,
              updated_at,
              profiles:user_id!student_id(first_name, last_name, email)
            `)
            .eq('advisor_id', profile.id);
        } else if (profile.role === 'critic') {
          // Load critic-student relationships where current user is the critic
          query = supabase
            .from('critic_student_relationships')
            .select(`
              id,
              student_id,
              critic_id,
              status,
              created_at,
              updated_at,
              profiles:user_id!student_id(first_name, last_name, email)
            `)
            .eq('critic_id', profile.id);
        } else {
          // For admin or other roles, we might want to show all
          setIsLoading(false);
          return;
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform the data to match our interface
        const transformedData: Relationship[] = (data || []).map(rel => ({
          id: rel.id,
          student_id: rel.student_id,
          advisor_id: rel.advisor_id,
          critic_id: rel.critic_id,
          student_name: `${rel.profiles?.first_name || ''} ${rel.profiles?.last_name || ''}`.trim(),
          student_email: rel.profiles?.email || '',
          status: rel.status as 'pending' | 'active' | 'inactive' | 'completed',
          created_at: rel.created_at,
          updated_at: rel.updated_at
        }));

        setRelationships(transformedData);
        setFilteredRelationships(transformedData);
      } catch (error) {
        console.error("Error loading relationships:", error);
        toast.error("Failed to load relationships");
      } finally {
        setIsLoading(false);
      }
    };

    loadRelationships();
  }, [profile, supabase]);

  // Apply filters
  useEffect(() => {
    let result = relationships;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(rel => 
        rel.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rel.student_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(rel => rel.status === statusFilter);
    }

    setFilteredRelationships(result);
  }, [relationships, searchTerm, statusFilter]);

  // Add new relationship
  const addRelationship = async () => {
    if (!newRelationshipEmail.trim()) {
      toast.error("Please enter a student email");
      return;
    }

    try {
      // First, find the student by email
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newRelationshipEmail)
        .single();

      if (studentError || !studentData) {
        toast.error("Student not found with that email");
        return;
      }

      // Insert the relationship
      const relationshipData = {
        student_id: studentData.id,
        [profile?.role === 'advisor' ? 'advisor_id' : 'critic_id']: profile?.id,
        status: 'pending'
      };

      const { error: insertError } = await supabase
        .from(profile?.role === 'advisor' ? 'advisor_student_relationships' : 'critic_student_relationships')
        .insert(relationshipData);

      if (insertError) throw insertError;

      // Refresh the list
      const { data: newData, error: refreshError } = await supabase
        .from(profile?.role === 'advisor' ? 'advisor_student_relationships' : 'critic_student_relationships')
        .select(`
          id,
          student_id,
          advisor_id,
          critic_id,
          status,
          created_at,
          updated_at,
          profiles:user_id!student_id(first_name, last_name, email)
        `)
        .eq(profile?.role === 'advisor' ? 'advisor_id' : 'critic_id', profile?.id);

      if (refreshError) throw refreshError;

      const transformedData: Relationship[] = (newData || []).map(rel => ({
        id: rel.id,
        student_id: rel.student_id,
        advisor_id: rel.advisor_id,
        critic_id: rel.critic_id,
        student_name: `${rel.profiles?.first_name || ''} ${rel.profiles?.last_name || ''}`.trim(),
        student_email: rel.profiles?.email || '',
        status: rel.status as 'pending' | 'active' | 'inactive' | 'completed',
        created_at: rel.created_at,
        updated_at: rel.updated_at
      }));

      setRelationships(transformedData);
      setFilteredRelationships(transformedData);
      setNewRelationshipEmail("");
      toast.success("Relationship request sent successfully!");
    } catch (error) {
      console.error("Error adding relationship:", error);
      toast.error("Failed to add relationship");
    }
  };

  // Update relationship status
  const updateStatus = async (relationshipId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    try {
      const { error } = await supabase
        .from(profile?.role === 'advisor' ? 'advisor_student_relationships' : 'critic_student_relationships')
        .update({ status: newStatus })
        .eq('id', relationshipId);

      if (error) throw error;

      // Update local state
      setRelationships(relationships.map(rel => 
        rel.id === relationshipId ? { ...rel, status: newStatus } : rel
      ));
      setFilteredRelationships(filteredRelationships.map(rel => 
        rel.id === relationshipId ? { ...rel, status: newStatus } : rel
      ));

      toast.success(`Relationship status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating relationship status:", error);
      toast.error("Failed to update relationship status");
    }
  };

  // Remove relationship
  const removeRelationship = async (relationshipId: string) => {
    try {
      const { error } = await supabase
        .from(profile?.role === 'advisor' ? 'advisor_student_relationships' : 'critic_student_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;

      // Update local state
      setRelationships(relationships.filter(rel => rel.id !== relationshipId));
      setFilteredRelationships(filteredRelationships.filter(rel => rel.id !== relationshipId));

      toast.success("Relationship removed successfully!");
    } catch (error) {
      console.error("Error removing relationship:", error);
      toast.error("Failed to remove relationship");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><UserCheck className="w-3 h-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {profile?.role === 'advisor' ? 'Advisor-Student' : 'Critic-Student'} Relationships
        </CardTitle>
        <CardDescription>
          Manage your relationships with students and track their status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Relationship */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Add New Relationship</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="student-email">Student Email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="student@university.edu"
                value={newRelationshipEmail}
                onChange={(e) => setNewRelationshipEmail(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="relationship-type">Type</Label>
              <Select 
                value={profile?.role || "advisor"} 
                onValueChange={(val) => setRelationshipType(val as "advisor" | "critic")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advisor">Advisor-Student</SelectItem>
                  <SelectItem value="critic">Critic-Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 flex items-end">
              <Button 
                className="w-full" 
                onClick={addRelationship}
                disabled={!newRelationshipEmail.trim()}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-full md:w-40">
            <div className="relative">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded border border-input bg-background pl-8 pr-8 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Relationships List */}
        <div>
          <h3 className="font-medium mb-3">Current Relationships</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredRelationships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No relationships found.</p>
              <p className="text-sm">Add a new relationship to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRelationships.map(relationship => (
                <div 
                  key={relationship.id} 
                  className="p-4 border rounded-lg bg-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium">{relationship.student_name}</div>
                      <div className="text-sm text-muted-foreground">{relationship.student_email}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Added: {new Date(relationship.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated: {new Date(relationship.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {getStatusBadge(relationship.status)}
                      
                      {relationship.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(relationship.id, 'active')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeRelationship(relationship.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {relationship.status === 'active' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(relationship.id, 'completed')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(relationship.id, 'inactive')}
                            className="text-destructive hover:text-destructive"
                          >
                            Pause
                          </Button>
                        </div>
                      )}
                      
                      {(relationship.status === 'inactive' || relationship.status === 'completed') && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(relationship.id, 'active')}
                          >
                            Reactivate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeRelationship(relationship.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}