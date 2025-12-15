# Enterprise Topic Generator - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   EnterpriseTopicGenerator.tsx (React Component)         │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Header & Field Selection                            │ │   │
│  │  │ - Field dropdown                                    │ │   │
│  │  │ - Generate button                                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Filter Panel (Collapsible)                          │ │   │
│  │  │ - Feasibility slider                               │ │   │
│  │  │ - Innovation slider                                │ │   │
│  │  │ - Duration filter                                  │ │   │
│  │  │ - Sort options                                     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Analytics Dashboard                                 │ │   │
│  │  │ - Total ideas count                                │ │   │
│  │  │ - Avg feasibility score                            │ │   │
│  │  │ - Avg innovation score                             │ │   │
│  │  │ - Saved favorites count                            │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Topics Display Section                              │ │   │
│  │  │ - Card layouts (10 topics)                          │ │   │
│  │  │ - Score visualizations                             │ │   │
│  │  │ - Expandable details                               │ │   │
│  │  │ - Star/favorite buttons                            │ │   │
│  │  │ - Export controls                                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Favorites Section                                   │ │   │
│  │  │ - List of saved topics                             │ │   │
│  │  │ - Remove buttons                                   │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                         HTTP Request
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Route: /topic-ideas-pro/page.tsx                               │
│  - Page metadata                                                │
│  - Component rendering                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                         HTTP POST
                    (field + auth token)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│               SERVERLESS FUNCTION LAYER (Supabase)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Function: generate-topic-ideas-enterprise                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Authenticate User                                    │   │
│  │    - Verify JWT token                                  │   │
│  │    - Extract user ID                                   │   │
│  │    - Validate permissions                              │   │
│  │ ✓ User authenticated                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. Attempt AI Generation (Puter)                        │   │
│  │    - Call Puter AI API                                 │   │
│  │    - Send enriched prompt (scoring request)            │   │
│  │    - Parse JSON response                               │   │
│  │    - Validate topic count (10)                         │   │
│  │    - Validate score ranges (1-10)                      │   │
│  │ ✓ AI generation OR fallback                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. Fallback Generation (if AI fails)                    │   │
│  │    - Select field from 50+ curated topics              │   │
│  │    - Shuffle array (Fisher-Yates)                      │   │
│  │    - Select random 10                                  │   │
│  │    - Validate all fields present                       │   │
│  │ ✓ 10 topics with full enrichment                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. Return Results                                       │   │
│  │    - JSON response                                     │   │
│  │    - 10 enriched topics                                │   │
│  │    - All metadata included                             │   │
│  │ ✓ HTTP 200 with data                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                     HTTP Response (JSON)
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE PROCESSING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Parse Response & Update State                           │   │
│  │ - Store 10 topics in state                             │   │
│  │ - Stop loading indicator                               │   │
│  │ - Show success toast                                   │   │
│  │ ✓ Topics ready for display                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Apply Filters (useMemo - optimized)                     │   │
│  │ - Check feasibility threshold                          │   │
│  │ - Check innovation threshold                           │   │
│  │ - Check duration category                              │   │
│  │ - Apply all filters                                    │   │
│  │ ✓ Filtered topics list                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Apply Sorting                                           │   │
│  │ - Sort by relevance (default)                          │   │
│  │ - Sort by feasibility (high→low)                       │   │
│  │ - Sort by innovation (high→low)                        │   │
│  │ - Sort by duration (asc)                               │   │
│  │ ✓ Sorted filtered topics                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Calculate Analytics                                     │   │
│  │ - Count total displayed topics                         │   │
│  │ - Average feasibility score                            │   │
│  │ - Average innovation score                             │   │
│  │ - Count saved favorites                                │   │
│  │ ✓ Analytics data ready                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                               ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Render UI                                               │   │
│  │ - Display filtered topics                              │   │
│  │ - Show analytics dashboard                             │   │
│  │ - Render score visualizations                          │   │
│  │ - Display favorites section                            │   │
│  │ ✓ Professional UI displayed                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↓
                         User Interaction
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Click Star → Save Favorite → Update favorites list            │
│  Apply Filter → Re-filter topics → Update analytics            │
│  Change Sort → Re-sort topics → Update display                │
│  Expand Topic → Show details → Show research gap               │
│  Save Draft → Create document → Navigate to draft              │
│  Remove Favorite → Delete → Update favorites count             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Topic Generation Flow
```
User Input (Field)
        ↓
    Authenticate
        ↓
  Puter AI Request
        ↓
    ┌─ Success? ─┐
    │             │
   YES            NO
    ↓             ↓
  Parse      Fallback Pool
  Response       ↓
    ↓        Shuffle Topics
  Validate       ↓
  Response   Select 10
    ↓             ↓
   Return ←──────┘
```

