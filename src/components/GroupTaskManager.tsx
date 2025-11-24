'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Clock, CheckCircle, User } from 'lucide-react';

// interface Group {
//   id: string;
//   name: string;
// }

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'leader' | 'co-leader' | 'member';
  joined_at: string;
  user_metadata: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
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
  updated_at: string;
  completed_at?: string;
  group_id: string;
  user_metadata?: {
    full_name?: string;
    email?: string;
  };
}

export function GroupTaskManager({ groupId }: { groupId: string }) {
  const { session, supabase } = useAuth();
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<GroupTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    due_date: '',
  });

  // Load tasks and members
  useEffect(() => {
    if (!session?.user.id || !groupId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: membership, error: membershipError } = await supabase
          .from('group_memberships')
          .select('role, accepted_invite')
          .eq('group_id', groupId)
          .eq('user_id', session.user.id)
          .single();

        if (membershipError || !membership || !membership.accepted_invite) {
          setTasks([]);
          setMembers([]);
          setLoading(false);
          return;
        }

        const [tasksRes, membersRes] = await Promise.all([
          supabase.from('group_tasks').select('*').eq('group_id', groupId),
          supabase.from('group_memberships').select('*').eq('group_id', groupId)
        ]);

        if (tasksRes.error) {
          console.error('Error fetching tasks:', tasksRes.error);
          toast.error('Failed to load tasks.');
        }
        if (membersRes.error) {
          console.error('Error fetching members:', membersRes.error);
          toast.error('Failed to load group members.');
        }

        const tasksData = tasksRes.data || [];
        const membersData = membersRes.data?.filter(m => m.accepted_invite) || [];

        const userIds = [
          ...new Set([
            ...tasksData.map(t => t.assigned_to).filter(Boolean),
            ...tasksData.map(t => t.assigned_by),
            ...membersData.map(m => m.user_id)
          ])
        ];

        if (userIds.length === 0) {
          setTasks(tasksData);
          setMembers([]);
          setLoading(false);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast.error('Failed to load user information.');
        }

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

        const combinedTasks = tasksData.map(task => ({
          ...task,
          user_metadata: task.assigned_to ? profilesMap.get(task.assigned_to) : undefined
        }));

        const combinedMembers = membersData.map(mem => ({
          ...mem,
          user_metadata: profilesMap.get(mem.user_id) || { full_name: 'Unknown User' }
        }));

        setTasks(combinedTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setMembers(combinedMembers.sort((a, b) => {
            if (a.role === 'leader') return -1;
            if (b.role === 'leader') return 1;
            if (a.role === 'co-leader') return -1;
            if (b.role === 'co-leader') return 1;
            return 0;
        }));

      } catch (error) {
        console.error('General error in fetchData:', error);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user.id, groupId, supabase]);

  const handleCreateTask = async () => {
    if (!newTask.title) {
      toast.error('Please enter a task title');
      return;
    }

    const taskData: any = {
      group_id: groupId,
      title: newTask.title,
      description: newTask.description,
      assigned_by: session?.user.id,
      priority: newTask.priority,
      status: 'todo',
    };

    if (!newTask.assigned_to || newTask.assigned_to === 'unassigned') {
      taskData.assigned_to = null;
    } else {
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
      toast.success('Task created successfully');
      setNewTask({
        title: '',
        description: '',
        assigned_to: 'unassigned',
        priority: 'medium',
        due_date: '',
      });
      
      // Refresh tasks
      try {
        const { data, error: refreshError } = await supabase
          .from('group_tasks')
          .select(`*`)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (refreshError) {
          console.error('Error refreshing tasks:', refreshError);
          if (refreshError.code !== '42501' && !refreshError.message.toLowerCase().includes('permission')) {
            toast.error('Failed to refresh tasks');
          }
        } else {
          const tasksData = data || [];
          const userIds = [...new Set(tasksData.map(t => t.assigned_to).filter(Boolean))];
          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds);

            if (profilesError) {
              console.error('Error fetching profiles for refresh:', profilesError);
              setTasks(tasksData); // Set tasks without metadata on profile error
            } else {
              const profilesMap = new Map(profilesData.map(p => [p.id, p]));
              const combinedTasks = tasksData.map(task => ({
                ...task,
                user_metadata: task.assigned_to ? profilesMap.get(task.assigned_to) : undefined
              }));
              setTasks(combinedTasks);
            }
          } else {
            setTasks(tasksData);
          }
        }
      } catch (error: any) {
        console.error('Exception refreshing tasks:', error);
      }
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const { error } = await supabase
      .from('group_tasks')
      .update({
        title: editingTask.title,
        description: editingTask.description,
        assigned_to: editingTask.assigned_to,
        priority: editingTask.priority,
        due_date: editingTask.due_date,
        status: editingTask.status,
        completed_at: editingTask.status === 'completed' ? new Date().toISOString() : editingTask.completed_at,
      })
      .eq('id', editingTask.id);

    if (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } else {
      toast.success('Task updated successfully');
      setEditingTask(null);
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('group_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } else {
      toast.success('Task deleted');
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: GroupTask['status']) => {
    const { error } = await supabase
      .from('group_tasks')
      .update({ 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } else {
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status, completed_at: status === 'completed' ? new Date().toISOString() : task.completed_at } 
          : task
      ));
    }
  };

  const handleEditTask = (task: GroupTask) => {
    setEditingTask(task);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const getUserFullName = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return member?.user_metadata.full_name || 'Unknown';
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

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Task Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Create New Task</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <Select value={newTask.assigned_to} onValueChange={(val) => setNewTask({...newTask, assigned_to: val || ''})}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.user_metadata.full_name || 'Unknown'}
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
          <Button onClick={handleCreateTask} className="mt-3 w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Group Tasks</span>
            </div>
            <Badge variant="secondary">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted" />
              <p>No tasks created yet</p>
              <p className="text-sm mt-1">Create your first task using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    {editingTask && editingTask.id === task.id ? (
                      // Editing form
                      <div className="space-y-3">
                        <Input
                          value={editingTask.title}
                          onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Select 
                            value={editingTask.assigned_to || 'unassigned'} 
                            onValueChange={(val) => setEditingTask({
                              ...editingTask, 
                              assigned_to: val === 'unassigned' ? null : val
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {members.map(member => (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                  {member.user_metadata.full_name || member.user_metadata.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select 
                            value={editingTask.priority} 
                            onValueChange={(val) => setEditingTask({
                              ...editingTask, 
                              priority: val as any
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                            value={editingTask.due_date || ''}
                            onChange={(e) => setEditingTask({
                              ...editingTask, 
                              due_date: e.target.value || undefined
                            })}
                          />
                          <Select 
                            value={editingTask.status} 
                            onValueChange={(val) => setEditingTask({
                              ...editingTask, 
                              status: val as any
                            })}
                          >
                            <SelectTrigger>
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
                        <Textarea
                          value={editingTask.description || ''}
                          onChange={(e) => setEditingTask({
                            ...editingTask, 
                            description: e.target.value
                          })}
                          rows={2}
                        />
                        <div className="flex gap-2 mt-3">
                          <Button onClick={handleUpdateTask}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Display task
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge className={getStatusBadgeVariant(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {task.user_metadata && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Assigned to: {task.user_metadata.full_name || 'Unknown'}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              By: {getUserFullName(task.assigned_by)}
                            </span>
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            {task.completed_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Completed: {new Date(task.completed_at).toLocaleDateString()}
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
                          <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}