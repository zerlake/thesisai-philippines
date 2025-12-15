# Phase 4 Planning: Data Persistence & Analytics

**Date:** December 16, 2025  
**Phase Status:** Planning  
**Target Completion:** January 2026

## Executive Summary

Phase 4 transforms Phase 3's educational tools from stateless generators into persistent, analytics-driven learning systems. Students will save their study materials, track progress, and receive AI-powered recommendations based on their learning patterns.

## Strategic Objectives

1. **Persist educational artifacts** across sessions
2. **Track learning progress** with comprehensive analytics
3. **Enable spaced repetition** for flashcards
4. **Provide personalized recommendations** based on study patterns
5. **Support collaborative learning** with sharing features
6. **Generate learning insights** with AI analysis

## Data Persistence Requirements

### 1. Flashcard Data Model
```typescript
interface FlashcardDeck {
  id: uuid
  userId: uuid
  thesisId: uuid
  title: string
  description: string
  cardCount: number
  difficultyLevel: 'Easy' | 'Medium' | 'Hard'
  createdAt: timestamp
  updatedAt: timestamp
  lastReviewedAt?: timestamp
  status: 'draft' | 'active' | 'archived'
  
  // Spaced repetition tracking
  nextReviewDate?: timestamp
  reviewCount: integer
  successRate: float // 0-100
}

interface FlashcardCard {
  id: uuid
  deckId: uuid
  front: string
  back: string
  difficulty: integer // 1-5
  createdAt: timestamp
  
  // Spaced repetition data
  interval: integer // days until next review
  easeFactor: float // difficulty adjustment
  repetitions: integer
  nextReview: timestamp
}

interface CardReviewSession {
  id: uuid
  userId: uuid
  cardId: uuid
  deckId: uuid
  difficulty: integer // 1-5 (user assessment)
  timeSpent: integer // milliseconds
  correct: boolean
  reviewedAt: timestamp
}
```

### 2. Defense Question Data Model
```typescript
interface DefenseQuestionSet {
  id: uuid
  userId: uuid
  thesisId: uuid
  title: string
  categories: string[]
  totalQuestions: integer
  difficulty: 'Basic' | 'Intermediate' | 'Advanced'
  createdAt: timestamp
  updatedAt: timestamp
  status: 'draft' | 'active' | 'archived'
  
  // Practice tracking
  practiceCount: integer
  averageTime: integer // seconds
  lastPracticed?: timestamp
}

interface DefenseQuestion {
  id: uuid
  setId: uuid
  question: string
  expectedAnswer: string
  category: string
  difficulty: string
  createdAt: timestamp
}

interface DefensePracticeSession {
  id: uuid
  userId: uuid
  questionSetId: uuid
  questionId: uuid
  userAnswer: string
  timeSpent: integer // seconds
  quality: integer // 1-5 (self-assessment)
  completedAt: timestamp
  feedback?: string // AI-generated feedback
}
```

### 3. Study Guide Data Model
```typescript
interface StudyGuide {
  id: uuid
  userId: uuid
  thesisId: uuid
  title: string
  content: string // markdown format
  sections: StudyGuideSection[]
  learningObjectives: string[]
  practiceQuestions: integer
  estimatedReadTime: integer // minutes
  createdAt: timestamp
  updatedAt: timestamp
  status: 'draft' | 'active' | 'archived'
  
  // Usage tracking
  readCount: integer
  lastReadAt?: timestamp
  bookmarkedAt?: timestamp[]
  notes: StudyGuideNote[]
}

interface StudyGuideSection {
  id: uuid
  guideId: uuid
  title: string
  content: string
  order: integer
  bookmarked: boolean
  notes: StudyGuideNote[]
}

interface StudyGuideNote {
  id: uuid
  userId: uuid
  guideId: uuid
  sectionId?: uuid
  content: string
  position: { start: integer, end: integer }
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 4. Learning Progress Data Model
```typescript
interface LearningProgress {
  id: uuid
  userId: uuid
  thesisId: uuid
  
  // Flashcard metrics
  totalFlashcardReviews: integer
  totalFlashcardDecks: integer
  averageFlashcardSuccess: float // 0-100
  flashcardDaysConsistent: integer
  
  // Defense practice metrics
  totalDefenseSessions: integer
  totalQuestionsAnswered: integer
  averageDefenseScore: float // 0-100
  improvementTrend: float // percentage change
  
  // Study guide metrics
  totalGuidesSaved: integer
  totalNotesTaken: integer
  totalBookmarks: integer
  guidesCompletedPercent: float
  
  // Overall metrics
  estimatedReadiness: float // 0-100
  learningVelocity: float // progress per week
  recommendedFocusAreas: string[]
  
