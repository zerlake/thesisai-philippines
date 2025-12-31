# ThesisAI Philippines Architecture

## Overview
ThesisAI Philippines is a comprehensive academic writing platform built with Next.js 16, Supabase, and integrated AI services. The platform provides AI-powered tools for thesis writing, research, and academic collaboration.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 16 Application Layer               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Landing Page  │  │   Dashboard     │  │   Editor        │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   AI Tools      │  │   Documents     │  │   Communication │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes Layer                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth API      │  │   AI Tools API  │  │   Document API  │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   User API      │  │   Message API   │  │   Analytics API │ │
│  │                 │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Data Access Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Supabase       │  │  Server Actions │  │  AI Services    │ │
│  │  Client (SSR)   │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐                    ┌─────────────────────┐ │
│  │  Supabase       │                    │  Puter AI Facade    │ │
│  │  Client (CSR)   │                    │                     │ │
│  └─────────────────┘                    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Supabase      │  │   Puter AI      │  │   OpenRouter    │ │
│  │   PostgreSQL    │  │   (Primary)     │  │   (Fallback)    │ │
│  │   Auth/Storage  │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Third-party Integrations                       │ │
│  │  (Zotero, Mendeley, Sci-Hub, RevenueCat, etc.)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Module Structure

### Frontend Modules
- **Authentication**: Login, registration, password reset
- **Dashboard**: Student, advisor, critic dashboards
- **Editor**: Novel editor with AI integration
- **Academic Tools**: Outlines, research questions, citations
- **Communication**: Messaging between students, advisors, critics
- **Document Management**: Thesis document handling
- **AI Tools**: Various AI-powered academic assistance tools

### Backend Services
- **Supabase Integration**: Server and client-side database access
- **AI Services**: Puter AI facade with fallback mechanisms
- **Authentication**: Supabase Auth with role-based access
- **Real-time**: Supabase Realtime for live updates
- **File Storage**: Document and media storage

## 🔌 AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Service Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Puter AI Facade                        │ │
│  │  (Unified Interface for all AI tools)                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │ │
│  │  │   Caching       │  │   Retry Logic   │  │   Metrics   │ │ │
│  │  │   & Batching    │  │   & Fallback    │  │   & Logging │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AI Provider Router                     │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │ │
│  │  │    Puter AI     │  │   OpenRouter    │  │   Mock      │ │ │
│  │  │   (Primary)     │  │   (Fallback)    │  │   (Offline) │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   AI Tool Categories                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │  Writing    │  │  Research   │  │  Analysis &        │ │ │
│  │  │  Tools      │  │  Tools      │  │  Presentation      │ │ │
│  │  │             │  │             │  │                   │ │ │
│  │  │ • Outlines  │  │ • Gap       │  │ • Defense Q&A     │ │ │
│  │  │ • Grammar   │  │   Analysis  │  │ • Presentation    │ │ │
│  │  │ • Paraphrase│  │ • Paper     │  │   Generator       │ │ │
│  │  │ • Improve   │  │   Search    │  │ • Flashcards      │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
```

## 🗄️ Data Access Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Supabase Client                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │ │
│  │  │  Server Client  │  │  Client Client  │  │  SSR Client │ │ │
│  │  │  (Cookies)      │  │  (Anon Key)     │  │  (Auth)     │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Database Schema                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   Users &   │  │  Academic   │  │  Communication &   │ │ │
│  │  │  Profiles   │  │  Content    │  │  Collaboration     │ │ │
│  │  │             │  │             │  │                   │ │ │
│  │  │ • Users     │  │ • Documents │  │ • Messages        │ │ │
│  │  │ • Profiles  │  │ • Citations │  │ • Reviews         │ │ │
│  │  │ • Roles     │  │ • Outlines  │  │ • Notifications   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Supabase Features                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   Auth      │  │   Storage   │  │   Realtime        │ │ │
│  │  │             │  │             │  │                   │ │ │
│  │  │ • User      │  │ • Documents │  │ • Live Messages   │ │ │
│  │  │   Management│  │ • Media     │  │ • Document Sync   │ │ │
│  │  │ • RLS       │  │             │  │ • Notifications   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
```

## 🌐 Key Features

