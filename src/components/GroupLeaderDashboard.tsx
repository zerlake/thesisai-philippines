'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Mail, 
  Plus, 
  Clock, 
  CheckCircle, 
  UserPlus,
  UserX,
  PlusCircle,
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
}

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'leader' | 'co-leader' | 'member';
  joined_at: string;
  accepted_invite: boolean;
  user_metadata: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface GroupInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
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
  user_metadata?: {
    full_name?: string;
    email: string;
  };
}

export function GroupLeaderDashboard() {
  const { session, supabase } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Fetch groups for the current user
  useEffect(() => {
    if (!session?.user.id) return;

    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('research_groups')
        .select('*')
        .eq('created_by', session.user.id);

      if (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to fetch groups');
      } else {
        setGroups(data || []);
        if (data && data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0].id);
        }
      }
    };

    fetchGroups();
  }, [session?.user.id, supabase]);

  // Fetch group details when selected group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupDetails = async () => {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('group_memberships')
        .select(`
          *,
          user_metadata:user_id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', selectedGroup);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      } else {
        setMembers(membersData || []);
      }

      // Fetch invitations
      const { data: invitesData, error: invitesError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', selectedGroup);

      if (invitesError) {
        console.error('Error fetching invitations:', invitesError);
      } else {
        setInvitations(invitesData || []);
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('group_tasks')
        .select(`
          *,
          user_metadata:assigned_to (
            full_name,
            email
          )
        `)
        .eq('group_id', selectedGroup);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      } else {
        setTasks(tasksData || []);
      }
    };

    fetchGroupDetails();
  }, [selectedGroup, supabase]);

  const handleInviteMember = async () => {
    if (!selectedGroup || !newMemberEmail) {
      toast.error('Please provide an email address');
      return;
    }

    const { error } = await supabase
      .from('group_invitations')
      .insert([
        {
          group_id: selectedGroup,
          email: newMemberEmail,
          invited_by: session?.user.id,
        },
      ]);

    if (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } else {
      toast.success(`Invitation sent to ${newMemberEmail}`);
      setNewMemberEmail('');
      // Refresh invitations
      const { data: invitesData } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', selectedGroup);
      setInvitations(invitesData || []);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;

    const { error } = await supabase
      .from('group_memberships')
      .delete()
      .eq('group_id', selectedGroup)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } else {
      toast.success('Member removed');
      // Refresh members
      const { data: membersData } = await supabase
        .from('group_memberships')
        .select(`
          *,
          user_metadata:user_id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', selectedGroup);
      setMembers(membersData || []);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedGroup || !newTask.title) {
      toast.error('Please provide a task title');
      return;
    }

    const taskData: any = {
      group_id: selectedGroup,
      title: newTask.title,
      description: newTask.description,
      assigned_by: session?.user.id,
      priority: newTask.priority,
    };

    if (newTask.assigned_to) {
      taskData.assigned_to = newTask.assigned_to;
    }

    if (newTask.due_date) {
      taskData.due_date = newTask.due_date;
    }

    const { error } = await supabase
      .from('group_tasks')
      .insert([taskData]);

    if (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } else {
      toast.success('Task created');
      setNewTask({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        priority: 'medium',
      });
      setIsCreatingTask(false);
      // Refresh tasks
      const { data: tasksData } = await supabase
        .from('group_tasks')
        .select(`
          *,
          user_metadata:assigned_to (
            full_name,
            email
          )
        `)
        .eq('group_id', selectedGroup);
      setTasks(tasksData || []);
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

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
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
          Manage your research groups and collaborate with team members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Group Overview */}
          {selectedGroup && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      {groups.find(g => g.id === selectedGroup)?.name}
                      <p className="text-sm text-muted-foreground">
                        Manage your research group and team members
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {members.length} Members
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Invite Member Section */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter member email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleInviteMember}>
                      <Mail className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>

                  {/* Pending Invitations */}
                  {invitations.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Pending Invitations ({invitations.length})
                      </h3>
                      <div className="space-y-2">
                        {invitations.map(invite => (
                          <div key={invite.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span>{invite.email}</span>
                            <Badge variant="outline">{invite.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Group Tasks
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreatingTask(!isCreatingTask)}
                  >
                    {isCreatingTask ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Task</>}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isCreatingTask && (
                    <div className="mb-4 p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Create New Task</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Task title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        />
                        <Select value={newTask.assigned_to || 'unassigned'} onValueChange={(val) => setNewTask({...newTask, assigned_to: val === 'unassigned' ? '' : val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {members
                              .filter(m => m.accepted_invite)
                              .map(member => (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                  {member.user_metadata.full_name || member.user_metadata.email}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Select value={newTask.priority} onValueChange={(val) => setNewTask({...newTask, priority: val as any})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="date"
                          value={newTask.due_date}
                          onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                        />
                        <div className="md:col-span-2">
                          <Textarea
                            placeholder="Task description (optional)"
                            value={newTask.description}
                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button onClick={handleCreateTask} className="mt-3 w-full">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No tasks created yet. Add your first task!
                      </p>
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted">
                          <div className="flex-1">
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
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {task.user_metadata && (
                                <span>Assigned to: {task.user_metadata.full_name || task.user_metadata.email}</span>
                              )}
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Create New Group */}
          {!selectedGroup && (
            <Card>
              <CardHeader>
                <CardTitle>No Groups Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t created any research groups yet. Create your first group to start collaborating.
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Group
                </Button>
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
                {groups.map(group => (
                  <div 
                    key={group.id} 
                    className={`p-3 border rounded cursor-pointer ${
                      selectedGroup === group.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedGroup(group.id)}
                  >
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {group.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          {selectedGroup && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members
                    .filter(m => m.accepted_invite)
                    .map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.user_metadata.avatar_url} />
                            <AvatarFallback>
                              {getUserInitials(member.user_metadata.full_name, member.user_metadata.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {member.user_metadata.full_name || member.user_metadata.email}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        {member.role !== 'leader' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="h-8 w-8 p-0"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}