  updatedAt: timestamp
}

interface DailyLearningActivity {
  id: uuid
  userId: uuid
  date: date
  flashcardReviews: integer
  defensePractices: integer
  studyTimeMinutes: integer
  guidesRead: integer
  sessionsCompleted: integer
}
```

## Analytics Requirements

### 1. Learning Analytics Dashboard
```typescript
interface LearningAnalytics {
  // Time-based metrics
  dailyActivity: DailyActivity[]
  weeklyProgress: WeeklyProgress[]
  monthlyTrends: MonthlyTrend[]
  
  // Performance metrics
  skillMastery: SkillMetric[]
  knowledgeRetention: RetentionCurve
  performanceGap: PerformanceGap[]
  
  // Engagement metrics
  sessionFrequency: number
  sessionDuration: number
  consistencyScore: number // 0-100
  
  // Predictive metrics
  estimatedReadiness: number // 0-100
  successProbability: number // 0-100
  recommendedActions: string[]
}

interface SkillMetric {
  skillName: string
  masteryLevel: float // 0-100
  reviewCount: integer
  lastReviewed: timestamp
  trend: 'improving' | 'stable' | 'declining'
}

interface RetentionCurve {
  daysAfterLearning: integer[]
  retentionRate: float[] // 0-100
  predictedNextReview: timestamp
}
```

### 2. Analytics Events to Track
- Flashcard review sessions (start, card flip, answer submission, rating)
- Defense practice completions (question answered, time taken, self-score, feedback)
- Study guide interactions (section opened, note added, bookmark created, time spent)
- Learning milestone achievements (first deck, 10 reviews, 100% accuracy, etc.)
- Analytics view requests (dashboard opened, report generated)
- Settings changes (difficulty adjustment, review schedule change)

### 3. AI-Powered Insights
```typescript
interface LearningInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'recommendation'
  title: string
  description: string
  metric: string
  currentValue: any
  targetValue: any
  actionItems: string[]
  generatedAt: timestamp
}

// Example insights:
// - "Flashcard retention declining in methodology section"
// - "Defense question answering speed improving (avg 2min → 1.5min)"
// - "Study consistency: 6-day streak!"
// - "Recommend practice more on theoretical framework questions"
```

## Database Schema Additions

### Migration 1: Educational Tools Tables
```sql
-- Flashcard Decks
CREATE TABLE flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  thesis_id UUID REFERENCES theses,
  title VARCHAR NOT NULL,
  description TEXT,
  difficulty_level VARCHAR CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  card_count INTEGER DEFAULT 0,
  next_review_date TIMESTAMP,
  review_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_reviewed_at TIMESTAMP,
  CONSTRAINT unique_deck_per_thesis UNIQUE(user_id, thesis_id, title)
);

CREATE TABLE flashcard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES flashcard_decks ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  interval INTEGER DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE card_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  card_id UUID NOT NULL REFERENCES flashcard_cards ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES flashcard_decks ON DELETE CASCADE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  time_spent INTEGER, -- milliseconds
  correct BOOLEAN NOT NULL,
  reviewed_at TIMESTAMP DEFAULT NOW()
);

-- Defense Questions
CREATE TABLE defense_question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  thesis_id UUID REFERENCES theses,
  title VARCHAR NOT NULL,
  difficulty VARCHAR CHECK (difficulty IN ('Basic', 'Intermediate', 'Advanced')),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  practice_count INTEGER DEFAULT 0,
  average_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_practiced TIMESTAMP
);

CREATE TABLE defense_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES defense_question_sets ON DELETE CASCADE,
  question TEXT NOT NULL,
  expected_answer TEXT,
  category VARCHAR NOT NULL,
  difficulty VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE defense_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  question_set_id UUID NOT NULL REFERENCES defense_question_sets,
  question_id UUID NOT NULL REFERENCES defense_questions,
  user_answer TEXT,
  time_spent INTEGER, -- seconds
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  feedback TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Study Guides
CREATE TABLE study_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  thesis_id UUID REFERENCES theses,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  estimated_read_time INTEGER,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  read_count INTEGER DEFAULT 0,
  practice_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP,
  bookmarked_at TIMESTAMP
);