1. **Academic Writing Support**: Comprehensive tools for thesis writing including outlines, research questions, citations
2. **AI-Powered Assistance**: Multiple AI tools for writing improvement, research, and analysis
3. **Collaboration**: Student-advisor-critic communication system
4. **Document Management**: Full thesis document lifecycle
5. **Real-time Features**: Live collaboration and notifications
6. **Mobile Responsive**: Responsive design for all devices
7. **Accessibility**: WCAG compliant interface
8. **Performance Optimized**: Optimized for fast loading and smooth interactions

## Core Technologies

- **Frontend**: Next.js 16 with App Router, React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **AI Integration**: Primary - Puter AI, Fallback - OpenRouter
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Analytics**: Custom analytics service

## Architecture Highlights

1. **Application Structure**:
   - Landing pages with hero sections and features
   - Complete authentication system (login, register, password reset)
   - Role-based dashboards (student, advisor, critic)
   - Advanced editor with AI integration
   - Academic tools (outlines, research questions, citations)
   - Communication system for collaboration

2. **Data Access Layer**:
   - Server-side Supabase client with cookie handling
   - Client-side Supabase client for browser interactions
   - Server Actions for business logic
   - API routes for direct database access
   - Comprehensive authentication and authorization

3. **AI Integration**:
   - Primary AI provider: Puter AI with sophisticated fallback mechanisms
   - Unified AI facade that handles caching, retries, and error recovery
   - Multiple AI tools for academic writing (outlines, grammar, paraphrasing, etc.)
   - Context-aware academic assistance
   - Performance optimization with caching and batch processing

The architecture demonstrates a well-thought-out approach to building a complex academic platform with modern web technologies, prioritizing both user experience and robust backend services. The AI integration is particularly sophisticated, with multiple fallback mechanisms and performance optimizations.

## Module Contracts

### Puter AI Facade

- **Name**: Puter AI Facade
- **Location**:
  - Primary path(s): `src/lib/puter-ai-facade.ts`
  - Related folders: `src/lib/puter-ai-wrapper.ts`, `src/types/...`

***

### Responsibilities

- **Primary responsibilities**
  - Provide unified interface for all AI tool calls across the application
  - Handle routing between different AI providers (Puter, OpenRouter, fallback)
  - Manage caching, retry logic, and error recovery
  - Track metrics and performance for AI services
- **Non‑responsibilities (explicitly out of scope)**
  - Does not perform direct AI model calls (delegates to providers)
  - Does not handle UI rendering or client-side state management
  - Does not build prompts directly (delegates to internal methods)

***

### Public API (For Other Modules)

- **Exports / entrypoints**
  - `puterAIFacade.call()` - Main method to call AI tools
  - `puterAIFacade.callBatch()` - Batch execute multiple tools
  - `puterAIFacade.getMetrics()` - Get service metrics
  - `puterAIFacade.clearCache()` - Clear cached responses
- **Input/Output contracts**
  - Input types: `AIToolInput` (generic object), `AIToolConfig` (timeout, retries, etc.)
  - Output types: `AIToolResponse<T>` with success, data, error, provider, and metadata

***

### Allowed Callers

- **Who can call this module**
  - Server actions in `src/actions/`
  - API routes in `src/app/api/ai-tools/`
  - UI components that need AI functionality
- **Forbidden call patterns**
  - Client components should not call directly without proper error handling
  - No direct calls to underlying AI providers bypassing the facade

***

### Dependencies

- **Internal dependencies**
  - `src/lib/openrouter-ai.ts` - OpenRouter integration
  - `src/utils/error-utilities.ts` - Error normalization utilities
- **External dependencies**
  - Supabase client for Puter function calls
  - OpenRouter API for fallback provider
- **Direction constraints**
  - Depends only on lower-level utilities; never depends on UI or feature layers

***

### Invariants and Guarantees

- **Invariants**
  - All AI calls are logged with request ID and provider
  - Cache keys are consistent across tool calls
  - Metrics are updated for every call regardless of success/failure
- **Error handling rules**
  - Errors are normalized using `normalizeError` utility
  - Fallback responses are provided when all providers fail
  - All errors include provider information for debugging

---

### Security and Access Control

- **Auth assumptions**
  - Supabase client context is passed for Puter function calls
  - User authentication is validated by calling modules
