'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Users, 
  Bell, 
  Send, 
  Calendar,
  Video,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video as VideoIcon,
  Trash2,
  Reply,
  Forward,
  ArrowLeft
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  recipient_id: string;
  recipient_name: string;
  content: string;
  timestamp: string;
  read: boolean;
  document_id?: string;
  document_title?: string;
  attachments?: string[];
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  unread_count: number;
  last_message?: string;
  last_message_time?: string;
}

interface Conversation {
  id: string;
  participants: Student[];
  subject: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_group: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  target_audience: 'all' | 'selected' | 'year' | 'thesis_phase';
  recipients_count?: number;
}

const mockStudents: Student[] = [
  {
    id: 'student1',
    first_name: 'Maria',
    last_name: 'Santos',
    avatar_url: '',
    unread_count: 2,
    last_message: 'Advisor, I have a question about the methodology section...',
    last_message_time: '2024-12-15T10:30:00Z'
  },
  {
    id: 'student2',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    avatar_url: '',
    unread_count: 0,
    last_message: 'Thank you for the feedback!',
    last_message_time: '2024-12-14T15:45:00Z'
  },
  {
    id: 'student3',
    first_name: 'Ana',
    last_name: 'Reyes',
    avatar_url: '',
    unread_count: 1,
    last_message: 'I finished the literature review as we discussed.',
    last_message_time: '2024-12-15T09:15:00Z'
  },
  {
    id: 'student4',
    first_name: 'Carlos',
    last_name: 'Garcia',
    avatar_url: '',
    unread_count: 0,
    last_message: 'I scheduled our meeting for next week.',
    last_message_time: '2024-12-13T11:20:00Z'
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [mockStudents[0], mockStudents[2]],
    subject: 'Thesis Group Discussion',
    last_message: 'We should meet to discuss the proposal',
    last_message_time: '2024-12-15T09:00:00Z',
    unread_count: 1,
    is_group: true
  },
  {
    id: 'conv2',
    participants: [mockStudents[1]],
    subject: 'Individual Consultation',
    last_message: 'Please review Chapter 2 when you have time',
    last_message_time: '2024-12-14T14:30:00Z',
    unread_count: 0,
    is_group: false
  }
];

const mockMessages: Message[] = [
  // Thesis Group Discussion (conv1) - between Maria, Ana, and advisor
  {
    id: 'msg1',
    sender_id: 'student1',
    sender_name: 'Maria Santos',
    recipient_id: 'advisor1',
    recipient_name: 'Dr. Smith',
    content: 'Good morning, I have a question about the methodology section.',
    timestamp: '2024-12-15T10:30:00Z',
    read: false
  },
  {
    id: 'msg2',
    sender_id: 'advisor1',
    sender_name: 'Dr. Smith',
    recipient_id: 'student1',
    recipient_name: 'Maria Santos',
    content: 'Good morning Maria, of course! What specific aspect are you having trouble with?',
    timestamp: '2024-12-15T10:32:00Z',
    read: false
  },
  {
    id: 'msg3',
    sender_id: 'student3',
    sender_name: 'Ana Reyes',
    recipient_id: 'advisor1',
    recipient_name: 'Dr. Smith',
    content: 'I agree, we need to clarify the methodology for our group research project.',
    timestamp: '2024-12-15T10:35:00Z',
    read: false
  },
  // Individual Consultation (conv2) - between Juan and advisor
  {
    id: 'msg4',
    sender_id: 'student2',
    sender_name: 'Juan Dela Cruz',
    recipient_id: 'advisor1',
    recipient_name: 'Dr. Smith',
    content: 'Hi Dr. Smith, thank you for the feedback on my draft!',
    timestamp: '2024-12-14T14:00:00Z',
    read: true
  },
  {
    id: 'msg5',
    sender_id: 'advisor1',
    sender_name: 'Dr. Smith',
    recipient_id: 'student2',
    recipient_name: 'Juan Dela Cruz',
    content: 'You\'re welcome Juan! Please review Chapter 2 when you have time.',
    timestamp: '2024-12-14T14:30:00Z',
    read: true
  },
  {
    id: 'msg6',
    sender_id: 'student2',
    sender_name: 'Juan Dela Cruz',
    recipient_id: 'advisor1',
    recipient_name: 'Dr. Smith',
    content: 'Will do. I should have the revisions ready by next week.',
    timestamp: '2024-12-14T15:45:00Z',
    read: true
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'Thesis Proposal Submission Deadline Extended',
    content: 'The thesis proposal submission deadline has been extended to January 15, 2025. Please ensure all proposals are submitted by the new deadline.',
    created_by: 'Dr. Smith',
    created_at: '2024-12-10T09:00:00Z',
    target_audience: 'all'
  },
  {
    id: 'ann2',
    title: 'Research Ethics Training',
    content: 'Mandatory research ethics training session scheduled for December 20, 2024. All thesis students must attend.',
    created_by: 'Dr. Smith',
    created_at: '2024-12-05T14:30:00Z',
    target_audience: 'year',
    recipients_count: 45
  }
];

