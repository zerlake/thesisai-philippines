# Phase 3 Implementation Plan

## Overview
Phase 3 focuses on **Educational Support Tools** - advanced AI-powered components that enhance learning and thesis preparation.

**Status:** Ready to begin  
**Estimated Duration:** 3-4 hours  
**Components:** 3 new educational tools  

---

## Phase 3 Components

### 1. Flashcard Generator ✅
**Purpose:** Auto-generate Q&A flashcard pairs from thesis content  
**Location:** `src/components/flashcard-generator.tsx`

**Key Features:**
- 10-15 flashcard pairs per generation
- 4 question types: Definition, Explanation, Application, Example
- Export as JSON or CSV format
- Save to document library
- Copy to clipboard functionality
- Temperature: 0.4 (balanced Q&A generation)

**Implementation:**
```typescript
interface FlashcardData {
  question: string;
  answer: string;
  type: 'definition' | 'explanation' | 'application' | 'example';
}

interface FlashcardResponse {
  flashcards: FlashcardData[];
  generatedAt: string;
  count: number;
}
```

---

### 2. Defense Question Generator ✅
**Purpose:** Generate challenging thesis defense questions  
**Location:** `src/components/defense-question-generator.tsx`

**Key Features:**
- 8-12 challenging questions per generation
- 5 categories: Methodology, Findings, Implications, Limitations, Critique
- 3 difficulty levels: Moderate, Challenging, Expert
- Answer frameworks with suggested approaches
- Color-coded badges for categories and difficulty
- Temperature: 0.6 (creative, challenging questions)

**Implementation:**
```typescript
interface DefenseQuestion {
  question: string;
  category: 'methodology' | 'findings' | 'implications' | 'limitations' | 'critique';
  difficulty: 'moderate' | 'challenging' | 'expert';
  answerFramework: string;
  followUpQuestions: string[];
}

interface DefenseQuestionsResponse {
  questions: DefenseQuestion[];
  generatedAt: string;
  totalCount: number;
}
```

---

### 3. Study Guide Generator ✅
**Purpose:** Create comprehensive, hierarchical study guides  
**Location:** `src/components/study-guide-generator.tsx`

**Key Features:**
- Executive summary (2-3 paragraphs)
- 3-5 main sections with content and key points
- Review questions for each section
- 8-12 key terms with definitions
- 5-7 practical study tips
- Important citations list
- Estimated reading time calculation
- Temperature: 0.5 (balanced, organized content)

**Implementation:**
```typescript
interface StudyGuide {
  title: string;
  executiveSummary: string;
  sections: {
    heading: string;
    content: string;
    keyPoints: string[];
    reviewQuestions: string[];
  }[];
  keyTerms: {
    term: string;
    definition: string;
  }[];
  studyTips: string[];
  citationsList: string[];
  estimatedReadingTime: number; // in minutes
  generatedAt: string;
}
```

---

## Implementation Architecture

### Unified Pattern: callPuterAI
All Phase 3 components use the standardized `callPuterAI` pattern with:
- **Authentication checks** - session required
- **Loading states** - spinner UI feedback
- **Error handling** - toast notifications
- **Sample data** - quick testing capability
- **Export functionality** - JSON, CSV, text formats
- **Save to database** - document library integration
- **Clipboard copy** - one-click sharing
- **Responsive design** - mobile & desktop
- **Dark mode support** - theme-aware UI

### Error Handling Pattern
```typescript
try {
  const result = await callPuterAI(prompt, options);
  const parsed = JSON.parse(result);
  setData(parsed);
  toast.success("Content generated successfully!");
} catch (error) {
  console.error(error);
  toast.error(error.message || "Failed to generate content");
}
```

### Authentication Pattern
```typescript
useEffect(() => {
  if (!session) {
    toast.error("You must be logged in.");
    return;
  }
  // Continue with component logic
}, [session]);
```

### Export Patterns
```typescript
// JSON Export
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `export-${Date.now()}.json`;
a.click();

// CSV Export (Flashcards)
const headers = ['Question', 'Answer', 'Type'];
const rows = data.map(f => [f.question, f.answer, f.type]);
const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
const blob = new Blob([csv], { type: 'text/csv' });

// Copy to Clipboard
navigator.clipboard.writeText(text).then(() => {
  toast.success("Copied to clipboard!");
});
```

---

## Implementation Timeline

### Hour 1-2: Component Development
- Create `flashcard-generator.tsx` (450 LOC)
- Create `defense-question-generator.tsx` (500 LOC)
- Create `study-guide-generator.tsx` (400 LOC)

### Hour 2-3: Integration & Testing
- Integrate with existing components
- Add to navigation/menu systems
- Test with sample data
- Verify export functionality
- Test database save operations

### Hour 3-4: Refinement & Documentation
- Update documentation
- Create usage examples
- Add to AGENTS.md
- Performance verification
- Final testing

---

## Testing Checklist

### Component Testing
- [ ] All components render without errors
- [ ] Authentication checks work
- [ ] Loading states display correctly
- [ ] Error handling functions properly
- [ ] Sample data loads in test mode

### Functionality Testing
- [ ] Flashcard generation produces valid JSON
- [ ] Defense questions include all fields
- [ ] Study guides have complete structure
- [ ] Questions appear in correct categories
- [ ] Difficulty levels work properly

### Export Testing
- [ ] JSON exports valid JSON format
- [ ] CSV exports properly formatted
- [ ] Copy to clipboard works
- [ ] Save to database succeeds
- [ ] Files download correctly

### UI/UX Testing
- [ ] Components are responsive
- [ ] Dark mode works
- [ ] Buttons are accessible
- [ ] Loading spinners display
- [ ] Error messages are clear

---

## Success Metrics

### Code Quality
- ✅ 0 TypeScript errors
- ✅ 0 ESLint violations
- ✅ ~1,350 total LOC (Phase 3)
- ✅ All components follow unified pattern

### Functionality
- ✅ All 3 components production-ready
- ✅ All exports working
- ✅ Database integration complete
- ✅ Error handling comprehensive

### Testing
- ✅ Component tests passing
- ✅ Sample data tests passing
- ✅ Export tests passing
- ✅ Integration tests passing

---

## Integration Points

### Database
- Save to `user_documents` table
- Link to thesis/project
- Include metadata (type, created_at, etc.)

### Components Used
- Radix UI primitives (Dialog, Button, Input, Textarea)
- Tailwind CSS for styling
- Toast notifications (react-hot-toast)
- Copy to clipboard (navigator.clipboard API)

### API Routes
- `/api/documents/save` - Save generated content
- `/api/documents/list` - Retrieve saved items
- `/api/documents/delete` - Remove saved items

---

## Phase 4 Preview (Next)

After Phase 3 completes:

**Phase 4: Cleanup & Monitoring (2-3 hours)**
1. Identify unused Supabase functions
2. Deprecate legacy OpenRouter code
3. Update comprehensive documentation
4. Add usage monitoring/analytics
5. Final testing and verification
6. Create project completion summary

**Overall Progress:** 75% → 100% complete

---

## File Structure

```
src/components/
├── flashcard-generator.tsx         (450 LOC)
├── defense-question-generator.tsx  (500 LOC)
├── study-guide-generator.tsx       (400 LOC)
└── ...

Documentation:
├── PHASE_3_IMPLEMENTATION_PLAN.md         (this file)
├── PHASE_3_COMPLETION_SUMMARY.md          (after completion)
├── PUTER_AI_MIGRATION_PROJECT_STATUS.md   (updated)
└── MIGRATION_PHASES_INDEX.md              (updated)
```

---

## Temperature Settings

These control AI output creativity:

| Component | Temperature | Rationale |
|-----------|-------------|-----------|
| Flashcard Generator | 0.4 | Consistent, accurate Q&A pairs |
| Defense Questions | 0.6 | Creative but coherent challenges |
| Study Guides | 0.5 | Balanced organization and detail |

---

## Resources

### Documentation
- Component template with authentication
- Puter AI integration patterns
- Database integration examples
- Export functionality reference

### Testing Tools
- Local dev server: `pnpm dev`
- Build verification: `pnpm build`
- Type checking: `pnpm exec tsc --noEmit`
- Linting: `pnpm lint`

---

## Next Steps

1. ✅ Commit Phase 2 completion
2. ✅ Deploy to GitHub
3. 👉 **Begin Phase 3 (THIS SESSION)**
4. Complete Phase 4
5. Final project summary

**Ready to start Phase 3?** Proceed with component development.

---

**Status:** Phase 3 Ready to Begin  
**Last Updated:** December 16, 2025  
**Estimated Completion:** This session
