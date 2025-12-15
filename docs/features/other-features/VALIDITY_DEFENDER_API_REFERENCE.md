# Validity Defender - API Reference

## Authentication

All endpoints require authentication via Supabase session. Requests without valid session will return `401 Unauthorized`.

## Endpoints

### 1. Validate Instrument

**POST** `/api/instruments/validate`

Validates a research instrument and generates validity metrics.

#### Request

```json
{
  "thesisId": "550e8400-e29b-41d4-a716-446655440000",
  "instrumentName": "Student Engagement Survey",
  "instrumentType": "survey",
  "description": "Measures engagement in online learning environments",
  "content": "Question 1: On a scale of 1-5...\nQuestion 2: How often..."
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thesisId` | string (UUID) | Yes | User's thesis ID |
| `instrumentName` | string | Yes | Name of the instrument (max 255 chars) |
| `instrumentType` | enum | Yes | One of: `survey`, `questionnaire`, `interview`, `focus-group`, `observation` |
| `description` | string | No | Purpose and context of the instrument |
| `content` | string | Yes | Full instrument content (questions, scales, etc.) |

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "instrumentId": "660e8400-e29b-41d4-a716-446655440000",
  "validation": {
    "validityGaps": [
      "Consider using Likert scale for better construct validity",
      "Include reliability measures in pilot testing"
    ],
    "suggestions": [
      "Add demographic questions for context analysis",
      "Include open-ended questions for qualitative feedback",
      "Conduct pilot testing with minimum 30 respondents"
    ],
    "metrics": {
      "contentValidity": {
        "estimatedItemCount": 25,
        "requiresExpertReview": true,
        "contentValidityIndexTarget": 0.78
      },
      "internalConsistency": "pending_pilot_testing",
      "constructValidity": "pending_factor_analysis"
    },
    "defensePoints": [
      "Instrument adapted from established literature",
      "Content validity established through expert review",
      "Cronbach alpha coefficient ≥ 0.70 required for internal consistency",
      "Pilot tested with minimum 30-50 respondents"
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Operation successful |
| `instrumentId` | string (UUID) | ID for future references |
| `validation.validityGaps` | array | Identified gaps in validity |
| `validation.suggestions` | array | Recommendations for improvement |
| `validation.metrics` | object | Type-specific validity metrics |
| `validation.defensePoints` | array | Pre-written defense points |

#### Error Responses

**Status: 400 Bad Request**
```json
{
  "error": "Missing required fields: thesisId, instrumentName, instrumentType, content"
}
```

**Status: 401 Unauthorized**
```json
{
  "error": "User not authenticated"
}
```

**Status: 500 Internal Server Error**
```json
{
  "error": "Failed to save instrument validity record"
}
```

---

### 2. Generate Defense Response

**POST** `/api/instruments/defense-responses`

Generates scripted responses to panel questions.

#### Request

```json
{
  "instrumentId": "660e8400-e29b-41d4-a716-446655440000",
  "questionType": "content",
  "questionText": "How did you ensure content validity?",
  "customInstructions": "Focus on expert review process"
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instrumentId` | string (UUID) | Yes | ID from validation step |
| `questionType` | enum | Yes | One of: `content`, `construct`, `reliability`, `validity`, `methodology` |
| `questionText` | string | No | Custom question (uses default if not provided) |
| `customInstructions` | string | No | Additional context for response generation |

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "responseId": "770e8400-e29b-41d4-a716-446655440000",
  "response": {
    "questionType": "content",
    "questionText": "How did you ensure content validity of your survey instrument?",
    "aiGeneratedResponse": "To ensure content validity, I conducted a systematic review of relevant literature to identify key constructs and items. I then had three subject matter experts review the instrument using a Content Validity Index (CVI) approach. Each expert rated the relevance of items on a 4-point scale. Items achieving a CVI of 0.78 or higher were retained. Additionally, I conducted a pilot study with 40 respondents to ensure clarity and comprehensibility of items. This multi-stage approach aligns with established validity frameworks in education research.",
    "keyPoints": [
      "Literature-based item development",
      "Expert review using CVI methodology",
      "Pilot testing for clarity",
      "CVI threshold of 0.78"
    ],
    "citations": [
      "Lawshe (1975) - Content Validity Ratio",
      "Davis (1992) - Content Validity Index"
    ]
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `responseId` | string (UUID) | ID for tracking |
| `response.questionType` | string | Type of question addressed |
| `response.questionText` | string | The actual question |
| `response.aiGeneratedResponse` | string | Full scripted response (2-3 min speaking time) |
| `response.keyPoints` | array | Key points to emphasize in defense |
| `response.citations` | array | Academic references |

#### Common Question Types Generated

**Content Validity**
- "How did you ensure content validity of your [instrument type]?"
- Expects: Expert review, CVI, pilot testing, item clarity

**Construct Validity**
- "What measures did you take to establish construct validity?"
- Expects: Factor analysis, convergent/discriminant validity, theoretical alignment

**Reliability**
- "What is the Cronbach alpha coefficient of your instrument?"
- Expects: Alpha value (≥0.70), test-retest ICC, temporal stability

**Overall Validity**
- "Can you explain the different validity types you tested?"
- Expects: Comprehensive validity framework, multiple evidence types

**Methodology**
- "Why did you choose [this instrument type] for your research?"
- Expects: Research question alignment, feasibility, appropriateness

#### Error Responses

**Status: 400 Bad Request**
```json
{
  "error": "Missing required fields: instrumentId, questionType"
}
```

**Status: 404 Not Found**
```json
{
  "error": "Instrument not found"
}
```

**Status: 401 Unauthorized**
```json
{
  "error": "User not authenticated"
}
```

---

### 3. Create Practice Session

**POST** `/api/instruments/practice-session`

Initiates a defense practice session with randomized questions.

#### Request

```json
{
  "thesisId": "550e8400-e29b-41d4-a716-446655440000",
  "instrumentIds": [
    "660e8400-e29b-41d4-a716-446655440000",
    "770e8400-e29b-41d4-a716-446655440001"
  ],
  "sessionDate": "2024-12-01T10:00:00Z",
  "durationSeconds": 1800
}
```

#### Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thesisId` | string (UUID) | Yes | User's thesis ID |
| `instrumentIds` | array (UUID[]) | Yes | Array of validated instrument IDs (min 1) |
| `sessionDate` | string (ISO 8601) | No | Session start time (defaults to now) |
| `durationSeconds` | integer | No | Expected session duration in seconds |

#### Response

**Status: 200 OK**

```json
{
  "success": true,
  "sessionId": "880e8400-e29b-41d4-a716-446655440000",
  "totalQuestions": 8,
  "questions": [
    {
      "id": "q_0_abc123def",
      "questionText": "How did you ensure content validity of your survey?",
      "questionType": "content",
      "expectedPoints": [
        "Literature review",
        "Expert panel review (n = 3)",
        "Content Validity Index ≥ 0.78",
        "Pilot test (n = 40)",
        "Item clarity verification"
      ]
    },
    {
      "id": "q_1_def456ghi",
      "questionText": "What is the Cronbach alpha coefficient of your instrument?",
      "questionType": "reliability",
      "expectedPoints": [
        "Specific alpha value (≥ 0.70)",
        "Interpretation of the value",
        "Sample size used",
        "Implications for internal consistency"
      ]
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `sessionId` | string (UUID) | Session ID for tracking |
| `totalQuestions` | integer | Number of questions in session |
| `questions` | array | Array of question objects |
| `questions[].id` | string | Unique question identifier |
| `questions[].questionText` | string | The question to answer |
| `questions[].questionType` | string | Type: content, construct, reliability, validity, methodology |
| `questions[].expectedPoints` | array | Key points for AI scoring |

#### Question Generation Rules

- 2-3 questions per instrument (random selection)
- Total questions: 5-10 depending on number of instruments
- Randomized each time to avoid memorization
- Type distribution: Balanced across 5 question types
- Questions are instrument-type specific

#### Error Responses

**Status: 400 Bad Request**
```json
{
  "error": "Missing required fields: thesisId, instrumentIds"
}
```

**Status: 404 Not Found**
```json
{
  "error": "No instruments found"
}
```

---

## Data Models

### Instrument Validity Record

```typescript
interface InstrumentValidity {
  id: string; // UUID
  thesis_id: string; // UUID
  user_id: string; // UUID (from auth)
  instrument_name: string;
  instrument_type: 'survey' | 'questionnaire' | 'interview' | 'focus-group' | 'observation';
  description?: string;
  metrics_json: Record<string, unknown>; // Validity metrics
  validity_type: string[]; // ['content', 'construct', ...]
  defense_scripts: string; // Markdown-formatted
  pilot_test_results?: Record<string, unknown>;
  expert_validation?: string;
  reliability_score?: number; // 0-1
  cronbachs_alpha?: number; // 0-1
  sources: string[];
  validation_date: string; // ISO 8601
  created_at: string;
  updated_at: string;
}
```

### Defense Response Record

```typescript
interface DefenseResponse {
  id: string; // UUID
  instrument_id: string; // UUID
  user_id: string; // UUID
  question_type: 'content' | 'construct' | 'reliability' | 'validity' | 'methodology';
  question_text: string;
  ai_generated_response: string;
  user_notes?: string;
  practice_score?: number; // 0-100
  is_customized: boolean;
  created_at: string;
  updated_at: string;
}
```

### Practice Session Record

```typescript
interface DefensePracticeSession {
  id: string; // UUID
  user_id: string; // UUID
  thesis_id: string; // UUID
  session_date: string; // ISO 8601
  duration_seconds?: number;
  total_questions: number;
  total_score?: number; // 0-100
  feedback?: Record<string, unknown>;
  session_transcript?: string;
  created_at: string;
}
```

## Query Examples

### Get User's Instruments

```bash
curl -X GET http://localhost:3000/api/instruments \
  -H "Authorization: Bearer <session_token>"
```

### Get Practice Sessions

```bash
curl -X GET http://localhost:3000/api/instruments/practice-sessions \
  -H "Authorization: Bearer <session_token>"
```

## Rate Limiting

- No explicit rate limiting implemented
- Consider adding: 10 requests per minute per IP

## Best Practices

1. **Always validate input** - Instrument name and type are required
2. **Handle errors gracefully** - Show user-friendly messages
3. **Save responses** - Generate all 5 types before practice
4. **Practice multiple times** - Session randomizes questions
5. **Customize when needed** - Use custom question field for specific context
6. **Track progress** - Save session data for review

## Testing

### Test Validation Endpoint

```bash
curl -X POST http://localhost:3000/api/instruments/validate \
  -H "Content-Type: application/json" \
  -d '{
    "thesisId": "test-thesis-uuid",
    "instrumentName": "Test Survey",
    "instrumentType": "survey",
    "description": "Test instrument",
    "content": "Question 1: How satisfied are you?\nQuestion 2: Would you recommend?"
  }'
```

### Test Defense Response Endpoint

```bash
curl -X POST http://localhost:3000/api/instruments/defense-responses \
  -H "Content-Type: application/json" \
  -d '{
    "instrumentId": "returned-from-validate",
    "questionType": "content",
    "customInstructions": "Focus on statistical measures"
  }'
```

### Test Practice Session Endpoint

```bash
curl -X POST http://localhost:3000/api/instruments/practice-session \
  -H "Content-Type: application/json" \
  -d '{
    "thesisId": "test-thesis-uuid",
    "instrumentIds": ["instrument-uuid-1", "instrument-uuid-2"]
  }'
```

## Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check required fields |
| 401 | Unauthorized | Login/refresh session |
| 404 | Not Found | Verify ID exists |
| 500 | Server Error | Check server logs |

---

**API Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Production Ready
