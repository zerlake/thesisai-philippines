'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  CheckCircle, 
  Clock,
  MailCheck,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  status: string;
  leader_info: {
    full_name?: string;
    email: string;
  };
}

interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  role: 'leader' | 'co-leader' | 'member';
  joined_at: string;
  accepted_invite: boolean;
  group_info: Group;
}

interface GroupTask {
  id: string;
  title: string;
  description?: string;
  assigned_to: string | null;
  assigned_by: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  created_at: string;
  completed_at?: string;
  group_info: {
    name: string;
  };
  assigned_by_info: {
    full_name?: string;
    email: string;
  };
}

interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  group_info: Group;
}

export function GroupMemberDashboard() {
  const { session, supabase } = useAuth();
  const [memberships, setMemberships] = useState<GroupMembership[]>([]);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch groups and memberships for the current user
  useEffect(() => {
    if (!session?.user.id) return;

    const fetchUserData = async () => {
      // Fetch groups where user is a member
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('group_memberships')
        .select(`
          *,
          group_info:group_id (*)
        `)
        .eq('user_id', session.user.id);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        toast.error('Failed to load group memberships');
      } else {
        setMemberships(membershipsData || []);
        if (membershipsData && membershipsData.length > 0 && !selectedGroup) {
          setSelectedGroup(membershipsData[0].group_id);
        }
      }

      // Fetch pending invitations for the user
      const email = session.user.email;
      const { data: invitesData, error: invitesError } = await supabase
        .from('group_invitations')
        .select(`
          *,
          group_info:group_id (*)
        `)
        .eq('email', email)
        .neq('status', 'accepted');

      if (invitesError) {
        console.error('Error fetching invitations:', invitesError);
      } else {
        setInvitations(invitesData || []);
      }
    };

    fetchUserData();
  }, [session?.user.id, session?.user.email, supabase, selectedGroup]);

  // Fetch group details when selected group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupDetails = async () => {
      // Fetch tasks assigned to the user in this group
      const { data: tasksData, error: tasksError } = await supabase
        .from('group_tasks')
        .select(`
          *,
          group_info:group_id (name),
          assigned_by_info:assigned_by (full_name, email)
        `)
        .eq('group_id', selectedGroup)
        .eq('assigned_to', session?.user.id);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup, session?.user.id, supabase]);

  const handleAcceptInvitation = async (invitationId: string, groupId: string) => {
    const { error: inviteError } = await supabase
      .from('group_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    if (inviteError) {
      console.error('Error accepting invitation:', inviteError);
      toast.error('Failed to accept invitation');
      return;
    }

    // Add membership record
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert([
        {
          group_id: groupId,
          user_id: session?.user.id,
          role: 'member',
          accepted_invite: true,
        },
      ]);

    if (membershipError) {
      console.error('Error creating membership:', membershipError);
      toast.error('Failed to join group');
    } else {
      toast.success('Successfully joined the group!');
      // Refresh group data
      const { data: membershipsData } = await supabase
        .from('group_memberships')
        .select(`
          *,
          group_info:group_id (*)
        `)
        .eq('user_id', session?.user.id);
      setMemberships(membershipsData || []);
      setSelectedGroup(groupId);
      // Refresh invitations
      const email = session?.user.email;
      const { data: invitesData } = await supabase
        .from('group_invitations')
        .select(`
          *,
          group_info:group_id (*)
        `)
        .eq('email', email)
        .neq('status', 'accepted');
      setInvitations(invitesData || []);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from('group_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);

    if (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    } else {
      toast.success('Declined invitation');
      // Refresh invitations
      const email = session?.user.email;
      const { data: invitesData } = await supabase
        .from('group_invitations')
        .select(`
          *,
          group_info:group_id (*)
        `)
        .eq('email', email)
        .neq('status', 'accepted');
      setInvitations(invitesData || []);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: GroupTask['status']) => {
    const { error } = await supabase
      .from('group_tasks')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } else {
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status, completed_at: status === 'completed' ? new Date().toISOString() : task.completed_at } : task
      ));
    }
  };

  const getStatusBadgeVariant = (status: GroupTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: GroupTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          Group Collaboration Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your group memberships and track assigned tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="w-5 h-5" />
                  Pending Invitations ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map(invite => (
                    <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{invite.group_info?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Invited by {invite.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptInvitation(invite.id, invite.group_id)}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineInvitation(invite.id)}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Group Content */}
          {selectedGroup && (
            <>
              {/* Group Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      {memberships.find(m => m.group_id === selectedGroup)?.group_info.name}
                      <p className="text-sm text-muted-foreground">
                        Group created by{' '}
                        {memberships.find(m => m.group_id === selectedGroup)?.group_info.leader_info.full_name || 
                         memberships.find(m => m.group_id === selectedGroup)?.group_info.leader_info.email}
                      </p>
                    </div>
                    <Badge>
                      Member
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {memberships.find(m => m.group_id === selectedGroup)?.group_info.description || 
                     'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              {/* Assigned Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No tasks assigned to you in this group.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted">
                          <div className="flex-1 mb-2 md:mb-0 md:mr-4">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge className={getStatusBadgeVariant(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Assigned by: {task.assigned_by_info.full_name || task.assigned_by_info.email}
                              </span>
                              {task.due_date && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select 
                              value={task.status} 
                              onValueChange={(val) => handleUpdateTaskStatus(task.id, val as any)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* No Groups Message */}
          {memberships.length === 0 && invitations.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No Groups Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You are not part of any groups yet. Check your email for invitations or ask your group leader to invite you.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Groups List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberships.map(membership => (
                  <div 
                    key={membership.id} 
                    className={`p-3 border rounded cursor-pointer ${
                      selectedGroup === membership.group_id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedGroup(membership.group_id)}
                  >
                    <h3 className="font-medium">{membership.group_info.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {membership.role} • Joined {new Date(membership.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {selectedGroup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Group Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tasks</span>
                    <span className="font-medium">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium text-yellow-600">
                      {tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-medium text-red-600">
                      {tasks.filter(t => 
                        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
                      ).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}