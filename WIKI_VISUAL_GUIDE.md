# Wiki Integration - Visual Guide

## Access Points

### Option 1: Admin Dashboard Landing Page
```
/admin
│
├─ User Management Card
├─ Institution Requests Card
├─ Testimonials Card
├─ Payout Requests Card
├─ 🆕 Wiki Card (Orange) ← CLICK HERE
│   └─ View Wiki button → /admin/wiki
├─ MCP Servers Card
└─ Puter.js Integration Card
```

### Option 2: Admin Dashboard Tabs
```
/admin
│
Dashboard Tabs:
├─ User Management
├─ Institution Requests
├─ Testimonials
├─ Payout Requests
├─ Paper Search
├─ Logs
├─ 🆕 Wiki ← CLICK HERE
└─ MCP Servers
```

### Option 3: Direct URL
```
/admin/wiki
```

---

## Wiki Viewer Layout

```
┌─────────────────────────────────────────────────┐
│                  Code Wiki                       │
│          Central knowledge base with documentation, guides, and best practices              │
│                                                  │
│ [Back to Dashboard]                             │
└─────────────────────────────────────────────────┘

┌──────────────────────┐ ┌──────────────────────────┐
│     Wiki Sidebar     │ │   Content Panel          │
│ ┌──────────────────┐ │ ┌──────────────────────────┐
│ │ 📚 Wiki          │ │ │ # Page Title             │
│ │ Code docs        │ │ │ [Category Badge]         │
│ │                  │ │ │                          │
│ │ [Search box]     │ │ │ Page Description         │
│ │  🔍 Search wiki  │ │ │                          │
│ │                  │ │ ├──────────────────────────┤
│ │ ┌──────────────┐ │ │ │                          │
│ │ │ Home         │ │ │ │ # Section 1              │
│ │ │ Getting..    │ │ │ │                          │
│ │ │              │ │ │ │ Page content rendered    │
│ │ │ Architecture │ │ │ │ with proper markdown    │
│ │ │ Overview     │ │ │ │ formatting               │
│ │ │              │ │ │ │                          │
│ │ │ Code         │ │ │ │ ## Subsection            │
│ │ │ Standards ✓  │ │ │ │ (Selected)               │
│ │ │              │ │ │ │                          │
│ │ │ Technology   │ │ │ │ - List items             │
│ │ │ Stack        │ │ │ │ - Render properly        │
│ │ │              │ │ │ │                          │
│ │ └──────────────┘ │ │ │ ```code blocks          │
│ │                  │ │ │ render correctly        │
│ │ [Tip: Click...]  │ │ │ ```                      │
│ │                  │ │ │                          │
│ └──────────────────┘ │ │                          │
└──────────────────────┘ └──────────────────────────┘
```

---

## Features Visualization

### Search Function
```
Before Search:
┌─────────────────┐
│ Home            │
│ Getting Started │
│ Architecture    │
│ Code Standards  │
│ Technology      │
└─────────────────┘

User types: "standards"
        ↓

After Search:
┌─────────────────┐
│ Code Standards  │
└─────────────────┘
(Other pages filtered out)
```

### Page Loading
```
Click "Code Standards"
        ↓
Set selectedPage
        ↓
Fetch /api/wiki/Code-Standards
        ↓
Show loading skeleton
        ↓
Receive markdown content
        ↓
Render with ReactMarkdown
        ↓
Display formatted content
```

### Markdown Rendering
```
Raw Markdown:
# Code Standards & Guidelines

Development standards...

**Good:**
```typescript
const user = { id, name }
```

Rendered Output:
┌──────────────────────────────────┐
│                                  │
│  Code Standards & Guidelines     │  ← h1 formatted
│                                  │
│  Development standards...         │  ← paragraph
│                                  │
│  Good:                           │
│  ┌──────────────────────────────┐│
│  │const user = { id, name }    ││  ← code block
│  └──────────────────────────────┘│
│                                  │
└──────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ GET /admin/wiki
       ↓
┌─────────────────────────┐
│   Next.js Page Route    │
│ /admin/wiki/page.tsx    │
└──────┬──────────────────┘
       │ Render WikiViewer
       ↓
┌─────────────────────────┐
│   WikiViewer Component  │
└──────┬────────┬─────────┘
       │        │
       │ Mount  │ useEffect
       │        │
       ↓        ↓
    fetch("/api/wiki")
       │
       ↓
┌─────────────────────────┐
│  /api/wiki (route.ts)   │
│  - Read /docs/wiki/     │
│  - Extract titles       │
│  - Extract descriptions │
│  - Return JSON array    │
└──────┬──────────────────┘
       │ Response
       ↓
  [pages array]
       │
       ↓
  Render in sidebar
       │
       ↓ User clicks page
       │
    fetch("/api/wiki/Code-Standards")
       │
       ↓
┌──────────────────────────┐
│ /api/wiki/[slug]/route.ts│
│ - Read file              │
│ - Return markdown        │
└──────┬───────────────────┘
       │ Response
       ↓
  [markdown content]
       │
       ↓
  ReactMarkdown rendering
       │
       ↓
  [formatted HTML]
       │
       ↓
  Display in content panel
```

