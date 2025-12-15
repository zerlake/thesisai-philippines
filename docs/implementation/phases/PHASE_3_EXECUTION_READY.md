# Phase 3 Execution - Educational Tools

**Status:** 🟢 READY  
**Phase:** 3 of 4  
**Start Date:** Now  
**Estimated Duration:** 3-4 hours  

---

## 🎯 Phase 3 Objectives

**Primary Goal:** Implement educational support tools to help students study, prepare for defense, and create learning resources

### Components to Create (Execution Order)

#### 1. Flashcard Generator (START HERE)
**Priority:** 🔴 HIGHEST  
**File:** `src/components/flashcard-generator.tsx`  
**Estimated Time:** 45-50 minutes  
**Difficulty:** Medium  
**Impact:** High (core study tool)

**Purpose:**
- Auto-generate flashcard pairs from thesis content
- Support spaced repetition learning
- Create study decks for revision

**Features:**
```
[ ] Input thesis content or topic
[ ] Generate flashcard Q&A pairs
[ ] Multiple question types (definition, explain, example)
[ ] Save flashcards to database
[ ] Export as JSON/CSV
[ ] Preview before saving
```

**API Pattern:**
```typescript
const prompt = `Generate flashcard pairs for studying this thesis:
${content}

Create pairs with:
- Question: Clear, specific, testable
- Answer: Concise but complete
- Type: definition, explanation, or application

Format as JSON array of {question, answer, type} objects`;

const result = await callPuterAI(prompt, {
  temperature: 0.4,  // Balanced questions & answers
  max_tokens: 3000,
  timeout: 30000
});
```

---

#### 2. Defense Question Generator (NEXT)
**Priority:** 🟡 HIGH  
**File:** `src/components/defense-question-generator.tsx`  
**Estimated Time:** 40-45 minutes  
**Difficulty:** Medium  
**Impact:** High

**Purpose:**
- Generate anticipated defense questions
- Create mock defense scenarios
- Practice answering techniques

**Features:**
```
[ ] Input thesis abstract/summary
[ ] Generate defense-level questions
[ ] Question categories (methodology, findings, implications)
[ ] Difficulty levels
[ ] Answer suggestions
[ ] Save question sets
[ ] Practice mode
```

**API Pattern:**
```typescript
const prompt = `Generate defense questions for this thesis:
${thesis}

Create 5-10 tough questions a thesis committee would ask:
- Deep methodological questions
- Challenge findings/assumptions
- Test understanding of contribution
- Explore limitations and alternatives

Include suggested answer frameworks.

Format as JSON array of {question, category, difficulty, answerFramework} objects`;

const result = await callPuterAI(prompt, {
  temperature: 0.6,  // Creative challenging questions
  max_tokens: 2500,
  timeout: 30000
});
```

---

#### 3. Study Guide Generator
**Priority:** 🟡 HIGH  
**File:** `src/components/study-guide-generator.tsx`  
**Estimated Time:** 40-45 minutes  
**Difficulty:** Medium  
**Impact:** Medium-High

**Purpose:**
- Create comprehensive study guides from thesis content
- Organize key concepts hierarchically
- Support different learning modalities

**Features:**
```
[ ] Input thesis content
[ ] Generate structured study guide
[ ] Include key concepts/terms
[ ] Summary sections
[ ] Practice problems
[ ] Important citations
[ ] Save and share guides
```

**API Pattern:**
```typescript
const prompt = `Create a comprehensive study guide for this thesis:
${content}

Include:
- Executive summary (2-3 paragraphs)
- Key concepts and definitions
- Important findings/results
- Methodology overview
- Critical analysis points
- Study tips and mnemonics
- Recommended review order

Format as structured JSON`;

const result = await callPuterAI(prompt, {
  temperature: 0.5,  // Balanced, organized content
  max_tokens: 3000,
  timeout: 30000
});
```

---

#### 4. Quiz Generator (OPTIONAL - If Time Permits)
**Priority:** 🟢 MEDIUM  
**File:** `src/components/quiz-generator.tsx`  
**Estimated Time:** 35-40 minutes  
**Difficulty:** Medium  
**Impact:** Medium

**Purpose:**
- Create self-assessment quizzes
- Verify learning comprehension
- Identify knowledge gaps

**Features:**
```
[ ] Input thesis/topic
[ ] Generate quiz questions
[ ] Multiple choice / Short answer
[ ] Scoring system
[ ] Immediate feedback
[ ] Progress tracking
```

**API Pattern:**
```typescript
const prompt = `Generate a quiz for studying this thesis:
${content}

Create 10-15 quiz questions:
- Mix of multiple choice and short answer
- Cover all major topics
- Vary difficulty
- Include answer key with explanations

Format as JSON array of {question, type, options?, correctAnswer, explanation} objects`;

const result = await callPuterAI(prompt, {
  temperature: 0.3,  // Precise educational content
  max_tokens: 2500,
  timeout: 30000
});
```

---

## 🚀 Execution Steps

### Step 1: Flashcard Generator (Highest Priority)

```bash
# 1. Create component file
# File: src/components/flashcard-generator.tsx

# 2. Implement structure
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

# 3. Key functions
- handleGenerateFlashcards() - Main API call
- handleSaveFlashcards() - Database persistence
- handleExport() - CSV/JSON export
- addSampleData() - Test data

# 4. Test with sample thesis content
# 5. Build and verify
pnpm build

# 6. Commit
git add src/components/flashcard-generator.tsx
git commit -m "Phase 3: Implement Flashcard Generator with callPuterAI"
```

