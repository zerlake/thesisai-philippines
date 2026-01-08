/**
 * Chat Interface Component
 * Phase 5: Real-time Communication & Collaboration
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Clock, MessageCircle, MessageCircleMore, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  read_status: boolean;
  sender_role: string;
  sender_name: string;
};

type Conversation = {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar_url?: string;
  }>;
  messages: ChatMessage[];
};

export function ChatInterface({
  initialConversationId
}: {
  initialConversationId?: string
}) {
  const { session, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log('Chat Interface loaded. Current user ID:', session?.user?.id, 'Email:', session?.user?.email);

    const loadConversations = async () => {
      setLoading(true);

      let relationships: any[] = [];
      try {
        const { data, error } = await supabase
          .from('advisor_student_relationships') // assuming this is the table for advisor-student relationships
          .select('student_id, advisor_id')
          .or(`student_id.eq.${session.user.id},advisor_id.eq.${session.user.id}`);

        if (error) {
          // If relationships table doesn't exist or user doesn't have permission, continue with empty array
          const errorCode = error?.code;
          const errorMessage = error?.message || String(error);
          console.warn('Error fetching advisor_student_relationships:', {
            code: errorCode,
            message: errorMessage,
            details: error?.details,
            hint: error?.hint
          });

          // Check for specific error conditions
          if (errorCode === '42P01' || // undefined_table
              errorCode === '42501' || // insufficient_privilege (permission denied)
              errorMessage.toLowerCase().includes('does not exist') ||
              errorMessage.toLowerCase().includes('permission denied') ||
              errorMessage.toLowerCase().includes('relation does not exist')) {
            console.warn('Relationships table not accessible, continuing without relationship-based messages');
            relationships = [];
          } else {
            // For other types of errors (network, etc.), we might want to retry or handle differently
            console.error('Unexpected error when fetching relationships:', error);
            relationships = []; // Continue with empty relationships to not break the UI
          }
        } else {
          relationships = data || [];
        }
      } catch (error: any) {
        const errorInfo = {
          message: typeof error === 'string' ? error : error?.message || 'Unknown error',
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          stack: error?.stack
        };
        console.error('Error fetching relationships:', errorInfo);
        relationships = []; // Continue with empty relationships
      }

      // Get all related user IDs
      const relatedUserIds = Array.from(
        new Set(
          relationships?.flatMap(rel => [
            rel.student_id === session.user.id ? rel.advisor_id : rel.student_id
          ]) || []
        )
      );

      // If no relationships found, try to get messages via API route
      if (relatedUserIds.length === 0) {
        let directMessages: any[] = [];

        try {
          const response = await fetch(`/api/messages/get?userId=${session.user.id}`);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error loading messages via API:', errorData);
            throw new Error(errorData.error || 'Failed to fetch messages');
          }

          const { data } = await response.json();

          console.log('Direct messages API result:', {
            dataCount: data?.length || 0,
            userId: session.user.id,
            data: data
          });

          directMessages = data || [];

          // Transform the API response to match our expected structure
          directMessages = directMessages.map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            message: msg.message,
            created_at: msg.created_at,
            read_status: msg.read_status || msg.is_read || false,
            sender_role: msg.sender_role,
            sender_name: msg.sender_name || 'Unknown User'
          }));
        } catch (error: any) {
          const errorMsg = typeof error === 'string'
            ? error
            : error?.message || String(error) || 'Unknown error';

          console.error(
            `Error loading direct messages via API - Message: ${errorMsg}`,
            error
          );
          directMessages = []; // Continue with empty messages
        }

        if (directMessages && directMessages.length > 0) {
          // Group messages by conversation (sender-recipient pairs)
          const conversationMap: Record<string, Conversation> = {};

          for (const msg of directMessages) {
            // Determine the other party in the conversation
            const otherUserId = msg.sender_id === session.user.id 
              ? msg.recipient_id 
              : msg.sender_id;

            // Create a conversation ID (sorted to ensure consistent ID regardless of who is sender/recipient)
            const convId = [session.user.id, otherUserId].sort().join('-');

            if (!conversationMap[convId]) {
              conversationMap[convId] = {
                id: convId,
                participants: [
                  {
                    id: session.user.id,
                    name: `${profile?.first_name || 'User'} ${profile?.last_name || ''}`,
                    role: profile?.role || 'user',
                    avatar_url: profile?.avatar_url
                  },
                  {
                    id: otherUserId,
                    name: msg.sender_name || 'Unknown User',
                    role: msg.sender_role || 'user',
                    avatar_url: msg.sender_avatar_url
                  }
                ],
                messages: []
              };
            }

            // Add message to the conversation
            conversationMap[convId].messages.push({
              id: msg.id,
              sender_id: msg.sender_id,
              recipient_id: msg.recipient_id,
              message: msg.message,
              created_at: msg.created_at,
              read_status: msg.read_status || msg.is_read || false,
              sender_role: msg.sender_role,
              sender_name: msg.sender_name || 'Unknown User'
            });
          }

          const conversationList = Object.values(conversationMap);
          setConversations(conversationList);

          // Set initial active conversation if available
          if (initialConversationId) {
            const initialConv = conversationList.find(c => c.id === initialConversationId);
            if (initialConv) {
              setActiveConversation(initialConv);
            }
          } else if (conversationList.length > 0) {
            setActiveConversation(conversationList[0]);
          }
        }
      } else {
        // If relationships exist, get messages with those specific users via API
        try {
          const response = await fetch(`/api/messages/get?userId=${session.user.id}`);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error loading relationship messages via API:', errorData);
            throw new Error(errorData.error || 'Failed to fetch relationship messages');
          }

          const { data } = await response.json();
          const messages = data || [];

          console.log('Relationship messages API result:', {
            dataCount: messages?.length || 0,
            userId: session.user.id,
            messages: messages
          });

          // Transform the API response to match our expected structure
          const transformedMessages = messages.map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            message: msg.message,
            created_at: msg.created_at,
            read_status: msg.read_status || msg.is_read || false,
            sender_role: msg.sender_role,
            sender_name: msg.sender_name || 'Unknown User'
          }));

          if (transformedMessages && transformedMessages.length > 0) {
            // Group messages by conversation
            const conversationMap: Record<string, Conversation> = {};

            for (const msg of transformedMessages) {
              const otherUserId = msg.sender_id === session.user.id
                ? msg.recipient_id
                : msg.sender_id;

              const convId = [session.user.id, otherUserId].sort().join('-');

              if (!conversationMap[convId]) {
                conversationMap[convId] = {
                  id: convId,
                  participants: [
                    {
                      id: session.user.id,
                      name: `${profile?.first_name || 'User'} ${profile?.last_name || ''}`,
                      role: profile?.role || 'user',
                      avatar_url: profile?.avatar_url
                    },
                    {
                      id: otherUserId,
                      name: msg.sender_name || 'Unknown User',
                      role: msg.sender_role || 'user',
                      avatar_url: msg.sender_avatar_url
                    }
                  ],
                  messages: []
                };
              }

              conversationMap[convId].messages.push({
                id: msg.id,
                sender_id: msg.sender_id,
                recipient_id: msg.recipient_id,
                message: msg.message,
                created_at: msg.created_at,
                read_status: msg.read_status || msg.is_read || false,
                sender_role: msg.sender_role,
                sender_name: msg.sender_name || 'Unknown User'
              });
            }

            const conversationList = Object.values(conversationMap);
            setConversations(conversationList);

            if (initialConversationId) {
              const initialConv = conversationList.find(c => c.id === initialConversationId);
              if (initialConv) {
                setActiveConversation(initialConv);
              }
            } else if (conversationList.length > 0) {
              setActiveConversation(conversationList[0]);
            }
          }
        } catch (error: any) {
          const errorMsg = typeof error === 'string'
            ? error
            : error?.message || String(error) || 'Unknown error';

          console.error(
            `Error loading relationship messages via API - Message: ${errorMsg}`,
            error
          );
        }
      }

      setLoading(false);
    };

    loadConversations();

    // Set up real-time listener for new messages (only if table exists)
    let channel: any = null;
    try {
      channel = supabase
        .channel('chat-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'advisor_student_messages',
            filter: `or(sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id})`
          },
          (payload: { new: any }) => {
            // Update the appropriate conversation with the new message
            setConversations(prev => {
              // Find the conversation for this sender-recipient pair
              const convId = [payload.new.sender_id, payload.new.recipient_id].sort().join('-');
              const existingConvIndex = prev.findIndex(conv => conv.id === convId);

              if (existingConvIndex >= 0) {
                const updatedConvs = [...prev];
                updatedConvs[existingConvIndex] = {
                  ...updatedConvs[existingConvIndex],
                  messages: [
                    ...updatedConvs[existingConvIndex].messages,
                    {
                      id: payload.new.id,
                      sender_id: payload.new.sender_id,
                      recipient_id: payload.new.recipient_id,
                      message: payload.new.message,
                      created_at: payload.new.created_at,
                      read_status: payload.new.read_status,
                      sender_role: payload.new.sender_role,
                      sender_name: payload.new.sender_name || 'Unknown User'
                    }
                  ]
                };
                return updatedConvs;
              } else {
                // If no existing conversation, we might need to create one
                // For now, we'll skip adding it if no conversation exists
                return prev;
              }
            });

            // If this message belongs to the active conversation, also update that
            if (activeConversation) {
              const belongsToActive =
                (payload.new.sender_id === session.user.id && payload.new.recipient_id === activeConversation.participants.find(p => p.id !== session.user.id)?.id) ||
                (payload.new.recipient_id === session.user.id && payload.new.sender_id === activeConversation.participants.find(p => p.id !== session.user.id)?.id);

              if (belongsToActive) {
                setActiveConversation(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    messages: [
                      ...(prev.messages || []),
                      {
                        id: payload.new.id,
                        sender_id: payload.new.sender_id,
                        recipient_id: payload.new.recipient_id,
                        message: payload.new.message,
                        created_at: payload.new.created_at,
                        read_status: payload.new.read_status,
                        sender_role: payload.new.sender_role,
                        sender_name: payload.new.sender_name || 'Unknown User'
                      }
                    ]
                  };
                });
              }
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.warn('Real-time channel subscription failed, proceeding without real-time updates:', error);
      // Continue without real-time updates if subscription fails
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session?.user.id, profile, initialConversationId]);

  // Auto-scroll to bottom of messages when active conversation changes
  // DISABLED: Users have a dedicated Message section in the sidebar
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !session?.user?.id || isSending) return;

    // Find the other participant in the conversation
    const otherParticipant = activeConversation.participants.find(
      p => p.id !== session.user.id
    );

    if (!otherParticipant) return;

    const messageText = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    setIsSending(true);
    setSendSuccess(false);

    // Optimistically add the message to the UI immediately
    const tempMessage: ChatMessage = {
      id: tempMessageId,
      sender_id: session.user.id,
      recipient_id: otherParticipant.id,
      message: messageText,
      created_at: now,
      read_status: false,
      sender_role: profile?.role || 'user',
      sender_name: `${profile?.first_name || 'User'} ${profile?.last_name || ''}`,
    };

    // Update active conversation with the temp message
    setActiveConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...(prev.messages || []), tempMessage]
      };
    });

    // Clear input immediately for better UX
    setNewMessage('');

    try {
      // Prepare request body with demo token if applicable
      // Determine role based on email for demo users (more reliable than profile.role)
      // This prevents role override issues when admins access other dashboards
      let senderRole = profile?.role || 'user';
      
      if (session.user.email) {
        if (session.user.email.includes('demo-student')) senderRole = 'student';
        else if (session.user.email.includes('demo-advisor')) senderRole = 'advisor';
        else if (session.user.email.includes('demo-critic')) senderRole = 'critic';
      }

      const requestBody: any = {
        senderId: session.user.id,
        senderRole: senderRole,
        recipientId: otherParticipant.id,
        message: messageText,
      };

      // Note: Demo users now have built-in authorization via UUID in DEMO_USER_UUIDS
      // No need to send demo token anymore - they're authorized as admin avatars
      const DEMO_IDS = ['6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7', 'ff79d401-5614-4de8-9f17-bc920f360dcf', '14a7ff7d-c6d2-4b27-ace1-32237ac28e02', '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7'];
      console.log('Sending message:', { 
        senderId: session.user.id, 
        senderRole: senderRole,
        userEmail: session.user.email,
        isDemo: DEMO_IDS.includes(session.user.id) 
      });

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies with the request
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Failed to parse error response:', errorText, 'Status:', response.status);
          errorData = { error: `Server error (${response.status}): ${errorText || 'Unknown error'}` };
        }
        console.error('Error sending message:', errorData, 'Status:', response.status);
        
        // Remove the temp message on error
        setActiveConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.filter(m => m.id !== tempMessageId)
          };
        });
        
        const errorMessage = errorData?.error || `Failed to send message (Status: ${response.status})`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);

      // Replace temp message with actual message from server
      if (result.data && result.data[0]) {
        setActiveConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: prev.messages.map(m => 
              m.id === tempMessageId 
                ? {
                    id: result.data[0].id,
                    sender_id: result.data[0].sender_id,
                    recipient_id: result.data[0].recipient_id,
                    message: result.data[0].message,
                    created_at: result.data[0].created_at,
                    read_status: result.data[0].read_status || false,
                    sender_role: result.data[0].sender_role,
                    sender_name: tempMessage.sender_name
                  }
                : m
            )
          };
        });
      }

      // Show success animation
      setSendSuccess(true);
      toast.success('Message sent');
      setTimeout(() => setSendSuccess(false), 1500);
    } catch (error) {
      console.error('Error sending message:', error instanceof Error ? error.message : String(error));
      
      // Optionally show a toast notification for better UX
      if (typeof window !== 'undefined' && 'toaster' in window) {
        // If you have a toast library, use it here
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper function to get user's avatar initials
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-full w-full bg-background rounded-lg border">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h2>
              <p className="text-sm text-muted-foreground">Chat with your team</p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border-b animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conversation => {
              const otherParticipant = conversation.participants.find(
                p => p.id !== session?.user.id
              );
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              
              return (
                <div
                  key={conversation.id}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                    activeConversation?.id === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {otherParticipant?.avatar_url && (
                        <AvatarImage src={otherParticipant.avatar_url} />
                      )}
                      <AvatarFallback>
                        {getAvatarInitials(otherParticipant?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="font-medium truncate">
                          {otherParticipant?.name}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(lastMessage.created_at), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircleMore className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a conversation by sending a message</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveConversation(null)}
                  className="p-1 h-auto flex-shrink-0"
                >
                  ← Back to Messages
                </Button>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {activeConversation.participants
                    .find(p => p.id !== session?.user.id)?.avatar_url && (
                    <AvatarImage
                      src={activeConversation.participants
                        .find(p => p.id !== session?.user.id)?.avatar_url}
                    />
                  )}
                  <AvatarFallback>
                    {getAvatarInitials(
                      activeConversation.participants
                        .find(p => p.id !== session?.user.id)?.name || 'U'
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">
                    {activeConversation.participants
                      .find(p => p.id !== session?.user.id)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeConversation.participants
                      .find(p => p.id !== session?.user.id)?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === session?.user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_id === session?.user.id
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === session?.user.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  className={`transition-all duration-500 ${
                    sendSuccess 
                      ? 'bg-green-500 hover:bg-green-500 text-white' 
                      : ''
                  }`}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : sendSuccess ? (
                    <Check className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Conversation Selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}