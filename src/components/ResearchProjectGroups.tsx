'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Folder, 
  FileText, 
  Plus, 
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  Settings,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface ResearchProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'on-hold';
  members: GroupMember[];
  literatureReviews: string[]; // IDs of associated literature reviews
  progress: number; // 0-100
}

interface ProjectActivity {
  id: string;
  type: 'literature-add' | 'note-add' | 'member-join' | 'update';
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

export function ResearchProjectGroups() {
  const { session, profile } = useAuth();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization - in a real app, this would come from Supabase
  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for research projects
      const mockProjects: ResearchProject[] = [
        {
          id: 'proj1',
          name: 'AI in Philippine Education',
          description: 'Researching the impact of AI tools on learning outcomes in Filipino universities',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          status: 'active',
          members: [
            {
              id: session?.user.id || 'user1',
              name: profile?.first_name ? `${profile.first_name} ${profile?.last_name || ''}` : 'You',
              email: session?.user.email || 'you@example.com',
              avatar: profile?.avatar_url || '',
              role: 'admin',
              joinedAt: new Date(Date.now() - 86400000 * 7).toISOString()
            },
            {
              id: 'user2',
              name: 'Sarah Johnson',
              email: 'sarah@example.com',
              avatar: '',
              role: 'member',
              joinedAt: new Date(Date.now() - 86400000 * 5).toISOString()
            },
            {
              id: 'user3',
              name: 'Michael Chen',
              email: 'michael@example.com',
              avatar: '',
              role: 'member',
              joinedAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
          ],
          literatureReviews: ['lit1', 'lit2'],
          progress: 45
        },
        {
          id: 'proj2',
          name: 'Sustainable Development',
          description: 'Research on sustainable practices in Philippine universities',
          createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
          updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
          status: 'active',
          members: [
            {
              id: session?.user.id || 'user1',
              name: profile?.first_name ? `${profile.first_name} ${profile?.last_name || ''}` : 'You',
              email: session?.user.email || 'you@example.com',
              avatar: profile?.avatar_url || '',
              role: 'member',
              joinedAt: new Date(Date.now() - 86400000 * 10).toISOString()
            },
            {
              id: 'user4',
              name: 'Dr. Ana Rodriguez',
              email: 'ana@example.com',
              avatar: '',
              role: 'admin',
              joinedAt: new Date(Date.now() - 86400000 * 14).toISOString()
            }
          ],
          literatureReviews: ['lit3'],
          progress: 70
        }
      ];
      
      // Mock data for activities
      const mockActivities: ProjectActivity[] = [
        {
          id: 'act1',
          type: 'literature-add',
          user: {
            id: session?.user.id || 'user1',
            name: profile?.first_name ? `${profile.first_name} ${profile?.last_name || ''}` : 'You',
            avatar: profile?.avatar_url || ''
          },
          content: 'Added 5 new papers to the literature review',
          timestamp: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
        },
        {
          id: 'act2',
          type: 'note-add',
          user: {
            id: 'user2',
            name: 'Sarah Johnson',
            avatar: ''
          },
          content: 'Added methodology notes for the AI project',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
          id: 'act3',
          type: 'member-join',
          user: {
            id: 'user3',
            name: 'Michael Chen',
            avatar: ''
          },
          content: 'Joined the research project',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
        }
      ];
      
      setProjects(mockProjects);
      setActivities(mockActivities);
      setIsLoading(false);
    };
    
    loadData();
    }, [session?.user.id, session?.user.email, profile?.avatar_url, profile?.first_name, profile?.last_name]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    const newProject: ResearchProject = {
      id: `proj${projects.length + 1}`,
      name: newProjectName,
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      members: [
        {
          id: session?.user.id || 'current-user',
          name: profile?.first_name ? `${profile.first_name} ${profile?.last_name || ''}` : 'You',
          email: session?.user.email || 'you@example.com',
          avatar: profile?.avatar_url || '',
          role: 'admin',
          joinedAt: new Date().toISOString()
        }
      ],
      literatureReviews: [],
      progress: 0
    };
    
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setNewProjectDescription('');
    toast.success('Research project created successfully!');
  };

  const handleAddMember = (projectId: string) => {
    if (!newMemberEmail.trim()) return;
    
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const newMember: GroupMember = {
          id: `member${project.members.length + 1}`,
          name: newMemberEmail.split('@')[0],
          email: newMemberEmail,
          avatar: '',
          role: 'member',
          joinedAt: new Date().toISOString()
        };
        
        return {
          ...project,
          members: [...project.members, newMember]
        };
      }
      return project;
    }));
    
    setNewMemberEmail('');
    toast.success('Member added successfully!');
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.members.some(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Folder className="w-8 h-8 text-primary" />
          Research Project Groups
        </h1>
        <p className="text-muted-foreground mt-2">
          Organize your research projects and collaborate with team members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, members, and activities..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Tag className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Project creation card */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Research Project</CardTitle>
              <CardDescription>
                Start a new collaborative research project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <Textarea
                placeholder="Project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={2}
              />
              <Button onClick={handleCreateProject} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Your Research Projects
            </h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading research projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-3 text-muted" />
                  <p>No research projects yet</p>
                  <p className="text-sm mt-1">Create your first research project above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProjects.map(project => (
                  <Card 
                    key={project.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${activeProject?.id === project.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setActiveProject(project)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {project.members.slice(0, 4).map(member => (
                              <div key={member.id} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs border-2 border-background font-medium">
                                {member.name.charAt(0)}
                              </div>
                            ))}
                            {project.members.length > 4 && (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background font-medium">
                                +{project.members.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Project Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(project.progress)}`} 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {project.literatureReviews.length} literature review{project.literatureReviews.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with project details and activity */}
        <div className="space-y-6">
          {activeProject ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      {activeProject.name}
                    </span>
                    {getStatusBadge(activeProject.status)}
                  </CardTitle>
                  <CardDescription>{activeProject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Members Section */}
                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Project Members
                      </h3>
                      <div className="space-y-2 mb-4">
                        {activeProject.members.map(member => (
                          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            {member.id !== session?.user.id && (
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Member email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleAddMember(activeProject.id)}
                          disabled={!newMemberEmail}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Project Details</h3>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Started:</span>
                          <span>{new Date(activeProject.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last updated:</span>
                          <span>{new Date(activeProject.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Literature Reviews:</span>
                          <span>{activeProject.literatureReviews.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Project Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{activeProject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(activeProject.progress)}`} 
                        style={{ width: `${activeProject.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {activeProject.progress < 30 ? 'Just getting started' : 
                       activeProject.progress < 70 ? 'Making good progress' : 
                       'Almost complete!'}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Next Steps</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                        Review methodology notes
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-blue-500" />
                        Schedule team meeting
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Complete literature analysis
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Select a project to view details and manage members</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Project Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {activity.user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span> {activity.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}