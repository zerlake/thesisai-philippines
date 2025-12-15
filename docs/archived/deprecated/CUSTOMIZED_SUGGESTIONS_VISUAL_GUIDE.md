# Advisor & Critic Customized Suggestions - Visual Guide

## User Interface

### Advisor Suggestion Engine (`/advisor/suggestion-engine`)

```
┌─────────────────────────────────────────────────────────────┐
│ Customized Suggestion Engine                                │
│ Configure how the AI generates suggestions for your students│
└─────────────────────────────────────────────────────────────┘

┌─ Core Settings ─────────────────────────────────────────────┐
│                                                              │
│  Suggestion Tone              Formal / Encouraging / Balanced│
│  Detail Level                 Brief / Moderate / Comprehensive
│  Frequency (days)             [7] days                      │
│  ☑ Auto-generate suggestions                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ Focus Areas ───────────────────────────────────────────────┐
│  ☑ Research Gap Identification                             │
│  ☑ Literature Review Guidance                              │
│  ☑ Methodology & Design                                    │
│  ☑ Writing Quality & Structure                             │
│  ☐ Data Analysis & Results                                 │
│  ☐ Presentation & Defense                                  │
│  ☐ Timeline & Project Management                           │
│  ☐ Student Engagement & Motivation                         │
└──────────────────────────────────────────────────────────────┘

┌─ Suggestion Types ──────────────────────────────────────────┐
│  ☑ Research Design & Gap Guidance                          │
│  ☑ Writing Quality & Structure Tips                        │
│  ☑ Methodology & Statistical Analysis                      │
│  ☐ Presentation & Defense Preparation                      │
└──────────────────────────────────────────────────────────────┘

┌─ Custom Instructions ───────────────────────────────────────┐
│                                                              │
│  [Focus on statistical rigor...]                           │
│                                                              │
│  These instructions will be used to customize all          │
│  suggestions generated for your students                   │
└──────────────────────────────────────────────────────────────┘

                [Reset to Defaults]  [Save Preferences]
```

### Critic Review Configuration (`/critic/suggestion-engine`)

```
┌─────────────────────────────────────────────────────────────┐
│ Review & Feedback Configuration                             │
│ Customize your review criteria and feedback approach        │
└─────────────────────────────────────────────────────────────┘

┌─ Core Review Settings ──────────────────────────────────────┐
│                                                              │
│  Feedback Style               Constructive / Critical / Supportive
│  Review Depth                 Surface / Moderate / Deep      │
│  Turnaround (days)            [5] days                      │
│  ☑ Auto-generate feedback                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ Review Focus Areas ────────────────────────────────────────┐
│  ☑ Conceptual Clarity & Coherence                          │
│  ☑ Literature Coverage & Relevance                         │
│  ☑ Methodological Soundness                                │
│  ☑ Results Interpretation & Analysis                       │
│  ☑ Academic Writing Standards                              │
│  ☐ Argument Strength & Logic                               │
│  ☐ Data Quality & Reliability                              │
│  ☐ Contribution & Significance                             │
└──────────────────────────────────────────────────────────────┘

┌─ Review Components ────────────────────────────────────────┐
│  ☑ Content Quality & Relevance Assessment                  │
│  ☑ Document Structure & Organization Review                │
│  ☑ Methodology & Research Design Critique                  │
│  ☐ Presentation & Writing Quality Feedback                 │
│  ☑ Originality & Plagiarism Concerns                       │
└──────────────────────────────────────────────────────────────┘

┌─ Custom Review Guidelines ──────────────────────────────────┐
│                                                              │
│  [Must include literature from past 5 years...]            │
│                                                              │
│  These guidelines will inform all feedback and reviews     │
│  you generate                                               │
└──────────────────────────────────────────────────────────────┘

                [Reset to Defaults]  [Save Preferences]
```

## Navigation Integration

### Advisor Sidebar
```
📊 Advisor Workspace
  ├─ 📊 Dashboard
  ├─ 💡 Suggestion Engine        ← NEW
  ├─ 👥 Sample Students
  ├─ ☑️  Competency Assessment
  └─ 📖 Advisor Guide

📊 Student Management
  ├─ 📈 Analytics
  └─ 🔒 Data Management

📖 Advisor Resources
  ├─ 📚 Resources
  └─ 🎓 University Guides
```

### Critic Sidebar
```
👁️  Critic Workspace
  ├─ 📊 Dashboard
  ├─ 💡 Review Configuration     ← NEW
  ├─ 👥 My Students
  ├─ 👥 Sample Students
  ├─ 💳 Billing
  ├─ 📚 Resources
  └─ 📖 Critic Guide

01. Conceptualize - Research Planning
  └─ [various tools...]
```

## Data Flow

### Advisor Preferences Flow
```
┌──────────────────────┐
│  User Interface      │
│  (React Component)   │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │  setState   │
    │  (React)    │
    └──────┬──────┘
           │
    ┌──────▼─────────────┐
    │  localStorage      │
    │  (Demo Mode)       │ OR  ┌──────────────┐
    └────────────────────┘     │  Supabase    │
                               │  (Production)│
                               └──────────────┘
           │
    ┌──────▼──────────────┐
    │  AI Suggestion      │
    │  Generation         │
    └────────────────────┘
```

### Critic Preferences Flow
```
┌──────────────────────┐
│  User Interface      │
│  (React Component)   │
└──────────┬───────────┘
           │
    ┌──────▼──────┐
    │  setState   │
    │  (React)    │
    └──────┬──────┘
           │
    ┌──────▼─────────────┐
    │  localStorage      │
    │  (Demo Mode)       │ OR  ┌──────────────┐
    │                     │     │  Supabase    │
    └────────────────────┘     │  (Production)│
           │                   └──────────────┘
    ┌──────▼──────────────┐
    │  Review & Feedback  │
    │  Generation         │
    └────────────────────┘
```

