# ThesisAI - Top 10 UX Fixes (Quick Reference)

## 1. 🔴 Fix Active Navigation Highlighting
**File**: `src/components/sidebar.tsx`
**Current Issue**: Navigation items don't highlight when viewing nested routes

**Fix**:
```typescript
// Change from:
pathname === item.href && "bg-accent text-accent-foreground"

// To:
const isActive = pathname === item.href || 
                 pathname.startsWith(item.href + '/');
isActive && "bg-accent text-accent-foreground"
```

---

## 2. 🔴 Add Unsaved Changes Warning
**File**: `src/components/document-editor.tsx` (or similar)
**Problem**: No warning when leaving with unsaved changes

**Fix**:
```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Continue?';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

---

## 3. 🔴 Add Error Handling to Async Operations
**Pattern for all async functions**:
```typescript
const handleSaveDocument = async () => {
  try {
    setIsLoading(true);
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    toast.success('Document saved!');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save';
    toast.error(`Save failed: ${message}`);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 4. 🔴 Add Empty States to All Lists/Widgets
**File**: `src/components/student-dashboard.tsx`
**Problem**: No indication when widgets are empty

**Fix**:
```typescript
{documents.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-semibold mb-2">No documents yet</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Create your first document to get started
    </p>
    <Button onClick={() => openNewDocumentDialog()}>
      Create Document
    </Button>
  </div>
) : (
  // Render documents
)}
```

---

## 5. 🔴 Increase Mobile Touch Targets
**File**: `src/components/sidebar.tsx`, `src/components/header.tsx`
**Problem**: Navigation links may be < 44px on mobile

**Fix**:
```typescript
// Change from:
"px-3 py-2 text-sm"

// To:
"px-4 py-3 md:px-3 md:py-2 text-sm md:text-xs"
// Ensures 44px+ height on mobile (16px text + 3px*2 padding + line-height)
```

---

## 6. 🟠 Implement Form Validation Error Display
**File**: `src/components/sign-up-form.tsx`
**Problem**: Unclear if validation errors are shown inline

**Fix**:
```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          type="email"
          className={cn(
            fieldState.error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage className="text-xs text-destructive">
          {fieldState.error.message}
        </FormMessage>
      )}
    </FormItem>
  )}
/>
```

---

## 7. 🟠 Add Skeleton Loaders to Data Pages
**File**: Any page with `useEffect` that fetches data
**Problem**: No loading indication while data loads

**Fix**:
```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

return <div>{/* content */}</div>;
```

---

## 8. 🟠 Dashboard Widget Customization
**File**: `src/components/student-dashboard.tsx`
**Problem**: Dashboard has 15+ widgets - too much info

**Fix**:
```typescript
const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
  const saved = localStorage.getItem('dashboardWidgets');
  return saved ? JSON.parse(saved) : ['activity', 'checklist', 'milestones'];
});

const toggleWidget = (id: string) => {
  const updated = visibleWidgets.includes(id)
    ? visibleWidgets.filter(w => w !== id)
    : [...visibleWidgets, id];
  setVisibleWidgets(updated);
  localStorage.setItem('dashboardWidgets', JSON.stringify(updated));
};

// In render:
{visibleWidgets.includes('activity') && <RecentActivityChart />}
{visibleWidgets.includes('checklist') && <ThesisChecklist />}
// etc...
```

---

## 9. 🟠 Add AI Tool Loading with Timeouts
**File**: AI tool components (TopicIdeasGenerator, OutlineGenerator, etc.)
**Problem**: No feedback for slow AI requests

**Fix**:
```typescript
const [elapsedTime, setElapsedTime] = useState(0);

useEffect(() => {
  if (!isLoading) return;
  const interval = setInterval(() => {
    setElapsedTime(t => t + 1);
  }, 1000);
  return () => clearInterval(interval);
}, [isLoading]);

return (
  <div>
    {isLoading && (
      <div className="space-y-2">
        <Skeleton className="h-64 w-full" />
        <p className="text-xs text-muted-foreground">
          Generating... {elapsedTime}s
          {elapsedTime > 5 && " (taking longer than usual)"}
        </p>
        <Button size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    )}
  </div>
);
```

---

## 10. 🟠 Implement Multi-Step Onboarding
**File**: Create `src/components/onboarding-flow.tsx`
**Problem**: No onboarding for new users

**Fix**:
```typescript
const OnboardingFlow = ({ isNewUser }: { isNewUser: boolean }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { title: 'Welcome', component: <WelcomeStep /> },
    { title: 'Select Role', component: <RoleStep /> },
    { title: 'University', component: <UniversityStep /> },
    { title: 'Preferences', component: <PreferencesStep /> },
  ];

  if (!isNewUser) return null;

  return (
    <Dialog open={true}>
      <DialogContent>
        <div className="mb-4">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
        {steps[step].component}
        <div className="flex gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (step < steps.length - 1) setStep(s => s + 1);
              else completeOnboarding();
            }}
          >
            {step === steps.length - 1 ? 'Start Writing' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Testing Checklist

After implementing fixes, test:
- [ ] Navigation highlights correctly on nested routes
- [ ] Try to leave page with unsaved content (warning appears)
- [ ] All async operations show success/error toast
- [ ] Empty lists show helpful CTA buttons
- [ ] Mobile buttons are easily tappable (44x44px minimum)
- [ ] Form validation errors display inline
- [ ] Loading states appear on data-fetching pages
- [ ] Dashboard widgets can be hidden/shown
- [ ] AI tools show loading progress and timeouts
- [ ] New users see onboarding flow

---

## Files to Audit

1. `src/components/sidebar.tsx` - Navigation highlighting
2. `src/components/document-editor.tsx` - Unsaved changes
3. All API call locations - Error handling
4. `src/components/student-dashboard.tsx` - Empty states & widgets
5. `src/components/sign-up-form.tsx` - Validation display
6. All data-fetching pages - Skeleton loaders
7. AI tool components - Loading states
8. `src/app/layout.tsx` - Add onboarding provider

---

**Priority**: Implement in order (1-5 are critical, 6-10 are high priority)
**Estimated effort**: 
- Items 1-5: 2-3 days
- Items 6-10: 3-5 days