CREATE TABLE study_guide_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES study_guides ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  section_order INTEGER,
  bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_guide_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  guide_id UUID NOT NULL REFERENCES study_guides ON DELETE CASCADE,
  section_id UUID REFERENCES study_guide_sections ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Learning Progress & Analytics
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  thesis_id UUID REFERENCES theses,
  total_flashcard_reviews INTEGER DEFAULT 0,
  total_flashcard_decks INTEGER DEFAULT 0,
  average_flashcard_success FLOAT DEFAULT 0,
  flashcard_days_consistent INTEGER DEFAULT 0,
  total_defense_sessions INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  average_defense_score FLOAT DEFAULT 0,
  improvement_trend FLOAT DEFAULT 0,
  total_guides_saved INTEGER DEFAULT 0,
  total_notes_taken INTEGER DEFAULT 0,
  estimated_readiness FLOAT DEFAULT 0,
  learning_velocity FLOAT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, thesis_id)
);

CREATE TABLE daily_learning_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  activity_date DATE NOT NULL,
  flashcard_reviews INTEGER DEFAULT 0,
  defense_practices INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,
  guides_read INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_date)
);

CREATE TABLE learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  thesis_id UUID REFERENCES theses,
  insight_type VARCHAR CHECK (insight_type IN ('opportunity', 'warning', 'achievement', 'recommendation')),
  title VARCHAR NOT NULL,
  description TEXT,
  metric VARCHAR,
  current_value VARCHAR,
  target_value VARCHAR,
  action_items TEXT[],
  dismissed BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP DEFAULT NOW(),
  dismissed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX idx_flashcard_decks_thesis_id ON flashcard_decks(thesis_id);
CREATE INDEX idx_flashcard_cards_deck_id ON flashcard_cards(deck_id);
CREATE INDEX idx_flashcard_cards_next_review ON flashcard_cards(next_review);
CREATE INDEX idx_card_review_sessions_user_id ON card_review_sessions(user_id);
CREATE INDEX idx_card_review_sessions_reviewed_at ON card_review_sessions(reviewed_at);
CREATE INDEX idx_defense_question_sets_user_id ON defense_question_sets(user_id);
CREATE INDEX idx_defense_practice_sessions_user_id ON defense_practice_sessions(user_id);
CREATE INDEX idx_defense_practice_sessions_completed_at ON defense_practice_sessions(completed_at);
CREATE INDEX idx_study_guides_user_id ON study_guides(user_id);
CREATE INDEX idx_study_guide_notes_user_id ON study_guide_notes(user_id);
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_daily_learning_activity_user_id ON daily_learning_activity(user_id);
CREATE INDEX idx_daily_learning_activity_date ON daily_learning_activity(activity_date);
CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_learning_insights_generated_at ON learning_insights(generated_at);

-- Enable RLS
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guide_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own flashcard decks"
  ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create flashcard decks"
  ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard decks"
  ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcard decks"
  ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

## API Endpoints

### Flashcard Management
```
POST   /api/flashcards/decks                    - Create new deck
GET    /api/flashcards/decks                    - List all decks
GET    /api/flashcards/decks/:deckId             - Get deck details
PUT    /api/flashcards/decks/:deckId             - Update deck
DELETE /api/flashcards/decks/:deckId             - Delete deck
POST   /api/flashcards/decks/:deckId/cards      - Add cards
GET    /api/flashcards/decks/:deckId/cards      - Get cards
POST   /api/flashcards/decks/:deckId/review     - Start review session
POST   /api/flashcards/sessions/:sessionId/card/:cardId - Submit card response
GET    /api/flashcards/decks/:deckId/progress   - Get deck progress
```

### Defense Questions
```
POST   /api/defense/sets                        - Create question set
GET    /api/defense/sets                        - List all sets
GET    /api/defense/sets/:setId                 - Get set details
POST   /api/defense/sets/:setId/practice        - Start practice session
POST   /api/defense/sessions/:sessionId/answer  - Submit answer
GET    /api/defense/progress                    - Get practice progress
```

### Study Guides
```
POST   /api/study-guides                        - Create guide
GET    /api/study-guides                        - List guides
GET    /api/study-guides/:guideId               - Get guide
PUT    /api/study-guides/:guideId               - Update guide
DELETE /api/study-guides/:guideId               - Delete guide
POST   /api/study-guides/:guideId/notes         - Add note
GET    /api/study-guides/:guideId/notes         - Get notes
POST   /api/study-guides/:guideId/bookmark      - Add bookmark
GET    /api/study-guides/:guideId/analytics     - Get reading analytics
```

### Analytics & Progress
```
GET    /api/learning/progress                   - Get learning progress
GET    /api/learning/analytics                  - Get analytics dashboard
GET    /api/learning/insights                   - Get AI-generated insights
GET    /api/learning/activity/daily             - Get daily activity
GET    /api/learning/activity/weekly            - Get weekly trends
POST   /api/learning/insights/:insightId/dismiss - Dismiss insight
```

