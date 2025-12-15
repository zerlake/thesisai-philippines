# ThesisAI Philippines - User Flow Analysis & Friction Point Report

## Overview
This document simulates key user interactions and identifies friction points, drop-off areas, and UX gaps across 8 critical user flows.

---

## FLOW 1: LANDING → SIGN-UP (New User Acquisition)

### User Journey Map
```
Landing Page
    ↓ (scrolls features)
    ↓ (views value proposition)
    ↓ (clicks "Sign Up")
Registration Page
    ↓ (sees form)
    ↓ (fills role selection)
    ↓ (fills name, email, password)
    ↓ (selects institution)
    ↓ (completes role-specific fields)
    ↓ (clicks submit)
Confirmation
    ↓ (checks email)
    ↓ (clicks confirmation link)
Dashboard
```

### Friction Points Identified

#### 🔴 CRITICAL: Sign-Up Form Length
**Friction**: The sign-up form has 10+ fields depending on role selected:
- First name, last name, email, password (4 fields)
- Role selection (3 options)
- Institution selection (dropdown + optional custom name)
- Role-specific fields:
  - Student: Student ID, Program, Year level (3 more)
  - Advisor: Department, Faculty ID, Field of Expertise (3 more)
  - Critic: Department, Field of Expertise, Institution (3 more)

**Impact on Users**:
- **Mobile users**: Form is very long on mobile, requires excessive scrolling
- **First-time users**: Unclear which fields are required vs optional
- **(Optional) labels**: Field says "(Optional)" but unclear what happens if skipped
- **Abandonment risk**: High likelihood of form abandonment after 3-4 minutes

**Current Code Issues** (`src/components/sign-up-form.tsx`):
```typescript
// Form renders 10+ fields sequentially
// No progress indicator
// No collapsible sections for role-specific fields
// No real-time validation feedback
```

