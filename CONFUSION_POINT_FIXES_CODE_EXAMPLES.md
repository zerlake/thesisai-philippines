# ThesisAI - UX Confusion Point Fixes (Code Examples)

This document provides **copy-paste ready** code examples for fixing the top 18 confusion points.

---

## 1. FIX: Sign-Up Form Too Long → Convert to 3-Step Form

**File**: `src/components/sign-up-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type FormStep = 'role' | 'institution' | 'confirmation';

export function SignUpForm() {
  const [step, setStep] = useState<FormStep>('role');
  const form = useForm({ mode: 'onBlur' });

  const totalSteps = 3;
  const currentStep = ['role', 'institution', 'confirmation'].indexOf(step) + 1;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Create Account</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 1: Role & Basic Info */}
      {step === 'role' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>
              This determines your access and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  value: 'student',
                  title: 'Student',
                  description: 'Write and manage your thesis with AI assistance',
                  icon: '📚',
                },
                {
                  value: 'advisor',
                  title: 'Advisor',
                  description: 'Provide feedback on student theses',
                  icon: '👨‍🏫',
                },
                {
                  value: 'critic',
                  title: 'Professional Reviewer',
                  description: 'Conduct professional manuscript reviews',
                  icon: '✏️',
                },
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => form.setValue('role', role.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    form.watch('role') === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <p className="font-semibold">{role.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Email & Password in Step 1 */}
            <div className="space-y-4 mt-6 pt-6 border-t">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  {...form.register('email', { required: true })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="your@university.edu"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  {...form.register('password', { required: true })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="••••••••"
                  onChange={(e) => {
                    form.setValue('password', e.target.value);
                    // Trigger password strength update
                  }}
                />
                
                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator
                  password={form.watch('password')}
                />
              </div>
            </div>

            <Button
              onClick={() => setStep('institution')}
              disabled={!form.watch('role') || !form.watch('email') || !form.watch('password')}
              className="w-full"
            >
              Next: Select Institution →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Institution Selection */}
      {step === 'institution' && (
        <Card>
          <CardHeader>
            <CardTitle>Your University</CardTitle>
            <CardDescription>
              We have {2487} Philippine institutions in our database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Search Institution</label>
              <InstitutionAutocomplete
                onSelect={(institution) =>
                  form.setValue('institution', institution)
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Program (Optional)</label>
              <input
                type="text"
                {...form.register('program')}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('role')}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep('confirmation')}
                disabled={!form.watch('institution')}
                className="flex-1"
              >
                Review & Sign Up →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Confirmation */}
      {step === 'confirmation' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Information</CardTitle>
            <CardDescription>
              Make sure everything looks correct
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Review Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">
                  {form.watch('role')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{form.watch('email')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Institution:
                </span>
                <span className="font-medium">
                  {form.watch('institution')}
                </span>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="text-xs text-blue-900">
                ✓ We'll send a verification link to {form.watch('email')}
              </p>
              <p className="text-xs text-blue-900 mt-1">
                ✓ Your data is encrypted and secure
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('institution')}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button onClick={() => handleSubmit()} className="flex-1">
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" className="text-primary underline">
          Sign in here
        </a>
      </p>
    </div>
  );
}

// Password Strength Component
function PasswordStrengthIndicator({ password }: { password: string }) {
  const requirements = [
    { text: 'At least 8 characters', met: (password?.length ?? 0) >= 8 },
    {
      text: 'Mix of letters and numbers',
      met: /[a-z].*[0-9]|[0-9].*[a-z]/i.test(password ?? ''),
    },
    {
      text: 'Special character (optional)',
      met: /[!@#$%^&*]/.test(password ?? ''),
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, idx) => (
        <div
          key={idx}
          className={`text-xs flex items-center gap-2 ${
            req.met ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          {req.met ? '✓' : '○'} {req.text}
        </div>
      ))}
    </div>
  );
}

