// src/app/apps/collaboration-hub/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Label import
import {
  Users,
  MessageSquare,
  FileText,
  Share2,
  Mail,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye,
  Download,
  Upload,
  GitBranch,
  GitPullRequest,
  UserPlus,
  Hash,
  Bell,
  Settings,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MessageCircle,
  UserCheck,
  AtSign
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CollaborationHubPage() {
  const [activeTab, setActiveTab] = useState('share');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');

  // Sample data initialization
  useEffect(() => {
    setCollaborators([
      {
        id: '1',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@thesisai.edu',
        role: 'Advisor',
        status: 'active',
        lastActive: '2025-01-15T10:30:00Z',
        avatar: '/avatars/maria.jpg'
      },
      {
        id: '2',
        name: 'Prof. John Smith',
        email: 'john.smith@thesisai.edu',
        role: 'Committee Member',
        status: 'offline',
        lastActive: '2025-01-14T18:45:00Z',
        avatar: '/avatars/john.jpg'
      },
      {
        id: '3',
        name: 'Jane Doe',
        email: 'jane.doe@thesisai.edu',
        role: 'Peer Reviewer',
        status: 'active',
        lastActive: '2025-01-15T11:15:00Z',
        avatar: '/avatars/jane.jpg'
      }
    ]);

    setDocuments([
      {
        id: 'doc-1',
        title: 'Thesis Outline',
        author: 'Me',
        lastEdited: '2025-01-15T09:30:00Z',
        lastEditor: 'You',
        permissions: 'edit',
        commentsCount: 3,
        status: 'in-progress',
        progress: 85
      },
      {
        id: 'doc-2',
        title: 'Literature Review',
        author: 'Me',
        lastEdited: '2025-01-14T16:45:00Z',
        lastEditor: 'Dr. Maria Santos',
        permissions: 'comment',
        commentsCount: 7,
        status: 'review',
        progress: 100
      },
      {
        id: 'doc-3',
        title: 'Methodology Chapter',
        author: 'Me',
        lastEdited: '2025-01-13T14:20:00Z',
        lastEditor: 'You',
        permissions: 'edit',
        commentsCount: 1,
        status: 'draft',
        progress: 45
      }
    ]);

    setMessages([
      {
        id: 'msg-1',
        sender: 'Dr. Maria Santos',
        content: 'The literature review looks good, but consider adding more recent sources from 2024.',
        timestamp: '2025-01-15T08:30:00Z',
        type: 'comment',
        documentId: 'doc-2'
      },
      {
        id: 'msg-2',
        sender: 'Jane Doe',
        content: 'I reviewed the methodology section and have some suggestions for the sample size calculation.',
        timestamp: '2025-01-14T15:45:00Z',
        type: 'review',
        documentId: 'doc-3'
      },
      {
        id: 'msg-3',
        sender: 'Prof. John Smith',
        content: 'Approved the thesis outline with minor changes to section 3.4.',
        timestamp: '2025-01-14T12:15:00Z',
        type: 'approval',
        documentId: 'doc-1'
      }
    ]);

    setNotifications([
      {
        id: 'notif-1',
        type: 'comment',
        title: 'New comment on Literature Review',
        description: 'Dr. Maria Santos commented on your document',
        timestamp: '2025-01-15T08:30:00Z',
        read: false
      },
      {
        id: 'notif-2',
        type: 'mention',
        title: 'You were mentioned in a discussion',
        description: 'Jane Doe mentioned you in a thread about methodology',
        timestamp: '2025-01-14T16:20:00Z',
        read: true
      },
      {
        id: 'notif-3',
        type: 'approval',
        title: 'Thesis Outline Approved',
        description: 'Prof. John Smith approved your thesis outline',
        timestamp: '2025-01-14T12:15:00Z',
        read: false
      }
    ]);
  }, []);

  const handleShareDocument = async () => {
    if (!selectedDocument || !shareEmail) {
      return;
    }

    // In a real implementation, this would send an invitation via email
    console.log(`Sharing document ${selectedDocument} with ${shareEmail}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShareEmail('');
    alert(`Document shared with ${shareEmail} successfully!`);
  };

  const addComment = async () => {
    if (!selectedDocument || !newComment.trim()) {
      return;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      documentId: selectedDocument,
      author: 'Current User', // Would come from auth context
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    setMessages([comment, ...messages]);
    setNewComment('');

    // In a real implementation, this would be sent to the backend
  };

  const toggleNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: !notif.read } : notif
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Collaboration Hub</h1>
          <p className="text-muted-foreground">
            Share, discuss, and collaborate on your thesis with advisors and peers
          </p>
        </div>

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="share">Share Documents</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Thesis Documents
                </CardTitle>
                <CardDescription>
                  Share your thesis components with advisors and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="document-select">Select Document</Label>
                      <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                        <SelectTrigger id="document-select">
                          <SelectValue placeholder="Choose a document to share" />
                        </SelectTrigger>
                        <SelectContent>
                          {documents.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="email">Invite Collaborator</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                        />
                        <Button onClick={handleShareDocument} disabled={!selectedDocument || !shareEmail}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">View Only</Badge>
                        <Badge variant="outline">Comment</Badge>
                        <Badge>Can Edit</Badge>
                        <Badge variant="destructive">Admin</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Recently Shared Documents</h3>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Shared {new Date(doc.lastEdited).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={doc.permissions === 'edit' ? 'default' : doc.permissions === 'comment' ? 'secondary' : 'outline'}>
                            {doc.permissions}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments & Discussions</CardTitle>
                <CardDescription>
                  Engage in discussions about your thesis components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment or question..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{message.sender}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            {message.type === 'comment' && (
                              <Badge variant="secondary">{message.documentId}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Center
                </CardTitle>
                <CardDescription>
                  Messages and discussions with your thesis team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-secondary rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{message.sender}</h3>
                              <Badge variant="outline" className="text-xs">
                                {message.type}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{message.content}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(message.timestamp).toLocaleString()}
                              {message.documentId && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Document: {documents.find(d => d.id === message.documentId)?.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thesis Team
                </CardTitle>
                <CardDescription>
                  Manage your advisors, committee members, and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input placeholder="Search team members..." />
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {collaborators.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-secondary rounded-full h-12 w-12 flex items-center justify-center">
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{member.role}</Badge>
                                <span className={`inline-flex h-2 w-2 rounded-full ${
                                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                }`}></span>
                                <span className="text-xs text-muted-foreground">
                                  {member.status === 'active' ? 'Online' : `Last seen ${new Date(member.lastActive).toLocaleDateString()}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Reviews
                </CardTitle>
                <CardDescription>
                  Track feedback and review status of your thesis components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {documents.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{document.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last edited by {document.lastEditor} on {new Date(document.lastEdited).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={document.status === 'in-progress' ? 'default' : document.status === 'review' ? 'secondary' : 'outline'}>
                                {document.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline">{document.permissions}</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">{document.progress}%</div>
                              <div className="text-xs text-muted-foreground">Complete</div>
                            </div>
                            <div className="w-32">
                              <Progress value={document.progress} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{document.commentsCount} comments</span>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on thesis reviews, comments, and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`hover:shadow-md transition-shadow ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {notification.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                              {notification.type === 'mention' && <AtSign className="h-4 w-4 text-green-500" />}
                              {notification.type === 'approval' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              <h3 className={`font-semibold ${!notification.read ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-white"></div>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNotificationRead(notification.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}