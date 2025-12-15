# Test Commands Reference Guide

Complete guide to running tests for each component, hook, API, and integration test.

## Quick Start

```bash
# Run all tests
pnpm test

# Run all tests with UI
pnpm test:ui

# Run all tests with coverage
pnpm test:coverage
```

---

## Category-Level Tests

Run all tests in a specific category:

### Components Tests (13 files)
```bash
pnpm test:components
```

### Hooks Tests (3 files)
```bash
pnpm test:hooks
```

### API Tests (2 files)
```bash
pnpm test:api
```

### Integration Tests (3 files)
```bash
pnpm test:integration
```

### Personalization Tests (7 files)
```bash
pnpm test:personalization
```

### All Categories Together
```bash
pnpm test:all-categories
```

---

## Individual Component Tests

Run a specific component test:

### Editor Component
```bash
pnpm test:editor
```
**Test File:** `src/__tests__/components/editor.test.tsx`
**Coverage:** Editor rendering, text input, save, formatting toolbar

### Sign In Form
```bash
pnpm test:sign-in
```
**Test File:** `src/__tests__/components/sign-in-form.test.tsx`
**Coverage:** Email/password inputs, validation, sign in flow

### Student Dashboard
```bash
pnpm test:dashboard
```
**Test File:** `src/__tests__/components/student-dashboard.test.tsx`
**Coverage:** Dashboard layout, widgets, navigation, user greeting

### Research Question Generator
```bash
pnpm test:research-questions
```
**Test File:** `src/__tests__/components/research-question-generator.test.tsx`
**Coverage:** Topic input, generation, copy button, validation

### Outline Builder
```bash
pnpm test:outline
```
**Test File:** `src/__tests__/components/outline-builder.test.tsx`
**Coverage:** Title input, outline generation, section editing, add section

### Grammar Checker
```bash
pnpm test:grammar
```
**Test File:** `src/__tests__/components/grammar-checker.test.tsx`
**Coverage:** Text input, corrections display, accept corrections

### Notifications
```bash
pnpm test:notifications
```
**Test File:** `src/__tests__/components/notification-bell.test.tsx`
**Coverage:** Bell icon, badge, dropdown, mark as read, close

### Paper Search Bar
```bash
pnpm test:papers
```
**Test File:** `src/__tests__/components/paper-search-bar.test.tsx`
**Coverage:** Search input, results display, pagination, validation

### Theme Toggle
```bash
pnpm test:theme
```
**Test File:** `src/__tests__/components/theme-toggle.test.tsx`
**Coverage:** Theme options, toggle, persistence, system theme

### Bibliography Generator
```bash
pnpm test:bibliography
```
**Test File:** `src/__tests__/components/bibliography-generator.test.tsx`
**Coverage:** Citation formats (APA, MLA, Chicago), generation, copy

### Button (UI Component)
```bash
pnpm test:button
```
**Test File:** `src/__tests__/components/button.test.tsx`
**Coverage:** Variants (primary, secondary, destructive), sizes, disabled state

### Input (UI Component)
```bash
pnpm test:input
```
**Test File:** `src/__tests__/components/input.test.tsx`
**Coverage:** Text input, placeholders, disabled, focus/blur, types

### Card (UI Component)
```bash
pnpm test:card
```
**Test File:** `src/__tests__/components/card.test.tsx`
**Coverage:** Card structure, header, title, description, content

---

## Individual Hook Tests

### useAuth Hook
```bash
pnpm test:use-auth
```
**Test File:** `src/__tests__/hooks/useAuth.test.ts`
**Coverage:** User loading, authentication state, signOut function

### useTheme Hook
```bash
pnpm test:use-theme
```
**Test File:** `src/__tests__/hooks/useTheme.test.ts`
**Coverage:** Theme state, setTheme, localStorage persistence, dark/light/system

### useDebounce Hook
```bash
pnpm test:use-debounce
```
**Test File:** `src/__tests__/hooks/useDebounce.test.ts`
**Coverage:** Debounce delay, value changes, timeout cancellation

---

## Individual API Tests

### Thesis API
```bash
pnpm test:api-thesis
```
**Test File:** `src/__tests__/api/thesis.test.ts`
**Coverage:** CRUD operations, list, errors, validation

### Papers API
```bash
pnpm test:api-papers
```
**Test File:** `src/__tests__/api/papers.test.ts`
**Coverage:** Search, fetch details, save, retrieve saved, filters, errors

---

## Individual Integration Tests

### Authentication Workflow
```bash
pnpm test:integration-auth
```
**Test File:** `src/__tests__/integration/auth-workflow.test.tsx`
**Coverage:** Sign in flow, errors, session persistence, redirects

### Thesis Creation Workflow
```bash
pnpm test:integration-thesis
```
**Test File:** `src/__tests__/integration/thesis-creation-workflow.test.tsx`
**Coverage:** Complete thesis creation, research questions, outline, saving

### AI Tools Workflow
```bash
pnpm test:integration-ai
```
**Test File:** `src/__tests__/integration/ai-tools-workflow.test.ts`
**Coverage:** Tool chaining, error handling, retries, multiple operations

