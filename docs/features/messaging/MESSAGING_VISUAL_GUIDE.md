# Real-Time Messaging - Visual Guide

## User Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     LOGIN PAGE                                   │
│                                                                  │
│  Email: student@demo.thesisai.local                             │
│  Password: ••••••••••                                           │
│  [Login]                                                        │
└──────────────────────────────────────────────────────────────────┘
                          ↓
            ┌─────────────────────────┐
            │  AUTH SYSTEM             │
            │  Validates credentials   │
            │  Creates session         │
            │  Returns real UUID       │
            └─────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────────┐
│                     DASHBOARD                                    │
│                                                                  │
│  Welcome, Student!                                              │
│                                                                  │
│  [Main Content]    [Conversation Panel]                        │
│                    ├─ Header: "Conversation"                    │
│                    ├─ Messages:                                 │
│                    │  └─ "Hi student, how's the thesis?"       │
│                    │     [Advisor] 12:35 PM                    │
│                    │                                             │
│                    ├─ Input: [Type message...]                  │
│                    └─ [Send Message]                            │
└──────────────────────────────────────────────────────────────────┘
```

## Message Sending Flow

```
USER CLICKS "SEND MESSAGE"
        ↓
   VALIDATION
   ├─ ✓ Message not empty?
   ├─ ✓ User authenticated?
   ├─ ✓ Recipient selected?
   └─ ✓ UUID valid format?
        ↓
   API REQUEST
   POST /api/messages/send
   {
     senderId: "550e8400...",
     senderRole: "student",
     recipientId: "550e8400...",
     message: "Hello!",
     documentId: null
   }
        ↓
   API VALIDATION
   ├─ ✓ senderId is valid UUID
   ├─ ✓ recipientId is valid UUID
   ├─ ✓ User exists in profiles
   └─ ✓ Message not empty
        ↓
   DATABASE INSERT
   INSERT INTO advisor_student_messages (...)
   VALUES (...)
        ↓
   REALTIME BROADCAST
   Subscribers notified of INSERT
        ↓
   UI UPDATE
   ├─ Show ✅ Success Modal
   ├─ Add message to list
   ├─ Clear input field
   └─ Auto-dismiss modal (3 sec)
        ↓
   OTHER USERS SEE
   ├─ Message appears instantly
   ├─ Sender styled differently
   └─ Timestamp shown
```

## Modal Visualizations

### Success Modal

```
┌─────────────────────────────────────────┐
│  ✅ Success                          ✕  │
├─────────────────────────────────────────┤
│                                         │
│  Message sent successfully!             │
│                                         │
│  Auto-dismisses in 3 seconds            │
│                                         │
└─────────────────────────────────────────┘

Styling:
├─ Background: White (dark: Gray-900)
├─ Border: Green-200 (dark: Green-800)
├─ Icon: Green-600 (CheckCircle2)
├─ Title: Font-semibold, text-lg
├─ Message: text-sm, muted
└─ Close: Gray-400 on hover
```

### Error Modal

```
┌─────────────────────────────────────────┐
│  ⚠️  Error                          ✕  │
├─────────────────────────────────────────┤
│                                         │
│  Invalid senderId - must be a valid    │
│  UUID from auth system                  │
│                                         │
│  [User must close or wait]              │
│                                         │
└─────────────────────────────────────────┘

Styling:
├─ Background: White (dark: Gray-900)
├─ Border: Red-200 (dark: Red-800)
├─ Icon: Red-600 (AlertCircle)
├─ Title: Font-semibold, text-lg
├─ Message: text-sm, muted
└─ Close: Gray-400 on hover

Note: Does NOT auto-dismiss
```

## Conversation Panel Layout

```
┌─────────────────────────────────────┐
│  Conversation            [Collapse]  │
│  Direct conversation               │ ← Header
├─────────────────────────────────────┤
│                                     │
│  [Other] Say, what's the issue? │   │
│          2:15 PM                  │   │
│                                     │   
│                 [You] I need feedback│
│                       3:20 PM       │   Messages area
│                                     │   (auto-scroll to bottom)
│  [Other] I'll review it today     │
│          3:25 PM                  │
│                                     │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │Type your message here...     │  │
│  │                              │  │  Input field
│  └──────────────────────────────┘  │  (min-height: 80px)
│  [➤ Send Message]                  │
└─────────────────────────────────────┘