---

## File Organization

```
docs/
├── wiki/
│   ├── Home.md                    ← Wiki files
│   ├── Getting-Started.md
│   ├── Architecture-Overview.md
│   ├── Code-Standards.md
│   ├── Technology-Stack.md
│   └── INDEX.md
│
└── WIKI_QUICK_REFERENCE.md        ← User guide

src/
├── app/
│   ├── api/
│   │   └── wiki/
│   │       ├── route.ts           ← List endpoint
│   │       └── [slug]/
│   │           └── route.ts       ← Get endpoint
│   │
│   └── (app)/admin/
│       ├── wiki/
│       │   └── page.tsx           ← Wiki page
│       └── page.tsx               ← Updated
│
├── components/
│   ├── admin/
│   │   └── wiki-viewer.tsx        ← Main component
│   └── admin-dashboard.tsx        ← Updated
│
└── __tests__/
    └── admin/
        └── wiki-viewer.test.tsx   ← Tests
```

---

## Component Props & State

### WikiViewer Component

**State:**
```typescript
pages: WikiPage[]              // All pages
selectedPage: WikiPage | null  // Currently selected
content: string               // Page markdown
isLoading: boolean            // Fetching content
isLoadingPages: boolean       // Fetching page list
searchQuery: string           // Search input
```

**Props:** None (hooks internally)

**Methods:**
- `fetchPages()` - Get wiki pages list
- `loadWikiContent()` - Get page content
- `handleSelectPage()` - Switch pages

---

## API Response Examples

### GET /api/wiki
```json
{
  "pages": [
    {
      "title": "Home",
      "slug": "Home",
      "description": "Central knowledge base..."
    },
    {
      "title": "Code Standards",
      "slug": "Code-Standards",
      "description": "Development standards..."
    }
  ]
}
```

### GET /api/wiki/Code-Standards
```json
{
  "slug": "Code-Standards",
  "content": "# Code Standards & Guidelines\n\n...",
  "title": "Code Standards"
}
```

---

## User Interaction Flow

```
1. User navigates to /admin
              ↓
2. Sees admin dashboard with Wiki card
              ↓
3. Clicks "View Wiki" button
              ↓
4. Navigates to /admin/wiki
              ↓
5. WikiViewer loads pages from API
              ↓
6. Pages appear in sidebar (with loading state)
              ↓
7. User types in search box
              ↓
8. Pages filter in real-time
              ↓
9. User clicks a page
              ↓
10. Content loads (with loading skeleton)
              ↓
11. Markdown renders with proper formatting
              ↓
12. User can:
    - Read content
    - Search for more pages
    - Click other pages
    - Go back to dashboard
```

---

## Colors & Styling

### Wiki Card
- **Icon Background**: Orange-100
- **Icon Color**: Orange-600
- **Title**: "Wiki"
- **Description**: "Code documentation and guides"

### Sidebar
- **Background**: Card background
- **Selected Page**: Primary color with highlight
- **Unselected**: Ghost variant
- **Icon**: FileText (gray)

### Content Area
- **Headings**: Dark/light based on theme
- **Code Blocks**: Muted background with monospace font
- **Links**: Blue with underline
- **Borders**: Subtle dividers between sections

---

## Responsive Behavior

```
Desktop (lg and up):
┌─────────────────────────────────┐
│ 25% Sidebar │ 75% Content       │
└─────────────────────────────────┘

Tablet & Mobile (below lg):
┌─────────────────┐
│ 100% Content    │
│ (Sidebar stacked|
│  below on scroll)
└─────────────────┘
```

---

## Error States

```
Loading:        Skeleton placeholders
No pages:       "No pages found" message
No selection:   "Select a Wiki Page" prompt
Fetch error:    Error message displayed
Content error:  Fallback text shown
```

---

## Performance Metrics

- **Initial Load**: ~200-500ms (depends on wiki file count)
- **Page Switch**: ~100-300ms (fetch + render)
- **Search**: Instant (client-side)
- **Memory**: ~1-5MB (depends on wiki size)

---

This visual guide helps understand the wiki integration structure, flow, and user interactions.

**Ready to use!** Navigate to `/admin` and click the Wiki card to start exploring.
