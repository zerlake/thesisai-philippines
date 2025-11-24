// Simplified version of the group page without the complex type issues
'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupCommunication } from '@/components/GroupCommunication';
import { GroupTaskManager } from '@/components/GroupTaskManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { Users, MessageSquare, CheckSquare, Mail, ArrowLeft } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: 'leader' | 'co-leader' | 'member';
  joined_at: string;
  accepted_invite: boolean;
  user_metadata?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

interface GroupTask {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  assigned_to: string | null;
  assigned_by: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  created_at: string;
  completed_at?: string;
}

// Client component using useRouter for getting params in Next.js 16
export default function GroupLayout({ params }: { params: Promise<{ groupId: string }> }) {
  const { session, supabase } = useAuth();
  const resolvedParams = use(params);
  const groupId = resolvedParams.groupId;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [userRole, setUserRole] = useState<'leader' | 'co-leader' | 'member'>('member');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [_tasks, setTasks] = useState<GroupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Helper function for handling member invitations
  const handleInviteMember = async () => {
    if (!groupId || !newMemberEmail || !session?.user.id) return;
    
    const { error } = await supabase
      .from('group_invitations')
      .insert([
        {
          group_id: groupId,
          email: newMemberEmail,
          invited_by: session.user.id,
          status: 'pending'
        }
      ]);
    
    if (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } else {
      toast.success(`Invitation sent to ${newMemberEmail}`);
      setNewMemberEmail('');
      
      // Refresh invitations
      const { data: newInvites, error: refreshError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('group_id', groupId);
      
      if (!refreshError) {
        setInvitations(newInvites || []);
      }
    }
  };

  // Fetch all group information
  useEffect(() => {
    if (!session?.user.id || !groupId) return;

    const fetchGroupData = async () => {
      try {
        // Get group info
         const { data: groupData, error: groupError } = await supabase
           .from('research_groups')
           .select('*')
           .eq('id', groupId)
          .single();

        if (groupError) {
          if (groupError.code === 'PGRST116') { // Row not found
            toast.error('Group not found');
            window.location.href = '/dashboard';
            return;
          } else {
            throw groupError;
          }
        }

        if (!groupData) {
          toast.error('Group not found');
          window.location.href = '/dashboard';
          return;
        }

        setGroup(groupData);

        // Get user role in this group
        const { data: membershipData, error: membershipError } = await supabase
          .from('group_memberships')
          .select('role')
          .eq('group_id', groupId)
          .eq('user_id', session.user.id)
          .single();

        if (membershipError && !(membershipError.constructor === Object && Object.keys(membershipError).length === 0)) {
          console.error('Error fetching membership:', membershipError);
          toast.error('Failed to load group membership');
        } else if (membershipData) {
          setUserRole(membershipData.role as 'leader' | 'co-leader' | 'member');
        }

        // Get group members
         const { data: membersData, error: membersError } = await supabase
           .from('group_memberships')
           .select(`
             id,
             user_id,
             group_id,
             role,
             joined_at,
             accepted_invite
           `)
           .eq('group_id', groupId);

        if (membersError && !(membersError.constructor === Object && Object.keys(membersError).length === 0)) {
          console.error('Error fetching members:', membersError);
        } else {
          // Filter out members who haven't accepted the invite client-side
          const acceptedMembers = membersData?.filter(member => member.accepted_invite) || [];
          setMembers(acceptedMembers as any); // Type assertion since we're not adding user_metadata here
        }

        // Get pending invitations
        const { data: invitesData, error: invitesError } = await supabase
          .from('group_invitations')
          .select('*')
          .eq('group_id', groupId);

        if (invitesError && !(invitesError.constructor === Object && Object.keys(invitesError).length === 0)) {
          console.error('Error fetching invitations:', invitesError);
        } else {
          setInvitations(invitesData || []);
        }

        // Get group tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('group_tasks')
          .select(`
            id,
            title,
            description,
            assigned_to,
            assigned_by,
            status,
            priority,
            due_date,
            created_at,
            updated_at,
            completed_at,
            group_id
          `)
          .eq('group_id', groupId);

        if (tasksError && !(tasksError.constructor === Object && Object.keys(tasksError).length === 0)) {
          console.error('Error fetching tasks:', tasksError);
        } else {
          setTasks(tasksData || []);
        }
      } catch (error: any) {
         console.error('Error loading group:', error);
         toast.error('Failed to load group information');
         window.location.href = '/dashboard';
       } finally {
         setLoading(false);
       }
      };

      fetchGroupData();
      }, [session?.user.id, groupId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-xl font-medium mb-2">Group not found</h2>
        <p className="text-muted-foreground mb-4">
          The group you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => window.history.back()}>
             <ArrowLeft className="w-4 h-4" />
           </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {group.name}
              <Badge variant="outline">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Created at {new Date(group.created_at).toLocaleDateString()} • {members.length} members
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </Badge>
      </div>

      {/* Group Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-sm mx-auto">
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          {(userRole === 'leader' || userRole === 'co-leader') && (
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invites
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No members in this group yet</p>
              ) : (
                <div className="grid gap-3">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user_metadata?.avatar_url} />
                          <AvatarFallback>
                            {member.user_metadata?.full_name 
                              ? (member.user_metadata?.full_name || '').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                              : (member.user_metadata?.email || '').charAt(0).toUpperCase() || 
                                member.user_id.substring(0, 2).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user_metadata?.full_name || member.user_metadata?.email || member.user_id}</p>
                          <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
           {groupId && <GroupCommunication groupId={groupId} />}
         </TabsContent>

         <TabsContent value="tasks" className="space-y-4">
           {groupId && <GroupTaskManager groupId={groupId} />}
         </TabsContent>

         {groupId && (userRole === 'leader' || userRole === 'co-leader') && (
          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Group Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter email to invite"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                    <Button onClick={handleInviteMember}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invite
                    </Button>
                  </div>
                  
                  {invitations.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="font-medium">Pending Invitations</h3>
                      {invitations.map(invite => (
                        <div key={invite.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <p className="text-xs text-muted-foreground">Sent {new Date(invite.created_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline">{invite.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No pending invitations</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}