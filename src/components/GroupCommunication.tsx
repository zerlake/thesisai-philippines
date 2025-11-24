'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { AlertCircle, CalendarCheck, FileText, MessageCircle, Send } from 'lucide-react';

// interface Group {
//   id: string;
//   name: string;
//   description?: string;
// }

interface GroupCommunication {
  id: string;
  group_id: string;
  sender_id: string;
  message: string;
  message_type: 'message' | 'announcement' | 'task_update' | 'document_share';
  created_at: string;
  sender_info: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

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

export function GroupCommunication({ groupId }: { groupId: string }) {
  const { session, supabase } = useAuth();
  const [messages, setMessages] = useState<GroupCommunication[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'announcement' | 'task_update' | 'document_share'>('message');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages and members
  useEffect(() => {
    if (!session?.user?.id || !groupId || !session?.access_token) return;

    let isMounted = true;
    let channel: any = null;

    const fetchAndCombineData = async () => {
      try {
        // Fetch messages and members in parallel
        const [messagesRes, membersRes] = await Promise.all([
          supabase
            .from('group_communications')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: true }),
          supabase
            .from('group_memberships')
            .select('*')
            .eq('group_id', groupId)
        ]);

        if (!isMounted) return;

        if (messagesRes.error) {
          toast.error('Failed to load messages.');
        }
        if (membersRes.error) {
          toast.error('Failed to load group members.');
        }

        const messagesData = messagesRes.data || [];
        const membersData = membersRes.data?.filter(m => m.accepted_invite) || [];

        // Collect all user IDs
        const userIds = [
          ...new Set([
            ...messagesData.map(m => m.sender_id),
            ...membersData.map(m => m.user_id)
          ])
        ];

        if (userIds.length === 0) {
          if (isMounted) {
            setMessages([]);
            setMembers([]);
          }
          return;
        }

        // Fetch all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (!isMounted) return;

        if (profilesError) {
          toast.error('Failed to load user information.');
        }

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

        // Combine data
        const combinedMessages = messagesData.map(msg => ({
          ...msg,
          sender_info: profilesMap.get(msg.sender_id) || { full_name: 'Unknown User' }
        }));

        const combinedMembers = membersData.map(mem => ({
          ...mem,
          user_metadata: profilesMap.get(mem.user_id) || { full_name: 'Unknown User' }
        }));

        if (isMounted) {
          setMessages(combinedMessages);
          setMembers(combinedMembers);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('An unexpected error occurred.');
        }
      }
    };

    const setupRealtime = async () => {
      try {
        await fetchAndCombineData();

        // Verify user is still authenticated before subscribing
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !isMounted) {
          return;
        }

        // Set up real-time subscription to messages
        channel = supabase
          .channel(`group:${groupId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'group_communications',
              filter: `group_id=eq.${groupId}`,
            },
            async (payload) => {
              if (!isMounted) return;

              const newMessage = payload.new as any;

              // Fetch sender info for the new message
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();

              if (profileError) {
              }

              if (!isMounted) return;

              const fullMessage = {
                ...newMessage,
                sender_info: profileData || { full_name: 'Unknown User' }
              };
              
              setMessages(prev => [...prev, fullMessage]);
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;

            if (status === 'CHANNEL_ERROR') {
            } else if (status === 'TIMED_OUT') {
            } else if (status === 'SUBSCRIBED') {
            }
          });
      } catch (err: any) {
        if (!isMounted) return;

        // Silently handle auth errors
        if (err?.message?.includes("Refresh Token") || err?.message?.includes("Invalid") || err?.message?.includes("JWT")) {
          return;
        }
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel).catch((err) => {
        });
      }
    };
  }, [session?.user?.id, groupId, session?.access_token, supabase]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user.id) return;

    const messageData = {
      group_id: groupId,
      sender_id: session.user.id,
      message: newMessage.trim(),
      message_type: messageType,
    };

    const { error } = await supabase
      .from('group_communications')
      .insert([messageData]);

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
      setMessageType('message');
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

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <AlertCircle className="w-4 h-4" />;
      case 'task_update': return <CalendarCheck className="w-4 h-4" />;
      case 'document_share': return <FileText className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'text-red-600';
      case 'task_update': return 'text-blue-600';
      case 'document_share': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span>Group Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {members.length} members
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 max-h-[50vh]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <MessageCircle className="w-12 h-12 mb-4" />
                <h3 className="font-medium text-lg mb-1">No messages yet</h3>
                <p className="text-sm">
                  Start a conversation with your group members
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${message.sender_id === session?.user.id ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`w-8 h-8 ${message.sender_id === session?.user.id ? 'order-2' : ''}`}>
                      <AvatarImage src={message.sender_info.avatar_url} />
                      <AvatarFallback>
                        {getUserInitials(message.sender_info.full_name, message.sender_info.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${message.sender_id === session?.user.id ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender_info.full_name || 'Unknown User'}
                        </span>
                        <span className={`flex items-center gap-1 text-xs ${getMessageTypeColor(message.message_type)}`}>
                          {getMessageTypeIcon(message.message_type)}
                          {message.message_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div 
                        className={`p-3 rounded-lg ${
                          message.sender_id === session?.user.id 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-muted rounded-bl-none'
                        }`}
                      >
                        <p>{message.message}</p>
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${message.sender_id === session?.user.id ? 'text-right' : ''}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border rounded-lg p-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none min-h-[60px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Select value={messageType} onValueChange={(val) => setMessageType(val as any)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="task_update">Task Update</SelectItem>
                    <SelectItem value="document_share">Document Share</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}