- **RLS / authorization coupling**
  - Relies on Supabase RLS for data access control
  - No direct database access - all through Supabase functions

***

### Observability

- **Logging**
  - All AI calls are logged with tool name, execution time, and provider
  - Error logs include tool name and error details
- **Metrics / analytics**
  - Tracks total calls, successful calls, failed calls, fallback usage
  - Average response time and cache hit rates

***

### Example Usage

- **Code snippets**
  ```typescript
  // From a server action or API route
  const result = await puterAIFacade.call('generate-outline', {
    topic: 'Machine Learning in Education'
  }, supabaseClient);

  if (result.success) {
    return result.data;
  } else {
    console.error('AI tool failed:', result.error);
    // Handle fallback
  }
  ```
- **Common misuse to avoid**
  - Do not call underlying providers directly
  - Do not bypass caching without good reason

***

### Future Work / TODOs

- **Planned extensions**
  - Add more AI providers for better redundancy
  - Enhanced caching strategies for specific tool types
- **Known limitations**
  - Cache size is limited to 500 entries
  - All tools share the same timeout configuration

---

### AI Provider Router

- **Name**: AI Provider Router
- **Location**:
  - Primary path(s): `src/lib/puter-ai-facade.ts` (internal routing logic)
  - Related folders: `src/lib/ai-service-provider.ts`

***

### Responsibilities

- **Primary responsibilities**
  - Route AI requests to appropriate provider based on configuration
  - Handle fallback between providers when primary fails
  - Manage provider-specific configurations and settings
- **Non‑responsibilities (explicitly out of scope)**
  - Does not implement actual AI model logic
  - Does not handle UI state or user preferences directly
  - Does not manage caching (handled by facade layer)

***

### Public API (For Other Modules)

- **Exports / entrypoints**
  - Internal routing methods within `PuterAIFacade`
  - Provider selection based on tool type and availability
- **Input/Output contracts**
  - Input types: Tool name, input parameters, configuration options
  - Output types: Provider-specific responses wrapped in standard format

***

### Allowed Callers

- **Who can call this module**
  - Only the Puter AI Facade module
  - Internal methods within the same service
- **Forbidden call patterns**
  - Direct calls from UI components or other services
  - Bypassing the facade layer

***

### Dependencies

- **Internal dependencies**
  - `src/lib/openrouter-ai.ts` - OpenRouter provider implementation
  - `src/lib/puter-ai-wrapper.ts` - Puter provider implementation
- **External dependencies**
  - Puter.js SDK for primary provider
  - OpenRouter API for fallback provider
- **Direction constraints**
  - Only called by the facade layer; no upward dependencies

***

### Invariants and Guarantees

- **Invariants**
  - Always tries primary provider first
  - Falls back to alternative providers on failure
  - Maintains consistent response format across providers
- **Error handling rules**
  - Propagates provider-specific errors to facade layer
  - Maintains error context for debugging

---

### Security and Access Control

- **Auth assumptions**
  - Relies on calling module to provide appropriate authentication context
  - No direct auth handling within routing logic
- **RLS / authorization coupling**
  - Not applicable - handles AI provider routing, not data access

***

### Observability

- **Logging**
  - Logs provider selection and fallback attempts
  - Tracks provider availability and response times
- **Metrics / analytics**
  - Provider usage statistics
  - Fallback frequency and success rates

***

### Example Usage

- **Code snippets**
  ```typescript
  // Internal usage within PuterAIFacade
  // Tries Puter via Supabase first, falls back to OpenRouter
  if (supabaseClient && mergedConfig.provider !== 'openrouter') {
    response = await this.callPuterTool<T>(toolName, input, supabaseClient, mergedConfig);
  } else {
    response = await this.callOpenRouterTool<T>(toolName, input, mergedConfig);
  }
  ```
- **Common misuse to avoid**
  - Direct calls to routing methods without going through facade

***

### Future Work / TODOs

- **Planned extensions**
  - Add more provider options (OpenAI, Anthropic, etc.)
  - Intelligent provider selection based on tool type
- **Known limitations**
  - Currently only supports Puter and OpenRouter

---

### Supabase Server Client

- **Name**: Supabase Server Client
- **Location**:
  - Primary path(s): `src/integrations/supabase/server-client.ts`, `src/lib/supabase/server.ts`
  - Related folders: `src/lib/supabase/client.ts`, `supabase/migrations/`