### Step 2-4: Repeat Pattern for Other Components

For each component:
1. Copy/adapt template from flashcard generator
2. Customize prompt for educational purpose
3. Set appropriate temperature (0.3-0.6 range)
4. Test with sample data
5. Build
6. Commit

---

## 📊 Temperature Reference for Phase 3

**Keep this handy:**

```
FLASHCARD GENERATION:    0.4  (balanced Q&A)
DEFENSE QUESTIONS:       0.6  (creative challenge)
STUDY GUIDES:            0.5  (balanced organization)
QUIZ GENERATION:         0.3  (precise testing)
LEARNING PATHS:          0.5  (structured planning)
```

---

## 💾 Component Template

Use this as base for all Phase 3 components:

```typescript
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Download, Loader2, Sparkles } from "lucide-react";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { useRouter } from "next/navigation";

interface GeneratedContent {
  items: Array<Record<string, string | number>>;
  metadata: {
    generatedAt: string;
    itemCount: number;
  };
}

export function ComponentName() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide input content.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in.");
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `Your prompt template here...`;
      
      const result = await callPuterAI(prompt, {
        temperature: 0.X,  // Set appropriate temperature
        max_tokens: YYYY,
        timeout: 30000
      });

      const parsed = JSON.parse(result);
      setGeneratedContent({
        items: parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          itemCount: parsed.length
        }
      });
      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !generatedContent) return;
    
    try {
      const { error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: "Generated Educational Content",
          content: JSON.stringify(generatedContent),
        });

      if (error) {
        toast.error("Failed to save.");
      } else {
        toast.success("Saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving content.");
    }
  };

  const handleExport = () => {
    if (!generatedContent) return;
    
    const dataStr = JSON.stringify(generatedContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-${Date.now()}.json`;
    link.click();
    toast.success("Exported successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Component Title</CardTitle>
          <CardDescription>Description of what this tool does</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Input Content</label>
            <Textarea
              placeholder="Paste your content here..."
              className="min-h-[300px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !inputText.trim()}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            
            <pre className="bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(generatedContent, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## ✔️ Verification Steps

After each component:

```bash
# 1. TypeScript check
npm run type-check

# 2. Build
pnpm build

# 3. Manual test
pnpm dev
# Navigate to component, test with sample data

# 4. Verify imports
grep -r "from \"@/lib/puter-ai-wrapper\"" src/components/

# 5. Commit
git add src/components/[component-name].tsx
git commit -m "Phase 3: Implement [Component] with callPuterAI"
```

---

## 📈 Expected Outcomes

After Phase 3 completion:

| Metric | Target |
|--------|--------|
| Components Created | 3-4 |
| API Calls Using callPuterAI | 100% |
| Build Status | ✅ PASSED |
| Code Quality | ✅ TypeScript Strict |
| User Feedback | ✅ Toast Notifications |
| Documentation | ✅ Complete |
| Project Progress | 75% Complete |

---

## 🎯 Success Criteria

Phase 3 is COMPLETE when:

```
[ ] Flashcard Generator created and tested
[ ] Defense Question Generator created and tested
[ ] Study Guide Generator created and tested
[ ] All components use callPuterAI
[ ] All build with no errors
[ ] All have authentication checks
[ ] All have save/export functionality
[ ] Documentation updated
[ ] Ready for Phase 4
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: JSON Parse Error
**Solution:**
```typescript
try {
  const parsed = JSON.parse(result);
} catch (e) {
  // Try removing markdown code blocks
  const cleaned = result.replace(/```json\n?|\n?```/g, '');
  const parsed = JSON.parse(cleaned);
}
```

### Issue 2: Token Limit Exceeded
**Solution:**
```typescript
const maxTokens = Math.min(
  Math.ceil(inputText.length / 4) * 1.5,
  3000  // Cap at 3000
);
```

### Issue 3: Content Too Generic
**Solution:**
```typescript
// Add more specific instructions to prompt
const prompt = `Generate VERY SPECIFIC questions for this thesis...
Include actual terminology from the content.
Reference specific methodologies mentioned.
Ask about specific findings presented.`;
```

---

## 📚 Reference Materials

**Quick Links:**
- Temperature Guide: This document
- Prompt Examples: PUTER_AI_QUICK_REFERENCE.md
- Phase 2 Reference: PHASE_2_PUTER_AI_MIGRATION_COMPLETE.md

---

## 🎬 Ready to Execute

**Everything is prepared:**
- ✅ Pattern established from Phase 1-2
- ✅ callPuterAI wrapper ready
- ✅ Temperature guidelines defined
- ✅ Component template provided
- ✅ Execution steps clear

**Start with Flashcard Generator. You've got this.**

---

## 📝 Execution Log (Fill As You Go)

```
Session Start: [TIME]

Flashcard Generator:
  Started: [TIME]
  Completed: [TIME]
  Status: [✅ / ❌]
  Notes: [Any issues encountered]

Defense Question Generator:
  Started: [TIME]
  Completed: [TIME]
  Status: [✅ / ❌]
  Notes: [Any issues encountered]

Study Guide Generator:
  Started: [TIME]
  Completed: [TIME]
  Status: [✅ / ❌]
  Notes: [Any issues encountered]

Quiz Generator (Optional):
  Started: [TIME]
  Completed: [TIME]
  Status: [✅ / ❌]
  Notes: [Any issues encountered]

Final Build: [TIME]
Status: [✅ PASSED / ❌ FAILED]
Ready for Phase 4: [YES / NO]
```

---

**🚀 Phase 3 is ready. Begin execution now.**
