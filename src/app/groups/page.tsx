'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Reserved for future navigation
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { Plus, Search, Users, Eye, Trash2 } from 'lucide-react';
import GroupCollaborationSampleDataGenerator from '@/components/sample-data/group-collaboration-sample-generator';

interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  role: 'leader' | 'co-leader' | 'member';
}

export default function GroupsDashboard() {
  const { session, supabase } = useAuth();
  // const router = useRouter(); // Reserved for future navigation
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user's groups
  useEffect(() => {
    if (!session?.user.id) return;

    const fetchGroups = async () => {
      try {
        // Get the group memberships for the user without complex joins
        const { data: memberships, error: membershipError } = await supabase
          .from('group_memberships')
          .select('group_id, role')
          .eq('user_id', session.user.id);

        if (membershipError) {
          console.error('Error fetching memberships:', membershipError);
          throw membershipError;
        }

        // If no memberships, return empty array
        if (!memberships || memberships.length === 0) {
          setGroups([]);
          setLoading(false);
          return;
        }

        // Get the group details separately
        const groupIds = memberships.map(m => m.group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('research_groups')
          .select('id, name, description, created_by, created_at, updated_at')
          .in('id', groupIds);

        if (groupsError) {
          console.error('Error fetching groups:', groupsError);
          throw groupsError;
        }

        // Map the data to our Group interface
        const transformedGroups = groupsData.map(group => {
          const membership = memberships.find(m => m.group_id === group.id);
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            created_by: group.created_by,
            created_at: group.created_at,
            updated_at: group.updated_at,
            role: (membership?.role === 'co-leader' ? 'co-leader' : membership?.role || 'member'),
            member_count: 0, // Will fetch counts separately if needed
          };
        });

        setGroups(transformedGroups);
      } catch (error: any) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [session?.user.id, supabase]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('research_groups')
        .insert([
          {
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            created_by: session?.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the current user as a leader member
      const { error: memberError } = await supabase
        .from('group_memberships')
        .insert([
          {
            group_id: data.id,
            user_id: session?.user.id,
            role: 'leader',
            accepted_invite: true,
          }
        ]);

      if (memberError) throw memberError;

      toast.success('Group created successfully!');
      setIsCreatingGroup(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      // Refresh groups - get the group memberships for the user
      const { data: memberships, error: membershipError } = await supabase
        .from('group_memberships')
        .select('group_id, role')
        .eq('user_id', session?.user.id);

      if (membershipError) {
        console.error('Error refreshing memberships:', membershipError);
        throw membershipError;
      }

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        return;
      }

      // Then get the group details
      const groupIds = memberships.map(m => m.group_id);
      const { data: groupsData, error: groupsError } = await supabase
        .from('research_groups')
        .select('id, name, description, created_by, created_at, updated_at')
        .in('id', groupIds);

      if (groupsError) {
        console.error('Error refreshing groups:', groupsError);
        throw groupsError;
      }

      // Combine the data
      const newGroups = groupsData.map(group => {
        const membership = memberships.find(m => m.group_id === group.id);
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          created_by: group.created_by,
          created_at: group.created_at,
          updated_at: group.updated_at,
          role: (membership?.role === 'co-leader' ? 'co-leader' : membership?.role || 'member'),
          member_count: 0, // Will fetch counts separately if needed
        };
      });

      setGroups(newGroups);
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('research_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } else {
      toast.success('Group deleted successfully');
      setGroups(groups.filter(group => group.id !== groupId));
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Research Groups</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your peers and manage research projects
          </p>
        </div>
        <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Research Group</DialogTitle>
              <DialogDescription>
                Start a new collaborative research group with your peers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Group Name</label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Literature Review Team"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
                <Input
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe the purpose of this group..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingGroup(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sample Data Generator */}
      <div className="mb-8">
        <GroupCollaborationSampleDataGenerator onSampleDataGenerated={() => {
          // Refresh the groups after generating sample data
          if (session?.user.id) {
            const fetchGroups = async () => {
              try {
                const { data: memberships, error: membershipError } = await supabase
                  .from('group_memberships')
                  .select('group_id, role')
                  .eq('user_id', session.user.id)
                  .eq('accepted_invite', true);

                if (membershipError) {
                  console.error('Error fetching memberships:', membershipError);
                  throw membershipError;
                }

                if (!memberships || memberships.length === 0) {
                  setGroups([]);
                  return;
                }

                const groupIds = memberships.map(m => m.group_id);
                const { data: groupsData, error: groupsError } = await supabase
                  .from('research_groups')
                  .select('id, name, description, created_by, created_at, updated_at')
                  .in('id', groupIds);

                if (groupsError) {
                  console.error('Error fetching groups:', groupsError);
                  throw groupsError;
                }

                const transformedGroups = groupsData.map(group => {
                  const membership = memberships.find(m => m.group_id === group.id);
                  return {
                    id: group.id,
                    name: group.name,
                    description: group.description,
                    created_by: group.created_by,
                    created_at: group.created_at,
                    updated_at: group.updated_at,
                    role: (membership?.role === 'co-leader' ? 'co-leader' : membership?.role || 'member'),
                    member_count: 0,
                  };
                });

                setGroups(transformedGroups);
              } catch (error: any) {
                console.error('Error fetching groups:', error);
                toast.error('Failed to refresh groups: ' + (error.message || 'Unknown error'));
              }
            };

            fetchGroups();
          }
        }} />
      </div>



      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No groups yet</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'No groups match your search' 
              : 'You are not part of any groups yet. Create your first group or accept an invitation.'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreatingGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <Card key={group.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <Badge variant={group.role === 'leader' ? 'default' : group.role === 'co-leader' ? 'secondary' : 'outline'}>
                    {group.role === 'leader' ? 'Leader' : group.role === 'co-leader' ? 'Co-leader' : 'Member'}
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {group.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4 mr-1" />
                  {group.member_count} members
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Created at {new Date(group.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/groups/${group.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {group.role === 'leader' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}