## State Machine

### Advisor Component States
```
         ┌─────────────┐
         │   LOADING   │
         └──────┬──────┘
                │
         ┌──────▼──────────┐
         │  PREFERENCES    │
         │  LOADED         │
         └──────┬──────────┘
                │
         ┌──────▼──────────┐
         │  USER EDITING   │
         └──────┬──────────┘
         /      │      \
    SAVE     RESET    CANCEL
        |        |        |
        └───┬────┴───┬────┘
            │        │
      SAVING    RESETTING
            │        │
            └───┬────┴────┐
                │         │
            SUCCESS    DEFAULT
```

## Database Schema Visualization

### advisor_suggestion_preferences Table
```
┌─────────────────────────────────────────────┐
│ advisor_suggestion_preferences              │
├─────────────────────────────────────────────┤
│ id (UUID) PRIMARY KEY                       │
│ advisor_id (UUID) FOREIGN KEY               │
│ focus_areas (TEXT[]) - Multi-select array   │
│ suggestion_tone (TEXT) - Enum               │
│ detail_level (TEXT) - Enum                  │
│ frequency_days (INTEGER) - 1-30             │
│ auto_generate (BOOLEAN)                     │
│ include_research_guidance (BOOLEAN)         │
│ include_writing_tips (BOOLEAN)              │
│ include_methodology_advice (BOOLEAN)        │
│ include_presentation_help (BOOLEAN)         │
│ custom_instructions (TEXT)                  │
│ created_at (TIMESTAMP)                      │
│ updated_at (TIMESTAMP)                      │
├─────────────────────────────────────────────┤
│ UNIQUE(advisor_id)                          │
│ RLS: Users see only their own               │
└─────────────────────────────────────────────┘
```

### critic_suggestion_preferences Table
```
┌──────────────────────────────────────────────┐
│ critic_suggestion_preferences                │
├──────────────────────────────────────────────┤
│ id (UUID) PRIMARY KEY                        │
│ critic_id (UUID) FOREIGN KEY                 │
│ review_focus_areas (TEXT[]) - Multi-select   │
│ feedback_style (TEXT) - Enum                 │
│ review_depth (TEXT) - Enum                   │
│ turnaround_expectation_days (INTEGER)        │
│ auto_generate_feedback (BOOLEAN)             │
│ include_content_review (BOOLEAN)             │
│ include_structure_review (BOOLEAN)           │
│ include_methodology_review (BOOLEAN)         │
│ include_presentation_review (BOOLEAN)        │
│ include_originality_concerns (BOOLEAN)       │
│ custom_review_guidelines (TEXT)              │
│ created_at (TIMESTAMP)                       │
│ updated_at (TIMESTAMP)                       │
├──────────────────────────────────────────────┤
│ UNIQUE(critic_id)                            │
│ RLS: Users see only their own                │
└──────────────────────────────────────────────┘
```

## User Journey

### Advisor Journey
```
1. Login as Advisor
   ↓
2. Navigate to Dashboard
   ↓
3. Click "Suggestion Engine" in sidebar
   ↓
4. Page loads with current preferences
   ↓
5. Modify settings:
   - Toggle focus areas
   - Change tone/detail
   - Adjust frequency
   - Add custom instructions
   ↓
6. Click "Save Preferences"
   ↓
7. Settings saved to localStorage/Supabase
   ↓
8. Toast notification: "Preferences saved"
   ↓
9. Settings used when generating suggestions
```

### Critic Journey
```
1. Login as Critic
   ↓
2. Navigate to Dashboard
   ↓
3. Click "Review Configuration" in sidebar
   ↓
4. Page loads with current preferences
   ↓
5. Modify settings:
   - Select review focus areas
   - Change feedback style
   - Adjust review depth
   - Set turnaround time
   - Add custom guidelines
   ↓
6. Click "Save Preferences"
   ↓
7. Settings saved to localStorage/Supabase
   ↓
8. Toast notification: "Preferences saved"
   ↓
9. Settings used when reviewing work
```

## Component Architecture

```
src/components/
├── advisor-suggestion-engine.tsx
│   ├── useState (preferences)
│   ├── useState (isSaving)
│   ├── useState (isLoading)
│   ├── useState (hasChanges)
│   ├── useEffect (loadPreferences)
│   ├── handleSavePreferences()
│   ├── handleResetPreferences()
│   ├── toggleFocusArea()
│   └── Render UI
│
└── critic-suggestion-engine.tsx
    ├── useState (preferences)
    ├── useState (isSaving)
    ├── useState (isLoading)
    ├── useState (hasChanges)
    ├── useEffect (loadPreferences)
    ├── handleSavePreferences()
    ├── handleResetPreferences()
    ├── toggleReviewArea()
    └── Render UI
```

## Error Handling Flow

```
Load Preferences
       ↓
  Try-Catch
    ↙     ↘
  Error  Success
    │       │
localStorage  Supabase
    │         │
  Success  Error?
    │       ╱   ╲
    │      ✓     ✗
    │      │     │
    └──┬───┘     │
       │    localStorage
       │    fallback
       │         │
   Show Data  Show Defaults
       │         │
       └────┬────┘
            │
        Page Renders
```

---

**Visual Documentation Complete**
All interfaces, flows, and schemas documented
Ready for implementation and testing
