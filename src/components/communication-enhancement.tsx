"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send, 
  Users, 
  Bell, 
  Calendar,
  MessageSquare,
  UserPlus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Pin,
  Globe,
  Hash,
  AtSign,
  FileText,
  Settings,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  ExternalLink,
  MessageCircle,
  Star,
  Reply,
  Forward,
  ArchiveRestore,
  Volume2,
  VolumeX,
  Shield,
  Lock
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: "admin" | "advisor" | "critic";
  };
  audience: "all" | "students" | "advisors" | "critics" | "department" | "year-level";
  department?: string;
  yearLevel?: string;
  priority: "low" | "medium" | "high" | "urgent";
  sentAt: string;
  scheduledAt?: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  readCount: number;
  totalRecipients: number;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  isImportant: boolean;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    role: "student" | "advisor" | "critic" | "admin";
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
    role: "student" | "advisor" | "critic" | "admin";
  };
  subject: string;
  content: string;
  sentAt: string;
  readAt?: string;
  repliedAt?: string;
  attachments: Attachment[];
  isRead: boolean;
  isArchived: boolean;
  threadId: string;
  priority: "normal" | "high";
  tags: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: "document" | "image" | "spreadsheet" | "presentation" | "other";
  size: string;
  url: string;
}

const CommunicationEnhancement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Thesis Defense Schedule Update",
      content: "The thesis defense schedule has been updated. Please check your assigned time slots.",
      author: {
        id: "admin-1",
        name: "System Administrator",
        avatar: "",
        role: "admin"
      },
      audience: "students",
      priority: "high",
      sentAt: "2024-12-20T10:30:00Z",
      status: "sent",
      readCount: 120,
      totalRecipients: 150,
      isPinned: true,
      isArchived: false,
      tags: ["defense", "schedule", "important"],
      isImportant: true
    },
    {
      id: "2",
      title: "New AI Writing Assistant Available",
      content: "We've launched a new AI writing assistant to help with thesis writing. Check it out in the tools section.",
      author: {
        id: "admin-2",
        name: "ThesisAI Team",
        avatar: "",
        role: "admin"
      },
      audience: "all",
      priority: "medium",
      sentAt: "2024-12-18T14:20:00Z",
      status: "sent",
      readCount: 240,
      totalRecipients: 300,
      isPinned: false,
      isArchived: false,
      tags: ["ai-tools", "new-feature"],
      isImportant: false
    },
    {
      id: "3",
      title: "System Maintenance Notice",
      content: "The thesis management system will undergo maintenance on Dec 25, 2024 from 2:00 AM to 4:00 AM.",
      author: {
        id: "admin-1",
        name: "System Administrator",
        avatar: "",
        role: "admin"
      },
      audience: "all",
      priority: "urgent",
      sentAt: "2024-12-15T09:15:00Z",
      status: "sent",
      readCount: 280,
      totalRecipients: 300,
      isPinned: false,
      isArchived: false,
      tags: ["maintenance", "downtime", "urgent"],
      isImportant: true
    },
    {
      id: "4",
      title: "Research Gap Identification Workshop",
      content: "Join our workshop on identifying research gaps in your field next Friday at 2 PM.",
      author: {
        id: "advisor-1",
        name: "Dr. Juan Dela Cruz",
        avatar: "",
        role: "advisor"
      },
      audience: "students",
      priority: "medium",
      sentAt: "2024-12-22T11:45:00Z",
      status: "sent",
      readCount: 45,
      totalRecipients: 80,
      isPinned: false,
      isArchived: false,
      tags: ["workshop", "research", "training"],
      isImportant: false
    }
  ]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: {
        id: "student-1",
        name: "Maria Santos",
        avatar: "",
        role: "student"
      },
      recipient: {
        id: "advisor-1",
        name: "Dr. Juan Dela Cruz",
        avatar: "",
        role: "advisor"
      },
      subject: "Thesis Proposal Feedback Request",
      content: "Could you please review my thesis proposal and provide feedback?",
      sentAt: "2024-12-22T10:30:00Z",
      readAt: "2024-12-22T11:15:00Z",
      repliedAt: "2024-12-22T14:45:00Z",
      attachments: [
        {
          id: "att-1",
          name: "thesis-proposal-v2.pdf",
          type: "document",
          size: "2.4 MB",
          url: "/attachments/proposal-v2.pdf"
        }
      ],
      isRead: true,
      isArchived: false,
      threadId: "thread-1",
      priority: "normal",
      tags: ["proposal", "feedback-request"]
    },
    {
      id: "2",
      sender: {
        id: "advisor-1",
        name: "Dr. Juan Dela Cruz",
        avatar: "",
        role: "advisor"
      },
      recipient: {
        id: "student-1",
        name: "Maria Santos",
        avatar: "",
        role: "student"
      },
      subject: "Re: Thesis Proposal Feedback",
      content: "I've reviewed your proposal. The topic is interesting but you need to narrow down your research question.",
      sentAt: "2024-12-22T14:45:00Z",
      readAt: "2024-12-22T15:20:00Z",
      attachments: [],
      isRead: true,
      isArchived: false,
      threadId: "thread-1",
      priority: "high",
      tags: ["feedback", "proposal-revision"]
    },
    {
      id: "3",
      sender: {
        id: "student-2",
        name: "Juan Dela Cruz",
        avatar: "",
        role: "student"
      },
      recipient: {
        id: "advisor-1",
        name: "Dr. Juan Dela Cruz",
        avatar: "",
        role: "advisor"
      },
      subject: "Methodology Clarification",
      content: "I'm having trouble with the methodology section. Could we schedule a meeting?",
      sentAt: "2024-12-21T09:15:00Z",
      readAt: "2024-12-21T10:30:00Z",
      attachments: [],
      isRead: true,
      isArchived: false,
      threadId: "thread-2",
      priority: "normal",
      tags: ["methodology", "meeting-request"]
    }
  ]);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    audience: "all" as "all" | "students" | "advisors" | "critics" | "department" | "year-level",
    department: "",
    yearLevel: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    scheduledAt: "",
    tags: [] as string[],
    isImportant: false
  });
  
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
    attachments: [] as File[],
    priority: "normal" as "normal" | "high"
  });
  
  const [activeTab, setActiveTab] = useState<"announcements" | "messages" | "broadcast">("announcements");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      author: {
        id: "current-user", // This would be the actual logged-in user
        name: "Dr. Juan Dela Cruz", // Current advisor name
        avatar: "",
        role: "advisor"
      },
      audience: newAnnouncement.audience,
      department: newAnnouncement.department || undefined,
      yearLevel: newAnnouncement.yearLevel || undefined,
      priority: newAnnouncement.priority,
      sentAt: new Date().toISOString(),
      scheduledAt: newAnnouncement.scheduledAt || undefined,
      status: newAnnouncement.scheduledAt ? "scheduled" : "sent",
      readCount: 0,
      totalRecipients: newAnnouncement.audience === "all" ? 500 : 
                       newAnnouncement.audience === "students" ? 300 : 
                       newAnnouncement.audience === "advisors" ? 50 : 
                       newAnnouncement.audience === "critics" ? 30 : 50,
      isPinned: false,
      isArchived: false,
      tags: newAnnouncement.tags,
      isImportant: newAnnouncement.isImportant
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({
      title: "",
      content: "",
      audience: "all",
      department: "",
      yearLevel: "",
      priority: "medium",
      scheduledAt: "",
      tags: [],
      isImportant: false
    });
    setShowBroadcastDialog(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: {
        id: "current-user", // Current user
        name: "Dr. Juan Dela Cruz", // Current advisor name
        avatar: "",
        role: "advisor"
      },
      recipient: {
        id: "recipient-user", // Will be determined from input
        name: newMessage.recipient,
        avatar: "",
        role: "student" // Will be determined from recipient
      },
      subject: newMessage.subject,
      content: newMessage.content,
      sentAt: new Date().toISOString(),
      attachments: [],
      isRead: false,
      isArchived: false,
      threadId: `thread-${Date.now()}`,
      priority: newMessage.priority,
      tags: []
    };

    setMessages([message, ...messages]);
    setNewMessage({
      recipient: "",
      subject: "",
      content: "",
      attachments: [],
      priority: "normal"
    });
    setShowMessageDialog(false);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === "all" || announcement.priority === priorityFilter;
    const matchesAudience = audienceFilter === "all" || announcement.audience === audienceFilter;
    
    return matchesSearch && matchesPriority && matchesAudience;
  });

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case "all":
        return <Badge variant="default">All Users</Badge>;
      case "students":
        return <Badge className="bg-blue-500">Students</Badge>;
      case "advisors":
        return <Badge className="bg-green-500">Advisors</Badge>;
      case "critics":
        return <Badge className="bg-purple-500">Critics</Badge>;
      case "department":
        return <Badge variant="outline">{department}</Badge>;
      case "year-level":
        return <Badge variant="outline">Year {yearLevel}</Badge>;
      default:
        return <Badge variant="outline">{audience}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="outline" className="border-red-300 text-red-600">Admin</Badge>;
      case "advisor":
        return <Badge className="bg-green-500">Advisor</Badge>;
      case "critic":
        return <Badge className="bg-orange-500">Critic</Badge>;
      case "student":
        return <Badge variant="outline" className="border-blue-300 text-blue-600">Student</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "sent":
        return <Badge className="bg-green-500">Sent</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Communication Center</h2>
          <p className="text-muted-foreground">
            Manage announcements, messages, and broadcast communications
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Communication Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements">
            <Bell className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <Globe className="h-4 w-4 mr-2" />
            Broadcast
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>
                  {filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''} available
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="advisors">Advisors</SelectItem>
                    <SelectItem value="critics">Critics</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="year-level">Year Level</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setShowBroadcastDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      selectedAnnouncement?.id === announcement.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10 mt-0.5">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${announcement.author.name}&backgroundColor=b6e6ff&fontSize=32`} alt={announcement.author.name} />
                          <AvatarFallback>{announcement.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{announcement.title}</h3>
                            {announcement.isPinned && (
                              <Pin className="h-4 w-4 text-yellow-500" />
                            )}
                            {announcement.isImportant && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">{announcement.author.name}</span>
                            {getRoleBadge(announcement.author.role)}
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(announcement.sentAt)}</span>
                          </div>
                          <p className="mt-2 text-sm">{announcement.content}</p>
                          <div className="flex items-center gap-2 mt-3">
                            {getAudienceBadge(announcement.audience)}
                            {getPriorityBadge(announcement.priority)}
                            {getStatusBadge(announcement.status)}
                            <Badge variant="secondary">{announcement.tags.join(', ')}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium">{announcement.readCount}/{announcement.totalRecipients}</div>
                          <div className="text-xs text-muted-foreground">read</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePinAnnouncement(announcement.id)}>
                              {announcement.isPinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                              {announcement.isPinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => archiveAnnouncement(announcement.id)}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyAnnouncement(announcement.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredAnnouncements.length === 0 && (
                  <div className="text-center py-10">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No announcements found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No announcements match your search." : "No announcements have been created yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowBroadcastDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Announcement
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Private communications with students and colleagues
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button onClick={() => setShowMessageDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      !message.isRead ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10 mt-0.5">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender.name}&backgroundColor=f0f9ff&fontSize=32`} alt={message.sender.name} />
                          <AvatarFallback>{message.sender.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{message.sender.name}</h3>
                            {getRoleBadge(message.sender.role)}
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(message.sentAt)}</span>
                            {!message.isRead && <Badge variant="secondary">New</Badge>}
                          </div>
                          <div className="font-medium mt-1">{message.subject}</div>
                          <p className="mt-2 text-sm">{message.content}</p>
                          {message.attachments.length > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {message.attachments.length} attachment{message.attachments.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          <Forward className="h-4 w-4 mr-1" />
                          Forward
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Mark as Important
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredMessages.length === 0 && (
                  <div className="text-center py-10">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No messages found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No messages match your search." : "No messages in your inbox."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowMessageDialog(true)}>
                        <Send className="h-4 w-4 mr-2" />
                        Compose Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Announcement</CardTitle>
              <CardDescription>
                Send announcements to multiple recipients at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="Enter announcement title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Enter announcement content"
                    rows={6}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience">Audience</Label>
                    <Select value={newAnnouncement.audience} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, audience: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="advisors">Advisors Only</SelectItem>
                        <SelectItem value="critics">Critics Only</SelectItem>
                        <SelectItem value="department">Specific Department</SelectItem>
                        <SelectItem value="year-level">Specific Year Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {newAnnouncement.audience === "department" && (
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newAnnouncement.department}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, department: e.target.value})}
                      placeholder="Enter department name"
                    />
                  </div>
                )}
                
                {newAnnouncement.audience === "year-level" && (
                  <div>
                    <Label htmlFor="yearLevel">Year Level</Label>
                    <Input
                      id="yearLevel"
                      type="number"
                      value={newAnnouncement.yearLevel}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, yearLevel: e.target.value})}
                      placeholder="Enter year level (e.g., 1, 2, 3, 4)"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newAnnouncement.tags.join(', ')}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, tags: e.target.value.split(',').map(tag => tag.trim())})}
                    placeholder="e.g., defense, schedule, important"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="important"
                    checked={newAnnouncement.isImportant}
                    onCheckedChange={(checked) => setNewAnnouncement({...newAnnouncement, isImportant: checked})}
                  />
                  <Label htmlFor="important">Mark as Important</Label>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSendAnnouncement} disabled={!newAnnouncement.title || !newAnnouncement.content}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send New Message</DialogTitle>
            <DialogDescription>
              Compose a new message to a student or colleague
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student-1">Maria Santos (Student)</SelectItem>
                  <SelectItem value="student-2">Juan Dela Cruz (Student)</SelectItem>
                  <SelectItem value="advisor-1">Dr. Ana Reyes (Advisor)</SelectItem>
                  <SelectItem value="critic-1">Dr. Carlos Gomez (Critic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="Enter message subject"
              />
            </div>
            
            <div>
              <Label htmlFor="messageContent">Message</Label>
              <Textarea
                id="messageContent"
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            
            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={(e) => e.target.files && setNewMessage({...newMessage, attachments: Array.from(e.target.files)})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="highPriority"
                checked={newMessage.priority === "high"}
                onCheckedChange={(checked) => setNewMessage({...newMessage, priority: checked ? "high" : "normal"})}
              />
              <Label htmlFor="highPriority">High Priority</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.recipient || !newMessage.subject || !newMessage.content}>
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationEnhancement;