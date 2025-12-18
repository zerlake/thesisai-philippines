/**
 * Chat Navigation Item Component
 * Phase 5: Real-time Communication & Collaboration
 */

import { Button } from '@/components/ui/button';
import { MessageCircle, MessageCircleMore } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function ChatNavItem() {
  const { profile } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  // In a real implementation, we would fetch unread message count from Supabase
  useEffect(() => {
    // This would be the real implementation:
    /*
    const fetchUnreadMessages = async () => {
      if (!profile?.id) return;
      
      const { count, error } = await supabase
        .from('advisor_student_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', profile.id)
        .eq('read_status', false);
        
      if (!error && count !== null) {
        setHasUnreadMessages(count > 0);
      }
    };
    
    fetchUnreadMessages();
    */
    
    // For now, simulate with mock data
    setHasUnreadMessages(Math.random() > 0.7); // 30% chance of having unread messages
  }, [profile?.id]);

  // Determine the appropriate chat path based on user role
  const getChatPath = () => {
    if (!profile) return '/chat';
    
    switch (profile.role) {
      case 'admin':
        return '/admin/chat';
      case 'advisor':
        return '/advisor/chat';
      case 'critic':
        return '/critic/chat';
      case 'user':
        return '/chat';
      default:
        return '/chat';
    }
  };

  // Determine the appropriate label based on user role
  const getChatLabel = () => {
    if (!profile) return 'Chat';
    
    switch (profile.role) {
      case 'admin':
        return 'Admin Chat';
      case 'advisor':
        return 'Student Messages';
      case 'critic':
        return 'Student Messages';
      case 'user':
        return 'Advisor Messages';
      default:
        return 'Messages';
    }
  };

  return (
    <Link href={getChatPath()}>
      <Button variant="ghost" className="w-full justify-start relative">
        {hasUnreadMessages ? (
          <MessageCircleMore className="h-5 w-5 mr-2" />
        ) : (
          <MessageCircle className="h-5 w-5 mr-2" />
        )}
        {getChatLabel()}
        {hasUnreadMessages && (
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
        )}
      </Button>
    </Link>
  );
}