Dimensions:
├─ Width: 350px
├─ Height: calc(100vh - 150px)
├─ Position: Right sidebar
└─ Border: Left, gray

Message Styling:
├─ Own message: Blue background (right-aligned)
├─ Other message: White background (left-aligned)
└─ Timestamp: Gray, smaller text
```

## Real-Time Message Delivery Timeline

```
TIME  WINDOW 1 (STUDENT)           WINDOW 2 (ADVISOR)
────────────────────────────────────────────────────
T+0   Click "Send Message"
T+50  ├─ API call sent             
      └─ Button disabled            
      
T+100 ├─ Message inserted to DB
      └─ Realtime broadcasts
                                   T+100 ← Subscription triggers
                                   T+150 ← Message rendered
                                   
T+200 ├─ Success modal shown       
      ├─ Message appears in list
      └─ Input cleared
      
T+300 ├─ Success modal auto-
      │  dismisses
      └─ Ready for next message
      
                                   T+350 Success modal shown
                                   T+650 Success modal dismisses
────────────────────────────────────────────────────
TOTAL DELIVERY TIME: 100-200ms from send to appear
```

## Multi-Window Real-Time Example

```
BROWSER 1 (STUDENT)          BROWSER 2 (ADVISOR)
─────────────────────────────────────────────────

Conversation:                Conversation:
├─ [None yet]              ├─ [None yet]


[Type: Hi advisor]         

[Send Message] ────────────────────→ INSERT sent
                                    ↓
├─ ✅ Success Modal              Realtime triggers
├─ Message appears:             ↓
│  "Hi advisor"          ← Message appears instantly:
│  (from you)               "Hi advisor"
                            (from student)

[Wait 3 sec]

[Type: What do you]
[think?]

[Send Message] ────────────────────→ INSERT sent
                                    ↓
├─ ✅ Success Modal              Realtime triggers
├─ Message appears:             ↓
│  "What do you think?"   ← Message appears instantly:
│  (from you)               "What do you think?"
                            (from student)
                            
                            [Type: Looks good!]
                            [Type: Let me...]
                            [Type: suggest...]
                            
                            [Send Message] ──→ INSERT sent
                                              ↓
                                          Realtime triggers
                                              ↓
Message appears instantly ←────────── "Looks good! Let me suggest..."
"Looks good! Let me
suggest..." (from advisor)
```

## Component Architecture

```
┌─────────────────────────────────────┐
│     ConversationPanel               │
│  (Client Component - 'use client')  │
├─────────────────────────────────────┤
│                                     │
│  State:                             │
│  ├─ messages[]                      │
│  ├─ newMessage (string)             │
│  ├─ isLoading (boolean)             │
│  ├─ isSending (boolean)             │
│  └─ sendStatus {type, message}      │
│                                     │
│  Effects:                           │
│  ├─ fetchMessages (on mount)        │
│  └─ realtimeSubscription (on mount) │
│                                     │
│  Handlers:                          │
│  └─ handleSendMessage               │
│                                     │
│  JSX:                               │
│  ├─ Header                          │
│  ├─ Messages list (with scroll)     │
│  ├─ Status Modal (conditional)      │
│  └─ Input + Send button             │
│                                     │
└─────────────────────────────────────┘
      ↓
   useAuth()  ← Get session, profile
   
   supabase ← Realtime subscriptions
   
   fetch() ← API calls
```

## Database Schema Visualization

```
┌─────────────────────────────────────────────┐
│  advisor_student_messages                   │
├─────────────────────────────────────────────┤
│ id                UUID (Primary Key)        │
│ sender_id         UUID (Foreign Key)        │
│ sender_role       TEXT ('student'...)       │
│ sender_name       TEXT (from profiles)      │
│ recipient_id      UUID (Foreign Key)        │
│ message           TEXT                      │
│ document_id       UUID (Nullable)           │
│ subject           TEXT                      │
│ is_read           BOOLEAN (default: false)  │
│ created_at        TIMESTAMP                 │
│ updated_at        TIMESTAMP                 │
└─────────────────────────────────────────────┘