---

## Watch Mode Tests

Run tests in watch mode for development:

### Watch Components
```bash
pnpm test:watch:components
```

### Watch Hooks
```bash
pnpm test:watch:hooks
```

### Watch API
```bash
pnpm test:watch:api
```

### Watch Integration
```bash
pnpm test:watch:integration
```

---

## Coverage Reports

### Full Coverage Report
```bash
pnpm test:coverage
```

### Components Coverage
```bash
pnpm test:coverage -- src/__tests__/components
```

### Hooks Coverage
```bash
pnpm test:coverage -- src/__tests__/hooks
```

### API Coverage
```bash
pnpm test:coverage -- src/__tests__/api
```

### Integration Coverage
```bash
pnpm test:coverage -- src/__tests__/integration
```

---

## Test Runner Script

Use the automated test runner for batch testing:

```bash
# Run all component tests
node scripts/run-tests.js COMPONENT_TESTS

# Run all hook tests
node scripts/run-tests.js HOOK_TESTS

# Run all API tests
node scripts/run-tests.js API_TESTS

# Run all integration tests
node scripts/run-tests.js INTEGRATION_TESTS
```

---

## Test Organization Chart

```
TESTS (47 total)
├── COMPONENT TESTS (13)
│   ├── Feature Components (10)
│   │   ├── editor.test.tsx
│   │   ├── sign-in-form.test.tsx
│   │   ├── student-dashboard.test.tsx
│   │   ├── research-question-generator.test.tsx
│   │   ├── outline-builder.test.tsx
│   │   ├── grammar-checker.test.tsx
│   │   ├── notification-bell.test.tsx
│   │   ├── paper-search-bar.test.tsx
│   │   ├── theme-toggle.test.tsx
│   │   └── bibliography-generator.test.tsx
│   └── UI Components (3)
│       ├── button.test.tsx
│       ├── input.test.tsx
│       └── card.test.tsx
├── HOOK TESTS (3)
│   ├── useAuth.test.ts
│   ├── useTheme.test.ts
│   └── useDebounce.test.ts
├── API TESTS (2)
│   ├── thesis.test.ts
│   └── papers.test.ts
├── INTEGRATION TESTS (3)
│   ├── auth-workflow.test.tsx
│   ├── thesis-creation-workflow.test.tsx
│   └── ai-tools-workflow.test.ts
└── PERSONALIZATION TESTS (7)
    └── (existing personalization tests)
```

---

## Common Test Commands

### Run Quick Test Suite
```bash
# Fast test run (no coverage, no UI)
pnpm test
```

### Run with Visual UI
```bash
pnpm test:ui
```

### Run Specific Test File
```bash
pnpm exec vitest run src/__tests__/components/editor.test.tsx
```

### Run Tests Matching Pattern
```bash
pnpm exec vitest run -t "Editor"
```

### Run Failed Tests Only
```bash
pnpm exec vitest --last-failed
```

### Run Tests in Isolation
```bash
pnpm exec vitest --isolate src/__tests__/components/editor.test.tsx
```

---

## Tips & Tricks

### Debug a Single Test
```bash
# Run test in debug mode
pnpm exec vitest run --inspect-brk src/__tests__/components/editor.test.tsx
```

### Run Tests with Reporter
```bash
# Verbose output
pnpm exec vitest run --reporter=verbose src/__tests__/components

# JSON output
pnpm exec vitest run --reporter=json src/__tests__/components > test-results.json
```

### Generate Test Report
```bash
# HTML coverage report
pnpm test:coverage -- --reporter=html
```

### Performance Testing
```bash
# Measure test execution time
pnpm exec vitest run --reporter=verbose src/__tests__/components | grep -i duration
```

---

## Quick Reference Table

| Command | Purpose | Files |
|---------|---------|-------|
| `pnpm test:components` | All component tests | 13 |
| `pnpm test:hooks` | All hook tests | 3 |
| `pnpm test:api` | All API tests | 2 |
| `pnpm test:integration` | All integration tests | 3 |
| `pnpm test:editor` | Editor component | 1 |
| `pnpm test:use-auth` | useAuth hook | 1 |
| `pnpm test:api-thesis` | Thesis API | 1 |
| `pnpm test:integration-auth` | Auth workflow | 1 |
| `pnpm test:all-categories` | All organized tests | 21 |
| `pnpm test:watch:components` | Watch mode for components | 13 |
| `pnpm test:coverage` | Full coverage report | All |

---

## CI/CD Integration

For continuous integration pipelines:

```bash
# Run all tests and exit with status
pnpm test

# Run with coverage thresholds
pnpm test:coverage -- --coverage.lines=80 --coverage.functions=80

# Run all categories and fail on error
pnpm test:all-categories
```

---

## Notes

- All tests use Vitest as the test runner
- React components use @testing-library/react
- Async operations handled with waitFor()
- External dependencies mocked (Supabase, Puter AI)
- Tests follow AAA pattern (Arrange, Act, Assert)
- Coverage reports available in `coverage/` directory

Generated: 2025-12-16
