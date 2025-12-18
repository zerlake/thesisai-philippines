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
import { Send, Users, Clock, MessageCircle, MessageCircleMore } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

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
          // If relationships table doesn't exist, continue with empty array
          const errorCode = error?.code;
          const errorMessage = error?.message || String(error);
          if (errorCode === '42P01' || errorMessage.toLowerCase().includes('does not exist')) {
            console.warn('Relationships table not found, continuing without relationship-based messages:', error);
            relationships = [];
          } else {
            throw error; // Throw other errors
          }
        } else {
          relationships = data || [];
        }
      } catch (error: any) {
        const errorInfo = {
          message: typeof error === 'string' ? error : error?.message || 'Unknown error',
          code: error?.code,
          details: error?.details,
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

      // If no relationships found, try to get messages directly involving this user
      if (relatedUserIds.length === 0) {
        let directMessages: any[] = [];
        let dmError: any = null;

        try {
           const { data, error } = await supabase
             .from('advisor_student_messages')
             .select(`
               id,
               sender_id,
               recipient_id,
               message,
               created_at,
               is_read,
               read_status,
               sender_role,
               sender_name,
               sender_avatar_url
             `)
             .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
             .order('created_at', { ascending: true });
           
           console.log('Direct messages query result:', { 
             dataCount: data?.length || 0, 
             error: error?.message || error,
             userId: session.user.id,
             data: data
           });

          if (error) {
            // If the advisor_student_messages table doesn't exist, try a generic messages table
            const errorCode = error?.code;
            const errorMessage = error?.message || String(error);
            if (errorCode === '42P01' || errorMessage.toLowerCase().includes('does not exist')) {
              // Try alternative table name
              const { data: altData, error: altError } = await supabase
                .from('messages')
                .select(`
                  id,
                  sender_id,
                  recipient_id,
                  message,
                  created_at,
                  read_status,
                  sender_role,
                  sender_name,
                  sender_avatar_url
                `)
                .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
                .order('created_at', { ascending: true });

              if (altError) {
                // If no messages table exists, continue with empty array
                console.warn('Messages table not available, continuing without chat functionality:', altError);
                directMessages = [];
              } else {
                directMessages = altData || [];
              }
            } else {
              throw error; // Throw other errors
            }
          } else {
            directMessages = data || [];
          }
        } catch (error: any) {
          const errorMsg = typeof error === 'string' 
            ? error 
            : error?.message || String(error) || 'Unknown error';
          const errorCode = error?.code || 'NO_CODE';
          const errorDetails = error?.details ? JSON.stringify(error.details) : 'none';
          
          console.error(
            `Error loading direct messages - Message: ${errorMsg}, Code: ${errorCode}, Details: ${errorDetails}`,
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
        // If relationships exist, get messages with those specific users
        const { data: messages, error: msgError } = await supabase
          .from('advisor_student_messages')
          .select(`
            id,
            sender_id,
            recipient_id,
            message,
            created_at,
            read_status,
            sender_role,
            sender_name,
            sender_avatar_url
          `)
          .in('sender_id', [...relatedUserIds, session.user.id])
          .in('recipient_id', [...relatedUserIds, session.user.id])
          .order('created_at', { ascending: true });

        if (msgError) {
          console.error('Error loading messages:', msgError);
          setLoading(false);
          return;
        }

        if (messages && messages.length > 0) {
          // Group messages by conversation
          const conversationMap: Record<string, Conversation> = {};

          for (const msg of messages) {
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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !session?.user?.id) return;

    // Find the other participant in the conversation
    const otherParticipant = activeConversation.participants.find(
      p => p.id !== session.user.id
    );

    if (!otherParticipant) return;

    const messageData = {
      sender_id: session.user.id,
      recipient_id: otherParticipant.id,
      message: newMessage.trim(),
      sender_role: profile?.role || 'user',
      read_status: false,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('advisor_student_messages')
      .insert([messageData]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
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
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h2>
          <p className="text-sm text-muted-foreground">Chat with your team</p>
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
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="w-8 h-8">
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
              <div>
                <p className="font-semibold">
                  {activeConversation.participants
                    .find(p => p.id !== session?.user.id)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConversation.participants
                    .find(p => p.id !== session?.user.id)?.role}
                </p>
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
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
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