Indexes:
├─ sender_id (for filtering)
├─ recipient_id (for filtering)
├─ document_id (for filtering)
└─ created_at DESC (for ordering)

RLS Policies:
├─ Users can view messages where:
│  └─ auth.uid() = sender_id OR auth.uid() = recipient_id
├─ Users can insert where:
│  └─ auth.uid() = sender_id
└─ Users can update where:
   └─ auth.uid() = sender_id
```

## Error Handling Flow

```
USER SENDS MESSAGE
        ↓
┌─────────────────────────────────┐
│  Client Validation              │
├─────────────────────────────────┤
│ ✓ Message not empty?            │
│ ✓ User authenticated?           │
│ ✓ Recipient specified?          │
└─────────────────────────────────┘
        ↓
        NO ERRORS?
        ↓ YES        ↓ NO
        │            └─→ Show Error Modal
        ↓               [Close with X]
  API REQUEST
        ↓
┌─────────────────────────────────┐
│  Server Validation              │
├─────────────────────────────────┤
│ ✓ senderId is valid UUID?       │
│ ✓ recipientId is valid UUID?    │
│ ✓ All required fields present?  │
└─────────────────────────────────┘
        ↓
        NO ERRORS?
        ↓ YES        ↓ NO
        │            └─→ Return 400 with error
        │                │
        ↓                │
  INSERT MESSAGE      Client receives error
        ↓              │
  DATABASE           └─→ Show Error Modal
        ↓
  SUCCESS?
  ↓ YES  ↓ NO
  │      └─→ Return 500 with error
  │          │
  ↓          └─→ Show Error Modal
BROADCAST
  ↓
SHOW SUCCESS MODAL
  ↓
AUTO-DISMISS (3s)
```

## Realtime Subscription Filter

```
┌──────────────────────────────────┐
│  Database Change Event (INSERT)  │
│  {                               │
│    sender_id: "uuid-student",    │
│    recipient_id: "uuid-advisor"  │
│  }                               │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  Filter Check                    │
│                                  │
│  Does:                           │
│  sender_id == user.id OR         │
│  recipient_id == user.id?        │
│                                  │
│  (Current user: uuid-student)    │
└──────────────────────────────────┘
           ↓
           YES
           ↓
┌──────────────────────────────────┐
│  Trigger Handler                 │
│  (payload: any) => {...}         │
│                                  │
│  ├─ Extract message from payload │
│  ├─ Check for duplicates         │
│  └─ Add to messages array        │
└──────────────────────────────────┘
           ↓
┌──────────────────────────────────┐
│  UI Update                       │
│                                  │
│  setMessages([...prev, newMsg])  │
│                                  │
│  (Component re-renders)          │
└──────────────────────────────────┘
```

## Performance Comparison

### Before (Polling)
```
Browser 1          Browser 2
├─ T+0: Send       
├─ T+100: Poll ────────────→ "Not yet"
├─ T+200: Poll ────────────→ "Not yet"
├─ T+300: Poll ────────────→ "Not yet"
├─ T+400: Poll ────────────→ "Got it!" ✓
├─ T+500: Poll ────────────→ (wasted)
└─ T+600: Poll ────────────→ (wasted)

LATENCY: 400ms (with polling every 100ms)
```

### After (Realtime)
```
Browser 1          Browser 2
├─ T+0: Send       
├─ T+100: Insert   
├─ T+150: Realtime ────────→ Subscribed listener
├─ T+200: Appears ◄─────────
└─ Success Modal

LATENCY: 100-200ms (Realtime broadcast)
```

---

**Visual Guide Complete** ✅  
For implementation details, see `MESSAGING_IMPLEMENTATION_COMPLETE.md`  
For setup instructions, see `MESSAGING_QUICK_START.md`