## Implementation Plan

### Phase 4.1: Database & Infrastructure (Week 1-2)
- [ ] Create database migrations
- [ ] Set up RLS policies
- [ ] Create indexes for performance
- [ ] Create database helper functions

### Phase 4.2: Backend API Implementation (Week 2-3)
- [ ] Implement flashcard CRUD endpoints
- [ ] Implement defense question endpoints
- [ ] Implement study guide endpoints
- [ ] Create analytics aggregation functions

### Phase 4.3: Data Persistence in Components (Week 3-4)
- [ ] Update FlashcardGenerator with save functionality
- [ ] Update DefenseQuestionGenerator with save functionality
- [ ] Update StudyGuideGenerator with save functionality
- [ ] Add preview/history features

### Phase 4.4: Analytics Dashboard (Week 4-5)
- [ ] Create learning progress dashboard
- [ ] Build analytics visualizations
- [ ] Implement insight generation
- [ ] Add activity tracking

### Phase 4.5: Testing & Optimization (Week 5-6)
- [ ] Write integration tests
- [ ] Performance optimization
- [ ] Load testing
- [ ] Production deployment prep

## Technology Stack

### Database
- PostgreSQL with Supabase
- Real-time subscriptions for collaborative features
- Full-text search for content

### Backend
- Next.js API routes
- Server-side data aggregation
- Scheduled functions for analytics

### Frontend
- React Query for data fetching & caching
- Zustand for state management (optional)
- Recharts for analytics visualizations
- TanStack Table for data tables

### AI/ML
- Puter AI for insight generation
- TensorFlow.js for client-side ML (optional)
- Spaced repetition algorithm (SM-2)

## Spaced Repetition Algorithm (SM-2)

```typescript
interface SM2State {
  interval: number      // days
  easeFactor: number    // difficulty multiplier
  repetitions: number   // number of reviews
}

function updateSM2(
  state: SM2State,
  quality: number       // 0-5 (quality of answer)
): SM2State {
  let { interval, easeFactor, repetitions } = state

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Update interval and repetitions
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 3
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions++
  }

  return { interval, easeFactor, repetitions }
}
```

## Key Features

### 1. Progress Dashboard
- Visual progress charts (flashcard mastery, defense readiness, study completion)
- Time-based analytics (daily, weekly, monthly)
- Skill breakdown by topic
- Estimated readiness percentage

### 2. Smart Recommendations
- AI-powered focus area suggestions
- Optimal review scheduling
- Difficulty progression guidance
- Study pace recommendations

### 3. Collaborative Features
- Share flashcard decks with peers
- Collaborative note-taking on study guides
- Q&A discussion threads
- Peer review of defense answers

### 4. Learning Insights
- Retention curve visualization
- Performance gap identification
- Learning streak tracking
- Achievement badges/milestones

## Success Metrics

- Data persistence: 100% save success rate
- Analytics accuracy: >95% metric correlation with student performance
- API response time: <200ms for analytics queries
- Daily active users tracking educational tools
- Student engagement: >70% using multiple tools

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Data loss | Regular backups, transaction logging |
| Performance degradation | Proper indexing, query optimization, caching |
| Privacy concerns | RLS enforcement, audit logging |
| User confusion | Clear UI/UX, onboarding flow |
| AI insight accuracy | Validation against ground truth, user feedback |

## Timeline

| Week | Deliverable | Owner |
|------|------------|-------|
| W1-2 | Database migrations, schema creation | Backend |
| W2-3 | API endpoints for CRUD operations | Backend |
| W3-4 | Component persistence integration | Frontend |
| W4-5 | Analytics dashboard & insights | Full-stack |
| W5-6 | Testing, optimization, deployment | QA/DevOps |

## Dependencies

- Phase 3 educational tools (completed)
- Supabase database instance
- Puter AI SDK (already integrated)
- Analytics visualization library

## Success Criteria

✓ All data persists across sessions  
✓ Analytics dashboard shows actionable insights  
✓ Spaced repetition algorithm optimizes learning  
✓ API responses <200ms under normal load  
✓ 95%+ test coverage for new endpoints  
✓ Zero data loss incidents  
✓ User satisfaction >4/5 stars

## Next Steps

1. **Approve Phase 4 Plan** - Get stakeholder sign-off
2. **Create Database Migration** - Implement schema (Week 1)
3. **Build API Layer** - Implement endpoints (Week 2)
4. **Integrate Persistence** - Update components (Week 3)
5. **Build Analytics** - Dashboard & insights (Week 4)

---

**Status:** ✅ PHASE 4 PLANNING COMPLETE - Ready for implementation kickoff