***

### Responsibilities

- **Primary responsibilities**
  - Create Supabase client instances for server-side operations
  - Handle cookie-based session management for SSR
  - Provide authenticated access to Supabase services on the server
- **Non‑responsibilities (explicitly out of scope)**
  - Does not implement business logic or data validation
  - Does not handle UI state or client-side operations
  - Does not manage database schema or migrations

***

### Public API (For Other Modules)

- **Exports / entrypoints**
  - `createServerSupabaseClient()` - Main function to create server client
  - `createClient` alias for compatibility
- **Input/Output contracts**
  - Input types: None required (uses environment variables and cookies)
  - Output types: Supabase client instance with proper session context

***

### Allowed Callers

- **Who can call this module**
  - Server actions in `src/actions/`
  - API routes in `src/app/api/`
  - Server components that need database access
- **Forbidden call patterns**
  - Client components should not import this directly
  - Never use in client-side code (use client client instead)

***

### Dependencies

- **Internal dependencies**
  - `@supabase/ssr` - Supabase SSR utilities
  - `next/headers` - Next.js headers API for cookie access
- **External dependencies**
  - `@supabase/supabase-js` - Supabase JavaScript client
- **Direction constraints**
  - Only depends on Next.js framework and Supabase libraries

***

### Invariants and Guarantees

- **Invariants**
  - Always uses server-side session context from cookies
  - Properly handles cookie setting/getting/removing operations
  - Maintains session consistency across server requests
- **Error handling rules**
  - Gracefully handles cookie access errors in server components
  - Logs cookie-related errors without exposing to users

---

### Security and Access Control

- **Auth assumptions**
  - Relies on Supabase Auth for user authentication
  - Uses session cookies to maintain user context
- **RLS / authorization coupling**
  - Fully integrates with Supabase Row Level Security policies
  - Respects all configured RLS rules for data access

***

### Observability

- **Logging**
  - Logs client creation and cookie access operations
  - Error logs for authentication/session issues
- **Metrics / analytics**
  - Not directly tracked (handled by Supabase)

***

### Example Usage

- **Code snippets**
  ```typescript
  // In a server action
  import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

  export async function someServerAction() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('documents').select('*');
    return { data, error };
  }
  ```
- **Common misuse to avoid**
  - Using in client components (use client client instead)
  - Direct database access without proper auth context

***

### Future Work / TODOs

- **Planned extensions**
  - Enhanced error handling for different deployment environments
  - Better integration with Next.js middleware
- **Known limitations**
  - Requires proper cookie configuration in deployment

---

### Message/Notification API

- **Name**: Message/Notification API
- **Location**:
  - Primary path(s): `src/app/api/messages/route.ts`, `src/app/api/notifications/route.ts`
  - Related folders: `src/components/chat-interface.tsx`, `src/services/thesis-feedback-service.ts`

***

### Responsibilities

- **Primary responsibilities**
  - Handle real-time messaging between users (students, advisors, critics)
  - Manage notification delivery and status tracking
  - Provide REST API endpoints for message operations
- **Non‑responsibilities (explicitly out of scope)**
  - Does not handle UI rendering or chat interface logic
  - Does not manage user authentication (delegated to middleware)
  - Does not implement complex business rules for academic workflows

***

### Public API (For Other Modules)

- **Exports / entrypoints**
  - HTTP endpoints: GET, POST, PUT, DELETE for messages
  - Standard API response format with success/error handling
- **Input/Output contracts**
  - Input types: Message content, recipient IDs, metadata
  - Output types: Standard API response with message data or error

***

### Allowed Callers

- **Who can call this module**
  - Client components using fetch/SWR for real-time updates
  - Server actions that need to send system messages
  - Other API routes that need to trigger notifications
- **Forbidden call patterns**
  - Direct database calls bypassing the API layer
  - Cross-tenant message access without proper authorization

***

### Dependencies

- **Internal dependencies**
  - `src/integrations/supabase/server-client.ts` - Database access
  - `src/lib/utils.ts` - Utility functions
- **External dependencies**
  - Supabase Realtime for live updates
  - Next.js API routes framework
- **Direction constraints**
  - Depends on data access layer; not on UI layer

