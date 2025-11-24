'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

interface Group {
  id: string;
  name: string;
}

interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  group_info: Group;
}

export function GroupInvitationManager() {
  const { session, supabase } = useAuth();
  const [invitedEmail, setInvitedEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initially get user's groups
  useState(async () => {
    if (!session?.user.id) return;

    try {
      // Get groups where user is leader
      const { data, error } = await supabase
        .from('research_groups')
        .select('id, name')
        .eq('created_by', session.user.id);

      if (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to fetch groups');
      } else {
        setGroups(data || []);
        if (data && data.length > 0) {
          setSelectedGroupId(data[0].id);
        }
      }

      // Get all invitations sent by this user
      const { data: invData, error: invError } = await supabase
        .from('group_invitations')
        .select(`
          *,
          group_info:group_id (name)
        `)
        .eq('invited_by', session.user.id);

      if (invError) {
        console.error('Error fetching invitations:', invError);
      } else {
        setInvitations(invData || []);
      }
    } catch (error: any) {
      console.error('Error in initial load:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  });

  const handleSendInvitation = async () => {
    if (!invitedEmail || !selectedGroupId) {
      toast.error('Please select a group and enter an email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invitedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const { error } = await supabase
        .from('group_invitations')
        .insert([
          {
            group_id: selectedGroupId,
            email: invitedEmail,
            invited_by: session?.user.id,
          },
        ]);

      if (error) {
        console.error('Error sending invitation:', error);
        toast.error('Failed to send invitation');
      } else {
        toast.success(`Invitation sent to ${invitedEmail} for group: ${groups.find(g => g.id === selectedGroupId)?.name}`);
        
        // Reset form
        setInvitedEmail('');
        
        // Refresh invitations list
        const { data: newInvitations, error: refreshError } = await supabase
          .from('group_invitations')
          .select(`
            *,
            group_info:group_id (name)
          `)
          .eq('invited_by', session?.user.id);

        if (refreshError) {
          console.error('Error refreshing invitations:', refreshError);
        } else {
          setInvitations(newInvitations || []);
        }
      }
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      // We can't really resend an invitation as sent emails can't be recalled
      // Instead, we'll just update the expiration time
      const { error } = await supabase
        .from('group_invitations')
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })
        .eq('id', invitationId);

      if (error) {
        console.error('Error updating invitation:', error);
        toast.error('Failed to update invitation');
      } else {
        toast.success('Invitation expiration extended');
        // Refresh invitations
        const { data: newInvitations, error: refreshError } = await supabase
          .from('group_invitations')
          .select(`
            *,
            group_info:group_id (name)
          `)
          .eq('invited_by', session?.user.id);

        if (refreshError) {
          console.error('Error refreshing invitations:', refreshError);
        } else {
          setInvitations(newInvitations || []);
        }
      }
    } catch (error: any) {
      console.error('Error updating invitation:', error);
      toast.error('Failed to update invitation');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        console.error('Error cancelling invitation:', error);
        toast.error('Failed to cancel invitation');
      } else {
        toast.success('Invitation cancelled');
        // Refresh invitations
        const { data: newInvitations, error: refreshError } = await supabase
          .from('group_invitations')
          .select(`
            *,
            group_info:group_id (name)
          `)
          .eq('invited_by', session?.user.id);

        if (refreshError) {
          console.error('Error refreshing invitations:', refreshError);
        } else {
          setInvitations(newInvitations || []);
        }
      }
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="container mx-auto py-6">
      <CardHeader>
        <CardTitle className="text-2xl">Invite Team Members</CardTitle>
        <p className="text-muted-foreground">
          Send invitations to colleagues to join your research groups
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Send Invitation Form */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Send New Invitation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="groupId">Select Group</Label>
                <select
                  id="groupId"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">Choose a group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="colleague@university.edu"
                  value={invitedEmail}
                  onChange={(e) => setInvitedEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              className="mt-4 w-full md:w-auto" 
              onClick={handleSendInvitation}
            >
              Send Invitation
            </Button>
          </div>

          {/* Existing Invitations */}
          {invitations.length > 0 ? (
            <div>
              <h3 className="font-medium mb-3">Outstanding Invitations</h3>
              <div className="space-y-3">
                {invitations
                  .filter(inv => inv.status !== 'accepted') // Only show active invitations
                  .map(invitation => (
                    <div key={invitation.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{invitation.email}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${getInvitationStatusColor(invitation.status)}`}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Group: {invitation.group_info?.name} • Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          {invitation.expires_at && ` • Expires: ${new Date(invitation.expires_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        {invitation.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResendInvitation(invitation.id)}
                            >
                              Resend
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No invitations sent yet</p>
              <p className="text-sm mt-1">Send your first invitation using the form above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}