// Institution Autocomplete Component
function InstitutionAutocomplete({
  onSelect,
}: {
  onSelect: (institution: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [institutions, setInstitutions] = useState<string[]>([]);

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query.length > 0) {
      // Fetch from API with autocomplete
      fetch(`/api/institutions?search=${query}`)
        .then((res) => res.json())
        .then((data) => setInstitutions(data.institutions));
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="Type university name..."
      />
      {institutions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
          {institutions.map((inst) => (
            <button
              key={inst}
              onClick={() => {
                onSelect(inst);
                setSearch(inst);
                setInstitutions([]);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
            >
              {inst}
            </button>
          ))}
        </div>
      )}
      {search && institutions.length === 0 && search.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              onSelect(search);
              setInstitutions([]);
            }}
            className="w-full text-left px-3 py-2 text-blue-600 hover:bg-blue-50"
          >
            + Add "{search}" as new institution
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 2. FIX: Forgot Password Link Missing

**File**: `src/components/sign-in-form.tsx`

```typescript
export function SignInForm() {
  const form = useForm();
  const [step, setStep] = useState<'email' | 'password' | 'reset'>('email');

  // ... existing code ...

  if (step === 'reset') {
    return <ForgotPasswordForm onBack={() => setStep('email')} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              {...form.register('email', { required: true })}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => setStep('reset')}
                className="text-xs text-primary underline hover:no-underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              {...form.register('password', { required: true })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

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
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/register" className="text-primary underline">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'email' | 'confirmation'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStep('confirmation');
    } catch (error) {
      toast.error('Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <Card>
        <CardContent className="text-center space-y-4 pt-6">
          <Mail className="h-12 w-12 mx-auto text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Check Your Email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to {email}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <strong>Link expires in 24 hours</strong>
            </p>
            <p className="text-xs text-blue-900">
              Usually arrives in 1-2 minutes
            </p>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Open email app
                window.location.href = 'mailto:';
              }}
            >
              Open Email App
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep('email')}
            >
              Didn't receive email? Try again
            </Button>
          </div>

          <Button variant="link" onClick={onBack} className="w-full">
            ← Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="your@university.edu"
        />

        <Button
          onClick={handleRequestReset}
          disabled={!email || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>

        <Button variant="outline" onClick={onBack} className="w-full">
          ← Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 3. FIX: Empty Dashboard - Add Clear CTA

**File**: `src/components/student-dashboard.tsx`

```typescript
export function StudentDashboard() {
  const { documents } = useDocuments(); // Assuming hook exists

  // Show empty state if no documents
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        {/* Icon/Illustration */}
        <div className="mb-6">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-3">Start Your Thesis</h2>

        {/* Description */}
        <p className="text-muted-foreground max-w-sm mb-8">
          Create your first document to begin writing your thesis with AI
          assistance. You can choose from templates or start from scratch.
        </p>

        {/* Primary CTA */}
        <Button
          size="lg"
          onClick={() => openNewDocumentDialog()}
          className="mb-4"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Document
        </Button>

        {/* Secondary CTA */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => openTemplateGallery()}
          className="mb-8"
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Browse Templates
        </Button>

        {/* Reassurance */}
        <p className="text-xs text-muted-foreground">
          💡 Tip: Start with a template to get pre-organized sections
        </p>
      </div>
    );
  }

  // Existing dashboard for users with documents
  return <ExistingDashboard documents={documents} />;
}

function ExistingDashboard({ documents }: { documents: Document[] }) {
  return (
    <div className="space-y-6">
      {/* Welcome back section */}
      <WelcomeBanner />

      {/* Recommended action */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-semibold text-sm mb-2">Continue Where You Left Off</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">{documents[0].title}</p>
            <p className="text-xs text-muted-foreground">
              {documents[0].progress}% complete
            </p>
          </div>
          <Button size="sm">
            Continue Writing
          </Button>
        </div>
      </div>

      {/* Rest of dashboard widgets... */}
    </div>
  );
}
```

---

## 4. FIX: No Save Indicator in Editor

**File**: `src/components/document-editor.tsx`

```typescript
export function DocumentEditor() {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<
    'typing' | 'saving' | 'saved'
  >('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Debounced autosave
  const saveDocument = useCallback(
    debounce(async (newContent: string) => {
      setSaveStatus('saving');
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });
        setSaveStatus('saved');
        setLastSaveTime(new Date());
        setIsUnsaved(false);
        toast.success('Document saved!');
      } catch (error) {
        toast.error('Failed to save document');
      }
    }, 3000),
    []
  );

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaveStatus('typing');
    setIsUnsaved(true);
    saveDocument(newContent);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUnsaved) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUnsaved]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header with Save Status */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Unsaved indicator dot */}
          {isUnsaved && (
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full" />
          )}

          <h1 className="text-lg font-semibold">{documentTitle}</h1>

          {/* Save Status Text */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {saveStatus === 'typing' && (
              <>
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full" />
                Typing...
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            )}
            {saveStatus === 'saved' && lastSaveTime && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Saved at {lastSaveTime.toLocaleTimeString()}
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Share
          </Button>
          <Button size="sm">AI Tools</Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <RichTextEditor
          value={content}
          onChange={handleContentChange}
          autoFocus
        />
      </div>

      {/* Footer with Word Count */}
      <div className="border-t p-4 flex justify-between items-center text-xs text-muted-foreground">
        <div>
          {content.split(/\s+/).length} words |{' '}
          {content.length} characters
        </div>
        <div>
          {isUnsaved && (
            <span className="text-orange-600 font-medium">
              You have unsaved changes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 5. FIX: Share Button Hidden → Make Prominent

**File**: `src/components/editor-header.tsx`

```typescript
export function EditorHeader({ documentId }: { documentId: string }) {
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Unsaved indicator */}
        <SaveIndicator />
        <h1 className="text-lg font-semibold">Document Title</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Secondary actions */}
        <Button variant="outline" size="sm" onClick={() => {}}>
          <Palette className="w-4 h-4 mr-2" />
          Formatting
        </Button>

        <Button variant="outline" size="sm" onClick={() => {}}>
          <Sparkles className="w-4 h-4 mr-2" />
          AI Tools
        </Button>

        {/* PRIMARY CTA: SHARE BUTTON (Blue) */}
        <Button
          size="sm"
          onClick={() => setShowShareDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {/* More options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Move to folder</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          documentId={documentId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}
```

---

## 6. FIX: Sharing Dialog Confusing → Clear Sections

**File**: `src/components/share-dialog.tsx`

```typescript
export function ShareDialog({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharedWith, setSharedWith] = useState<ShareRecipient[]>([]);
  const [permissionLevel, setPermissionLevel] = useState<
    'view' | 'comment' | 'edit'
  >('comment');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: Share by Email */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Share by Email
            </h3>
            <p className="text-xs text-muted-foreground">
              Invite people to view, comment, or edit this document
            </p>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={advisorEmail}
                  onChange={(e) => setAdvisorEmail(e.target.value)}
                  placeholder="advisor@university.edu"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <select
                value={permissionLevel}
                onChange={(e) =>
                  setPermissionLevel(
                    e.target.value as 'view' | 'comment' | 'edit'
                  )
                }
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="view">View only</option>
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
            </div>

            <Button
              onClick={() => inviteAdvisor(advisorEmail, permissionLevel)}
              className="w-full"
              size="sm"
            >
              Send Invitation
            </Button>
          </div>

          {/* Permission level explanations */}
          <div className="bg-blue-50 p-3 rounded-lg text-xs space-y-2">
            <p>
              <strong>View only:</strong> Can read document
            </p>
            <p>
              <strong>Can comment:</strong> Can add comments and suggestions
            </p>
            <p>
              <strong>Can edit:</strong> Can make changes directly
            </p>
          </div>

          {/* Section 2: Copy Link */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Copy Share Link
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg text-xs bg-gray-50"
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success('Link copied!');
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium">Access level:</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                <option>View only</option>
                <option>Can comment</option>
                <option>Can edit</option>
              </select>
            </div>
          </div>

          {/* Section 3: People with Access */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              People with Access
            </h3>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {/* Owner */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>

              {/* Shared recipients */}
              {sharedWith.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {person.role === 'view' && '👁️ Can view'}
                      {person.role === 'comment' && '💬 Can comment'}
                      {person.role === 'edit' && '✏️ Can edit'}
                    </p>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. FIX: AI Tool Inputs Vague → Add Examples

**File**: `src/components/topic-ideas-tool.tsx`

```typescript
export function TopicIdeasTool() {
  const [field, setField] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<string[] | null>(null);
  const [usageRemaining, setUsageRemaining] = useState(5);

  const generateTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, context }),
      });
      const data = await response.json();
      setOutput(data.topics);
      setUsageRemaining(data.usageRemaining);
    } catch (error) {
      toast.error('Failed to generate topics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Generate Topic Ideas
          </CardTitle>
          <CardDescription>
            Get AI-powered suggestions for thesis topics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Field Selection */}
          <div>
            <label className="text-sm font-medium">
              What field is your thesis?
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            >
              <option value="">Select a field...</option>
              <option value="computer-science">Computer Science</option>
              <option value="education">Education</option>
              <option value="engineering">Engineering</option>
              <option value="medicine">Medicine</option>
              <option value="business">Business</option>
              <option value="literature">Literature</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Context Input */}
          <div>
            <label className="text-sm font-medium">
              Additional context (optional)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Give more details to get better suggestions
            </p>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder='E.g., "Focus on AI ethics and responsible AI development"'
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm h-24 resize-none"
            />
          </div>

          {/* Example Output */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-2">
              📌 Example Output
            </p>
            <ul className="text-xs text-amber-900 space-y-1">
              <li>✓ Ethical implications of AI in decision-making</li>
              <li>✓ Bias detection in machine learning models</li>
              <li>✓ Fairness metrics for AI systems</li>
            </ul>
          </div>

          {/* Usage Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs">
              <strong>Usage:</strong> {usageRemaining} of 5 topic generations
              remaining
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Resets monthly • {6 - usageRemaining} used this month
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateTopics}
            disabled={!field || isLoading || usageRemaining === 0}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating... (~3 seconds)
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Topics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Preview Modal */}
      {output && (
        <TopicOutputPreview
          topics={output}
          onInsert={(topic) => insertIntoDcoument(topic)}
          onRegenerate={() => generateTopics()}
        />
      )}
    </div>
  );
}
```

---

## 8. FIX: Mobile Navigation Too Complex → Simplify

**File**: `src/components/mobile-navigation.tsx`

```typescript
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  // Only show 5 main items on mobile
  const mainNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Documents', icon: FileText, href: '/documents' },
    { label: 'References', icon: BookOpen, href: '/references' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const secondaryItems = [
    { label: 'Help', href: '/help' },
    { label: 'Feedback', href: '/feedback' },
    { label: 'About', href: '/about' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="flex justify-around">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 px-2 border-r last:border-r-0 hover:bg-gray-50"
              style={{ minHeight: '60px' }} // Touch target
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content spacing for bottom nav */}
      <div className="md:hidden pb-20" />

      {/* Hamburger for secondary items */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed bottom-20 right-4 rounded-full"
            style={{ width: '56px', height: '56px' }} // Touch target
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto max-h-96">
          <SheetHeader>
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>

          <div className="space-y-1 mt-4">
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block w-full px-4 py-3 text-left hover:bg-gray-50 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

---

## 9. FIX: Notification Badge Doesn't Show Count

**File**: `src/components/notification-bell.tsx`

```typescript
export function NotificationBell() {
  const { unreadCount, notifications, markAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />

          {/* Badge showing unread count */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notif.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => markAsRead(notif.id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 border-t">
          <Link href="/notifications" className="text-sm text-primary">
            View all notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## IMPLEMENTATION CHECKLIST

Use this checklist to track implementation of all 9 fixes:

```markdown
## Implementation Progress

- [ ] 1. Sign-Up: Convert to 3-step form with progress bar
  - [ ] Create step components
  - [ ] Add password strength indicator
  - [ ] Test on mobile
  - [ ] Deploy and monitor

- [ ] 2. Forgot Password: Add link and recovery flow
  - [ ] Add "Forgot password?" link to login
  - [ ] Create password reset page
  - [ ] Send reset emails via Supabase
  - [ ] Test email delivery

- [ ] 3. Empty Dashboard: Add clear CTA
  - [ ] Add empty state component
  - [ ] Design illustration
  - [ ] Test with new users

- [ ] 4. Save Indicator: Show status in editor
  - [ ] Add save status display
  - [ ] Implement autosave with feedback
  - [ ] Add beforeunload warning
  - [ ] Test on slow network

- [ ] 5. Share Button: Make prominent
  - [ ] Move to header as primary button
  - [ ] Style with brand color (blue)
  - [ ] Test mobile responsiveness

- [ ] 6. Share Dialog: Clear sections
  - [ ] Separate email/link/people sections
  - [ ] Add permission level explanations
  - [ ] Test with real users

- [ ] 7. AI Tool Inputs: Add examples
  - [ ] Add example inputs to each tool
  - [ ] Create input descriptions
  - [ ] Show expected output examples
  - [ ] Document in help

- [ ] 8. Mobile Navigation: Simplify
  - [ ] Reduce to 5 main items
  - [ ] Create bottom tab nav
  - [ ] Add "More" menu for secondary items
  - [ ] Test on various devices

- [ ] 9. Notification Badge: Show count
  - [ ] Add badge component
  - [ ] Track unread count
  - [ ] Display on bell icon
  - [ ] Test with multiple notifications
```

---

**Total Estimated Implementation Time**: 20-30 developer hours  
**Recommended Team Size**: 2 developers, 1 designer  
**Timeline**: 2-3 weeks with standard process  
**Faster Timeline**: 1 week with focused sprint