***

### Invariants and Guarantees

- **Invariants**
  - All messages are properly attributed to sender
  - Message content is sanitized before storage
  - Notifications are delivered only to authorized recipients
- **Error handling rules**
  - Standardized error responses with appropriate HTTP status codes
  - Detailed error logging for debugging while protecting user data

---

### Security and Access Control

- **Auth assumptions**
  - Requires valid user session via middleware
  - Validates user permissions before allowing message operations
- **RLS / authorization coupling**
  - Enforces RLS policies to prevent unauthorized message access
  - Ensures users can only access their own messages and authorized group messages

***

### Observability

- **Logging**
  - Logs all message operations with user IDs and timestamps
  - Error logs for failed message operations
- **Metrics / analytics**
  - Tracks message volume and delivery success rates
  - Monitors API response times

***

### Example Usage

- **Code snippets**
  ```typescript
  // API route example
  export async function GET(request: NextRequest) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      return NextResponse.json({ success: true, data });
    } catch (error) {
      return createErrorResponse('Failed to fetch messages', 500);
    }
  }
  ```
- **Common misuse to avoid**
  - Bypassing auth checks
  - Direct database access without proper RLS consideration

***

### Future Work / TODOs

- **Planned extensions**
  - Enhanced real-time capabilities with WebSockets
  - Message threading and conversation views
- **Known limitations**
  - Current implementation may have performance issues with very large message volumes

---

### Thesis Document Service

- **Name**: Thesis Document Service
- **Location**:
  - Primary path(s): `src/app/api/documents/route.ts`, `src/services/thesis-feedback-service.ts`
  - Related folders: `src/components/editor.tsx`, `src/lib/document-templates.ts`

***

### Responsibilities

- **Primary responsibilities**
  - Manage thesis document lifecycle (create, read, update, delete)
  - Handle document versioning and collaboration features
  - Provide document analysis and feedback capabilities
- **Non‑responsibilities (explicitly out of scope)**
  - Does not handle UI rendering for document editor
  - Does not manage user authentication directly
  - Does not implement complex AI analysis (delegated to AI services)

***

### Public API (For Other Modules)

- **Exports / entrypoints**
  - HTTP endpoints for document operations
  - Server functions for document management
- **Input/Output contracts**
  - Input types: Document content, metadata, user permissions
  - Output types: Document data with version info and metadata

***

### Allowed Callers

- **Who can call this module**
  - Editor components for document operations
  - Server actions for document processing
  - API routes for external integrations
- **Forbidden call patterns**
  - Direct database access without proper validation
  - Cross-user document access without authorization

***

### Dependencies

- **Internal dependencies**
  - `src/integrations/supabase/server-client.ts` - Database access
  - `src/lib/puter-ai-facade.ts` - AI integration for document analysis
  - `src/lib/document-templates.ts` - Document templates
- **External dependencies**
  - Supabase Storage for document file storage
  - Next.js API routes framework
- **Direction constraints**
  - Depends on data access and AI services; not on UI layer

***

### Invariants and Guarantees

- **Invariants**
  - Document versions are properly tracked and immutable
  - User permissions are validated before document access
  - Document content is properly sanitized
- **Error handling rules**
  - Consistent error responses across all document operations
  - Proper handling of file size and format limitations

---

### Security and Access Control

- **Auth assumptions**
  - Requires valid user session for document operations
  - Validates document ownership and collaboration permissions
- **RLS / authorization coupling**
  - Enforces strict RLS policies for document access
  - Prevents unauthorized document viewing or modification

***

### Observability

- **Logging**
  - Logs all document operations with user and document IDs
  - Tracks document analysis and feedback operations
- **Metrics / analytics**
  - Monitors document storage usage
  - Tracks document collaboration metrics

***

### Example Usage

- **Code snippets**
  ```typescript
  // In a server action
  export async function updateDocument(documentId: string, content: string) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('documents')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('owner_id', user.id);

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return { success: true };
  }
  ```
- **Common misuse to avoid**
  - Bypassing permission checks
  - Direct storage access without proper validation

***

### Future Work / TODOs

- **Planned extensions**
  - Enhanced collaboration features with real-time editing
  - Advanced document analysis with AI integration
- **Known limitations**
  - Current versioning system may need optimization for very large documents