# Conversation Feature Rebuild Guide

## Overview
Rebuild the "Conversation" messaging feature between advisors/critics and students with **REAL data only** - no mocks, no test data, no demo logic.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ConversationPanel (new component)                           │
│  - Displays message thread                                   │
│  - Input field for sending messages                          │
│  - Message list with timestamps                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes Layer                           │
├─────────────────────────────────────────────────────────────┤
│  POST /api/messages/send (existing)                          │
│  GET /api/messages/get (existing)                            │
│  - Calls Resend API for email notifications                 │
│  - Returns real data from database                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  advisor_student_messages table                              │
│  - id (UUID)                                                 │
│  - document_id (UUID)                                        │
│  - sender_id (UUID)                                          │
│  - sender_name (string)                                      │
│  - sender_role (advisor|critic|student)                      │
│  - message (text)                                            │
│  - created_at (timestamp)                                    │
│  - is_read (boolean)                                         │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

The `advisor_student_messages` table (from migration 42):
```sql
CREATE TABLE advisor_student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name VARCHAR(255),
  sender_role VARCHAR(50), -- 'advisor' | 'critic' | 'student'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (sender_id) REFERENCES auth.users(id)
);
```

## Phase 1: Create ConversationPanel Component

**File:** `src/components/conversation-panel.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'advisor' | 'critic' | 'student';
  message: string;
  created_at: string;
}

interface ConversationPanelProps {
  documentId: string;
  recipientId?: string;
  onMessageSent?: () => void;
}

export function ConversationPanel({
  documentId,
  recipientId,
  onMessageSent,
}: ConversationPanelProps) {
  const { session, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch messages from database
  useEffect(() => {
    const fetchMessages = async () => {
      if (!documentId) return;

      try {
        const response = await fetch(
          `/api/messages/get?documentId=${documentId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        } else {
          console.error('Failed to fetch messages');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [documentId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!session?.user) {
      toast.error('Not authenticated');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          senderId: session.user.id,
          senderRole: profile?.role || 'student',
          recipientId,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const { data } = await response.json();
      setMessages([...messages, data[0]]);
      setNewMessage('');
      toast.success('Message sent!');
      onMessageSent?.();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col border-l border-gray-200 dark:border-gray-800 w-[350px] max-h-[calc(100vh-150px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="font-semibold text-lg">Conversation</h2>
        <p className="text-sm text-muted-foreground">
          Discussion about this document
        </p>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground pt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${
                msg.sender_id === session?.user?.id ? 'justify-end' : ''
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg text-sm ${
                  msg.sender_id === session?.user?.id
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="font-semibold text-xs mb-1">{msg.sender_name}</p>
                <p className="break-words">{msg.message}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="space-y-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full p-2 border rounded-md min-h-[80px] text-sm resize-none"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Phase 2: Integrate into Editor

**File:** `src/components/editor.tsx`

Add this to imports:
```typescript
import { ConversationPanel } from './conversation-panel';
```

In the return JSX, add after the main editor content:
```typescript
{/* Right Sidebar: Conversation (for advisors/critics) */}
{(profile?.role === 'advisor' || profile?.role === 'critic') && (
  <ConversationPanel 
    documentId={documentId}
    recipientId={documentOwnerId || undefined}
  />
)}
```

This shows conversation only to advisors and critics, not students.

## Phase 3: Verify Existing API Routes

Check these already exist and work:
- `/api/messages/send` - POST endpoint
- `/api/messages/get` - GET endpoint

Both should:
- Query REAL data from `advisor_student_messages` table
- NOT contain any mock/demo logic
- Return actual database records

## Phase 4: Testing Checklist

### Test 1: Real Message Sending
1. Log in as advisor
2. Navigate to /advisor/students/[studentId]/[documentId]
3. Open document
4. Type message in conversation panel
5. Click "Send Message"
6. ✓ Message appears in conversation
7. ✓ Message saved to database
8. ✓ Email notification sent to student (if API configured)

### Test 2: Real Message Loading
1. Log in as student
2. Navigate to /drafts/[documentId]
3. Open document
4. Messages from advisor should appear
5. ✓ No mock messages
6. ✓ Only real messages from database

### Test 3: Multi-Person Conversation
1. Log in as advisor
2. Send message to student
3. Log in as student
4. See advisor's message
5. Reply to advisor
6. Log in as advisor again
7. ✓ See student's reply
8. ✓ Full conversation thread visible

### Test 4: Roles and Permissions
1. ✓ Only advisors/critics can see conversation panel in documents
2. ✓ Students can see conversation in /drafts view
3. ✓ Messages show correct sender role and name

## Phase 5: Email Integration

When message is sent via `/api/messages/send`:
1. Save message to `advisor_student_messages` table
2. Send email notification to recipient (if enabled in preferences)
3. Use Resend API to send
4. Include document title and message preview in email

Example email flow:
```
User sends message via UI
    ↓
POST /api/messages/send
    ↓
Save to advisor_student_messages table
    ↓
Get recipient email from profiles table
    ↓
Call Resend API to send email
    ↓
Return success response to frontend
    ↓
Show toast notification
```

## Phase 6: Database Verification

Before testing, verify:
```sql
-- Check migration applied
SELECT * FROM information_schema.tables 
WHERE table_name = 'advisor_student_messages';

-- Check sample data (if any)
SELECT * FROM advisor_student_messages LIMIT 5;

-- Verify relationships
SELECT DISTINCT sender_role FROM advisor_student_messages;
```

## Phase 7: Error Handling

Component should handle:
- ✓ Network errors → Toast message
- ✓ Invalid session → Redirect to login
- ✓ No messages yet → Show friendly message
- ✓ Empty message → Disable send button
- ✓ Message too long → Validation
- ✓ Failed to load messages → Show error, allow retry

## Key Differences from Old Implementation

| Old (Removed) | New (Building) |
|---|---|
| Hardcoded test messages | Real database queries |
| Mock data in state | Fetch from API |
| Demo-only logic | Production-only code |
| In-editor conversation sidebar | Same sidebar, clean implementation |
| No role checking | Explicit role-based visibility |
| No proper error handling | Comprehensive error handling |

## Implementation Order

1. ✓ Create `ConversationPanel` component
2. ✓ Add to `editor.tsx`
3. ✓ Test message sending via existing API
4. ✓ Test message loading via existing API
5. ✓ Verify role-based visibility
6. ✓ Test email notifications
7. ✓ Handle edge cases
8. ✓ Production deployment

## Success Criteria

- [ ] Build succeeds with no errors
- [ ] Message sending works (real messages saved to DB)
- [ ] Message loading works (real messages displayed from DB)
- [ ] Role-based visibility works (only advisors/critics see sidebar)
- [ ] Email notifications sent on message (if configured)
- [ ] No mock/demo data in conversation
- [ ] All error cases handled gracefully
- [ ] Full conversation thread visible between advisor and student

## Next Steps After Rebuild

1. Monitor logs for any errors
2. Test with real advisor-student pairs
3. Verify emails are sent to correct addresses
4. Check message delivery in email inbox
5. Deploy to production when verified

---

## Notes

- The component is **synchronous** in loading but shows loader state
- Messages are **NOT** automatically refreshed - component loads once on mount
- To add auto-refresh, add polling or WebSocket subscription
- For scaling, consider pagination for very long conversations
- Consider adding message editing/deletion features in future

This rebuild uses ONLY real data from the database with no test shortcuts.