export function AdvisorCommunicationHub() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'group'>('all');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedStudent) return;

    const newMessage: Message = {
      id: `msg${messages.length + 1}`,
      sender_id: user?.id || 'advisor1',
      sender_name: 'Dr. Smith', // In real app, get from profile
      recipient_id: selectedStudent.id,
      recipient_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      content: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleSendAnnouncement = () => {
    // In a real implementation, this would call an API to send announcement
    alert('Announcement sent to selected students!');
  };

  const handleCreateGroup = () => {
    // TODO: Implement group creation modal/form
    alert('Create group feature coming soon');
  };

  const getGroupMessages = (conversationId: string): Message[] => {
    // Filter messages based on conversation participants
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return [];
    
    // For demo purposes, show different messages based on conversation ID
    if (conversationId === 'conv1') {
      // Thesis Group Discussion - messages from Maria (student1) and Ana (student3)
      return messages.slice(0, 3);
    } else if (conversationId === 'conv2') {
      // Individual Consultation - messages from Juan (student2) only
      return messages.slice(3, 6);
    }
    return messages;
  };

  const handleViewGroup = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
    }
  };

  const handleStartCall = (type: 'video' | 'voice') => {
    if (selectedStudent) {
      toast.success(`Starting ${type} call with ${selectedStudent.first_name} ${selectedStudent.last_name}...`);
      // TODO: Implement actual call functionality
    } else if (selectedConversation) {
      toast.success(`Starting ${type} call with group "${selectedConversation.subject}"...`);
      // TODO: Implement actual group call functionality
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'unread') {
      return matchesSearch && student.unread_count > 0;
    }
    return matchesSearch;
  });

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Communication Hub
            </CardTitle>
            <CardDescription>Message, schedule, and communicate with your students</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleStartCall('video')}>
              <VideoIcon className="h-4 w-4 mr-1" />
              Video Call
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleStartCall('voice')}>
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="messages" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Groups
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="messages" className="flex-1 flex flex-col p-0 m-0">
            <div className="flex h-full">
              {/* Student List */}
              <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant={filter === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      size="sm" 
                      variant={filter === 'unread' ? 'default' : 'outline'}
                      onClick={() => setFilter('unread')}
                    >
                      <span className="flex items-center gap-1">
                        Unread
                        {students.filter(s => s.unread_count > 0).length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {students.filter(s => s.unread_count > 0).length}
                          </Badge>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="space-y-1 p-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedStudent?.id === student.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedConversation(null);
                        }}
                      >
                        <Avatar>
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            {student.first_name.charAt(0)}
                            {student.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            {student.unread_count > 0 && (
                              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                                {student.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.last_message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedStudent ? (
                  <>
                    <div className="border-b p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selectedStudent.avatar_url} />
                          <AvatarFallback>
                            {selectedStudent.first_name.charAt(0)}
                            {selectedStudent.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {selectedStudent.first_name} {selectedStudent.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleStartCall('voice')} title="Start voice call">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleStartCall('video')} title="Start video call">
                          <VideoIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {getGroupMessages(selectedConversation.id).map((message) => (
                           <div
                             key={message.id}
                             className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                           >
                             <div
                               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                 message.sender_id === user?.id
                                   ? 'bg-primary text-primary-foreground'
                                   : 'bg-secondary'
                               }`}
                             >
                               <p>{message.content}</p>
                               <p className={`text-xs mt-1 ${
                                 message.sender_id === user?.id
                                   ? 'text-primary-foreground/70'
                                   : 'text-muted-foreground'
                               }`}>
                                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                             </div>
                           </div>
                         ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 relative">
                          <Textarea
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="resize-none min-h-[60px] pr-10"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            className="absolute bottom-2 right-2"
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a student to start messaging</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a student from the list to view conversation history and send messages.
                    </p>
                    <Button onClick={() => setSelectedStudent(students[0])}>
                      Start Conversation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="announcements" className="flex-1 flex flex-col p-0 m-0">
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Create New Announcement</h3>
              <div className="space-y-3">
                <Input placeholder="Announcement title..." />
                <Textarea placeholder="Announcement content..." rows={3} />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Target Audience</label>
                    <select className="w-full p-2 border rounded mt-1">
                      <option value="all">All Students</option>
                      <option value="year">Specific Year Level</option>
                      <option value="thesis_phase">Current Thesis Phase</option>
                      <option value="selected">Selected Students</option>
                    </select>
                  </div>
                  <Button className="self-end" onClick={handleSendAnnouncement}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">By {announcement.created_by}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {announcement.target_audience === 'all' ? 'All Students' : 
                           announcement.target_audience === 'year' ? 'Year Level' : 
                           'Selected Students'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{announcement.content}</p>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="schedule" className="flex-1 flex flex-col p-0 m-0">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Advisor Calendar</h3>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule Meeting
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 grid grid-cols-7 gap-2 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="font-semibold text-muted-foreground text-sm py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2; // Start at day 1
                if (day < 1 || day > 31) return <div key={i} className="p-2"></div>;
                
                const hasEvent = day % 7 === 0; // Example: every 7th day has an event
                
                return (
                  <div 
                    key={i} 
                    className={`p-2 border rounded text-center min-h-20 ${
                      day === new Date().getDate() ? 'bg-primary/10 border-primary' : 'border-border'
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    {hasEvent && (
                      <div className="text-xs bg-blue-100 text-blue-800 rounded mt-1 p-1">
                        Meeting
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="flex-1 flex flex-col p-0 m-0">
            {selectedConversation ? (
              <>
                <div className="border-b p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Groups
                    </Button>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedConversation.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participants.length} member{selectedConversation.participants.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleStartCall('voice')} title="Start voice call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleStartCall('video')} title="Start video call">
                      <VideoIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <div className="mb-6 p-4 bg-secondary rounded-lg">
                      <p className="font-semibold mb-3">Group Members:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedConversation.participants.map((student) => (
                          <div key={student.id} className="flex items-center gap-2 bg-background p-2 rounded">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={student.avatar_url} />
                              <AvatarFallback>
                                {student.first_name.charAt(0)}
                                {student.last_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{student.first_name} {student.last_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_id === user?.id
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type your message to the group..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="resize-none min-h-[60px] pr-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Student Groups</h3>
                    <Button variant="outline" size="sm" onClick={handleCreateGroup}>
                      + Create Group
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conversations.map((conversation) => (
                      <Card key={conversation.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{conversation.subject}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {conversation.participants.map((student, index) => (
                                  <div key={student.id} className="flex items-center gap-1">
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={student.avatar_url} />
                                      <AvatarFallback>
                                        {student.first_name.charAt(0)}
                                        {student.last_name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    {index < conversation.participants.length - 1 && (
                                      <span className="text-muted-foreground">,</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {conversation.unread_count > 0 && (
                              <Badge variant="default">{conversation.unread_count}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{conversation.last_message}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Last message: {new Date(conversation.last_message_time).toLocaleString()}</span>
                            <Button size="sm" onClick={() => handleViewGroup(conversation.id)}>View Group</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}