### Filtering & Display Flow
```
Topics Loaded
    ↓
Apply Filters (useMemo)
    ├─ Feasibility check
    ├─ Innovation check
    └─ Duration check
    ↓
Apply Sort
    ├─ By relevance
    ├─ By feasibility
    ├─ By innovation
    └─ By duration
    ↓
Calculate Analytics
    ├─ Count topics
    ├─ Avg feasibility
    ├─ Avg innovation
    └─ Count favorites
    ↓
Render UI
```

### User Interaction Flow
```
User Action
    ↓
Update State
    ↓
Trigger useMemo
    ↓
Recalculate Derived Data
    ↓
Re-render Component
    ↓
Update Analytics
    ↓
Display Changes
```

## Component Hierarchy

```
EnterpriseTopicGenerator
├── Header Card
│   ├── Title
│   ├── Description
│   └── Settings Button
├── Generation Card
│   ├── Field Selector
│   └── Generate Button
├── Filter Panel (Conditional)
│   ├── Feasibility Slider
│   ├── Innovation Slider
│   ├── Duration Dropdown
│   └── Sort Dropdown
├── Analytics Card (Conditional)
│   ├── Stat: Total Ideas
│   ├── Stat: Avg Feasibility
│   ├── Stat: Avg Innovation
│   └── Stat: Favorites Count
├── Topics Section (Conditional)
│   ├── Section Header with Export Buttons
│   ├── Loading Skeletons (if loading)
│   └── Topics Grid
│       └── TopicCard (×10)
│           ├── Header with Title & Star
│           ├── Description
│           ├── Metrics Grid
│           │   ├── Feasibility Metric
│           │   ├── Innovation Metric
│           │   ├── Duration Metric
│           │   └── Resources Metric
│           ├── Expandable Details (Conditional)
│           │   ├── Research Gap
│           │   └── Action Buttons
└── Favorites Section (Conditional)
    └── FavoritesList
        └── FavoriteItem (×N)
```

## State Management

```typescript
Component State:
├── field: string                    // Selected field
├── ideas: TopicIdea[]              // Generated topics
├── isLoading: boolean              // Generation state
├── isSaving: boolean               // Save state
├── savedTopics: TopicIdea[]        // Favorites
├── expandedIndex: number | null    // Expanded topic
├── showFilters: boolean            // Filter panel visibility
└── filters: FilterOptions          // Filter configuration
    ├── feasibilityMin: number
    ├── innovationMin: number
    ├── duration: string
    └── sortBy: string

Computed State (useMemo):
└── filteredIdeas: TopicIdea[]      // Filtered & sorted
```

## Performance Optimizations

```
1. useMemo for filteredIdeas
   └─ Recalculates only when ideas or filters change
   └─ Avoids re-filtering on every render

2. Client-side filtering
   └─ Instant updates
   └─ No server roundtrips

3. Lazy UI rendering
   └─ Only render filtered topics
   └─ Collapse details by default

4. Toast notifications
   └─ Non-blocking feedback
   └─ Good UX without full page updates
```

## Security & Authentication

```
Request Flow:
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │ Include JWT in header
       ↓
┌──────────────────────────┐
│  Supabase Edge Function  │
├──────────────────────────┤
│ 1. Extract JWT           │
│ 2. Verify signature      │
│ 3. Extract user ID       │
│ 4. Check permissions     │
│ 5. Proceed if valid      │
└──────────────────────────┘
       │ If invalid: 401 Unauthorized
       │ If valid: Generate topics
       ↓
┌─────────────┐
│  Response   │
└─────────────┘
```

## Database Integration

```
Supabase Interaction:
┌──────────────────────┐
│ Save as Draft        │
└──────────┬───────────┘
           │
           ↓
    ┌─────────────────┐
    │ Supabase Client │
    ├─────────────────┤
    │ .from('documents')
    │ .insert({
    │   user_id,
    │   title,
    │   content
    │ })
    └─────────────────┘
           │
           ↓
    ┌─────────────────┐
    │ PostgreSQL DB   │
    └─────────────────┘
```

---

**Architecture Version**: 1.0 Enterprise
**Status**: Production Ready
**Last Updated**: November 2025