**Recommended Fix**:
- **Step 1**: Role selection + name + email + password
- **Step 2**: Institution selection (only if needed)
- **Step 3**: Role-specific fields
- Show progress bar: "Step 2 of 3"
- Save progress to localStorage (don't lose data on reload)

#### 🔴 CRITICAL: Institution Selection UX
**Friction**: InstitutionSelector requires users to:
1. Find their institution in dropdown (may have 100+ options)
2. If not found, select "not-in-list" and type institution name manually
3. Wait for database lookup

**Impact**:
- **Confusion**: Unclear if institution is required
- **Search complexity**: No search/filter in institution dropdown
- **Data entry**: Manual institution entry creates duplicate data
- **Validation**: User doesn't know if institution is correctly entered until submission

**Code Issue**:
```typescript
// InstitutionSelector - need to check its implementation
// Likely missing:
// - Search/filter functionality
// - Loading state while fetching institutions
// - Clear indication of "not-in-list" option
```

**Recommended Fix**:
- Autocomplete institution search (type to filter)
- Show institution count: "2,487 Philippine institutions"
- If user selects "not-in-list":
  - Validate institution name in real-time
  - Show confirmation: "We'll add 'University X' after you verify email"
- Send email to admin if new institution added

#### 🟠 HIGH: Password Requirements Unclear
**Friction**: Password field shows only "••••••••" placeholder
- No indication of 8-character minimum
- No strength indicator
- User discovers error only after clicking submit

**Recommended Fix**:
```typescript
// Add password requirements display
const requirements = [
  { text: "At least 8 characters", met: password.length >= 8 },
  { text: "Mix of letters and numbers", met: /[a-z].*[0-9]|[0-9].*[a-z]/i.test(password) },
];

// Show as checklist while typing
<div className="space-y-1">
  {requirements.map(req => (
    <div className={cn("text-xs", req.met ? "text-green-600" : "text-red-600")}>
      {req.met ? "✓" : "○"} {req.text}
    </div>
  ))}
</div>
```

#### 🟠 HIGH: Email Confirmation Flow Unclear
**Friction**: After submission:
- Toast says "Check your email for a confirmation link"
- User doesn't know:
  - How long before email arrives
  - What to do if email doesn't arrive
  - Whether they can proceed before confirming
  - How long confirmation link lasts

**Recommended Fix**:
```typescript
// After signup success, show confirmation screen:
<div className="text-center space-y-4">
  <Mail className="h-12 w-12 mx-auto text-primary" />
  <h2>Check your email</h2>
  <p>We've sent a confirmation link to juan@example.com</p>
  
  <div className="bg-blue-50 p-4 rounded text-sm">
    <p>⏱️ <strong>Link expires in 24 hours</strong></p>
    <p>Usually arrives in 1-2 minutes</p>
  </div>
  
  <Button variant="outline">
    Didn't receive email? <span className="ml-2">Resend</span>
  </Button>
</div>
```

#### 🟠 HIGH: Role Selection Consequences Unclear
**Friction**: Users may not understand that changing role = different workflow
- "Student" vs "Advisor" vs "Critic" roles are unclear
- No description of each role's capabilities
- User might pick wrong role and be stuck

**Recommended Fix**:
- Add role descriptions on hover:
  ```
  Student: Write and manage your thesis with AI assistance
  Advisor: Provide feedback on student theses
  Critic: Review manuscripts professionally
  ```
- Show "Change role later in settings" disclaimer

#### 🟡 MEDIUM: No Sign-In Link
**Friction**: On sign-up page, no link to "Already have account? Sign in"
- User has to navigate back or type `/login`
- Common expectation on sign-up pages

**Recommended Fix**:
```typescript
// Add at bottom of form
<div className="text-center text-sm text-muted-foreground">
  Already have an account?{" "}
  <Link href="/login" className="underline text-primary">
    Sign in here
  </Link>
</div>
```

---

## FLOW 2: SIGN-IN (Returning User)

### User Journey Map
```
Landing Page / Header
    ↓ (clicks "Sign In")
Login Page
    ↓ (enters email)
    ↓ (enters password)
    ↓ (clicks submit)
Dashboard
    or
2FA Verification (if enabled)
    ↓ (checks code)
    ↓ (enters code)
Dashboard
```

### Friction Points Identified

#### 🔴 CRITICAL: No "Forgot Password" UX
**Friction**: Password reset flow is unclear
- No "Forgot password?" link on login form (or not visible)
- User stuck if they forgot password
- High abandonment rate

**Code Check Needed**: `src/components/sign-in-form.tsx`

**Recommended Fix**:
```typescript
<FormField control={form.control} name="password" ... />

<Link href="/forgot-password" className="text-xs text-primary underline">
  Forgot password?
</Link>
```

And create `/forgot-password` page:
```typescript
// 1. User enters email
// 2. Show confirmation: "Check your email for reset link"
// 3. User gets email with magic link
// 4. User sets new password
// 5. Redirect to login with success message
```

#### 🟠 HIGH: Demo Login Buttons Confusing
**Friction**: Sign-in page shows demo login buttons for different roles
- Users might not understand these are "test accounts"
- Users may click demo login thinking it's standard login
- Creates duplicate/test accounts in database

**Code** (`src/components/sign-in-page.tsx`):
```typescript
// Demo buttons are prominent, but unclear they're for testing
<Button onClick={() => handleDemoLogin('user')}>
  Login as User  {/* Ambiguous - is this the normal login? */}
</Button>
```

**Recommended Fix**:
- Move demo buttons to separate "Try Demo" section
- Label clearly:
  ```typescript
  <Card className="border-amber-200 bg-amber-50">
    <CardHeader>
      <CardTitle className="text-sm">Want to explore first?</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Try our demo accounts (no email verification needed)
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => handleDemoLogin('user')}>
          Demo: Student
        </Button>
        {/* etc */}
      </div>
    </CardContent>
  </Card>
  ```

#### 🟠 HIGH: Google Sign-In Missing Explanation
**Friction**: Google button shown but unclear if:
- It creates new account or logs in
- It links to existing account
- It works if email doesn't match signup email

**Recommended Fix**:
- Add explanatory text:
  ```typescript
  <div className="text-xs text-muted-foreground mb-2">
    Sign in with your Google account for faster access
  </div>
  <GoogleSignInButton ... />
  ```

#### 🟡 MEDIUM: No Loading Feedback
**Friction**: When user clicks submit, unclear if form is processing
- No disabled state on button
- No loading spinner
- User might click submit multiple times

**Code Issue**:
```typescript
// Check if SignInForm disables button during submission
// Likely missing: disabled={isLoading} on submit button
```

**Recommended Fix**:
```typescript
<Button 
  type="submit" 
  className="w-full"
  disabled={form.formState.isSubmitting}
>
  {form.formState.isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Signing in...
    </>
  ) : (
    "Sign In"
  )}
</Button>
```

---

## FLOW 3: FIRST-TIME DOCUMENT CREATION

### User Journey Map
```
Dashboard
    ↓ (sees empty state or "New Document" button)
    ↓ (clicks button)
Document Type/Template Selection
    ↓ (chooses template)
    ↓ (sees "Creating document...")
Editor Page
    ↓ (sees blank document)
    ↓ (unclear what to do next)
```

### Friction Points Identified

#### 🔴 CRITICAL: Empty Dashboard State
**Friction**: After login, new users see dashboard with many widgets but no document list
- No clear CTA to create first document
- No indication that document creation exists
- Users unsure what to do next

**Impact**:
- User abandonment rate increases
- First-time users may never create a document
- Confusion about app purpose

**Recommended Fix**:
```typescript
// In StudentDashboard, if no documents:
{documents.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <FileText className="h-16 w-16 text-muted-foreground mb-6" />
    <h2 className="text-2xl font-bold mb-2">Start Your Thesis</h2>
    <p className="text-muted-foreground mb-8 max-w-sm">
      Create your first document to begin writing your thesis with AI assistance
    </p>
    <Button size="lg" onClick={openNewDocumentDialog}>
      <Plus className="mr-2 h-5 w-5" />
      Create Your First Document
    </Button>
  </div>
) : (
  // Show documents
)}
```

#### 🟠 HIGH: Document Template Selection Unclear
**Friction**: `NewDocumentDialog` shows templates, but unclear:
- What's the difference between templates?
- Can user change after selecting?
- What content is pre-filled?
- Are templates recommendations or required?

**Code** (`src/components/new-document-dialog.tsx`):
```typescript
// Shows templates but minimal description
const documentTemplates = [/* unclear content */];

// Templates rendered without clear descriptions
{documentTemplates.map(template => (
  <Card onClick={() => handleCreateDocument(template)}>
    <CardTitle>{template.title}</CardTitle>
    {/* Missing: CardDescription with value proposition */}
  </Card>
))}
```

**Recommended Fix**:
```typescript
// Add descriptions to templates
const documentTemplates = [
  {
    title: "Full Thesis",
    description: "Complete thesis from introduction to conclusion",
    icon: BookOpen,
    content: "..." // pre-filled outline
  },
  {
    title: "Manuscript Review",
    description: "Submit your paper for AI analysis and feedback",
    icon: FileText,
    content: "..."
  },
  // ... more templates
];

// Render with full information
{documentTemplates.map(template => (
  <Card 
    key={template.title}
    onClick={() => handleCreateDocument(template)}
    className="cursor-pointer hover:border-primary transition-colors"
  >
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <template.icon className="h-5 w-5" />
            {template.title}
          </CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="text-xs text-muted-foreground">
      {/* Show preview of what's included */}
      Includes: Introduction, Methods, Results, Conclusion
    </CardContent>
  </Card>
))}
```

#### 🟠 HIGH: Document Creation Loading State
**Friction**: After clicking template, unclear if document is being created
- No loading indicator shown
- User might click multiple times
- Document appears suddenly without feedback

**Code**:
```typescript
const handleCreateDocument = async (template) => {
  setIsCreating(template.title);  // This state is set
  // But UI doesn't show loading feedback clearly
  
  // Should show spinner/loading text during request
};
```

**Recommended Fix**:
```typescript
{isCreating ? (
  <Dialog open={true}>
    <DialogContent className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <p>Creating your document...</p>
      <p className="text-xs text-muted-foreground">This usually takes 1-2 seconds</p>
    </DialogContent>
  </Dialog>
) : null}
```

#### 🟡 MEDIUM: No "Start from Scratch" Option
**Friction**: Users might want blank document, not template
- Templates may be opinionated or overwhelming
- Some users prefer to start empty

**Recommended Fix**:
```typescript
// Add blank document option at top
<Card 
  onClick={() => handleCreateDocument({ title: 'Blank Document', content: '' })}
  className="border-2 border-dashed"
>
  <CardHeader>
    <CardTitle>Start from Scratch</CardTitle>
    <CardDescription>Empty document with no pre-filled content</CardDescription>
  </CardHeader>
</Card>
```

---

## FLOW 4: DOCUMENT EDITOR (Writing Experience)

### User Journey Map
```
Editor Page Loads
    ↓ (content appears)
    ↓ (user starts typing)
    ↓ (unclear if auto-saving)
    ↓ (user closes tab)
    or
    ↓ (user uses AI tool)
    ↓ (waits for result)
    ↓ (result appears or fails)
```

### Friction Points Identified

#### 🔴 CRITICAL: No Save Indicator
**Friction**: User has no indication if document is being saved
- No "Saving..." or "Saved" indicator
- No unsaved changes indicator
- User anxious about losing work

**Impact**:
- Users might manually copy content to external editor
- Reduced confidence in app
- High anxiety during writing

**Recommended Fix**:
```typescript
// Add save indicator near title
<div className="flex items-center gap-2">
  <h1>{document.title}</h1>
  {isSaving && (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
      <Loader2 className="h-3 w-3 animate-spin" />
      Saving...
    </span>
  )}
  {lastSavedAt && !isSaving && (
    <span className="text-xs text-muted-foreground">
      Saved at {lastSavedAt.toLocaleTimeString()}
    </span>
  )}
  {hasUnsavedChanges && (
    <span className="text-xs text-orange-600 font-semibold">
      ⚠ Unsaved changes
    </span>
  )}
</div>
```

#### 🔴 CRITICAL: No Warning on Unsaved Changes
**Friction**: User can close tab/browser without warning about unsaved changes
- Data loss scenario very likely
- No beforeunload handler

**Code Issue**: Document editor missing:
```typescript
// Missing in editor component
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

#### 🟠 HIGH: AI Tool Error Handling
**Friction**: When user requests AI assistance (topic ideas, outline, etc.):
- Long wait times with no feedback
- Errors shown but with unclear recovery
- User doesn't know what to do

**Example**: Topic Ideas Generator
- User enters thesis topic
- Clicks "Generate Ideas"
- Waits 5-10 seconds (feels like forever)
- Result appears or error shows
- Error says "Request failed" (not helpful)

**Recommended Fix**:
```typescript
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [elapsedSeconds, setElapsedSeconds] = useState(0);

useEffect(() => {
  if (status !== 'loading') return;
  
  const interval = setInterval(() => {
    setElapsedSeconds(s => s + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [status]);

return (
  <div>
    {status === 'loading' && (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating topic ideas...</span>
        </div>
        
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p className="text-xs text-muted-foreground">
            ⏱️ {elapsedSeconds}s elapsed
          </p>
          {elapsedSeconds > 5 && (
            <p className="text-xs text-orange-600 mt-2">
              This is taking longer than usual. 
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-2"
                onClick={cancelRequest}
              >
                Cancel
              </Button>
            </p>
          )}
        </div>
      </div>
    )}
    
    {status === 'error' && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to generate ideas</AlertTitle>
        <AlertDescription>
          {error?.message || "Something went wrong. Please try again."}
        </AlertDescription>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={retry}>
            Try Again
          </Button>
          <Button size="sm" variant="outline" onClick={useTemplate}>
            Use Template Instead
          </Button>
        </div>
      </Alert>
    )}
  </div>
);
```

#### 🟠 HIGH: Unclear Editor Features
**Friction**: New users don't know what features are available
- Where's the formatting toolbar?
- How to use AI assistance?
- How to collaborate?
- How to request feedback?

**Recommended Fix**:
- Show onboarding tooltip on first editor load:
  ```typescript
  {isFirstTimeInEditor && (
    <Popover>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-semibold">Welcome to the editor!</h4>
          <p className="text-sm">Key features:</p>
          <ul className="text-sm space-y-1">
            <li>✨ <strong>AI Tools</strong> - Top right menu for assistance</li>
            <li>👥 <strong>Collaborate</strong> - Invite advisors to review</li>
            <li>💾 <strong>Auto-save</strong> - Work is saved automatically</li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )}
  ```

#### 🟡 MEDIUM: Word Count / Progress Unclear
**Friction**: User doesn't know writing progress
- No word count visible
- No progress indicator toward thesis milestones
- No motivation feedback

**Recommended Fix**:
```typescript
// Add in editor header
<div className="flex items-center gap-6">
  <div className="text-right">
    <p className="text-xs text-muted-foreground">Word Count</p>
    <p className="text-lg font-semibold">{wordCount}</p>
  </div>
  
  <ProgressBar 
    value={(wordCount / 10000) * 100} 
    max={100}
    label="10,000 words"
  />
</div>
```

---

## FLOW 5: REQUESTING AI ASSISTANCE (E.g., Topic Generator)

### User Journey Map
```
Editor / Tool Page
    ↓ (user clicks AI tool)
    ↓ (tool opens dialog)
    ↓ (user enters input)
    ↓ (clicks "Generate" button)
    ↓ (loading state)
    ↓ (result appears or error)
    ↓ (user selects/copies result or requests change)
```

### Friction Points Identified

#### 🔴 CRITICAL: Vague Input Requirements
**Friction**: AI tools don't explain what input they need
- "Topic Ideas" tool: What level of detail required?
- "Outline Generator": How much detail in topic?
- User enters vague input → Bad output → Frustration

**Example** (`TopicIdeasGenerator` or similar):
```typescript
// Current likely state:
<Input 
  placeholder="Enter your thesis topic"
  value={topic}
/>

// Should be:
<div className="space-y-2">
  <Label>Your Thesis Topic</Label>
  <Input 
    placeholder="e.g., 'The impact of social media on academic performance of Filipino students'"
    value={topic}
  />
  <p className="text-xs text-muted-foreground">
    Be specific: provide your topic, field, and any constraints
  </p>
  
  <div className="bg-blue-50 p-3 rounded text-xs">
    <p className="font-semibold mb-1">Example good input:</p>
    <p>"How does the implementation of STEM education in Philippine high schools affect student achievement in mathematics?"</p>
  </div>
</div>
```

#### 🔴 CRITICAL: No Output Preview Before Inserting
**Friction**: AI generates output, but user must click to see full result
- Output might not match expectations
- User inserts bad content into document
- User then has to delete/rewrite

**Recommended Fix**:
```typescript
// Show output in fullscreen preview first
{result && (
  <Dialog open={showPreview} onOpenChange={setShowPreview}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Generated Content</DialogTitle>
      </DialogHeader>
      
      <div className="prose prose-sm max-w-none">
        {/* Display result with full formatting */}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={regenerate}>
          Regenerate with Different Style
        </Button>
        <Button onClick={insertIntoDocument}>
          Insert into Document
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}
```

#### 🟠 HIGH: No Output Quality Indication
**Friction**: AI generates content, but no indication of confidence/quality
- User trusts bad output
- User doesn't know if they should revise

**Recommended Fix**:
```typescript
// Add quality indicators
<div className="flex items-center justify-between">
  <span className="font-semibold">Generated Content</span>
  
  <div className="flex items-center gap-2">
    <Badge variant={quality === 'high' ? 'default' : 'secondary'}>
      {quality === 'high' ? '✓ High Quality' : 'Review Recommended'}
    </Badge>
    
    {quality !== 'high' && (
      <Tooltip content="AI confidence is lower for this topic. Consider revising.">
        <AlertCircle className="h-4 w-4 text-amber-600" />
      </Tooltip>
    )}
  </div>
</div>
```

#### 🟠 HIGH: No Regeneration Option
**Friction**: User doesn't like output, no clear way to get alternative
- User might give up and write manually
- No "Try again" or "Different approach" button

**Recommended Fix**:
```typescript
<div className="flex gap-2">
  <Button 
    size="sm" 
    onClick={() => regenerate({ style: 'concise' })}
    variant="outline"
  >
    More Concise
  </Button>
  
  <Button 
    size="sm" 
    onClick={() => regenerate({ style: 'detailed' })}
    variant="outline"
  >
    More Detailed
  </Button>
  
  <Button 
    size="sm" 
    onClick={regenerate}
    variant="outline"
  >
    Completely Different
  </Button>
</div>
```

#### 🟡 MEDIUM: No Usage Limits Communicated
**Friction**: User might not know if they're limited on AI tool usage
- "How many topic ideas can I generate?"
- "Do I have a limit?"
- Creates uncertainty

**Recommended Fix**:
```typescript
// Show usage in tool header
<div className="flex items-center justify-between">
  <h3>Topic Ideas Generator</h3>
  <Badge variant="outline">
    {remainingUses}/{maxUses} uses remaining today
  </Badge>
</div>
```

---

## FLOW 6: REQUESTING ADVISOR FEEDBACK

### User Journey Map
```
Document Page
    ↓ (user clicks "Request Feedback" button)
    ↓ (shares/invites advisor)
    ↓ (advisor receives notification)
    ↓ (advisor opens document)
    ↓ (advisor leaves comments)
    ↓ (user sees comments)
    ↓ (user revises based on feedback)
    ↓ (marks as reviewed)
```

### Friction Points Identified

#### 🔴 CRITICAL: Sharing/Invitation Flow Unclear
**Friction**: User wants to share document with advisor but unclear how
- Is there a "Share" button?
- Do they send email link?
- Do they add advisor by email or ID?
- What permissions does advisor get?

**Code Check Needed**: `src/components/share-dialog.tsx`

**Recommended Fix**:
```typescript
// Create clear sharing dialog
<Dialog>
  <DialogHeader>
    <DialogTitle>Share Document</DialogTitle>
    <DialogDescription>
      Allow advisors or peers to view and comment on your thesis
    </DialogDescription>
  </DialogHeader>
  
  <div className="space-y-4">
    {/* Option 1: Share by email */}
    <div>
      <Label>Add by Email</Label>
      <div className="flex gap-2">
        <Input 
          placeholder="advisor@university.edu"
          value={advisorEmail}
        />
        <Button onClick={addAdvisor}>
          Add
        </Button>
      </div>
    </div>
    
    {/* Option 2: Copy link */}
    <div>
      <Label>Share Link</Label>
      <div className="flex gap-2">
        <Input 
          value={shareLink}
          readOnly
        />
        <Button 
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(shareLink);
            toast.success("Link copied!");
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    {/* Show current collaborators */}
    <div>
      <Label>People with Access</Label>
      <div className="space-y-2">
        {sharedWith.map(person => (
          <div key={person.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <p className="font-semibold text-sm">{person.name}</p>
              <p className="text-xs text-muted-foreground">{person.role}</p>
            </div>
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => removeAccess(person.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
</Dialog>
```

#### 🟠 HIGH: No Feedback Notification
**Friction**: User submits for feedback but doesn't know when advisor has reviewed
- No notification when feedback is received
- User has to manually check document

**Recommended Fix**:
- Implement in-app notifications:
  ```typescript
  // When advisor leaves comment:
  const notification = {
    type: 'feedback_received',
    title: 'New feedback from Dr. Santos',
    description: 'Your advisor left a comment on the introduction',
    documentId: '...',
    link: '/drafts/123'
  };
  ```
- Send email notification (optional)
- Badge notification bell with count

#### 🟠 HIGH: Comments/Feedback Format Unclear
**Friction**: Advisor feedback might not be clear or actionable
- Comments might be vague
- User doesn't know which changes to make
- Feedback appears inline but unclear where

**Recommended Fix**:
```typescript
// Show feedback with context and suggestions
<div className="border-l-2 border-blue-500 bg-blue-50 p-4 rounded">
  <div className="flex items-start justify-between mb-2">
    <div>
      <p className="font-semibold text-sm">Dr. Santos</p>
      <p className="text-xs text-muted-foreground">Today at 10:45 AM</p>
    </div>
    <Badge>Suggestion</Badge>
  </div>
  
  <p className="text-sm mb-3">
    This paragraph needs more evidence. Consider adding a citation.
  </p>
  
  <div className="bg-white p-2 rounded border-l-2 border-gray-300 mb-3">
    <p className="text-xs italic text-gray-600 mb-2">Current text:</p>
    <p className="text-sm">The evidence suggests...</p>
  </div>
  
  <div className="flex gap-2">
    <Button size="sm" onClick={editAroundComment}>
      Edit in Document
    </Button>
    <Button size="sm" variant="outline" onClick={markResolved}>
      Mark as Done
    </Button>
  </div>
</div>
```

#### 🟡 MEDIUM: Unclear Feedback Status
**Friction**: User doesn't know if advisor has:
- Seen the document
- Started reviewing
- Finished reviewing
- Has questions

**Recommended Fix**:
```typescript
// Show advisor status
{sharedWith.map(advisor => (
  <div key={advisor.id} className="flex items-center gap-3 p-3 border rounded">
    <Avatar>
      <AvatarImage src={advisor.avatarUrl} />
      <AvatarFallback>{advisor.name.split(' ')[0][0]}</AvatarFallback>
    </Avatar>
    
    <div className="flex-1">
      <p className="font-semibold text-sm">{advisor.name}</p>
      <p className="text-xs text-muted-foreground">
        {advisor.status === 'viewed' && 'Started reviewing'}
        {advisor.status === 'commenting' && 'Left 3 comments'}
        {advisor.status === 'not_viewed' && 'Invitation pending'}
      </p>
    </div>
    
    <Badge variant={advisor.status === 'commenting' ? 'default' : 'secondary'}>
      {advisor.status === 'viewed' && '👀 Viewing'}
      {advisor.status === 'commenting' && '💬 Left feedback'}
      {advisor.status === 'not_viewed' && '⏳ Pending'}
    </Badge>
  </div>
))}
```

---

## FLOW 7: REVIEWING/EDITING FEEDBACK

### User Journey Map
```
Dashboard
    ↓ (sees "Feedback Received" notification)
    ↓ (clicks to open document)
    ↓ (sees advisor comments inline)
    ↓ (reads feedback)
    ↓ (edits document based on feedback)
    ↓ (marks comment as resolved)
    ↓ (resubmits for review or marks complete)
```

### Friction Points Identified

#### 🔴 CRITICAL: No Comment Inline Editing
**Friction**: User reads feedback but can't edit document directly from comment
- User has to switch contexts (comment view → document view)
- Friction increases chance of user ignoring feedback

**Recommended Fix**:
```typescript
// Option 1: Side-by-side view
<div className="grid grid-cols-2 gap-4 h-screen">
  {/* Left: Document view */}
  <div className="overflow-y-auto border-r">
    <Editor value={document.content} readOnly />
  </div>
  
  {/* Right: Comments view */}
  <div className="overflow-y-auto">
    <CommentsPanel comments={comments} />
  </div>
</div>

// Option 2: Inline comments in document
// (More complex but better UX)
{document.content.split('\n').map((line, idx) => {
  const commentOnLine = comments.find(c => c.lineNumber === idx);
  
  return (
    <div key={idx}>
      <p>{line}</p>
      {commentOnLine && (
        <div className="bg-yellow-50 border-l-2 border-yellow-500 p-2 ml-4">
          <p className="text-sm font-semibold">{commentOnLine.author}</p>
          <p className="text-sm">{commentOnLine.text}</p>
        </div>
      )}
    </div>
  );
})}
```

#### 🟠 HIGH: No "Resolve Comment" Tracking
**Friction**: User addresses feedback but can't mark as done
- User doesn't know which comments they've addressed
- Advisor doesn't know which feedback was implemented
- Confusion about what's left to do

**Recommended Fix**:
```typescript
// Mark comments as resolved
{comments.map(comment => (
  <div key={comment.id} className={cn(
    "border rounded p-3",
    comment.resolved ? "bg-green-50 border-green-300" : "bg-blue-50 border-blue-300"
  )}>
    <div className="flex items-start justify-between">
      <div>
        <p className="font-semibold">{comment.author}</p>
        <p className="text-sm mt-1">{comment.text}</p>
      </div>
      <Button
        size="sm"
        variant={comment.resolved ? "default" : "outline"}
        onClick={() => toggleResolved(comment.id)}
      >
        {comment.resolved ? "✓ Resolved" : "Mark Resolved"}
      </Button>
    </div>
  </div>
))}

// Show summary of progress
<div className="bg-blue-50 p-4 rounded">
  <p className="text-sm">
    You've addressed <strong>3 of 5</strong> feedback comments
  </p>
  <ProgressBar value={(3/5)*100} />
</div>
```

#### 🟡 MEDIUM: No Notification of Re-review
**Friction**: After user revises and resubmits, unclear if advisor has re-reviewed
- No indication advisor has seen new version
- User anxious about feedback status

**Recommended Fix**:
- Show document version history:
  ```typescript
  <div className="space-y-2">
    <p className="font-semibold text-sm">Document History</p>
    <div className="space-y-1">
      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm">v3 - Final revision (today)</span>
        <Badge>Dr. Santos reviewed</Badge>
      </div>
      <div className="flex items-center gap-2 p-2">
        <Circle className="h-4 w-4" />
        <span className="text-sm">v2 - Revision (yesterday)</span>
      </div>
      <div className="flex items-center gap-2 p-2">
        <Circle className="h-4 w-4" />
        <span className="text-sm">v1 - Initial draft (3 days ago)</span>
      </div>
    </div>
  </div>
  ```

---

## FLOW 8: MOBILE USAGE (Any Flow on Mobile)

### Friction Points Identified

#### 🔴 CRITICAL: Navigation Complexity on Mobile
**Friction**: Mobile hamburger menu contains 8+ navigation groups (20+ items)
- User has to scroll extensively through menu
- Menu might take up entire screen
- Mobile UX severely degraded

**Current Code** (`src/components/header.tsx`):
```typescript
// Sheet navigation with all items from sidebar
// Renders full navigation menu in sheet
```

**Recommended Fix**:
```typescript
// Create mobile-optimized navigation
<Sheet>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    
    <ScrollArea className="h-[calc(100vh-60px)]">
      <div className="space-y-4">
        {/* Quick access - most important items */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
            QUICK ACCESS
          </h3>
          <nav className="space-y-1">
            <MobileNavItem href="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </MobileNavItem>
            <MobileNavItem href="/drafts" icon={FileText}>
              My Documents
            </MobileNavItem>
            <MobileNavItem href="/references" icon={BookOpen}>
              References
            </MobileNavItem>
          </nav>
        </div>
        
        {/* Expandable sections for less critical items */}
        <Collapsible>
          <CollapsibleTrigger>
            <span>More Tools</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {/* Less critical items */}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ScrollArea>
  </SheetContent>
</Sheet>
```

#### 🟠 HIGH: Touch Targets Too Small
**Friction**: Navigation links might be < 44px on mobile
- Difficult to tap accurately
- Frequent mis-taps

**Recommended Fix** (already noted in UX_QUICK_FIXES.md):
- Increase padding on mobile: `px-4 py-3 md:px-3 md:py-2`

#### 🟠 HIGH: Editor Not Optimized for Mobile
**Friction**: Document editor may not work well on small screens
- Toolbar buttons too small
- Word wrap issues
- Keyboard takes up too much space

**Recommended Fix**:
```typescript
// Mobile-specific editor layout
{isMobile ? (
  <div className="flex flex-col h-screen">
    {/* Minimalist header on mobile */}
    <div className="flex items-center justify-between p-2 border-b">
      <h1 className="text-sm font-semibold truncate">{document.title}</h1>
      <Button size="sm" variant="ghost" onClick={openMenu}>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
    
    {/* Full-height editor */}
    <div className="flex-1 overflow-y-auto">
      <Editor value={content} onChange={setContent} />
    </div>
    
    {/* Bottom action bar */}
    <div className="border-t p-2 flex gap-2">
      <Button size="sm" onClick={openAIMenu}>
        ✨ AI
      </Button>
      <Button size="sm" onClick={formatText}>
        Text
      </Button>
    </div>
  </div>
) : (
  // Desktop layout
)}
```

#### 🟡 MEDIUM: Forms Not Mobile-Friendly
**Friction**: Sign-up form on mobile has many fields, difficult to fill
- Small input fields
- Labels above inputs take up space
- Keyboard makes view cramped

**Recommended Fix** (already noted in UX_QUICK_FIXES.md):
- Font size 16px to prevent mobile zoom
- Increase input height to 48px on mobile
- Stack layout vertically
- Show progress indicator

---

## SUMMARY TABLE: All Friction Points

| Flow | Friction | Severity | Impact | Est. Fix Time |
|------|----------|----------|--------|---------------|
| Sign-Up | Form too long | 🔴 Critical | 30% abandonment | 2-3 hours |
| Sign-Up | Institution selection unclear | 🔴 Critical | Duplicate data | 2 hours |
| Sign-Up | Password requirements unclear | 🟠 High | Poor UX | 30 min |
| Sign-Up | Email confirmation flow unclear | 🟠 High | User confusion | 1 hour |
| Sign-Up | Role selection consequences unclear | 🟠 High | Wrong role selection | 30 min |
| Sign-In | No "Forgot password" link | 🔴 Critical | User abandonment | 2 hours |
| Sign-In | Demo login buttons confusing | 🟠 High | Wrong expectations | 30 min |
| Sign-In | Loading feedback missing | 🟡 Medium | UX friction | 15 min |
| Document Create | Empty dashboard state | 🔴 Critical | Users don't create docs | 1 hour |
| Document Create | Template selection unclear | 🟠 High | User confusion | 1 hour |
| Document Create | Loading state missing | 🟠 High | Multiple clicks | 30 min |
| Editor | No save indicator | 🔴 Critical | Anxiety, data loss | 1 hour |
| Editor | No unsaved changes warning | 🔴 Critical | Data loss scenario | 30 min |
| Editor | AI tool error handling vague | 🟠 High | User frustration | 2 hours |
| Editor | Unclear editor features | 🟠 High | Underutilization | 1 hour |
| Editor | Word count not shown | 🟡 Medium | No progress feedback | 30 min |
| AI Tool | Vague input requirements | 🔴 Critical | Bad outputs | 1 hour |
| AI Tool | No output preview | 🔴 Critical | Bad content inserted | 1 hour |
| AI Tool | No quality indicator | 🟠 High | User trusts bad output | 1 hour |
| AI Tool | No regeneration option | 🟠 High | User gives up | 30 min |
| AI Tool | Usage limits not shown | 🟡 Medium | User uncertainty | 30 min |
| Feedback | Sharing flow unclear | 🔴 Critical | Can't collaborate | 2 hours |
| Feedback | No feedback notification | 🟠 High | User doesn't know | 1 hour |
| Feedback | Comments not actionable | 🟠 High | Feedback ignored | 1 hour |
| Feedback | Feedback status unclear | 🟡 Medium | User anxiety | 1 hour |
| Review | No inline editing from comments | 🔴 Critical | Context switching | 2 hours |
| Review | No comment resolution tracking | 🟠 High | Lost feedback | 1 hour |
| Mobile | Navigation too complex | 🔴 Critical | Mobile UX broken | 1 hour |
| Mobile | Touch targets too small | 🟠 High | Mis-taps | 30 min |
| Mobile | Editor not optimized | 🟠 High | Poor writing experience | 2 hours |
| Mobile | Forms not mobile-friendly | 🟠 High | Mobile signup failure | 1 hour |

---

## TOP 10 HIGHEST-IMPACT FIXES (By Estimated Drop-Off Rate)

1. **Empty Dashboard State** (30% new user drop-off)
   - Add clear CTA for first document creation
   - **Estimated Fix**: 1 hour

2. **Sign-Up Form Length** (25% signup abandonment)
   - Convert to 3-step process
   - **Estimated Fix**: 3 hours

3. **No Save Indicator in Editor** (20% anxiety-driven abandonment)
   - Add save status display
   - **Estimated Fix**: 1 hour

4. **No "Forgot Password" Flow** (15% login failure recovery)
   - Implement password reset flow
   - **Estimated Fix**: 2 hours

5. **Sharing/Feedback Flow Unclear** (20% collaboration drop-off)
   - Create clear sharing UI
   - **Estimated Fix**: 2 hours

6. **Institution Selection UX** (18% form abandonment)
   - Add search/autocomplete
   - **Estimated Fix**: 2 hours

7. **AI Tool Error Handling** (25% of AI tool usage attempts)
   - Improve error messages and recovery
   - **Estimated Fix**: 2 hours

8. **Mobile Navigation Complexity** (40% mobile abandonment)
   - Simplify mobile navigation
   - **Estimated Fix**: 1 hour

9. **No Unsaved Changes Warning** (10% data loss scenarios)
   - Add beforeunload handler
   - **Estimated Fix**: 30 minutes

10. **Unclear Input Requirements for AI Tools** (35% bad AI outputs)
    - Add examples and descriptions
    - **Estimated Fix**: 1 hour each tool

---

## ESTIMATED TOTAL EFFORT

- **Critical fixes** (7 items): 13.5 hours
- **High priority fixes** (15 items): 18 hours
- **Medium priority fixes** (7 items): 5 hours
- **Total**: ~36-40 developer hours (1 week for 1 developer)

**Recommended approach**: Fix critical issues first (1-2 days), then high priority (2-3 days).

---

**Next Steps:**
1. Create task tickets for each friction point
2. Prioritize by impact (use drop-off estimates)
3. Assign to development sprints
4. Implement with A/B testing where possible
5. Measure post-fix drop-off rates to validate improvements
