# Architecture Overview

High-level system design and component interactions for ThesisAI.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Browser (React Components + Next.js Pages)             │  │
│  │  ├─ Landing Page                                        │  │
│  │  ├─ Authentication (Login/Register)                     │  │
│  │  ├─ Dashboard (Thesis overview)                         │  │
│  │  ├─ Thesis Editor (5 phases)                            │  │
│  │  ├─ Advisor Interface                                   │  │
│  │  └─ Messaging System                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (REST/WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (/api/*)                            │  │
│  │  ├─ Authentication endpoints                            │  │
│  │  ├─ CRUD endpoints                                      │  │
│  │  ├─ AI integration endpoints                            │  │
│  │  ├─ Notification endpoints                              │  │
│  │  └─ WebSocket handlers                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Auth Service   │  │ AI Service   │  │ Messaging Service │  │
│  │ (Supabase Auth) │  │ (Puter, MCP) │  │ (Real-time)       │  │
│  └─────────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Thesis Service  │  │ Advisor      │  │ Notification      │  │
│  │ (5 phases)      │  │ Service      │  │ Service           │  │
│  └─────────────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA & INTEGRATION LAYER                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Supabase (Backend as a Service)                         │  │
│  │  ├─ PostgreSQL Database                                  │  │
│  │  ├─ Real-time Subscriptions                              │  │
│  │  ├─ Auth & RLS (Row Level Security)                      │  │
│  │  └─ Edge Functions                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  External Services                                       │  │
│  │  ├─ Puter AI (Grammar, Paraphrasing)                     │  │
│  │  ├─ arXiv API (Research papers)                          │  │
│  │  ├─ Resend (Email notifications)                         │  │
│  │  └─ OpenAI (Optional AI enhancement)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend Architecture

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout + providers
│   ├── page.tsx                 # Landing page
│   ├── (auth)/                  # Auth routes (login, register)
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── thesis/              # Thesis management
│   │   ├── advisor/             # Advisor interface
│   │   └── messages/            # Messaging
│   ├── api/                     # API route handlers
│   └── [not_found].tsx          # 404 page
│
├── components/
│   ├── ui/                      # Radix UI components
│   ├── features/                # Feature-specific components
│   ├── common/                  # Shared components
│   └── layouts/                 # Layout components
│
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── mcp.ts                   # MCP integration
│   ├── auth.ts                  # Auth utilities
│   ├── utils.ts                 # Helpers
│   └── types.ts                 # TypeScript types
│
└── contexts/
    ├── AuthContext              # Auth state
    ├── ThemeContext             # Theme (dark/light)
    └── AppContext               # Global app state
```

### Backend Architecture

```
Supabase
├── Database (PostgreSQL)
│   ├── users table              # User profiles
│   ├── theses table             # Thesis documents
│   ├── chapters table           # Thesis chapters
│   ├── advisors table           # Advisor mappings
│   ├── messages table           # Messages
│   ├── feedback table           # Advisor feedback
│   ├── notifications table      # Notifications
│   └── [other tables]           # Supporting data
│
├── Auth
│   ├── Supabase Auth service
│   ├── JWT tokens
│   └── RLS policies
│
├── Real-time
│   ├── Subscriptions
│   └── Broadcasting
│
└── Edge Functions
    ├── Email handlers
    ├── AI orchestration
    └── Webhook processors
```

## Data Flow

### Authentication Flow

```
User Login
   ↓
Next.js API → Supabase Auth
   ↓
JWT Token Created
   ↓
Browser SessionStorage
   ↓
Subsequent Requests (Authorization Header)
   ↓
RLS Policies Enforce Access Control
```

### Thesis Editing Flow

```
User Starts Editing
   ↓
Client-side Form Validation
   ↓
Next.js API Route Handler
   ↓
Server-side Validation
   ↓
Supabase Database Update
   ↓
RLS Policy Check (User owns thesis?)
   ↓
Database Update/Insert/Delete
   ↓
Real-time Subscription Update
   ↓
UI Updates via Real-time Socket
   ↓
User Sees Changes
```

### AI Integration Flow

```
User Requests Grammar Check
   ↓
Next.js API Route
   ↓
Puter AI Service Call
   ↓
AI Processing
   ↓
Results Returned
   ↓
Save to Database (optional)
   ↓
Display in UI
```

### Messaging Flow

```
User Sends Message
   ↓
Real-time Emit
   ↓
Next.js Handler
   ↓
Save to DB + Broadcast
   ↓
WebSocket Subscription Triggered
   ↓
Recipient UI Updates
   ↓
Notification Email (optional)
```

## Key Design Patterns

### 1. Server Components & Client Components

```typescript
// Server Component (default in Next.js 13+)
export default async function ThesisPhase() {
  const data = await fetchThesis()  // Direct DB access
  return <ThesisContent data={data} />
}

// Client Component (with interactivity)
'use client'
export function ThesisEditor() {
  const [content, setContent] = useState('')
  return <Editor onChange={setContent} />
}
```

### 2. API Route Pattern

```typescript
// pages/api/thesis/[id].ts
export async function GET(request: Request) {
  // Validate auth
  // Fetch from DB
  // Return JSON
}

export async function PUT(request: Request) {
  // Validate auth & ownership
  // Validate input
  // Update DB
  // Return updated data
}
```

### 3. Context & Hooks Pattern

```typescript
// Create context
const AuthContext = createContext<AuthState | null>(null)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  return <AuthContext.Provider value={{ user }} />
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext)
}
```

### 4. Real-time Subscription

```typescript
// Subscribe to thesis changes
const subscription = supabase
  .channel('thesis:' + thesisId)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'theses' },
    handleChange
  )
  .subscribe()
```

## Component Hierarchy

```
App (Root)
├── AuthProvider
│   ├── ThemeProvider
│   │   ├── Navbar
│   │   ├── Sidebar (Dashboard)
│   │   └── Main Content
│   │       ├── Page Content
│   │       └── Modals/Dialogs
│   └── Toast Notifications
└── Analytics (Sentry, etc.)
```

## State Management

### Global State (Context)

```typescript
// AuthContext - User authentication
// ThemeContext - Dark/light mode
// AppContext - Global settings
```

### Local State (Component)

```typescript
// useState - Form data
// useReducer - Complex state
// useCallback - Memoized functions
```

### Server State (React Query/SWR)

```typescript
// Fetch & cache API data
// Auto-revalidation
// Optimistic updates
```

## Performance Optimizations

### 1. Code Splitting

- **Route-based:** Each route loads only needed code
- **Component lazy loading:** Import components on demand
- **Dynamic imports:** Async component loading

### 2. Image Optimization

- **Next.js Image component:** Automatic optimization
- **Responsive images:** Multiple sizes
- **Lazy loading:** Load on visibility

### 3. Caching Strategies

- **Static generation (SSG):** Cache at build time
- **Incremental static revalidation (ISR):** Revalidate on demand
- **Client-side caching:** Browser cache + React Query
- **CDN caching:** Vercel edge caching

### 4. Bundle Optimization

- **Tree-shaking:** Remove unused code
- **Minification:** Reduce file sizes
- **Compression:** Gzip/Brotli compression
- **Lazy routes:** Load on demand

## Security Architecture

### Authentication

- **Supabase Auth:** Secure JWT tokens
- **Session management:** HTTP-only cookies
- **MFA support:** Multi-factor authentication

### Authorization

- **Row Level Security (RLS):** PostgreSQL policies
- **API validation:** Server-side checks
- **User ownership:** Verify user owns resource

### Data Protection

- **Encryption:** Data in transit (HTTPS)
- **Secrets:** Environment variables
- **Rate limiting:** Prevent abuse
- **CORS:** Cross-origin restrictions

## Scaling Considerations

### Database

- **Indexes:** Query optimization
- **Partitioning:** Large table management
- **Replication:** High availability
- **Backup:** Data recovery

### API

- **Load balancing:** Distribute traffic
- **Caching:** Reduce DB hits
- **Rate limiting:** Prevent overload
- **Monitoring:** Performance tracking

### Frontend

- **CDN:** Global content delivery
- **Compression:** Reduce transfer size
- **Lazy loading:** Progressive enhancement
- **Pagination:** Handle large datasets

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Next.js 16 | Full-stack React, SSR/SSG |
| UI Library | Radix UI + Tailwind | Headless, customizable, styled |
| Database | PostgreSQL (Supabase) | Powerful, reliable, scalable |
| Authentication | Supabase Auth | Integrated, secure, managed |
| AI Integration | Puter SDK | Flexible, multiple models |
| Styling | Tailwind CSS | Utility-first, performant |
| Testing | Vitest | Fast, modern, Vite-native |
| Type Safety | TypeScript | Strict, compile-time checks |

---

## Related Pages

- [Technology Stack](./Technology-Stack) - Detailed tech information
- [Database Schema](./Database-Schema) - Data models
- [API Reference](./API-Reference) - All endpoints
- [Code Standards](./Code-Standards) - Development patterns

**Last Updated:** December 2024
